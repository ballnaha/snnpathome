"use client";

import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Facebook, Instagram, Youtube } from "iconsax-react";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0b0b0b", // Deeper black for a subtle finish
        color: "white",
        py: 3, // Minimal height as requested
        borderTop: "1px solid rgba(255, 255, 255, 0.05)"
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 2, md: 4 }}
        >
          {/* Super Minimal Brand Info */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">

            <Typography variant="caption" sx={{ color: "grey.700", fontWeight: 500 }}>
              © 2026 Srinanaporn Marketing Public Company Limited.
            </Typography>
          </Stack>


          {/* Clean Social Icons */}
          <Stack direction="row" spacing={3}>
            <SocialIcon icon={<Facebook variant="Bold" size={20} color="#FFF" />} />
            <SocialIcon icon={<Instagram variant="Bold" size={20} color="#FFF" />} />
            <SocialIcon icon={<Youtube variant="Bold" size={20} color="#FFF" />} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <Box
      sx={{
        color: "grey.700",
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { color: "primary.main" }
      }}
    >
      {icon}
    </Box>
  );
}

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: "grey.600",
        fontWeight: 700,
        letterSpacing: 1,
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { color: "white" }
      }}
    >
      {children}
    </Typography>
  );
}
