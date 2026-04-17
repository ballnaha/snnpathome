import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const promotions = await prisma.promotion.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(promotions);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { title, description, imageUrl, isActive, sortOrder } = await req.json();
  if (!title || !description) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  try {
    const promotion = await prisma.promotion.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || "/images/logo.png",
        isActive: isActive ?? true,
        sortOrder: Number(sortOrder ?? 0),
      },
    });
    return NextResponse.json(promotion, { status: 201 });
  } catch {
    return NextResponse.json({ error: "ชื่อโปรโมชันซ้ำหรือบันทึกไม่สำเร็จ" }, { status: 409 });
  }
}