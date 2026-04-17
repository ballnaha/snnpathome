import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";

// PATCH — update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { id } = await params;
  const { name, price, freeThreshold, isActive, sortOrder } = await req.json();

  const method = await prisma.shippingMethod.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price: Number(price) }),
      ...(freeThreshold !== undefined && { freeThreshold: freeThreshold === "" || freeThreshold === null ? null : Number(freeThreshold) }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
    },
  });

  return NextResponse.json({ ...method, price: Number(method.price), freeThreshold: method.freeThreshold !== null ? Number(method.freeThreshold) : null });
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { id } = await params;
  await prisma.shippingMethod.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
