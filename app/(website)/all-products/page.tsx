"use client";

import React from "react";
import { 
  Box, 
  Container, 
  Stack, 
  Typography, 
  TextField, 
  InputAdornment, 
  Button, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Breadcrumbs,
  Link as MuiLink
} from "@mui/material";
import Link from "next/link";
import { SearchNormal1, ArrowRight2 } from "iconsax-react";
import ProductCard from "@/components/ProductCard";

// Mock Data for All Products
const allProductsData = [
  { id: "1", name: "เบนโตะ ปลาหมึกอบทรงเครื่อง (สีแดง) 20ก.", price: 25, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-red.png", bestSeller: true },
  { id: "2", name: "เจเล่ บิวตี้ รสแอปเปิ้ล (สีเขียว) 150ก.", price: 10, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-green.png", bestSeller: true },
  { id: "3", name: "โลตัส ขนมรูปน่องไก่ รสทรงเครื่อง 55ก.", price: 20, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/lotus-original.png" },
  { id: "4", name: "เบนโตะ ปลาหมึกย่างน้ำพริกตำรับไทย (สีน้ำเงิน) 20ก.", price: 25, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-blue.png" },
  { id: "5", name: "เบนโตะ ปลาหมึกอบน้ำจิ้มหวาน (สีเขียว) 20ก.", price: 25, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-green.png" },
  { id: "6", name: "เจเล่ บิวตี้ รสลิ้นจี่ (สีชมพู) 150ก.", price: 10, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-pink.png" },
  { id: "7", name: "โลตัส ขนมรูปน่องไก่ รสแซ่บซี๊ด 55ก.", price: 20, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/lotus-spicy.png" },
  { id: "8", name: "สวีทตี้ ขนมเยลลี่กลิ่นผลไม้ต่างๆ 20ก.", price: 5, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-white.png" },
];

export default function AllProductsPage() {
  const [sortBy, setSortBy] = React.useState("popularity");

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* SEO Title */}
      <Typography variant="h1" sx={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        สินค้าทั้งหมด - SNNP AT HOME
      </Typography>

      {/* 1. Search Hero Section */}
      <Box component="section" sx={{ bgcolor: "#eee", py: { xs: 6, md: 10 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight="900" mb={4} sx={{ color: "#333", fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
            ค้นหาสินค้าที่ท่านต้องการ
          </Typography>
          <Stack direction="row" spacing={0} sx={{ maxWidth: 600, mx: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <TextField 
              fullWidth 
              placeholder="ค้นหาชื่อสินค้า..." 
              variant="outlined"
              sx={{ 
                bgcolor: "white", 
                "& fieldset": { borderRadius: "10px 0 0 10px", borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "transparent" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchNormal1 size="20" color="#d71414" />
                  </InputAdornment>
                ),
                "aria-label": "Search products"
              }}
            />
            <Button 
              variant="contained" 
              sx={{ 
                px: 4, 
                borderRadius: "0 10px 10px 0", 
                bgcolor: "primary.main", 
                "&:hover": { bgcolor: "#cc0000" },
                fontWeight: 700
              }}
            >
              ค้นหา
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* 2. Main Content Area */}
      <Container maxWidth="lg" component="main" sx={{ py: 6, flexGrow: 1 }}>
        <Breadcrumbs 
          separator={<ArrowRight2 size="14" color="#999" />} 
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <MuiLink component={Link} href="/" underline="hover" color="inherit" sx={{ fontSize: '0.85rem' }}>
            หน้าแรก
          </MuiLink>
          <Typography color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
            สินค้าทั้งหมด
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px 1fr" }, gap: 4 }}>
          
          {/* Sidebar Menu */}
          <Box component="aside">
            <Box sx={{ bgcolor: "white", borderRadius: 3, overflow: "hidden", border: "1px solid", borderColor: "grey.200" }}>
              <Box sx={{ bgcolor: "primary.main", color: "white", px: 3, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="800">เมนู</Typography>
              </Box>
              <Stack component="nav">
                <SidebarItem label="สินค้าทั้งหมด" active />
                <SidebarItem label="Jele" />
                <SidebarItem label="Bento" />
                <SidebarItem label="Lotus" />
                <SidebarItem label="Bakery House" />
                <SidebarItem label="Magic Farm" />
              </Stack>
            </Box>
          </Box>

          {/* Product Grid Area */}
          <Box>
            {/* Header / Filter bar */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h3" fontWeight="900" sx={{ fontSize: '1.5rem' }}>สินค้าทั้งหมด</Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="sort-select-label">เรียงตาม</InputLabel>
                <Select
                  labelId="sort-select-label"
                  label="เรียงตาม"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as string)}
                  sx={{ bgcolor: "white", borderRadius: 2 }}
                >
                  <MenuItem value="popularity">ความเป็นที่นิยม</MenuItem>
                  <MenuItem value="price-low">ราคาต่ำสุดไปสูงสุด</MenuItem>
                  <MenuItem value="price-high">ราคาสูงสุดไปต่ำสุด</MenuItem>
                  <MenuItem value="latest">ล่าสุด</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Grid */}
            <Box 
              display="grid" 
              gridTemplateColumns={{ xs: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
              gap={3}
            >
              {allProductsData.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </Box>

            {/* Load More Button */}
            <Box textAlign="center" mt={8}>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ 
                  borderRadius: 10, 
                  px: 6, 
                  py: 1.5, 
                  fontWeight: 800, 
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 }
                }}
              >
                โหลดเพิ่มเติม
              </Button>
            </Box>
          </Box>

        </Box>
      </Container>
    </Box>
  );
}

function SidebarItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <Box 
      sx={{ 
        px: 3, 
        py: 1.5, 
        cursor: "pointer", 
        bgcolor: active ? "rgba(215, 20, 20, 0.05)" : "transparent",
        borderLeft: active ? "4px solid" : "4px solid transparent",
        borderColor: "primary.main",
        transition: "0.2s",
        "&:hover": { bgcolor: "rgba(215, 20, 20, 0.03)" }
      }}
    >
      <Typography variant="body2" fontWeight={active ? 800 : 500} color={active ? "primary.main" : "text.secondary"}>
        {label}
      </Typography>
    </Box>
  );
}
