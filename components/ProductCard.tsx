"use client";

import React from "react";
import { Card, CardContent, CardMedia, Typography, Box, Stack } from "@mui/material";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  isBestSeller?: boolean;
  createdAt?: string | Date | null;
  unitsPerCase?: number | null;
  unitLabel?: string | null;
  caseLabel?: string | null;
}

const NEW_DAYS = 30;

export default function ProductCard({ id, name, price, originalPrice, image, slug, isBestSeller, createdAt }: ProductCardProps) {
  const productSlug = slug || encodeURIComponent(name.replace(/\s+/g, '-'));

  const isNew = createdAt
    ? (Date.now() - new Date(createdAt).getTime()) / 86400000 <= NEW_DAYS
    : false;

  return (
    <Link href={`/product/${productSlug}`} style={{ textDecoration: 'none' }}>
      <Card
        elevation={0}
        sx={{
          maxWidth: 300,
          borderRadius: 4,
          border: 1,
          borderColor: "grey.200",
          transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: "primary.main",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
          },
          cursor: "pointer",
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Badges top-left */}
        {(isBestSeller || isNew) && (
          <Stack
            direction="column"
            gap={0.5}
            alignItems="flex-start"
            sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}
          >
            {isBestSeller && (
              <Box sx={{ bgcolor: '#f59e0b', color: 'white', px: 1.2, py: 0.4, borderRadius: 1.5, fontSize: '10px', fontWeight: 800, lineHeight: 1.2 }}>
                BEST SELLER
              </Box>
            )}
            {isNew && (
              <Box sx={{ bgcolor: '#22c55e', color: 'white', px: 1.2, py: 0.4, borderRadius: 1.5, fontSize: '10px', fontWeight: 800, lineHeight: 1.2 }}>
                NEW
              </Box>
            )}
          </Stack>
        )}

        <CardMedia
          component="img"
          height="260"
          image={image}
          alt={name}
          sx={{ objectFit: 'contain', p: 2, transition: '0.3s', "&:hover": { transform: 'scale(1.05)' } }}
        />
        <CardContent sx={{ textAlign: "center", pb: 3, pt: 1, flexGrow: 1 }}>
          <Typography
            variant="body1"
            fontWeight="500"
            gutterBottom
            sx={{
              height: 60,
              fontSize: '1.1rem',
              lineHeight: 1.7,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              color: 'text.primary'
            }}
          >
            {name}
          </Typography>
          {originalPrice && (
            <Typography variant="body2" color="text.disabled" sx={{ textDecoration: 'line-through', fontWeight: 600 }}>
              ฿ {originalPrice.toLocaleString()}
            </Typography>
          )}
          <Typography variant="h6" fontWeight="900" color="primary.main">
            ฿ {price.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}

