import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

/** Safely delete a file under public/uploads — prevents path traversal */
function safeDeleteFile(imageUrl: string) {
  if (!imageUrl) return;
  // Accept both "/uploads/..." and "uploads/..." forms
  const relPath = imageUrl.replace(/^\/+/, "").replace(/^uploads\//, "");
  if (!relPath) return;
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const target = path.resolve(uploadsRoot, relPath);
  // Security: must stay inside uploads root
  if (!target.startsWith(uploadsRoot + path.sep) && target !== uploadsRoot) return;
  try {
    if (fs.existsSync(target)) fs.unlinkSync(target);
  } catch (e) {
    console.error("[upload] could not delete file:", target, e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { image: true, images: { select: { url: true } } },
  });

  if (!existingProduct) {
    return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.description !== undefined) data.description = body.description || null;
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.discount !== undefined) data.discount = body.discount !== null && body.discount !== "" ? Number(body.discount) : null;
  if (body.image !== undefined) data.image = body.image || null;
  if (body.stock !== undefined) data.stock = Number(body.stock);
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.isBestSeller !== undefined) data.isBestSeller = body.isBestSeller;
  if (body.brandId !== undefined) data.brandId = body.brandId;
  if (body.unitsPerCase !== undefined) data.unitsPerCase = body.unitsPerCase ? Number(body.unitsPerCase) : null;
  if (body.unitLabel !== undefined) data.unitLabel = body.unitLabel || null;
  if (body.caseLabel !== undefined) data.caseLabel = body.caseLabel || null;

  const removedUrls = new Set<string>();

  if (body.images !== undefined) {
    const nextImages = Array.isArray(body.images)
      ? body.images.filter((url: unknown): url is string => typeof url === "string" && url.length > 0)
      : [];
    const previousUrls = new Set([
      ...(existingProduct.image ? [existingProduct.image] : []),
      ...existingProduct.images.map((image) => image.url),
    ]);
    const nextUrls = new Set(nextImages);

    previousUrls.forEach((url) => {
      if (!nextUrls.has(url)) removedUrls.add(url);
    });

    data.image = nextImages[0] ?? null;
    data.images = {
      deleteMany: {},
      create: nextImages.map((url, index) => ({ url, sortOrder: index })),
    };
  }

  if (body.images === undefined && body.image !== undefined) {
    data.image = body.image || null;
    if (existingProduct.image && existingProduct.image !== body.image) {
      removedUrls.add(existingProduct.image);
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      brand: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  removedUrls.forEach((url) => safeDeleteFile(url));

  return NextResponse.json({ ...product, price: Number(product.price), discount: product.discount !== null ? Number(product.discount) : null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { image: true, images: { select: { url: true } } },
  });

  await prisma.product.delete({ where: { id } });

  const imageUrls = new Set([
    ...(product?.image ? [product.image] : []),
    ...(product?.images.map((image) => image.url) ?? []),
  ]);
  imageUrls.forEach((url) => safeDeleteFile(url));

  return NextResponse.json({ ok: true });
}
