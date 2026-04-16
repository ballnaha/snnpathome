import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import prisma from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true },
  });

  if (!product) {
    return { title: "ไม่พบสินค้า" };
  }

  const title = product.name;
  const description =
    product.description ??
    `ซื้อ ${product.name} ออนไลน์ได้ที่ SNNP AT HOME พร้อมโปรโมชั่นพิเศษและจัดส่งตรงถึงบ้านคุณ`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | SNNP AT HOME`,
      description,
      type: "website",
      ...(product.image ? { images: [{ url: product.image, alt: title }] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const [product, siteSettings] = await Promise.all([
    prisma.product.findUnique({
      where: { slug, isActive: true },
      include: { brand: true, images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.siteSetting.findUnique({ where: { id: "default" } }),
  ]);

  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: { brandId: product.brandId, isActive: true, NOT: { id: product.id } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
  const productGallery = (product.images as Array<{ url: string }>).map((image) => image.url);

  return (
    <ProductDetailClient
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description ?? null,
        price: product.price.toNumber(),
        discount: product.discount ? product.discount.toNumber() : null,
        image: product.image ?? "",
        images: productGallery,
        stock: product.stock,
        isBestSeller: product.isBestSeller,
        unitsPerCase: product.unitsPerCase ?? null,
        unitLabel: product.unitLabel ?? null,
        caseLabel: product.caseLabel ?? null,
        brand: { name: product.brand.name, slug: product.brand.slug },
      }}
      relatedProducts={relatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price.toNumber(),
        originalPrice: p.discount ? p.discount.toNumber() : undefined,
        image: p.image ?? "",
        isBestSeller: p.isBestSeller,
        createdAt: p.createdAt.toISOString(),
      }))}
      socialLinks={{
        facebookUrl: siteSettings?.facebookUrl ?? null,
        instagramUrl: siteSettings?.instagramUrl ?? null,
        lineUrl: siteSettings?.lineUrl ?? null,
      }}
    />
  );
}
