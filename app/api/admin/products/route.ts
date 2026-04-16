import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(products.map((p) => ({ ...p, price: Number(p.price), discount: p.discount !== null ? Number(p.discount) : null })));
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, description, price, discount, image, images, stock, isActive, brandId, unitsPerCase, unitLabel, caseLabel, isBestSeller } = await req.json();
  if (!name || !slug || !brandId) return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });

  const imageUrls = Array.isArray(images)
    ? images.filter((url): url is string => typeof url === "string" && url.length > 0)
    : image
      ? [image]
      : [];
  const coverImage = imageUrls[0] ?? null;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description || null,
      price: Number(price),
      discount: discount !== null && discount !== "" ? Number(discount) : null,
      image: coverImage,
      stock: Number(stock ?? 0),
      isActive: isActive ?? true,
      isBestSeller: isBestSeller ?? false,
      brandId,
      unitsPerCase: unitsPerCase ? Number(unitsPerCase) : null,
      unitLabel: unitLabel || null,
      caseLabel: caseLabel || null,
      images: {
        create: imageUrls.map((url, index) => ({ url, sortOrder: index })),
      },
    },
    include: {
      brand: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json({ ...product, price: Number(product.price), discount: product.discount !== null ? Number(product.discount) : null }, { status: 201 });
}
