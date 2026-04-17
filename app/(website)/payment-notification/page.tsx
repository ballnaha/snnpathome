import React, { Suspense } from "react";
import type { Metadata } from "next";
import PaymentNotificationClient from "./PaymentNotificationClient";
import { Box, Breadcrumbs, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { WalletMinus, ArrowRight2 } from "iconsax-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "แจ้งชำระเงิน",
  description: "อัปโหลดสลิปโอนเงินเพื่อแจ้งชำระเงินให้เราทราบ",
};

export default async function PaymentNotificationPage() {
  const siteSettings = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    select: { bankAccountInfo: true },
  });

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: { xs: 10, md: 6 } }}>
      {/* Hero */}
      <Box sx={{ bgcolor: "#eee", py: { xs: 4, md: 6 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            
            <Typography variant="h2" fontWeight="900" sx={{ color: "#333", fontSize: { xs: "1.4rem", md: "2rem" } }}>
              แจ้งชำระเงิน
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            กรอกข้อมูลการโอนเงินและอัปโหลดสลิปเพื่อยืนยันการชำระเงิน
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
        <Breadcrumbs
          separator={<ArrowRight2 size="14" color="#999" />}
          aria-label="breadcrumb"
          sx={{ mb: { xs: 2, md: 4 } }}
        >
          <Link href="/" style={{ fontSize: "0.85rem", color: "inherit", textDecoration: "none" }}>
            หน้าแรก
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            แจ้งชำระเงิน
          </Typography>
        </Breadcrumbs>
      </Container>

      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        }
      >
        <PaymentNotificationClient bankAccountInfo={siteSettings?.bankAccountInfo ?? null} />
      </Suspense>
    </Box>
  );
}
