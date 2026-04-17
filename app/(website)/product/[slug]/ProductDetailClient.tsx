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
  Chip,
  ToggleButton,
  ToggleButtonGroup,
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
  ArrowRight2,
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
  sellMode: string;
  unitPrice: number | null;
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
  // selectedMode is only relevant when sellMode === "BOTH"
  const [selectedMode, setSelectedMode] = React.useState<"CASE" | "UNIT">("CASE");
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

  // Derived sell-mode values
  const activeMode: "CASE" | "UNIT" =
    product.sellMode === "UNIT_ONLY" ? "UNIT" :
    product.sellMode === "CASE_ONLY" ? "CASE" :
    selectedMode;

  const caseLabel = product.caseLabel || "ลัง";
  const unitLabel = product.unitLabel || "ซอง";

  const activePrice = activeMode === "UNIT" ? (product.unitPrice ?? product.price) : product.price;
  const activeLabel = activeMode === "UNIT" ? unitLabel : caseLabel;
  // Use a variant-aware cart ID so CASE and UNIT are separate line items
  const activeCartId = product.sellMode === "BOTH" ? `${product.id}-${activeMode.toLowerCase()}` : product.id;
  const activeCartName = product.sellMode === "BOTH"
    ? `${product.name} (ต่อ${activeLabel})`
    : product.name;

  const packageLabel = product.unitsPerCase
    ? `1 ${caseLabel} = ${product.unitsPerCase} ${unitLabel}`
    : null;

  const handleQuantity = (type: 'add' | 'remove') => {
    if (type === 'add') setQuantity(q => q + 1);
    else if (quantity > 1) setQuantity(q => q - 1);
  };

  const currentCartItem = {
    id: activeCartId,
    name: activeCartName,
    price: activePrice,
    image: selectedImage || product.image,
    slug: product.slug,
  };

  const handleAddToCart = () => {
    addItem(currentCartItem, quantity);
    showSnackbar(`เพิ่ม "${activeCartName}" จำนวน ${quantity} ${activeLabel} ลงตะกร้าแล้ว`, "success");
  };

  const handleBuyNow = () => {
    addItem(currentCartItem, quantity);
    router.push("/checkout");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fdfdfd" }}>
      {/* SEO Title Hidden */}
      <Typography variant="h1" sx={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        {product.name} - SNNP AT HOME
      </Typography>

      {/* Main scrollable content */}
      <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 6 }, pb: { xs: "150px", md: 8 }, px: { xs: 2, sm: 3 } }}>
        {/* Breadcrumbs — mobile */}
        <Breadcrumbs
          separator={<ArrowRight2 size="11" color="#999" />}
          sx={{ mb: 2, display: { xs: 'flex', md: 'none' } }}
        >
          <MuiLink component={Link} href="/" color="inherit" sx={{ fontSize: '0.74rem', textDecoration: 'none' }}>
            หน้าแรก
          </MuiLink>
          <MuiLink component={Link} href="/all-products" color="inherit" sx={{ fontSize: '0.74rem', textDecoration: 'none' }}>
            สินค้า
          </MuiLink>
          <Typography color="primary.main" fontWeight="700" sx={{ fontSize: '0.74rem' }} noWrap>
            {product.name}
          </Typography>
        </Breadcrumbs>

        {/* Breadcrumbs — desktop only */}
        <Breadcrumbs separator={<ArrowRight2 size="12" color="#999" />} sx={{ mb: { xs: 2, md: 4 }, display: { xs: 'none', md: 'flex' }, px: { xs: 2, sm: 0 } }}>
          <MuiLink component={Link} href="/" color="inherit" sx={{ fontSize: '0.78rem' }}>หน้าแรก</MuiLink>
          <MuiLink component={Link} href="/all-products" color="inherit" sx={{ fontSize: '0.78rem' }}>สินค้าทั้งหมด</MuiLink>
          <Typography color="primary.main" fontWeight="600" sx={{ fontSize: '0.78rem' }} noWrap>{product.name}</Typography>
        </Breadcrumbs>

        {/* Main Product Layout */}
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
          gap={{ xs: 0, md: 8 }}
        >
          {/* Left Side: Product Image(s) */}
          <Box>
            {/* Image container — padded on mobile, clean on desktop */}
            <Paper elevation={0} sx={{
              border: 'none',
              p: { xs: 0, md: 5 }, borderRadius: { xs: 0, md: 6 },
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              bgcolor: 'white', minHeight: { xs: 300, md: 480 },
              overflow: 'hidden',
            }}>
              {selectedImage ? (
                <Box
                  component="img"
                  src={selectedImage}
                  alt={product.name}
                  sx={{ width: '100%', maxWidth: 480, maxHeight: { xs: 220, md: 400 }, height: 'auto', objectFit: 'contain' }}
                />
              ) : (
                <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ color: 'text.secondary' }}>
                  <Typography variant="h6" fontWeight={800}>ไม่มีรูปสินค้า</Typography>
                  <Typography variant="body2">รูปสินค้าจะอัปเดตในภายหลัง</Typography>
                </Stack>
              )}
            </Paper>

            {/* Gallery thumbnails — horizontal scroll on mobile */}
            {galleryImages.length > 1 && (
              <Box
                sx={{
                  display: 'flex', flexDirection: 'row', gap: 1.5, mt: 2,
                  overflowX: 'auto', pb: 0.5,
                  justifyContent: { xs: 'flex-start', md: 'center' },
                  '&::-webkit-scrollbar': { height: 4 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'grey.100', borderRadius: 2 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 2 },
                }}
              >
                {galleryImages.map((imageUrl) => (
                  <Box
                    key={imageUrl}
                    onClick={() => setSelectedImage(imageUrl)}
                    sx={{
                      flexShrink: 0,
                      width: { xs: 64, md: 80 }, height: { xs: 64, md: 80 },
                      border: '2px solid',
                      borderColor: selectedImage === imageUrl ? 'primary.main' : 'grey.200',
                      borderRadius: 2, p: 0.75, bgcolor: 'white',
                      cursor: 'pointer', transition: 'border-color 0.2s',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box component="img" src={imageUrl} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Right Side: Product Info */}
          <Box sx={{ px: { xs: 2, md: 0 } }}>
            <Stack spacing={{ xs: 2, md: 3 }}>
              {/* Badges */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={product.stock > 0 ? "AVAILABLE" : "OUT OF STOCK"}
                  color={product.stock > 0 ? "success" : "default"}
                  size="small" sx={{ fontWeight: 900, fontSize: '10px' }}
                />
                {product.isBestSeller && (
                  <Chip label="BEST SELLER" color="warning" size="small" sx={{ fontWeight: 900, fontSize: '10px' }} />
                )}
              </Stack>

              <Box>
                <Typography variant="overline" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 2, fontSize: '0.7rem' }}>
                  {product.brand.name}
                </Typography>
                <Typography variant="h2" fontWeight="900" sx={{ fontSize: { xs: '1.5rem', md: '2.2rem' }, lineHeight: 1.25, mt: 0.5 }}>
                  {product.name}
                </Typography>
              </Box>

              {/* Sell Mode Toggle — only shown when BOTH */}
              {product.sellMode === "BOTH" && (
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                    เลือกหน่วยซื้อ
                  </Typography>
                  <ToggleButtonGroup
                    value={selectedMode}
                    exclusive
                    onChange={(_, v) => v && setSelectedMode(v)}
                    size="small"
                    fullWidth
                    sx={{
                      gap: 1,
                      "& .MuiToggleButtonGroup-grouped": { border: "2px solid !important", borderRadius: "10px !important", mx: 0 },
                      "& .MuiToggleButton-root": {
                        flex: 1, py: 1.25, fontWeight: 800, fontSize: "0.85rem",
                        borderColor: "grey.300 !important",
                        "&.Mui-selected": { bgcolor: "primary.main", color: "white", borderColor: "primary.main !important" },
                      },
                    }}
                  >
                    <ToggleButton value="CASE">ต่อ{caseLabel}</ToggleButton>
                    <ToggleButton value="UNIT">ต่อ{unitLabel}</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}

              {/* Price */}
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Stack direction="row" alignItems="baseline" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Typography variant="h4" fontWeight="900" color="primary.main" sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                    ฿{activePrice.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={700}>
                    / {activeLabel}
                  </Typography>
                  {product.discount !== null && activeMode === "CASE" && product.sellMode !== "UNIT_ONLY" && (
                    <Typography variant="body2" color="grey.400" sx={{ textDecoration: 'line-through' }}>
                      ฿{product.discount.toLocaleString()}
                    </Typography>
                  )}
                  {product.sellMode === "BOTH" && activeMode === "CASE" && product.unitPrice !== null && (
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      (฿{product.unitPrice.toLocaleString()} / {unitLabel})
                    </Typography>
                  )}
                </Stack>

                {packageLabel && (
                  <Paper elevation={0} sx={{ px: 1.5, py: 0.75, borderRadius: 999, bgcolor: '#fff7ed', border: '1px solid', borderColor: '#fdba74', width: 'fit-content' }}>
                    <Typography variant="caption" fontWeight="800" color="#9a3412">
                      📦 {packageLabel}
                    </Typography>
                  </Paper>
                )}
              </Stack>

              {product.description && (
                <Typography variant="body2" color="grey.600" sx={{ lineHeight: 1.85, display: { xs: 'none', md: 'block' } }}>
                  {product.description}
                </Typography>
              )}

              <Divider sx={{ display: { xs: 'none', md: 'block' } }} />

              {/* Quantity + Action Buttons — desktop only; mobile uses sticky bar */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  '@media (hover: none) and (pointer: coarse)': {
                    display: 'none',
                  },
                }}
              >
                <Stack spacing={2.5}>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Typography variant="subtitle2" fontWeight="800">จำนวน :</Typography>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 10, px: 1.5, py: 0.5 }}>
                        <IconButton onClick={() => handleQuantity('remove')} size="small"><Minus size="18" variant="Linear" color="#d71414" /></IconButton>
                        <TextField
                          value={quantity}
                          slotProps={{ input: { readOnly: true } }}
                          size="small" variant="standard"
                          inputProps={{ style: { textAlign: 'center', width: 36, fontWeight: 900 }, "aria-label": "จำนวนสินค้า" }}
                          InputProps={{ disableUnderline: true }}
                        />
                        <IconButton onClick={() => handleQuantity('add')} size="small"><Add size="18" variant="Linear" color="#d71414" /></IconButton>
                      </Stack>
                      <Typography variant="subtitle2" fontWeight="700" color="text.secondary">{activeLabel}</Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined" fullWidth onClick={handleAddToCart} disabled={product.stock <= 0}
                      startIcon={<ShoppingCart variant="Bold" color="#d71414" />}
                      sx={{ py: 1.75, borderRadius: 15, fontWeight: 900, color: "primary.main", borderColor: "primary.main", borderWidth: 2, "&:hover": { borderWidth: 2 } }}
                    >
                      เพิ่มไปยังรถเข็น
                    </Button>
                    <Button
                      variant="contained" fullWidth onClick={handleBuyNow} disabled={product.stock <= 0}
                      startIcon={<Flash variant="Bold" color="#FFF" />}
                      sx={{ py: 1.75, borderRadius: 15, fontWeight: 900, bgcolor: "primary.main", "&:hover": { bgcolor: "#cc0000" } }}
                    >
                      สั่งซื้อทันที
                    </Button>
                  </Stack>

                  {/* Social and Chat */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                      component={socialLinks.lineUrl ? "a" : "button"}
                      href={socialLinks.lineUrl ?? undefined}
                      target={socialLinks.lineUrl ? "_blank" : undefined}
                      rel={socialLinks.lineUrl ? "noreferrer" : undefined}
                      startIcon={<MessageQuestion variant="Bold" color="#0084FF" />}
                      sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.82rem' }}
                    >
                      แชทเลย
                    </Button>
                    {hasShareLinks && <Divider orientation="vertical" flexItem sx={{ height: 20 }} />}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {hasShareLinks && <Typography variant="caption" color="grey.400" fontWeight="700">SHARE :</Typography>}
                      {socialLinks.facebookUrl && (
                        <IconButton component="a" href={socialLinks.facebookUrl} target="_blank" rel="noreferrer" size="small" aria-label="Share on Facebook"><Facebook variant="Bold" size="18" color="#1877F2" /></IconButton>
                      )}
                      {socialLinks.instagramUrl && (
                        <IconButton component="a" href={socialLinks.instagramUrl} target="_blank" rel="noreferrer" size="small" aria-label="Share on Instagram"><Instagram variant="Bold" size="18" color="#E4405F" /></IconButton>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Description — mobile only */}
        {product.description && (
          <Box sx={{ mt: 3, display: { xs: 'block', md: 'none' }, px: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={1}>รายละเอียดสินค้า</Typography>
            <Typography variant="body2" color="grey.600" sx={{ lineHeight: 1.85 }}>
              {product.description}
            </Typography>
          </Box>
        )}

        {relatedProducts.length > 0 && (
          <Box sx={{ mt: { xs: 4.5, md: 8 }, mb: { xs: 3, md: 1 } }}>
            <Box
              sx={{
                height: 1.5,
                width: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, rgba(215,20,20,0.04) 0%, rgba(215,20,20,0.18) 14%, rgba(215,20,20,0.48) 50%, rgba(215,20,20,0.18) 86%, rgba(215,20,20,0.04) 100%)',
              }}
            />
          </Box>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: { xs: 6, md: 12 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={{ xs: 3, md: 5 }}>
              <Box>
                <Typography variant="h6" fontWeight="900" sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}>สินค้าที่คล้ายกัน</Typography>
                <Box sx={{ width: 48, height: 3, bgcolor: 'primary.main', borderRadius: 2, mt: 0.5 }} />
              </Box>
              <Button component={Link} href="/all-products" endIcon={<DirectRight size="16" color="#d71414" />} sx={{ fontWeight: 800, color: 'primary.main', fontSize: { xs: '0.78rem', md: '0.875rem' } }}>
                ดูทั้งหมด
              </Button>
            </Stack>
            <Box display="grid" gridTemplateColumns={{ xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }} gap={{ xs: 1.5, md: 3 }}>
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} {...relatedProduct} />
              ))}
            </Box>
          </Box>
        )}
      </Container>

      {/* Sticky mobile action bar without Portal to avoid click-blocking overlays on real devices. */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1201,
          bgcolor: 'white',
          borderTop: '1px solid',
          borderColor: 'grey.100',
          px: 2,
          pt: 1.25,
          pb: 'calc(env(safe-area-inset-bottom) + 10px)',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Price + mode summary row */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" alignItems="baseline" spacing={0.75}>
            <Typography fontWeight={900} fontSize="1.15rem" color="primary.main" lineHeight={1}>
              ฿{activePrice.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              / {activeLabel}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" color="text.disabled" fontWeight={600}>รวม</Typography>
            <Typography variant="caption" fontWeight={900} color="text.primary">
              ฿{(activePrice * quantity).toLocaleString()}
            </Typography>
          </Stack>
        </Stack>

        {/* Quantity + Buttons row */}
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minHeight: 48 }}>
          {/* Compact qty stepper — no overflow:hidden (iOS Safari tap bug) */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center',
              border: '1.5px solid', borderColor: 'grey.200', borderRadius: 2,
              flexShrink: 0, height: 48,
            }}
          >
            <IconButton
              onClick={() => handleQuantity('remove')} size="small"
              sx={{
                borderRadius: '6px 0 0 6px', width: 40, height: '100%',
                color: quantity === 1 ? 'grey.300' : 'primary.main',
              }}
            >
              <Minus size="16" variant="Bold" color={quantity === 1 ? '#d1d5db' : '#d71414'} />
            </IconButton>
            <Box sx={{ px: 1.5, borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'grey.200', height: '100%', display: 'flex', alignItems: 'center' }}>
              <Typography fontWeight={900} fontSize="1rem" lineHeight={1} textAlign="center" sx={{ minWidth: 22 }}>
                {quantity}
              </Typography>
            </Box>
            <IconButton
              onClick={() => handleQuantity('add')} size="small"
              sx={{ borderRadius: '0 6px 6px 0', width: 40, height: '100%', color: 'primary.main' }}
            >
              <Add size="16" variant="Bold" color="#d71414" />
            </IconButton>
          </Box>

          {/* Add to cart */}
          <Button
            variant="outlined"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            sx={{
              flex: 1, height: 48, borderRadius: 2, fontWeight: 800, fontSize: '0.85rem',
              color: 'primary.main', borderColor: 'primary.main', borderWidth: '1.5px',
              minWidth: 0,
              '&:hover': { borderWidth: '1.5px', bgcolor: 'rgba(215,20,20,0.04)' },
            }}
          >
            <ShoppingCart size="17" variant="Bold" color="#d71414" style={{ marginRight: 5, flexShrink: 0 }} />
            ใส่ตะกร้า
          </Button>

          {/* Buy now */}
          <Button
            variant="contained"
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            sx={{
              flex: 1.3, height: 48, borderRadius: 2, fontWeight: 900, fontSize: '0.85rem',
              bgcolor: 'primary.main', minWidth: 0,
              boxShadow: '0 4px 12px rgba(215,20,20,0.35)',
              '&:hover': { bgcolor: '#c00', boxShadow: '0 4px 16px rgba(215,20,20,0.45)' },
            }}
          >
            <Flash size="17" variant="Bold" color="#ffffff" style={{ marginRight: 5, flexShrink: 0 }} />
            สั่งซื้อเลย
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
