import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createOrderAccessToken } from "@/lib/order-access";

interface LookupOrderAccessBody {
  orderNumber?: string;
  email?: string;
  phoneLast4?: string;
}

function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizePhoneLast4(value?: string) {
  return (value ?? "").replace(/\D/g, "").slice(-4);
}

function maskName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "-";
  }

  if (trimmed.length === 1) {
    return `${trimmed}*`;
  }

  return `${trimmed[0]}${"*".repeat(Math.min(trimmed.length - 1, 5))}`;
}

function maskEmail(value: string | null) {
  if (!value) {
    return null;
  }

  const [localPart, domain] = value.split("@");
  if (!localPart || !domain) {
    return null;
  }

  const head = localPart.slice(0, 2);
  return `${head}${"*".repeat(Math.max(localPart.length - head.length, 1))}@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LookupOrderAccessBody;
    const orderNumber = body.orderNumber?.trim();
    const email = normalizeEmail(body.email);
    const phoneLast4 = normalizePhoneLast4(body.phoneLast4);

    if (!orderNumber) {
      return NextResponse.json({ error: "กรุณากรอกหมายเลขคำสั่งซื้อ" }, { status: 400 });
    }

    if (!email && phoneLast4.length !== 4) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมลที่ใช้สั่งซื้อ หรือเบอร์โทร 4 หลักท้าย" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        phone: true,
        total: true,
        createdAt: true,
        firstName: true,
        status: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "ไม่พบข้อมูลที่ตรงกัน" }, { status: 404 });
    }

    const normalizedOrderEmail = normalizeEmail(order.email ?? "");
    const normalizedOrderPhoneLast4 = normalizePhoneLast4(order.phone);
    const emailMatches = email ? email === normalizedOrderEmail : false;
    const phoneMatches = phoneLast4 ? phoneLast4 === normalizedOrderPhoneLast4 : false;

    if (!emailMatches && !phoneMatches) {
      return NextResponse.json({ error: "ไม่พบข้อมูลที่ตรงกัน" }, { status: 404 });
    }

    const accessToken = createOrderAccessToken({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

    return NextResponse.json({
      accessToken,
      preview: {
        orderNumber: order.orderNumber,
        firstName: maskName(order.firstName),
        email: maskEmail(order.email),
        phoneLast4: normalizedOrderPhoneLast4,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        status: order.status,
      },
    });
  } catch (error) {
    console.error("[POST /api/order-access]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}