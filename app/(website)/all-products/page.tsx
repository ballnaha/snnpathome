import React, { Suspense } from "react";
import type { Metadata } from "next";
import {
  Box,
  Chip,
  Container,
  Stack,
  Typography,
  Breadcrumbs,
} from "@mui/material";
import Link from "next/link";
import { ArrowRight2 } from "iconsax-react";
import ProductCard from "@/components/ProductCard";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import AllProductsControls from "./AllProductsControls";

type SearchParams = Promise<{
  brand?: string;
  search?: string;
  sort?: string;
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { brand, search } = await searchParams;

  if (brand) {
    const brandData = await prisma.brand.findFirst({ where: { slug: brand, isActive: true } });
    if (brandData) {
      return {
        title: brandData.name,
        description: `สินค้าแบรนด์ ${brandData.name} ทั้งหมด สั่งซื้อออนไลน์ได้ที่ SNNP AT HOME ส่งตรงถึงบ้าน`,
        openGraph: {
          title: `${brandData.name} | SNNP AT HOME`,
          description: `เลือกซื้อสินค้าแบรนด์ ${brandData.name} พร้อมโปรโมชั่นพิเศษ`,
          type: "website",
        },
      };
    }
  }

  if (search) {
    return {
      title: `ค้นหา "${search}"`,
      description: `ผลการค้นหาสินค้า "${search}" ใน SNNP AT HOME`,
    };
  }

  return {
    title: "สินค้าทั้งหมด",
    description: "รวมสินค้าทั้งหมดจากเครือ SNNP — Bento, Jele, Lotus, Squidy และอีกมากมาย สั่งซื้อออนไลน์ได้เลย",
    openGraph: {
      title: "สินค้าทั้งหมด | SNNP AT HOME",
      description: "เลือกซื้อสินค้าจากเครือ SNNP ครบทุกแบรนด์",
      type: "website",
    },
  };
}

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { brand, search, sort } = await searchParams;

  // Fetch brands for the sidebar
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });

  // Build product filter
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    brand: {
      isActive: true,
      ...(brand ? { slug: brand } : {}),
    },
    ...(search
      ? { name: { contains: search } }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-low"
      ? { price: "asc" }
      : sort === "price-high"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { brand: true },
  });

  // Active brand info
  const activeBrand = brand
    ? brands.find((b) => b.slug === brand)
    : null;
  const pageTitle = activeBrand ? activeBrand.name : "สินค้าทั้งหมด";

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* SEO Title */}
      <Typography
        variant="h1"
        sx={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          border: 0,
        }}
      >
        {pageTitle} - SNNP AT HOME
      </Typography>

      {/* Hero */}
      <Box
        component="section"
        sx={{ bgcolor: "#eee", py: { xs: 4, md: 6 }, textAlign: "center" }}
      >
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            <Typography
              variant="h2"
              fontWeight="900"
              sx={{ color: "#333", fontSize: { xs: "1.4rem", md: "2rem" } }}
            >
              {pageTitle}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {search
              ? `ผลการค้นหา: "${search}" — พบ ${products.length} รายการ`
              : activeBrand
              ? `สินค้าแบรนด์ ${activeBrand.name} ทั้งหมด ${products.length} รายการ`
              : `สินค้าทั้งหมด ${products.length} รายการ`}
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" component="main" sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 4, md: 6 } }}>
        <Breadcrumbs
          separator={<ArrowRight2 size="14" color="#999" />}
          aria-label="breadcrumb"
          sx={{ mb: { xs: 2, md: 4 } }}
        >
          <Link href="/" style={{ fontSize: "0.85rem", color: "inherit", textDecoration: "none" }}>
            หน้าแรก
          </Link>
          {activeBrand ? (
            <>
              <Link href="/all-products" style={{ fontSize: "0.85rem", color: "inherit", textDecoration: "none" }}>
                สินค้าทั้งหมด
              </Link>
              <Typography
                color="text.primary"
                sx={{ fontSize: "0.85rem", fontWeight: 600 }}
              >
                {activeBrand.name}
              </Typography>
            </>
          ) : (
            <Typography
              color="text.primary"
              sx={{ fontSize: "0.85rem", fontWeight: 600 }}
            >
              สินค้าทั้งหมด
            </Typography>
          )}
        </Breadcrumbs>

        {/* Mobile brand filter — horizontal scroll chips, hidden on md+ */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            gap: 1,
            overflowX: "auto",
            pb: 1,
            mb: 2,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Link href="/all-products" style={{ textDecoration: "none" }}>
            <Chip
              label="ทั้งหมด"
              clickable
              color={!brand ? "primary" : "default"}
              variant={!brand ? "filled" : "outlined"}
              sx={{ flexShrink: 0 }}
            />
          </Link>
          {brands.map((b) => (
            <Link key={b.id} href={`/all-products?brand=${b.slug}`} style={{ textDecoration: "none" }}>
              <Chip
                label={b.name}
                clickable
                color={brand === b.slug ? "primary" : "default"}
                variant={brand === b.slug ? "filled" : "outlined"}
                sx={{ flexShrink: 0 }}
              />
            </Link>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "240px 1fr" },
            gap: { xs: 2, md: 4 },
          }}
        >
          {/* Sidebar — hidden on mobile */}
          <Box component="aside" sx={{ display: { xs: "none", md: "block" } }}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "grey.200",
                position: "sticky",
                top: 80,
              }}
            >
              <Box sx={{ bgcolor: "primary.main", color: "white", px: 3, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="800">
                  หมวดหมู่
                </Typography>
              </Box>
              <Stack component="nav">
                <SidebarItem
                  label="สินค้าทั้งหมด"
                  href="/all-products"
                  active={!brand}
                />
                {brands.map((b) => (
                  <SidebarItem
                    key={b.id}
                    label={b.name}
                    href={`/all-products?brand=${b.slug}`}
                    active={brand === b.slug}
                  />
                ))}
              </Stack>
            </Box>
          </Box>

          {/* Products area */}
          <Box>
            {/* Controls: search + sort */}
            <Suspense>
              <AllProductsControls
                defaultSearch={search ?? ""}
                defaultSort={sort ?? "latest"}
              />
            </Suspense>

            {/* Result count */}
            <Typography variant="body2" color="text.secondary" mb={2}>
              {products.length === 0
                ? "ไม่พบสินค้า"
                : `แสดง ${products.length} รายการ`}
            </Typography>

            {/* Grid */}
            {products.length > 0 ? (
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={{ xs: 1.5, md: 3 }}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={Number(product.price)}
                    image={product.image ?? ""}
                    isBestSeller={product.isBestSeller}
                    createdAt={product.createdAt.toISOString()}
                    unitsPerCase={product.unitsPerCase}
                    unitLabel={product.unitLabel}
                    caseLabel={product.caseLabel}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 10,
                  color: "text.secondary",
                }}
              >
                <Typography variant="h6" fontWeight={600} mb={1}>
                  ไม่พบสินค้าที่ค้นหา
                </Typography>
                <Typography variant="body2">
                  ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function SidebarItem({
  label,
  href,
  active = false,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: active ? "rgba(215, 20, 20, 0.05)" : "transparent",
          borderLeft: "4px solid",
          borderColor: active ? "primary.main" : "transparent",
          transition: "0.2s",
          "&:hover": { bgcolor: "rgba(215, 20, 20, 0.06)" },
        }}
      >
        <Typography
          variant="body2"
          fontWeight={active ? 800 : 500}
          color={active ? "primary.main" : "text.secondary"}
        >
          {label}
        </Typography>
      </Box>
    </Link>
  );
}
