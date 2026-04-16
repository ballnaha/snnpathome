import React from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { InfoCircle, Setting2 } from "iconsax-react";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import AdminSettingsClient from "./AdminSettingsClient";

export const metadata: Metadata = { title: "ตั้งค่าระบบ | SNNP Admin" };

export default async function AdminSettingsPage() {
  const [userCount, productCount, orderCount, brandCount, shippingCount, siteSettings] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.brand.count(),
    prisma.shippingMethod.count(),
    prisma.siteSetting.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } }),
  ]);

  const dbStats = [
    { label: "ผู้ใช้งาน", value: userCount },
    { label: "สินค้า", value: productCount },
    { label: "คำสั่งซื้อ", value: orderCount },
    { label: "แบรนด์", value: brandCount },
    { label: "รูปแบบจัดส่ง", value: shippingCount },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1500, mx: "auto" }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "grey.200",
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          background: "linear-gradient(140deg, #fff 0%, #fff7f7 100%)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "primary.main", display: "grid", placeItems: "center", boxShadow: "0 10px 24px rgba(215, 20, 20, 0.2)" }}>
              <Setting2 size="22" color="#fff" variant="Bold" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900}>ตั้งค่าระบบ</Typography>
              <Typography variant="body2" color="text.secondary">จัดการข้อมูลติดต่อ การแชร์โซเชียล และข้อมูลธุรกิจที่ใช้บนหน้าเว็บไซต์</Typography>
            </Box>
          </Stack>
          <Chip label="SYSTEM SETTINGS" size="small" sx={{ fontWeight: 800, letterSpacing: 0.8, bgcolor: "white", border: "1px solid", borderColor: "grey.200" }} />
        </Stack>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" }, gap: 3 }}>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}>
            <Stack direction="row" alignItems="center" gap={1.2} sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "grey.100" }}>
              <InfoCircle size="18" color="#d71414" variant="Bold" />
              <Typography fontWeight={900}>สรุปข้อมูลในระบบ</Typography>
            </Stack>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1 }}>
                {dbStats.map((s) => (
                  <Stack key={s.label} direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1.2, borderRadius: 2, bgcolor: "grey.50" }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>{s.label}</Typography>
                    <Typography variant="subtitle1" fontWeight={900} color="primary.main">{s.value.toLocaleString()}</Typography>
                  </Stack>
                ))}
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={900} mb={0.7}>คำแนะนำ</Typography>
            <Typography variant="body2" color="text.secondary">ใช้ URL แบบเต็ม เช่น https:// เพื่อให้ปุ่มโซเชียลทำงานถูกต้องทุกอุปกรณ์</Typography>
          </Paper>
        </Stack>

        <AdminSettingsClient
          initialSettings={{
            facebookUrl: siteSettings.facebookUrl,
            instagramUrl: siteSettings.instagramUrl,
            youtubeUrl: siteSettings.youtubeUrl,
            lineUrl: siteSettings.lineUrl,
            callCenterPhone: siteSettings.callCenterPhone,
            lineOfficial: siteSettings.lineOfficial,
            contactEmail: siteSettings.contactEmail,
            serviceHours: siteSettings.serviceHours,
            bankAccountInfo: siteSettings.bankAccountInfo,
            companyAddress: siteSettings.companyAddress,
          }}
          updatedAt={siteSettings.updatedAt.toISOString()}
        />
      </Box>
    </Box>
  );
}
