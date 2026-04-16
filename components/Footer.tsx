import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Facebook, Instagram, Youtube } from "iconsax-react";
import prisma from "@/lib/prisma";

export default async function Footer() {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "default" } });

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0b0b0b",
        color: "white",
        py: 3,
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        display: { xs: "none", md: "block" },
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
            <SocialIcon href={settings?.facebookUrl} icon={<Facebook variant="Bold" size={20} color="#FFF" />} />
            <SocialIcon href={settings?.instagramUrl} icon={<Instagram variant="Bold" size={20} color="#FFF" />} />
            <SocialIcon href={settings?.youtubeUrl} icon={<Youtube variant="Bold" size={20} color="#FFF" />} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href?: string | null }) {
  return (
    <Box
      component={href ? "a" : "span"}
      href={href ?? undefined}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      sx={{
        color: "grey.700",
        cursor: href ? "pointer" : "default",
        opacity: href ? 1 : 0.45,
        transition: "0.2s",
        "&:hover": { color: "primary.main" }
      }}
    >
      {icon}
    </Box>
  );
}
