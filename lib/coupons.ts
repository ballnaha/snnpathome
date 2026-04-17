import prisma from "@/lib/prisma";

type CouponLike = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: string;
  value: unknown;
  minSubtotal: unknown;
  maxDiscount: unknown;
  usageLimit: number | null;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase();
}

function toNumber(value: unknown) {
  if (value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function getCouponInvalidReason(coupon: CouponLike, subtotal: number, now = new Date()) {
  if (!coupon.isActive) {
    return "คูปองนี้ยังไม่เปิดใช้งาน";
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return "คูปองนี้ยังไม่ถึงเวลาใช้งาน";
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    return "คูปองนี้หมดอายุแล้ว";
  }

  const minSubtotal = toNumber(coupon.minSubtotal);
  if (minSubtotal !== null && subtotal < minSubtotal) {
    return `ใช้คูปองนี้ได้เมื่อยอดสั่งซื้อขั้นต่ำ ฿${minSubtotal.toLocaleString()}`;
  }

  return null;
}

export async function getCouponUsageCount(code: string) {
  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode) return 0;

  return prisma.order.count({
    where: {
      discountCode: normalizedCode,
      status: { not: "CANCELLED" },
    },
  });
}

export async function getCouponUsageCounts(codes: string[]) {
  const normalizedCodes = Array.from(
    new Set(codes.map(normalizeCouponCode).filter(Boolean))
  );

  if (normalizedCodes.length === 0) {
    return new Map<string, number>();
  }

  const grouped = await prisma.order.groupBy({
    by: ["discountCode"],
    where: {
      discountCode: { in: normalizedCodes },
      status: { not: "CANCELLED" },
    },
    _count: {
      _all: true,
    },
  });

  return new Map(
    grouped
      .filter((entry) => typeof entry.discountCode === "string")
      .map((entry) => [entry.discountCode as string, entry._count._all])
  );
}

export function calculateCouponDiscount(coupon: CouponLike, subtotal: number) {
  const rawValue = Math.max(0, toNumber(coupon.value) ?? 0);

  let discountAmount =
    coupon.type === "PERCENT"
      ? (subtotal * rawValue) / 100
      : rawValue;

  const maxDiscount = toNumber(coupon.maxDiscount);
  if (maxDiscount !== null) {
    discountAmount = Math.min(discountAmount, maxDiscount);
  }

  return Math.max(0, Math.min(subtotal, Math.round(discountAmount * 100) / 100));
}

export async function resolveCouponForSubtotal(code: string, subtotal: number) {
  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode) {
    return { ok: false as const, error: "กรุณากรอกโค้ดส่วนลด" };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon) {
    return { ok: false as const, error: "ไม่พบคูปองส่วนลดนี้" };
  }

  const reason = getCouponInvalidReason(coupon, subtotal);
  if (reason) {
    return { ok: false as const, error: reason };
  }

  const usageCount = await getCouponUsageCount(coupon.code);
  if (coupon.usageLimit !== null && usageCount >= coupon.usageLimit) {
    return { ok: false as const, error: "คูปองนี้ถูกใช้ครบจำนวนแล้ว" };
  }

  const discountAmount = calculateCouponDiscount(coupon, subtotal);
  if (discountAmount <= 0) {
    return { ok: false as const, error: "คูปองนี้ไม่สามารถใช้งานกับยอดสั่งซื้อปัจจุบันได้" };
  }

  return {
    ok: true as const,
    coupon,
    usageCount,
    discountAmount,
  };
}

export function serializeCoupon(coupon: CouponLike, usageCount = 0) {
  return {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    type: coupon.type,
    value: Number(coupon.value),
    minSubtotal: toNumber(coupon.minSubtotal),
    maxDiscount: toNumber(coupon.maxDiscount),
    usageLimit: coupon.usageLimit,
    usageCount,
    isActive: coupon.isActive,
    startsAt: coupon.startsAt?.toISOString() ?? null,
    endsAt: coupon.endsAt?.toISOString() ?? null,
    createdAt: coupon.createdAt?.toISOString?.() ?? null,
    updatedAt: coupon.updatedAt?.toISOString?.() ?? null,
  };
}