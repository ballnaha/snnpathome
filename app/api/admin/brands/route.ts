import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const brands = await prisma.brand.findMany({
    orderBy: [{ priority: "desc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { name, slug, logo, priority, isActive } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });

  try {
    const brand = await prisma.brand.create({
      data: { name, slug, logo: logo || null, priority: Number(priority ?? 0), isActive: isActive ?? true },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(brand, { status: 201 });
  } catch {
    return NextResponse.json({ error: "ชื่อหรือ slug ซ้ำ" }, { status: 409 });
  }
}
