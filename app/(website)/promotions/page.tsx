import React from "react";
import type { Metadata } from "next";
import { Box, Breadcrumbs, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { ArrowRight2 } from "iconsax-react";
import prisma from "@/lib/prisma";


export const metadata: Metadata = {
  title: "โปรโมชั่น",
  description: "รวมโปรโมชันล่าสุดจาก SNNP AT HOME พร้อมรูปภาพและรายละเอียดครบถ้วน",
};

export default async function PromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: { xs: 10, md: 6 } }}>
      <Box sx={{ bgcolor: "#eee", py: { xs: 4, md: 6 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            
            <Typography variant="h2" fontWeight="900" sx={{ color: "#333", fontSize: { xs: "1.4rem", md: "2rem" } }}>
              โปรโมชั่น
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            ข้อเสนอพิเศษและแคมเปญล่าสุดจาก SNNP AT HOME
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Breadcrumbs separator={<ArrowRight2 size="14" color="#999" />} aria-label="breadcrumb" sx={{ mb: { xs: 2, md: 4 } }}>
          <Link href="/" style={{ fontSize: "0.85rem", color: "inherit", textDecoration: "none" }}>
            หน้าแรก
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            โปรโมชั่น
          </Typography>
        </Breadcrumbs>



        {promotions.length === 0 ? (
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "grey.200",
              boxShadow: "0 8px 28px rgba(0,0,0,0.05)",
              px: { xs: 3, md: 6 },
              py: { xs: 5, md: 7 },
              textAlign: "center",
            }}
          >
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
              ยังไม่มีโปรโมชันในขณะนี้
            </Typography>
            <Typography variant="body2" color="text.secondary">
              โปรโมชันใหม่จะอัปเดตที่หน้านี้ทันทีเมื่อมีแคมเปญล่าสุด
            </Typography>
          </Box>
        ) : (
          <Stack spacing={{ xs: 2.5, md: 3.5 }}>
            {promotions.map((promotion) => (
              <Box
                key={promotion.id}
                sx={{
                  bgcolor: "white",
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "grey.200",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.05)",
                }}
              >
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "340px 1fr" } }}>
                  <Box sx={{ bgcolor: "grey.50", minHeight: { xs: 220, md: 280 } }}>
                    <Box
                      component="img"
                      src={promotion.imageUrl}
                      alt={promotion.title}
                      sx={{ width: "100%", height: "100%", minHeight: { xs: 220, md: 280 }, objectFit: "cover", display: "block" }}
                    />
                  </Box>
                  <Box sx={{ px: { xs: 3, md: 4.5 }, py: { xs: 3, md: 4 } }}>
                    <Typography variant="overline" fontWeight={800} color="primary.main" sx={{ letterSpacing: 1.8 }}>
                      SNNP PROMOTION
                    </Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, mb: 1.5, fontSize: { xs: "1.3rem", md: "1.8rem" }, lineHeight: 1.25 }}>
                      {promotion.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: "pre-line" }}>
                      {promotion.description}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}