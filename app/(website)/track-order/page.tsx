import React from "react";
import type { Metadata } from "next";
import { Box, Breadcrumbs, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { ArrowRight2, ReceiptText } from "iconsax-react";
import TrackOrderClient from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "ติดตามสถานะใบสั่งซื้อ",
};

export default function TrackOrderPage() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Box sx={{ bgcolor: "#eee", py: { xs: 4, md: 6 }, textAlign: "center" }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.25} mb={1}>
            
            <Typography variant="h2" fontWeight={900} sx={{ color: "#333", fontSize: { xs: "1.4rem", md: "2rem" } }}>
              ติดตามสถานะใบสั่งซื้อ
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            ตรวจสอบสถานะออเดอร์ได้โดยไม่ต้องเข้าสู่ระบบ
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Breadcrumbs separator={<ArrowRight2 size="14" color="#999" />} aria-label="breadcrumb" sx={{ mb: { xs: 2, md: 4 } }}>
          <Link href="/" style={{ fontSize: "0.85rem", color: "inherit", textDecoration: "none" }}>
            หน้าแรก
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            ติดตามสถานะใบสั่งซื้อ
          </Typography>
        </Breadcrumbs>

        <TrackOrderClient />
      </Container>
    </Box>
  );
}