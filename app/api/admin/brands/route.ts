import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const brands = await prisma.brand.findMany({
    orderBy: [{ priority: "desc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, logo, priority } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });

  try {
    const brand = await prisma.brand.create({
      data: { name, slug, logo: logo || null, priority: Number(priority ?? 0) },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(brand, { status: 201 });
  } catch {
    return NextResponse.json({ error: "ชื่อหรือ slug ซ้ำ" }, { status: 409 });
  }
}
