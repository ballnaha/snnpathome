import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";

const ORDER_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { id } = await params;
  const { status } = await req.json();

  if (typeof status !== "string" || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return NextResponse.json({ error: "สถานะคำสั่งซื้อไม่ถูกต้อง" }, { status: 400 });
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          productName: true,
          productImage: true,
          price: true,
          quantity: true,
        },
      },
    },
  });

  return NextResponse.json({
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    total: Number(order.total),
    shippingCost: Number(order.shippingCost),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  });
}