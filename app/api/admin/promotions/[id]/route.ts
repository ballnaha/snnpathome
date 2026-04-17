import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";
import path from "path";
import fs from "fs";

function safeDeleteUploadFile(imageUrl: string | null | undefined) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;

  const relPath = imageUrl.replace(/^\/+/, "").replace(/^uploads\//, "");
  if (!relPath) return;

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const target = path.resolve(uploadsRoot, relPath);
  if (!target.startsWith(uploadsRoot + path.sep) && target !== uploadsRoot) return;

  try {
    if (fs.existsSync(target)) fs.unlinkSync(target);
  } catch (error) {
    console.error("[promotions] could not delete file:", target, error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { id } = await params;
  const body = await req.json();
  const existingPromotion = await prisma.promotion.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  if (!existingPromotion) {
    return NextResponse.json({ error: "ไม่พบโปรโมชัน" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  let removedImageUrl: string | null = null;

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.imageUrl !== undefined) {
    const nextImageUrl = body.imageUrl || "/images/logo.png";
    data.imageUrl = nextImageUrl;
    if (existingPromotion.imageUrl && existingPromotion.imageUrl !== nextImageUrl) {
      removedImageUrl = existingPromotion.imageUrl;
    }
  }
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder ?? 0);

  try {
    const promotion = await prisma.promotion.update({ where: { id }, data });
    if (removedImageUrl) safeDeleteUploadFile(removedImageUrl);
    return NextResponse.json(promotion);
  } catch {
    return NextResponse.json({ error: "ไม่พบโปรโมชันหรือบันทึกไม่สำเร็จ" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { id } = await params;
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  await prisma.promotion.delete({ where: { id } });
  safeDeleteUploadFile(promotion?.imageUrl);
  return NextResponse.json({ ok: true });
}