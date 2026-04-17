import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";
import { getCouponUsageCounts, normalizeCouponCode, serializeCoupon } from "@/lib/coupons";

function parseNullableNumber(value: unknown) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNullableInteger(value: unknown) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseNullableDate(value: unknown) {
  if (value === "" || value == null) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const coupons = await prisma.coupon.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  const usageCounts = await getCouponUsageCounts(coupons.map((coupon) => coupon.code));

  return NextResponse.json(
    coupons.map((coupon) => serializeCoupon(coupon, usageCounts.get(coupon.code) ?? 0))
  );
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const body = await req.json();
  const code = normalizeCouponCode(typeof body?.code === "string" ? body.code : "");
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const type = body?.type === "PERCENT" ? "PERCENT" : "FIXED";
  const value = Number(body?.value ?? 0);
  const minSubtotal = parseNullableNumber(body?.minSubtotal);
  const maxDiscount = parseNullableNumber(body?.maxDiscount);
  const usageLimit = parseNullableInteger(body?.usageLimit);
  const startsAt = parseNullableDate(body?.startsAt);
  const endsAt = parseNullableDate(body?.endsAt);
  const isActive = Boolean(body?.isActive ?? true);

  if (!code || !name) {
    return NextResponse.json({ error: "กรุณากรอกรหัสคูปองและชื่อคูปอง" }, { status: 400 });
  }

  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "มูลค่าส่วนลดต้องมากกว่า 0" }, { status: 400 });
  }

  if (type === "PERCENT" && value > 100) {
    return NextResponse.json({ error: "คูปองแบบเปอร์เซ็นต์ต้องไม่เกิน 100%" }, { status: 400 });
  }

  if (usageLimit !== null && usageLimit <= 0) {
    return NextResponse.json({ error: "จำนวนคูปองต้องเป็นจำนวนเต็มมากกว่า 0" }, { status: 400 });
  }

  if (startsAt && endsAt && startsAt > endsAt) {
    return NextResponse.json({ error: "วันเริ่มใช้งานต้องไม่ช้ากว่าวันหมดอายุ" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code,
        name,
        description: description || null,
        type,
        value,
        minSubtotal,
        maxDiscount: type === "PERCENT" ? maxDiscount : null,
        usageLimit,
        isActive,
        startsAt,
        endsAt,
      },
    });

    return NextResponse.json(serializeCoupon(coupon, 0), { status: 201 });
  } catch {
    return NextResponse.json({ error: "รหัสคูปองซ้ำหรือบันทึกไม่สำเร็จ" }, { status: 409 });
  }
}