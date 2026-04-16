"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

interface BrandCardProps {
  name: string;
  slug: string;
  logo?: string;
}

export default function BrandCard({ name, slug, logo }: BrandCardProps) {
  return (
    <Link href={`/all-products?brand=${slug}`} style={{ textDecoration: "none" }}>
      <Box
        component="article"
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          border: "2px solid",
          borderColor: "grey.100",
          textAlign: "center",
          bgcolor: "white",
          transition: "0.3s",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          minHeight: { xs: 120, md: 160 },
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-5px)",
            boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          },
        }}
      >
        {logo ? (
          <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Box
              component="img"
              src={logo}
              alt={name}
              sx={{
                height: { xs: 70, md: 100 },
                width: "auto",
                maxWidth: "90%",
                objectFit: "contain",
              }}
            />
          </Box>
        ) : (
          <Typography variant="subtitle1" fontWeight="900" color="primary.main" sx={{ fontSize: { xs: "0.85rem", md: "1rem" } }}>
            {name}
          </Typography>
        )}
        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", md: "0.8rem" } }}>
          {name}
        </Typography>
      </Box>
    </Link>
  );
}
