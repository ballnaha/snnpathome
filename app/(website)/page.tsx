import React from "react";
import type { Metadata } from "next";
import { Box, Container, Typography } from "@mui/material";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import BrandCard from "@/components/BrandCard";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "หน้าแรก",
  description:
    "สั่งซื้อสินค้าออนไลน์จากเครือ SNNP — Bento, Jele, Lotus, Squidy และอีกมากมาย ส่งตรงถึงบ้านคุณในราคาพิเศษ",
  openGraph: {
    title: "SNNP AT HOME - สั่งซื้อออนไลน์สินค้าเครือ SNNP",
    description:
      "สั่งซื้อสินค้าออนไลน์จากเครือ SNNP ส่งตรงถึงบ้านคุณในราคาพิเศษ พร้อมโปรโมชั่นดีๆ ทุกวัน",
    type: "website",
  },
};

function mapProduct(p: { id: string; name: string; slug: string; price: { toNumber: () => number }; discount: { toNumber: () => number } | null; image: string | null; stock: number; isBestSeller: boolean; createdAt: Date; unitsPerCase: number | null; unitLabel: string | null; caseLabel: string | null }) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price.toNumber(),
    originalPrice: p.discount ? p.discount.toNumber() : undefined,
    image: p.image ?? "",
    isBestSeller: p.isBestSeller,
    createdAt: p.createdAt.toISOString(),
    unitsPerCase: p.unitsPerCase,
    unitLabel: p.unitLabel,
    caseLabel: p.caseLabel,
  };
}

export default async function Home() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { priority: "asc" },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        take: 4,
      },
    },
  });

  const allProducts = await prisma.product.findMany({
    where: { isActive: true, brand: { isActive: true } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <Box sx={{ pb: { xs: 8, md: 0 } }}>
      <Typography variant="h1" sx={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 }}>
        SNNP AT HOME - สั่งซื้อออนไลน์สินค้าเครือ SNNP เบนโตะ เจเล่ โลตัส
      </Typography>

      <Box component="main">
        <Hero />

        {/* Browse by Brands */}
        <Box component="section" sx={{ bgcolor: "#FDFDFD", py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Typography variant="h2" fontWeight="900" textAlign="center" mb={6} sx={{ textTransform: "uppercase", letterSpacing: 3, fontSize: { xs: "1.5rem", md: "2.2rem" } }}>
              Browse By Brands
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }} gap={3}>
              {brands.map((brand) => (
                <BrandCard key={brand.id} name={brand.name} slug={brand.slug} logo={brand.logo ?? undefined} />
              ))}
            </Box>
          </Container>
        </Box>

        {/* Per-brand sections */}
        {brands.map((brand, index) => (
          brand.products.length > 0 && (
            <Box key={brand.id} component="section" sx={{ bgcolor: index % 2 === 0 ? "#fdfdfd" : "white" }}>
              <ProductSection
                title={brand.name}
                subtitle={`EXPLORE ${brand.name.toUpperCase()}`}
                products={brand.products.map(mapProduct)}
                viewAllHref={`/all-products?brand=${brand.slug}`}
              />
            </Box>
          )
        ))}

        {/* All Products */}
        <Box sx={{ bgcolor: "primary.main", py: 4 }}>
          <Typography variant="h3" fontWeight="900" color="white" textAlign="center" sx={{ textTransform: "uppercase", letterSpacing: 2, fontSize: "1.5rem" }}>
            สินค้าแนะนำสำหรับคุณ
          </Typography>
        </Box>
        <Box component="section" sx={{ bgcolor: "#fafafa", py: 4 }}>
          <ProductSection
            title="ALL PRODUCTS"
            subtitle="RECOMMENDED FOR YOU"
            products={allProducts.map(mapProduct)}
            viewAllHref="/all-products"
          />
        </Box>
      </Box>
    </Box>
  );
}
