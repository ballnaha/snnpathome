import React from "react";
import type { Metadata } from "next";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Breadcrumbs,
} from "@mui/material";
import Link from "next/link";
import { ArrowRight2, ClipboardText, ShoppingBag } from "iconsax-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "ประวัติการสั่งซื้อ",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?redirect=/orders");
  }

  const userId = (session.user as any).id as string;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  // Serialize Decimal fields for the Client Component
  const serialized = orders.map((o) => ({
    ...o,
    total: Number(o.total),
    subtotal: Number(o.subtotal),
    discount: Number(o.discount),
    shippingCost: Number(o.shippingCost),
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      ...i,
      price: Number(i.price),
    })),
  }));

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Hero */}
      <Box sx={{ bgcolor: "#eee", py: { xs: 4, md: 6 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            
            <Typography variant="h2" fontWeight="900" sx={{ color: "#333", fontSize: { xs: "1.4rem", md: "2rem" } }}>
              ประวัติการสั่งซื้อ
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            ทั้งหมด {orders.length} คำสั่งซื้อ
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        <Breadcrumbs
          separator={<ArrowRight2 size="14" color="#999" />}
          aria-label="breadcrumb"
          sx={{ mb: { xs: 2, md: 4 } }}
        >
          <Link href="/" style={{ fontSize: "0.85rem", color: "inherit", textDecoration: "none" }}>
            หน้าแรก
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            ประวัติการสั่งซื้อ
          </Typography>
        </Breadcrumbs>

        {orders.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "50vh" }}
          >
            <ShoppingBag size="80" color="#ddd" variant="Bulk" />
            <Typography variant="h6" fontWeight={700} mt={2} mb={1} color="text.secondary">
              ยังไม่มีคำสั่งซื้อ
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              เริ่มต้นช้อปปิ้งสินค้าจากเครือ SNNP ได้เลย
            </Typography>
            <Link href="/all-products" style={{ textDecoration: "none" }}>
              <Chip
                label="เลือกซื้อสินค้า"
                color="primary"
                clickable
                sx={{ fontWeight: 700, px: 2, py: 2.5, fontSize: "0.95rem" }}
              />
            </Link>
          </Box>
        ) : (
          <OrdersClient orders={serialized} />
        )}
      </Container>
    </Box>
  );
}
