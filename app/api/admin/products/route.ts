import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(products.map((p) => ({ ...p, price: Number(p.price), discount: p.discount !== null ? Number(p.discount) : null, unitPrice: p.unitPrice !== null ? Number(p.unitPrice) : null })));
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const { name, slug, description, price, discount, image, images, stock, isActive, brandId, unitsPerCase, unitLabel, caseLabel, isBestSeller, sellMode, unitPrice } = await req.json();
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
      sellMode: sellMode ?? "CASE_ONLY",
      unitPrice: sellMode === "BOTH" && unitPrice !== null && unitPrice !== "" ? Number(unitPrice) : null,
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
