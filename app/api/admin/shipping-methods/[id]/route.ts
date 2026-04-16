import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// PATCH — update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.shippingMethod.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
