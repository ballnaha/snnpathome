import React from "react";
import type { Metadata } from "next";
import {
  Box,
  Container,
  Stack,
  Typography,
  Breadcrumbs,
  Divider,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight2, Call, Sms, Message, Clock, InfoCircle } from "iconsax-react";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "SNNP AT HOME อีกหนึ่งบริการที่มอบความสะดวกสบาย พร้อมตอบสนองไลฟ์สไตล์ของคนรุ่นใหม่ผ่านช่องทางออนไลน์ สั่งง่าย อิ่มอร่อยได้ทุกที่ พร้อมบริการจัดส่งฟรีในเขตกรุงเทพฯ ปริมณฑล",
  keywords: [
    "SNNP AT HOME",
    "เกี่ยวกับเรา",
    "บริการจัดส่ง",
    "สั่งขนมออนไลน์",
    "กรุงเทพ",
    "ปริมณฑล",
  ],
  openGraph: {
    title: "เกี่ยวกับเรา | SNNP AT HOME",
    description:
      "SNNP AT HOME อีกหนึ่งบริการที่มอบความสะดวกสบาย พร้อมตอบสนองไลฟ์สไตล์ของคนรุ่นใหม่ สั่งง่าย อิ่มอร่อยได้ทุกที่",
    type: "website",
    images: [{ url: "/images/about-us.jpg", width: 1200, height: 630, alt: "SNNP AT HOME" }],
  },
};

export default async function AboutUsPage() {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "default" } });

  const contactItems = [
    settings?.callCenterPhone
      ? { Icon: Call, label: "Call Center", value: `โทร. ${settings.callCenterPhone}`, href: `tel:${settings.callCenterPhone.replace(/[^0-9+]/g, "")}` }
      : null,
    settings?.lineOfficial
      ? { Icon: Message, label: "Line Official", value: settings.lineOfficial, href: `https://line.me/R/ti/p/${encodeURIComponent(settings.lineOfficial)}` }
      : null,
    settings?.contactEmail
      ? { Icon: Sms, label: "E-mail", value: settings.contactEmail, href: `mailto:${settings.contactEmail}` }
      : null,
    settings?.serviceHours
      ? { Icon: Clock, label: "เปิดบริการ", value: settings.serviceHours, href: null }
      : null,
  ].filter(Boolean) as { Icon: React.ElementType; label: string; value: string; href: string | null }[];

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: { xs: 10, md: 6 } }}>
      {/* Hero — same style as other pages */}
      <Box sx={{ bgcolor: "#eee", py: { xs: 4, md: 6 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            
            <Typography variant="h2" fontWeight="900" sx={{ color: "#333", fontSize: { xs: "1.4rem", md: "2rem" } }}>
              เกี่ยวกับเรา
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            SNNP AT HOME
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Breadcrumb */}
        <Breadcrumbs
          separator={<ArrowRight2 size="14" color="#999" />}
          aria-label="breadcrumb"
          sx={{ mb: { xs: 2, md: 4 } }}
        >
          <Link href="/" style={{ fontSize: "0.85rem", color: "inherit", textDecoration: "none" }}>
            หน้าแรก
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            เกี่ยวกับเรา
          </Typography>
        </Breadcrumbs>

        {/* Main content card */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* About image */}
          <Box sx={{ width: "100%", lineHeight: 0 }}>
            <Image
              src="/images/about-us.jpg"
              alt="SNNP AT HOME"
              width={820}
              height={280}
              priority
              style={{ width: "100%", height: "auto", display: "block" }}
              sizes="(max-width: 900px) 100vw, 900px"
            />
          </Box>

          {/* About text section */}
          <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 } }}>
            <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 2 }}>
              เกี่ยวกับเรา
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", lineHeight: 2, fontSize: { xs: "0.95rem", md: "1rem" } }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                SNNP AT HOME
              </Box>{" "}
              อีกหนึ่งบริการที่มอบความสะดวกสบาย พร้อมตอบสนองไลฟ์สไตล์ของคนรุ่นใหม่ผ่านช่องทางออนไลน์
              สั่งง่าย อิ่มอร่อยได้ทุกที่ ไม่ว่าคุณจะอยู่ที่ไหน คุณก็สามารถสั่งซื้อผลิตภัณฑ์ในเครือ SNNP
              ผ่านเว็บไซต์{" "}
              <Box
                component="a"
                href="https://www.snnpathome.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                www.snnpathome.com
              </Box>{" "}
              พร้อมบริการจัดส่งฟรีในเขตกรุงเทพฯ ปริมณฑล
            </Typography>
          </Box>

          {contactItems.length > 0 && (
            <>
              <Divider sx={{ mx: { xs: 3, md: 5 } }} />

              {/* Contact section */}
              <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 } }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  สอบถามข้อมูลเพิ่มเติมได้ที่
                </Typography>

                <Stack spacing={2.5}>
                  {contactItems.map(({ Icon, label, value, href }) => (
                    <Stack key={label} direction="row" spacing={2} alignItems="center">
                      {/* Icon bubble */}
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: "rgba(215, 20, 20, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={20} variant="Bold" color="#d71414" />
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.disabled", display: "block", fontWeight: 500 }}
                        >
                          {label}
                        </Typography>
                        {href ? (
                          <Box
                            component="a"
                            href={href}
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                            sx={{
                              color: "text.primary",
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              textDecoration: "none",
                              "&:hover": { color: "primary.main" },
                              transition: "color 0.2s",
                            }}
                          >
                            {value}
                          </Box>
                        ) : (
                          <Typography variant="body2" fontWeight={600}>
                            {value}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
