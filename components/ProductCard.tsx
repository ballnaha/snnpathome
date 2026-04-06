"use client";

import React from "react";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  slug?: string; // Optional slug for clean URLs
  name: string;
  price: number;
  image: string;
  category?: string;
  bestSeller?: boolean;
}

export default function ProductCard({ name, price, image, slug, bestSeller }: ProductCardProps) {
  // Fallback slug generation if not provided
  const productSlug = slug || encodeURIComponent(name.replace(/\s+/g, '-'));

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
        {bestSeller && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              bgcolor: 'primary.main', 
              color: 'white', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 2, 
              zIndex: 10,
              fontSize: '10px',
              fontWeight: 700
            }}
          >
            BEST SELLER
          </Box>
        )}
        <CardMedia
          component="img"
          height="220"
          image={image}
          alt={name}
          sx={{ objectFit: 'contain', p: 3, transition: '0.3s', "&:hover": { transform: 'scale(1.05)' } }}
        />
        <CardContent sx={{ textAlign: "center", pb: 3, pt: 1, flexGrow: 1 }}>
          <Typography 
            variant="body1" 
            fontWeight="700" 
            gutterBottom 
            sx={{ 
              height: 48, 
              fontSize: '0.9rem', 
              lineHeight: 1.5,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              color: 'text.primary'
            }}
          >
            {name}
          </Typography>
          <Typography variant="h6" fontWeight="900" color="primary.main">
            ฿ {price.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
