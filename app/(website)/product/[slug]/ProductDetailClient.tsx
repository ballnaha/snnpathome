"use client";

import React from "react";
import { 
  Box, 
  Container, 
  Stack, 
  Typography, 
  Breadcrumbs, 
  Link as MuiLink,
  Button,
  IconButton,
  TextField,
  Divider,
  Paper,
  Chip
} from "@mui/material";
import Link from "next/link";
import { 
  Add, 
  Minus, 
  ShoppingCart, 
  Flash, 
  DirectRight, 
  Facebook, 
  Instagram, 
  MessageQuestion, 
  ArrowRight2,
  Heart
} from "iconsax-react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useSnackbar } from "@/components/SnackbarProvider";

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [quantity, setQuantity] = React.useState(1);
  const { addItem } = useCart();
  const { showSnackbar } = useSnackbar();
  
  // Decoding slug for UI (not 100% accurate but for mock visual)
  const productName = decodeURIComponent(slug).replace(/-/g, ' ');

  // Mock Data for "Related" products
  const relatedProducts = [
    { id: "b1", name: "เบนโตะ ปลาหมึกอบทรงเครื่อง (สีแดง) 20ก.", price: 25, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-red.png" },
    { id: "j1", name: "เจเล่ บิวตี้ รสแอปเปิ้ล (สีเขียว) 150ก.", price: 10, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-green.png" },
    { id: "l1", name: "โลตัส ขนมรูปน่องไก่ รสทรงเครื่อง 55ก.", price: 20, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/lotus-original.png" },
    { id: "j2", name: "เจเล่ บิวตี้ รสแบล็คเคอร์แรนท์ (สีม่วง) 150ก.", price: 10, image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/jele-purple.png" },
  ];

  const handleQuantity = (type: 'add' | 'remove') => {
    if (type === 'add') setQuantity(q => q + 1);
    else if (quantity > 1) setQuantity(q => q - 1);
  }

  // Mock product data for cart
  const currentProduct = {
    id: slug,
    name: productName,
    price: 25,
    image: "https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-red.png",
    slug: slug,
  };

  const handleAddToCart = () => {
    addItem(currentProduct, quantity);
    showSnackbar(`เพิ่ม "${productName}" จำนวน ${quantity} ชิ้น ลงตะกร้าแล้ว`, "success");
  };

  const handleBuyNow = () => {
    addItem(currentProduct, quantity);
    // In the future, navigate to checkout
    showSnackbar(`เพิ่ม "${productName}" ลงตะกร้าแล้ว — พร้อมสั่งซื้อ!`, "success");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fdfdfd" }}>
      {/* SEO Title Hidden */}
      <Typography variant="h1" sx={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        {productName} - SNNP AT HOME
      </Typography>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, flexGrow: 1 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<ArrowRight2 size="14" color="#999" />} sx={{ mb: 4 }}>
          <MuiLink component={Link} href="/" color="inherit" sx={{ fontSize: '0.85rem' }}>หน้าแรก</MuiLink>
          <MuiLink component={Link} href="/all-products" color="inherit" sx={{ fontSize: '0.85rem' }}>สินค้าทั้งหมด</MuiLink>
          <Typography color="primary.main" fontWeight="600" sx={{ fontSize: '0.85rem' }}>{productName}</Typography>
        </Breadcrumbs>

        {/* Main Product Layout */}
        <Box 
          display="grid" 
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} 
          gap={{ xs: 4, md: 8 }}
        >
          {/* Left Side: Product Image(s) */}
          <Box>
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "grey.100", p: { xs: 2, md: 6 }, borderRadius: 6, display: 'flex', justifyContent: 'center', bgcolor: 'white' }}>
              <Box 
                component="img" 
                src="https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-red.png" 
                alt={productName}
                sx={{ width: '100%', maxWidth: 450, height: 'auto', objectFit: 'contain' }} 
              />
            </Paper>
            <Stack direction="row" spacing={2} mt={3} justifyContent="center">
               <Box sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'primary.main', borderRadius: 2, p: 1, bgcolor: 'white' }}>
                 <Box component="img" src="https://www.snnpathome.com/catalog/view/theme/snnpathome/image/bento-red.png" alt="Thumbnail" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
               </Box>
            </Stack>
          </Box>

          {/* Right Side: Product Info */}
          <Box>
             <Stack spacing={3}>
                <Chip label="AVAILABLE" color="success" size="small" sx={{ width: 'fit-content', fontWeight: 900, fontSize: '10px' }} />
                
                <Typography variant="h2" fontWeight="900" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.2 }}>
                  {productName}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h4" fontWeight="900" color="primary.main">
                    ฿ 25.00
                  </Typography>
                  <Typography variant="body2" color="grey.500" sx={{ textDecoration: 'line-through' }}>
                    ฿ 30.00
                  </Typography>
                </Stack>

                <Typography variant="body1" color="grey.600" sx={{ lineHeight: 1.8 }}>
                  ขนมขบเคี้ยวพรีเมียมจาก SNNP กรอบ อร่อย รสเข้มข้น ผลิตจากปลาเนื้อดี คุณภาพส่งออก สั่งซื้อได้แล้ววันนี้ ส่งตรงถึงหน้าบ้านคุณ
                </Typography>

                <Divider sx={{ my: 1 }} />

                {/* Quantity and Actions */}
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={4}>
                    <Typography variant="subtitle2" fontWeight="800">จำนวน :</Typography>
                    <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 10, px: 2, py: 0.5 }}>
                      <IconButton onClick={() => handleQuantity('remove')} size="small"><Minus size="18" variant="Linear" color="#d71414" /></IconButton>
                      <TextField 
                        value={quantity} 
                        size="small" 
                        variant="standard" 
                        inputProps={{ 
                          style: { textAlign: 'center', width: 40, fontWeight: 900 },
                          "aria-label": "Product Quantity"
                        }}
                        InputProps={{ disableUnderline: true }}
                      />
                      <IconButton onClick={() => handleQuantity('add')} size="small"><Add size="18" variant="Linear" color="#d71414" /></IconButton>
                    </Stack>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      onClick={handleAddToCart}
                      startIcon={<ShoppingCart variant="Bold" color="#d71414" />}
                      sx={{ py: 2, borderRadius: 15, fontWeight: 900, color: "primary.main", borderColor: "primary.main", borderWidth: 2, "&:hover": { borderWidth: 2 } }}
                    >
                      เพิ่มไปยังรถเข็น
                    </Button>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={handleBuyNow}
                      startIcon={<Flash variant="Bold" color="#FFF" />}
                      sx={{ py: 2, borderRadius: 15, fontWeight: 900, bgcolor: "primary.main", "&:hover": { bgcolor: "#cc0000" } }}
                    >
                      สั่งซื้อทันที
                    </Button>
                  </Stack>
                </Stack>

                {/* Social and Chat */}
                <Stack direction="row" spacing={3} mt={2} alignItems="center">
                  <Button startIcon={<MessageQuestion variant="Bold" color="#0084FF" />} sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.85rem' }}>แชทเลย</Button>
                  <Divider orientation="vertical" flexItem sx={{ height: 20 }} />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="grey.400" fontWeight="700">SHARE ON :</Typography>
                    <IconButton size="small" aria-label="Share on Facebook" sx={{ color: '#1877F2' }}><Facebook variant="Bold" size="18" color="#1877F2" /></IconButton>
                    <IconButton size="small" aria-label="Share on Instagram" sx={{ color: '#E4405F' }}><Instagram variant="Bold" size="18" color="#E4405F" /></IconButton>
                    <IconButton size="small" aria-label="Save to favorites" sx={{ color: '#d71414' }}><Heart variant="Bold" size="18" color="#d71414" /></IconButton>
                  </Stack>
                </Stack>
             </Stack>
          </Box>
        </Box>

        {/* Similar Products */}
        <Box sx={{ mt: 15 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
            <Box>
              <Typography variant="h4" fontWeight="900" gutterBottom>สินค้าที่คล้ายกัน</Typography>
              <Box sx={{ width: 60, height: 4, bgcolor: 'primary.main', borderRadius: 2 }} />
            </Box>
            <Button endIcon={<DirectRight size="18" color="#d71414" />} sx={{ fontWeight: 800, color: 'primary.main' }}>ดูสินค้าทั้งหมด</Button>
          </Stack>
          
          <Box display="grid" gridTemplateColumns={{ xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }} gap={3}>
            {relatedProducts.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
