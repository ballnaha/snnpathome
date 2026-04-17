import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
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

  return NextResponse.json(
    orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      total: Number(order.total),
      shippingCost: Number(order.shippingCost),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }))
  );
}