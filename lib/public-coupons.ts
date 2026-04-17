import prisma from "@/lib/prisma";
import { getCouponUsageCounts } from "@/lib/coupons";

export interface PublicCoupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: "FIXED" | "PERCENT";
  value: number;
  minSubtotal: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
}

export async function getPublicActiveCoupons(): Promise<PublicCoupon[]> {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ value: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      type: true,
      value: true,
      minSubtotal: true,
      maxDiscount: true,
      usageLimit: true,
      startsAt: true,
      endsAt: true,
    },
  });

  const usageCounts = await getCouponUsageCounts(coupons.map((coupon) => coupon.code));

  return coupons
    .filter((coupon) => {
      const usageCount = usageCounts.get(coupon.code) ?? 0;
      return coupon.usageLimit == null || usageCount < coupon.usageLimit;
    })
    .map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type as "FIXED" | "PERCENT",
      value: Number(coupon.value),
      minSubtotal: coupon.minSubtotal == null ? null : Number(coupon.minSubtotal),
      maxDiscount: coupon.maxDiscount == null ? null : Number(coupon.maxDiscount),
      usageLimit: coupon.usageLimit,
      startsAt: coupon.startsAt?.toISOString() ?? null,
      endsAt: coupon.endsAt?.toISOString() ?? null,
    }));
}

export function formatCouponBenefit(coupon: PublicCoupon) {
  if (coupon.type === "PERCENT") {
    return coupon.maxDiscount != null
      ? `ลด ${coupon.value}% สูงสุด ฿${coupon.maxDiscount.toLocaleString()}`
      : `ลด ${coupon.value}%`;
  }

  return `ลดทันที ฿${coupon.value.toLocaleString()}`;
}

export function formatCouponCondition(coupon: PublicCoupon) {
  const parts: string[] = [];

  if (coupon.minSubtotal != null) {
    parts.push(`ขั้นต่ำ ฿${coupon.minSubtotal.toLocaleString()}`);
  } else {
    parts.push("ไม่มีขั้นต่ำ");
  }

  if (coupon.endsAt) {
    parts.push(`ถึง ${new Date(coupon.endsAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}`);
  }

  return parts.join(" • ");
}