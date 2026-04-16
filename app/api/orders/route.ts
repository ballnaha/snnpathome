import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

interface OrderItemInput {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CreateOrderBody {
  items: OrderItemInput[];
  subtotal: number;
  discount: number;
  discountCode: string | null;
  total: number;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
  phone: string;
  shippingMethodId?: string | null;
  shippingMethodName?: string | null;
  shippingCost?: number;
}

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `${yy}${mm}`;

  // Find the highest running number this month
  const last = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let next = 1;
  if (last) {
    const running = parseInt(last.orderNumber.slice(prefix.length), 10);
    if (!isNaN(running)) next = running + 1;
  }

  return `${prefix}${String(next).padStart(3, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderBody = await req.json();

    const {
      items,
      subtotal,
      discount,
      discountCode,
      total,
      email,
      firstName,
      lastName,
      address,
      subdistrict,
      district,
      province,
      postcode,
      phone,
      shippingMethodId,
      shippingMethodName,
      shippingCost,
    } = body;

    // Basic validation
    if (!items?.length) {
      return NextResponse.json({ error: "ไม่มีสินค้าในคำสั่งซื้อ" }, { status: 400 });
    }
    if (!firstName || !lastName || !address || !postcode || !phone) {
      return NextResponse.json({ error: "ข้อมูลการจัดส่งไม่ครบถ้วน" }, { status: 400 });
    }

    // Get session (optional — allow guest orders)
    let userId: string | null = null;
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id ?? null;
    } catch {
      // guest checkout — no session
    }

    // Generate sequential order number (YYMM + running)
    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        subtotal,
        discount: discount ?? 0,
        discountCode: discountCode ?? null,
        total,
        email: email ?? null,
        firstName,
        lastName,
        address,
        subdistrict,
        district,
        province,
        postcode,
        phone,
        shippingMethodId: shippingMethodId ?? null,
        shippingMethodName: shippingMethodName ?? null,
        shippingCost: shippingCost ?? 0,
        userId,
        items: {
          create: items.map((item) => ({
            productId: item.id,
            productName: item.name,
            productImage: item.image ?? null,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Send order confirmation email (non-blocking)
    if (email) {
      const siteSettings = await prisma.siteSetting.findUnique({
        where: { id: "default" },
        select: { bankAccountInfo: true },
      });

      sendOrderConfirmationEmail({
        to: email,
        orderNumber: order.orderNumber,
        firstName,
        lastName,
        address,
        subdistrict,
        district,
        province,
        postcode,
        phone,
        subtotal,
        discount: discount ?? 0,
        total,
        discountCode,
        items: order.items.map((i) => ({
          productName: i.productName,
          productImage: i.productImage,
          price: Number(i.price),
          quantity: i.quantity,
        })),
        bankAccountInfo: siteSettings?.bankAccountInfo ?? null,
      }).catch((err) => console.error("[email] order confirmation failed:", err));
    }

    return NextResponse.json({ orderNumber: order.orderNumber, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
