import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

// GET — list all (including inactive)
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const methods = await prisma.shippingMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(
    methods.map((m) => ({
      ...m,
      price: Number(m.price),
      freeThreshold: m.freeThreshold !== null ? Number(m.freeThreshold) : null,
    }))
  );
}

// POST — create
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, price, freeThreshold, isActive, sortOrder } = await req.json();

  if (!name || price === undefined || price === null) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
  }

  const method = await prisma.shippingMethod.create({
    data: {
      name,
      price,
      freeThreshold: freeThreshold !== undefined && freeThreshold !== "" ? Number(freeThreshold) : null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json({ ...method, price: Number(method.price), freeThreshold: method.freeThreshold !== null ? Number(method.freeThreshold) : null }, { status: 201 });
}
