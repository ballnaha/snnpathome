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
import { useRouter } from "next/navigation";
import { 
  Add, 
  Minus, 
  ShoppingCart, 
  Flash, 
  DirectRight, 
  Facebook, 
  Instagram, 
  MessageQuestion, 
  ArrowRight2
} from "iconsax-react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useSnackbar } from "@/components/SnackbarProvider";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount: number | null;
  image: string;
  images: string[];
  stock: number;
  isBestSeller: boolean;
  unitsPerCase: number | null;
  unitLabel: string | null;
  caseLabel: string | null;
  brand: {
    name: string;
    slug: string;
  };
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  isBestSeller?: boolean;
  createdAt?: string;
}

interface ProductDetailClientProps {
  product: ProductDetail;
  relatedProducts: RelatedProduct[];
  socialLinks: {
    facebookUrl: string | null;
    instagramUrl: string | null;
    lineUrl: string | null;
  };
}

export default function ProductDetailClient({ product, relatedProducts, socialLinks }: ProductDetailClientProps) {
  const [quantity, setQuantity] = React.useState(1);
  const hasShareLinks = Boolean(socialLinks.facebookUrl || socialLinks.instagramUrl);
  const galleryImages = React.useMemo(() => {
    const uniqueImages = product.images.length > 0 ? product.images : product.image ? [product.image] : [];
    return Array.from(new Set(uniqueImages.filter(Boolean)));
  }, [product.image, product.images]);
  const [selectedImage, setSelectedImage] = React.useState(galleryImages[0] ?? "");
  const { addItem } = useCart();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  React.useEffect(() => {
    setSelectedImage(galleryImages[0] ?? "");
  }, [galleryImages]);

  const packageLabel = product.unitsPerCase
    ? `1 ${product.caseLabel || "ลัง"} = ${product.unitsPerCase} ${product.unitLabel || "ชิ้น"}`
    : null;

  const handleQuantity = (type: 'add' | 'remove') => {
    if (type === 'add') setQuantity(q => q + 1);
    else if (quantity > 1) setQuantity(q => q - 1);
  };

  const currentProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: selectedImage || product.image,
    slug: product.slug,
  };

  const handleAddToCart = () => {
    addItem(currentProduct, quantity);
    showSnackbar(`เพิ่ม "${product.name}" จำนวน ${quantity} ชิ้น ลงตะกร้าแล้ว`, "success");
  };

  const handleBuyNow = () => {
    addItem(currentProduct, quantity);
    router.push("/checkout");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fdfdfd" }}>
      {/* SEO Title Hidden */}
      <Typography variant="h1" sx={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        {product.name} - SNNP AT HOME
      </Typography>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, flexGrow: 1 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<ArrowRight2 size="14" color="#999" />} sx={{ mb: 4 }}>
          <MuiLink component={Link} href="/" color="inherit" sx={{ fontSize: '0.85rem' }}>หน้าแรก</MuiLink>
          <MuiLink component={Link} href="/all-products" color="inherit" sx={{ fontSize: '0.85rem' }}>สินค้าทั้งหมด</MuiLink>
          <Typography color="primary.main" fontWeight="600" sx={{ fontSize: '0.85rem' }}>{product.name}</Typography>
        </Breadcrumbs>

        {/* Main Product Layout */}
        <Box 
          display="grid" 
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} 
          gap={{ xs: 4, md: 8 }}
        >
          {/* Left Side: Product Image(s) */}
          <Box>
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "grey.100", p: { xs: 2, md: 6 }, borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'white', minHeight: { xs: 320, md: 520 } }}>
              {selectedImage ? (
                <Box 
                  component="img" 
                  src={selectedImage}
                  alt={product.name}
                  sx={{ width: '100%', maxWidth: 520, maxHeight: { xs: 280, md: 420 }, height: 'auto', objectFit: 'contain' }} 
                />
              ) : (
                <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ color: 'text.secondary' }}>
                  <Typography variant="h6" fontWeight={800}>ไม่มีรูปสินค้า</Typography>
                  <Typography variant="body2">รูปสินค้าจะอัปเดตในภายหลัง</Typography>
                </Stack>
              )}
            </Paper>
            {galleryImages.length > 0 && (
              <Stack direction="row" spacing={2} mt={3} justifyContent="center" flexWrap="wrap" useFlexGap>
                {galleryImages.map((imageUrl) => (
                  <Box key={imageUrl} onClick={() => setSelectedImage(imageUrl)} sx={{ width: 88, height: 88, border: '2px solid', borderColor: selectedImage === imageUrl ? 'primary.main' : 'grey.200', borderRadius: 3, p: 1, bgcolor: 'white', cursor: 'pointer', transition: 'border-color 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                    <Box component="img" src={imageUrl} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Right Side: Product Info */}
          <Box>
             <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Chip label={product.stock > 0 ? "AVAILABLE" : "OUT OF STOCK"} color={product.stock > 0 ? "success" : "default"} size="small" sx={{ width: 'fit-content', fontWeight: 900, fontSize: '10px' }} />
                  {product.isBestSeller && (
                    <Chip label="BEST SELLER" color="warning" size="small" sx={{ width: 'fit-content', fontWeight: 900, fontSize: '10px' }} />
                  )}
                </Stack>

                <Typography variant="overline" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 2 }}>
                  {product.brand.name}
                </Typography>
                
                <Typography variant="h2" fontWeight="900" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.2 }}>
                  {product.name}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h4" fontWeight="900" color="primary.main">
                    ฿ {product.price.toLocaleString()}
                  </Typography>
                  {product.discount && (
                    <Typography variant="body2" color="grey.500" sx={{ textDecoration: 'line-through' }}>
                      ฿ {product.discount.toLocaleString()}
                    </Typography>
                  )}
                </Stack>

                {packageLabel && (
                  <Paper elevation={0} sx={{ px: 2, py: 1.5, borderRadius: 3, bgcolor: '#fff7ed', border: '1px solid', borderColor: '#fdba74', width: 'fit-content' }}>
                    <Typography variant="subtitle2" fontWeight="800" color="#9a3412">
                      {packageLabel}
                    </Typography>
                  </Paper>
                )}

                <Typography variant="body1" color="grey.600" sx={{ lineHeight: 1.8 }}>
                  {product.description || "ยังไม่มีรายละเอียดสินค้าเพิ่มเติม"}
                </Typography>

                <Divider sx={{ my: 1 }} />

                {/* Quantity and Actions */}
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={4}>
                    <Typography variant="subtitle2" fontWeight="800">จำนวน :</Typography>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 10, px: 2, py: 0.5 }}>
                        <IconButton onClick={() => handleQuantity('remove')} size="small"><Minus size="18" variant="Linear" color="#d71414" /></IconButton>
                        <TextField 
                          value={quantity} 
                          slotProps={{ input: { readOnly: true } }}
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
                      <Typography variant="subtitle2" fontWeight="700" color="text.secondary">
                        {product.caseLabel || "ลัง"}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      startIcon={<ShoppingCart variant="Bold" color="#d71414" />}
                      sx={{ py: 2, borderRadius: 15, fontWeight: 900, color: "primary.main", borderColor: "primary.main", borderWidth: 2, "&:hover": { borderWidth: 2 } }}
                    >
                      เพิ่มไปยังรถเข็น
                    </Button>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={handleBuyNow}
                      disabled={product.stock <= 0}
                      startIcon={<Flash variant="Bold" color="#FFF" />}
                      sx={{ py: 2, borderRadius: 15, fontWeight: 900, bgcolor: "primary.main", "&:hover": { bgcolor: "#cc0000" } }}
                    >
                      สั่งซื้อทันที
                    </Button>
                  </Stack>
                </Stack>

                {/* Social and Chat */}
                <Stack direction="row" spacing={3} mt={2} alignItems="center">
                  <Button component={socialLinks.lineUrl ? "a" : "button"} href={socialLinks.lineUrl ?? undefined} target={socialLinks.lineUrl ? "_blank" : undefined} rel={socialLinks.lineUrl ? "noreferrer" : undefined} startIcon={<MessageQuestion variant="Bold" color="#0084FF" />} sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.85rem' }}>
                    แชทเลย
                  </Button>
                  {hasShareLinks && <Divider orientation="vertical" flexItem sx={{ height: 20 }} />}
                  <Stack direction="row" spacing={1} alignItems="center">
                    {hasShareLinks && (
                      <Typography variant="caption" color="grey.400" fontWeight="700">SHARE ON :</Typography>
                    )}
                    {socialLinks.facebookUrl && (
                      <IconButton component="a" href={socialLinks.facebookUrl} target="_blank" rel="noreferrer" size="small" aria-label="Share on Facebook" sx={{ color: '#1877F2' }}><Facebook variant="Bold" size="18" color="#1877F2" /></IconButton>
                    )}
                    {socialLinks.instagramUrl && (
                      <IconButton component="a" href={socialLinks.instagramUrl} target="_blank" rel="noreferrer" size="small" aria-label="Share on Instagram" sx={{ color: '#E4405F' }}><Instagram variant="Bold" size="18" color="#E4405F" /></IconButton>
                    )}
                  </Stack>
                </Stack>
             </Stack>
          </Box>
        </Box>

        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 15 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
              <Box>
                <Typography variant="h4" fontWeight="900" gutterBottom>สินค้าที่คล้ายกัน</Typography>
                <Box sx={{ width: 60, height: 4, bgcolor: 'primary.main', borderRadius: 2 }} />
              </Box>
              <Button component={Link} href="/all-products" endIcon={<DirectRight size="18" color="#d71414" />} sx={{ fontWeight: 800, color: 'primary.main' }}>ดูสินค้าทั้งหมด</Button>
            </Stack>
            
            <Box display="grid" gridTemplateColumns={{ xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }} gap={3}>
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} {...relatedProduct} />
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
