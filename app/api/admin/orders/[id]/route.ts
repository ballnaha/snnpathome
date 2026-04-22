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
    include: { items: true },
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
  }

  const oldStatus = existingOrder.status;
  const newStatus = status;

  // Use transaction to ensure status update and stock adjustment happen together
  const order = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        items: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            productId: true,
            productName: true,
            productImage: true,
            productSku: true,
            price: true,
            quantity: true,
          },
        },
      },
    });

    // Stock Adjustment Logic
    if (oldStatus !== "CANCELLED" && newStatus === "CANCELLED") {
      // If changed TO Cancelled: Return stock to inventory
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    } else if (oldStatus === "CANCELLED" && newStatus !== "CANCELLED") {
      // If changed FROM Cancelled: Re-deduct stock from inventory
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return updatedOrder;
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { id } = await params;

  const existingOrder = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    // If order is not CANCELLED, return stock before deleting
    if (existingOrder.status !== "CANCELLED") {
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    await tx.order.delete({
      where: { id },
    });
  });

  return NextResponse.json({ success: true });
}