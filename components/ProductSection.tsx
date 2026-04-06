"use client";

import React from "react";
import { Box, Typography, Button, Container, Stack } from "@mui/material";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  bestSeller?: boolean;
}

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
}

export default function ProductSection({ title, subtitle, products }: ProductSectionProps) {
  return (
    <Box component="section" sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h4" 
            fontWeight="900" 
            gutterBottom 
            sx={{ letterSpacing: 2, textTransform: "uppercase", color: "primary.main" }}
          >
            {title}
          </Typography>
          
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} mb={4}>
            <Box sx={{ height: 2, width: 40, bgcolor: "primary.main" }} />
            <Typography variant="subtitle2" fontWeight="700" sx={{ letterSpacing: 3, opacity: 0.8 }}>
              {subtitle}
            </Typography>
            <Box sx={{ height: 2, width: 40, bgcolor: "primary.main" }} />
          </Stack>
        </Box>

        <Box 
          display="grid" 
          gap={3} 
          gridTemplateColumns={{ 
            xs: "repeat(2, 1fr)", 
            sm: "repeat(3, 1fr)", 
            md: "repeat(4, 1fr)" 
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </Box>

        <Box textAlign="center" mt={6}>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ 
              px: 6, 
              py: 1.5, 
              borderRadius: "50px", 
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: "0 8px 16px rgba(215, 20, 20, 0.2)",
              "&:hover": { boxShadow: "0 12px 24px rgba(215, 20, 20, 0.3)" }
            }}
          >
            ดูเพิ่มเติม
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
