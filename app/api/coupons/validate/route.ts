import { NextRequest, NextResponse } from "next/server";
import { resolveCouponForSubtotal, serializeCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = typeof body?.code === "string" ? body.code : "";
    const subtotal = Number(body?.subtotal ?? 0);

    if (!code.trim()) {
      return NextResponse.json({ error: "กรุณากรอกโค้ดส่วนลด" }, { status: 400 });
    }

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return NextResponse.json({ error: "ยอดสั่งซื้อไม่ถูกต้อง" }, { status: 400 });
    }

    const result = await resolveCouponForSubtotal(code, subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      coupon: serializeCoupon(result.coupon),
      discountAmount: result.discountAmount,
      finalSubtotal: Math.max(0, subtotal - result.discountAmount),
    });
  } catch (error) {
    console.error("[POST /api/coupons/validate]", error);
    return NextResponse.json({ error: "ไม่สามารถตรวจสอบคูปองได้" }, { status: 500 });
  }
}