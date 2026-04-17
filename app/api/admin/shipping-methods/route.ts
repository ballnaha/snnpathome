import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";

// GET — list all (including inactive)
export async function GET() {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

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
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

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
