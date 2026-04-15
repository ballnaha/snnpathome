"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Paper,
} from "@mui/material";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { ArrowLeft2, SecuritySafe, Cards, TruckFast } from "iconsax-react";
import Link from "next/link";
import { useSnackbar } from "@/components/SnackbarProvider";

export default function CheckoutClient() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, redirect back to products or home
  React.useEffect(() => {
    if (items.length === 0) {
      router.push("/all-products");
    }
  }, [items, router]);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call for checkout processing
    setTimeout(() => {
      setIsSubmitting(false);
      showSnackbar("สั่งซื้อสำเร็จ! ขอบคุณที่อุดหนุน", "success");
      clearCart();
      router.push("/checkout/success");
    }, 1500);
  };

  if (items.length === 0) return null; // Prevent flicker before redirect

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Box mb={4}>
          <Button
            component={Link}
            href="/all-products"
            startIcon={<ArrowLeft2 size="16" />}
            sx={{ color: "text.secondary", fontWeight: 700 }}
          >
            กลับไปเลือกสินค้าต่อ
          </Button>
        </Box>

        <Typography variant="h3" fontWeight="900" mb={4}>
          ชำระเงิน (Checkout)
        </Typography>

        <form onSubmit={handleCheckout}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Left Column - Forms */}
            <Box sx={{ width: { xs: '100%', md: '58.333%', lg: '66.666%' }, flexShrink: 0 }}>
              <Stack spacing={4}>
                {/* Shipping Info */}
                <Paper
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "grey.200",
                    boxShadow: "none",
                  }}
                >
                  <Typography variant="h6" fontWeight="800" mb={3} display="flex" alignItems="center" gap={1}>
                    <TruckFast size="24" color="#d71414" variant="Bulk" /> 
                    ข้อมูลการจัดส่ง
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(6, 1fr)' }, gap: 2 }}>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}>
                      <TextField fullWidth label="ชื่อจริง" variant="outlined" required />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}>
                      <TextField fullWidth label="นามสกุล" variant="outlined" required />
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <TextField fullWidth label="ที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)" variant="outlined" required />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                      <TextField fullWidth label="ตำบล / แขวง" variant="outlined" required />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                      <TextField fullWidth label="อำเภอ / เขต" variant="outlined" required />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                      <TextField fullWidth label="จังหวัด" variant="outlined" required />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}>
                      <TextField fullWidth label="รหัสไปรษณีย์" variant="outlined" required />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}>
                      <TextField fullWidth label="เบอร์โทรศัพท์" variant="outlined" required />
                    </Box>
                  </Box>
                </Paper>

                {/* Payment Method */}
                <Paper
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "grey.200",
                    boxShadow: "none",
                  }}
                >
                   <Typography variant="h6" fontWeight="800" mb={3} display="flex" alignItems="center" gap={1}>
                    <Cards size="24" color="#d71414" variant="Bulk" /> 
                    วิธีการชำระเงิน
                  </Typography>
                  <Box sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 2, p: 2, bgcolor: 'rgb(215, 20, 20, 0.05)' }}>
                    <Typography fontWeight="800" mb={1} color="primary.main">โอนเงินเข้าบัญชีธนาคาร</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      กรุณาโอนเงินมาที่บัญชีด้านล่างเพื่อชำระค่าสินค้า
                    </Typography>
                    <Stack spacing={1} sx={{ bgcolor: 'white', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">ธนาคาร</Typography>
                        <Typography variant="body2" fontWeight="700">กสิกรไทย (KBank)</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">ชื่อบัญชี</Typography>
                        <Typography variant="body2" fontWeight="700">บมจ. ศรีนานาพร มาร์เก็ตติ้ง</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">เลขที่บัญชี</Typography>
                        <Typography variant="body2" fontWeight="900" color="primary.main">123-4-56789-0</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Paper>
              </Stack>
            </Box>

            {/* Right Column - Order Summary */}
            <Box sx={{ width: { xs: '100%', md: '41.666%', lg: '33.333%' } }}>
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "grey.200",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                  position: "sticky",
                  top: 100,
                }}
              >
                <Typography variant="h6" fontWeight="900" mb={3}>
                  สรุปคำสั่งซื้อ
                </Typography>

                {/* Item List */}
                <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 3 }}>
                  <Stack spacing={2}>
                    {items.map((item) => (
                      <Stack direction="row" key={item.id} spacing={2}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            border: "1px solid",
                            borderColor: "grey.200",
                            borderRadius: 2,
                            p: 0.5,
                            flexShrink: 0,
                          }}
                        >
                          <Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight="700" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.2, mb: 0.5 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            จำนวน: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="900">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Price Breakdown */}
                <Stack spacing={2} mb={3}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" fontWeight="500">ยอดรวมสินค้า</Typography>
                    <Typography fontWeight="700">฿{totalPrice.toLocaleString()}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" fontWeight="500">ค่าจัดส่ง</Typography>
                    <Typography fontWeight="700" color="success.main">ฟรี</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" fontWeight="500">ส่วนลด</Typography>
                    <Typography fontWeight="700" color="error.main">-฿0</Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                  <Typography variant="subtitle1" fontWeight="900">ยอดรวมทั้งสิ้น</Typography>
                  <Typography variant="h5" fontWeight="900" color="primary.main">
                    ฿{totalPrice.toLocaleString()}
                  </Typography>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  startIcon={<SecuritySafe variant="Bold" color="#FFF" />}
                  sx={{
                    py: 1.8,
                    borderRadius: 15,
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    bgcolor: "primary.main",
                    boxShadow: "0 8px 25px rgba(215,20,20,0.3)",
                    "&:hover": { bgcolor: "#cc0000" },
                  }}
                >
                  {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
                </Button>
                
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                   <SecuritySafe size="12" /> ข้อมูลการชำระเงินของคุณปลอดภัย
                </Typography>
              </Paper>
            </Box>
          </Box>
        </form>
      </Container>
    </Box>
  );
}
