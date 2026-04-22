import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { createOrderAccessToken } from "@/lib/order-access";
import { resolveCouponForSubtotal } from "@/lib/coupons";

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
      discountCode,
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

    const normalizedSubtotal = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const normalizedShippingCost = Number(shippingCost ?? 0);

    let appliedDiscount = 0;
    let appliedDiscountCode: string | null = null;

    if (discountCode) {
      const couponResult = await resolveCouponForSubtotal(discountCode, normalizedSubtotal);
      if (!couponResult.ok) {
        return NextResponse.json({ error: couponResult.error }, { status: 400 });
      }

      appliedDiscount = couponResult.discountAmount;
      appliedDiscountCode = couponResult.coupon.code;
    }

    const normalizedTotal = Math.max(0, normalizedSubtotal + normalizedShippingCost - appliedDiscount);

    // Generate sequential order number (YYMM + running)
    const orderNumber = await generateOrderNumber();

    // Fetch product details from DB to get SKUs and verify stock
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: items.map(i => i.id) } },
      select: { id: true, sku: true, stock: true, name: true }
    });

    // Check stock availability
    for (const item of items) {
      const dbProduct = dbProducts.find(p => p.id === item.id);
      if (!dbProduct) {
        return NextResponse.json({ error: `ไม่พบสินค้า "${item.name}"` }, { status: 400 });
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ 
          error: `สินค้า "${dbProduct.name}" คงเหลือไม่พอ (คงเหลือ ${dbProduct.stock} ชิ้น)` 
        }, { status: 400 });
      }
    }

    const skuMap = new Map(dbProducts.map(p => [p.id, p.sku]));

    // Use transaction to ensure both order creation and stock deduction succeed
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          subtotal: normalizedSubtotal,
          discount: appliedDiscount,
          discountCode: appliedDiscountCode,
          total: normalizedTotal,
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
          shippingCost: normalizedShippingCost,
          userId,
          items: {
            create: items.map((item) => ({
              productId: item.id,
              productName: item.name,
              productImage: item.image ?? null,
              productSku: skuMap.get(item.id) || null,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Decrement stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return createdOrder;
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
        subtotal: normalizedSubtotal,
        discount: appliedDiscount,
        total: normalizedTotal,
        discountCode: appliedDiscountCode,
        items: order.items.map((i) => ({
          productName: i.productName,
          productImage: i.productImage,
          price: Number(i.price),
          quantity: i.quantity,
        })),
        bankAccountInfo: siteSettings?.bankAccountInfo ?? null,
        shippingCost: normalizedShippingCost,
      }).catch((err) => console.error("[email] order confirmation failed:", err));
    }

    const accessToken = createOrderAccessToken(
      { orderId: order.id, orderNumber: order.orderNumber },
      7 * 24 * 60 * 60 * 1000
    );

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        orderId: order.id,
        accessToken,
        subtotal: normalizedSubtotal,
        discount: appliedDiscount,
        discountCode: appliedDiscountCode,
        total: normalizedTotal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
