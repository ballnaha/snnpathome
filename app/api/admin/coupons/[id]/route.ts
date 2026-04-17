import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";
import { getCouponUsageCount, normalizeCouponCode, serializeCoupon } from "@/lib/coupons";

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { id } = await params;
  const body = await req.json();

  const existingCoupon = await prisma.coupon.findUnique({ where: { id } });
  if (!existingCoupon) {
    return NextResponse.json({ error: "ไม่พบคูปองส่วนลด" }, { status: 404 });
  }

  const nextType = body?.type === undefined
    ? existingCoupon.type
    : body.type === "PERCENT"
      ? "PERCENT"
      : "FIXED";
  const nextValue = body?.value === undefined ? Number(existingCoupon.value) : Number(body.value);

  if (!Number.isFinite(nextValue) || nextValue <= 0) {
    return NextResponse.json({ error: "มูลค่าส่วนลดต้องมากกว่า 0" }, { status: 400 });
  }

  if (nextType === "PERCENT" && nextValue > 100) {
    return NextResponse.json({ error: "คูปองแบบเปอร์เซ็นต์ต้องไม่เกิน 100%" }, { status: 400 });
  }

  const usageLimit = body?.usageLimit === undefined
    ? existingCoupon.usageLimit
    : parseNullableInteger(body.usageLimit);
  if (usageLimit !== null && usageLimit <= 0) {
    return NextResponse.json({ error: "จำนวนคูปองต้องเป็นจำนวนเต็มมากกว่า 0" }, { status: 400 });
  }

  const startsAt = body?.startsAt === undefined ? existingCoupon.startsAt : parseNullableDate(body.startsAt);
  const endsAt = body?.endsAt === undefined ? existingCoupon.endsAt : parseNullableDate(body.endsAt);
  if (startsAt && endsAt && startsAt > endsAt) {
    return NextResponse.json({ error: "วันเริ่มใช้งานต้องไม่ช้ากว่าวันหมดอายุ" }, { status: 400 });
  }

  const data: Record<string, unknown> = {
    type: nextType,
    value: nextValue,
  };

  if (body?.code !== undefined) data.code = normalizeCouponCode(String(body.code));
  if (body?.name !== undefined) data.name = String(body.name).trim();
  if (body?.description !== undefined) data.description = String(body.description).trim() || null;
  if (body?.minSubtotal !== undefined) data.minSubtotal = parseNullableNumber(body.minSubtotal);
  if (body?.maxDiscount !== undefined || nextType === "FIXED") {
    data.maxDiscount = nextType === "PERCENT"
      ? parseNullableNumber(body?.maxDiscount === undefined ? existingCoupon.maxDiscount : body.maxDiscount)
      : null;
  }
  if (body?.usageLimit !== undefined) data.usageLimit = usageLimit;
  if (body?.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (body?.startsAt !== undefined) data.startsAt = startsAt;
  if (body?.endsAt !== undefined) data.endsAt = endsAt;

  if ((data.code !== undefined && !String(data.code).trim()) || (data.name !== undefined && !String(data.name).trim())) {
    return NextResponse.json({ error: "กรุณากรอกรหัสคูปองและชื่อคูปอง" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.update({ where: { id }, data });
    const usageCount = await getCouponUsageCount(coupon.code);
    return NextResponse.json(serializeCoupon(coupon, usageCount));
  } catch {
    return NextResponse.json({ error: "ไม่สามารถบันทึกคูปองส่วนลดได้" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { id } = await params;
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}