import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 2 }} alignItems="center">
              <Typography variant="caption" sx={{ color: "grey.700", fontWeight: 500 }}>
                © 2026 Srinanaporn Marketing Public Company Limited.
              </Typography>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, color: 'grey.800', fontSize: '0.7rem' }}>|</Box>
              <Stack direction="row" spacing={2}>
                <Link href="/privacy-policy" style={{ textDecoration: 'none' }}>
                  <Typography variant="caption" sx={{ color: "grey.600", "&:hover": { color: 'primary.main' }, transition: '0.2s' }}>
                    นโยบายความเป็นส่วนตัว
                  </Typography>
                </Link>
                <Link href="/terms-of-service" style={{ textDecoration: 'none' }}>
                  <Typography variant="caption" sx={{ color: "grey.600", "&:hover": { color: 'primary.main' }, transition: '0.2s' }}>
                    เงื่อนไขการใช้บริการ
                  </Typography>
                </Link>
              </Stack>
            </Stack>
          </Stack>


          {/* Clean Social Icons */}
          <Stack direction="row" spacing={3}>
            {settings?.facebookUrl && (
              <SocialIcon href={settings.facebookUrl} icon={<Facebook variant="Bold" size={20} color="#FFF" />} />
            )}
            {settings?.instagramUrl && (
              <SocialIcon href={settings.instagramUrl} icon={<Instagram variant="Bold" size={20} color="#FFF" />} />
            )}
            {settings?.youtubeUrl && (
              <SocialIcon href={settings.youtubeUrl} icon={<Youtube variant="Bold" size={20} color="#FFF" />} />
            )}
            {settings?.lineUrl && (
              <SocialIcon 
                href={settings.lineUrl} 
                icon={<Box component="span" sx={{ fontWeight: 900, fontSize: '0.8rem', border: '1.5px solid', px: 0.5, borderRadius: 1.5, borderColor: 'white', lineHeight: 1 }}>LINE</Box>} 
              />
            )}
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
