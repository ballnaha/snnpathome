import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Public — fetch active shipping methods
export async function GET() {
  const methods = await prisma.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      price: true,
      freeThreshold: true,
    },
  });

  return NextResponse.json(
    methods.map((m) => ({
      id: m.id,
      name: m.name,
      price: Number(m.price),
      freeThreshold: m.freeThreshold !== null ? Number(m.freeThreshold) : null,
    }))
  );
}
