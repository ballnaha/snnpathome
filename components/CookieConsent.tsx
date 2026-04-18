"use client";

import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, Stack, Slide, Link, useTheme, useMediaQuery } from "@mui/material";
import { ShieldTick } from "iconsax-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const rawConsent = localStorage.getItem("snnp-cookie-consent");
    if (!rawConsent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }

    try {
      const consent = JSON.parse(rawConsent);
      if (consent.status === "rejected") {
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const isExpired = Date.now() - consent.timestamp > twentyFourHours;
        if (isExpired) {
          setShow(true);
        }
      }
    } catch (e) {
      // Handle legacy string format or invalid JSON
      if (rawConsent === "rejected") {
         setShow(true); // Reset if it was old simple string
      }
    }
  }, []);

  const handleAction = (status: "accepted" | "rejected") => {
    const data = {
      status,
      timestamp: Date.now()
    };
    localStorage.setItem("snnp-cookie-consent", JSON.stringify(data));
    setShow(false);
  };

  if (typeof window === "undefined") return null;

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          bottom: { xs: 80, md: 24 }, // Sit above mobile bottom nav
          right: { xs: 8, md: 24 },
          left: { xs: 8, md: "auto" },
          maxWidth: { xs: "none", md: 400 },
          p: { xs: 1.5, md: 2.5 },
          borderRadius: { xs: 3, md: 4 },
          border: "1px solid",
          borderColor: "grey.200",
          bgcolor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          zIndex: 2000,
        }}
      >
        <Stack spacing={{ xs: 1.2, md: 2 }}>
          {/* Header/Title Line */}
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: "rgba(215, 20, 20, 0.08)", color: "primary.main", display: "flex" }}>
                <ShieldTick size="18" variant="Bold" color="#D71414" />
              </Box>
              <Typography variant="subtitle2" fontWeight={900} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                {isMobile ? "เราใช้คุกกี้" : "เราใช้คุกกี้เพื่อประสบการณ์ที่ดีขึ้น"}
              </Typography>
            </Stack>

            {/* Quick Actions for Mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
              <Button
                size="small"
                onClick={() => handleAction("rejected")}
                sx={{
                  color: "text.secondary",
                  minWidth: 'auto',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                ปฏิเสธ
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleAction("accepted")}
                sx={{
                  px: 2,
                  py: 0.5,
                  minWidth: 'auto',
                  borderRadius: 2,
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  boxShadow: "0 4px 10px rgba(215, 20, 20, 0.2)",
                }}
              >
                ตกลง
              </Button>
            </Box>
          </Stack>

          {/* Desktop Only Elaborated Text */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              เราใช้คุกกี้เพื่อพัฒนาประสิทธิภาพ และประสบการณ์ที่ดีในการใช้เว็บไซต์ของคุณ สามารถศึกษารายละเอียดได้ที่{" "}
              <Link href="/privacy-policy" sx={{ color: "primary.main", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                นโยบายความเป็นส่วนตัว
              </Link>
            </Typography>
          </Box>

          {/* Desktop Only Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              size="small"
              onClick={() => handleAction("rejected")}
              sx={{
                color: "text.secondary",
                fontWeight: 700,
                "&:hover": { bgcolor: "transparent", color: "text.primary" }
              }}
            >
              ปฏิเสธ
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleAction("accepted")}
              sx={{
                px: 3,
                borderRadius: 2.5,
                fontWeight: 800,
                boxShadow: "0 4px 12px rgba(215, 20, 20, 0.2)",
              }}
            >
              ยอมรับทั้งหมด
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Slide>
  );
}
