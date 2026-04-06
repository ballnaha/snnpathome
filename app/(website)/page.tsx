"use client";

import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";

// Mock Data for Bento
const bentoProducts = [
  { id: "b1", name: "เบนโตะ ปลาหมึกอบทรงเครื่อง (สีแดง) 20ก.", price: 25, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-red.png", bestSeller: true },
  { id: "b2", name: "เบนโตะ ปลาหมึกย่างน้ำพริกตำรับไทย (สีน้ำเงิน) 20ก.", price: 25, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-blue.png" },
  { id: "b3", name: "เบนโตะ ปลาหมึกอบกรอบ (สีเหลือง) 20ก.", price: 25, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-yellow.png" },
  { id: "b4", name: "เบนโตะ ปลาหมึกอบน้ำจิ้มหวาน (สีเขียว) 20ก.", price: 25, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-green.png" },
];

// Mock Data for Jele
const jeleProducts = [
  { id: "j1", name: "เจเล่ บิวตี้ รสแอปเปิ้ล (สีเขียว) 150ก.", price: 10, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-green.png", bestSeller: true },
  { id: "j2", name: "เจเล่ บิวตี้ รสแบล็คเคอร์แรนท์ (สีม่วง) 150ก.", price: 10, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-purple.png" },
  { id: "j3", name: "เจเล่ บิวตี้ รสลิ้นจี่ (สีชมพู) 150ก.", price: 10, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-pink.png" },
  { id: "j4", name: "เจเล่ บิวตี้ รสองุ่น (สีขาว) 150ก.", price: 10, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-white.png" },
];

// Mock Data for Lotus
const lotusProducts = [
  { id: "l1", name: "โลตัส ขนมรูปน่องไก่ รสทรงเครื่อง 55ก.", price: 20, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/lotus-original.png", bestSeller: true },
  { id: "l2", name: "โลตัส ขนมรูปน่องไก่ รสแซ่บซี๊ด 55ก.", price: 20, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/lotus-spicy.png" },
];

// Combine all for "Total Products"
const allProducts = [...bentoProducts, ...jeleProducts, ...lotusProducts].slice(0, 8);

export default function Home() {
  return (
    <Box>
      {/* SEO Title */}
      <Typography variant="h1" sx={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        SNNP AT HOME - สั่งซื้อออนไลน์สินค้าเครือ SNNP เบนโตะ เจเล่ โลตัส
      </Typography>

      <Box component="main">
        <Hero />

        {/* 1. Shared Brand Showcase (Icon Navigation) */}
        <Box component="section" sx={{ bgcolor: "#FDFDFD", py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
             <Typography variant="h2" fontWeight="900" textAlign="center" mb={6} sx={{ textTransform: "uppercase", letterSpacing: 3, fontSize: { xs: '1.5rem', md: '2.2rem' } }}>
              Browse By Brands
            </Typography>
            <Box 
              display="grid" 
              gridTemplateColumns={{ xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" }} 
              gap={3}
            >
              {['Bento', 'Jele', 'Lotus', 'Squidy', 'Magic Farm', 'Sunsiri'].map((brand) => (
                <BrandCard key={brand} name={brand} />
              ))}
            </Box>
          </Container>
        </Box>

        {/* 2. Brand Specific Sections */}
        <Box component="section">
          <ProductSection 
            title="Bento" 
            subtitle="EXPLORE BENTO" 
            products={bentoProducts} 
          />
        </Box>
        
        <Box component="section" sx={{ bgcolor: "white" }}>
          <ProductSection 
            title="Jele" 
            subtitle="EXPLORE JELE" 
            products={jeleProducts} 
          />
        </Box>

        <Box component="section">
          <ProductSection 
            title="Lotus" 
            subtitle="EXPLORE LOTUS" 
            products={lotusProducts} 
          />
        </Box>

        {/* 3. All Products Section (Summary) */}
        <Box sx={{ bgcolor: "primary.main", py: 4 }}>
           <Typography variant="h3" fontWeight="900" color="white" textAlign="center" sx={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: '1.5rem' }}>
             สินค้าแนะนำสำหรับคุณ
           </Typography>
        </Box>
        <Box component="section" sx={{ bgcolor: "#fafafa", py: 4 }}>
          <ProductSection 
            title="ALL PRODUCTS" 
            subtitle="RECOMMENDED FOR YOU" 
            products={allProducts} 
          />
        </Box>
      </Box>
    </Box>
  );
}

function BrandCard({ name }: { name: string }) {
  return (
    <Box 
      component="article"
      sx={{ 
        p: 3, 
        borderRadius: 4, 
        border: "2px solid", 
        borderColor: "grey.100", 
        textAlign: "center",
        bgcolor: "white",
        transition: "0.3s",
        cursor: "pointer",
        "&:hover": { 
          borderColor: "primary.main", 
          transform: "translateY(-5px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
        }
      }}
    >
      <Typography variant="subtitle1" fontWeight="900" color="text.secondary">
        {name}
      </Typography>
    </Box>
  );
}
