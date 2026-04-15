import React from "react";
import type { Metadata } from "next";
import { Box, Container, Typography, Button, Paper, Stack } from "@mui/material";
import { TickCircle, Receipt21, ShoppingBag, DocumentUpload } from "iconsax-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "สั่งซื้อสำเร็จ | SNNP AT HOME",
  description: "Your order has been placed successfully.",
};

export default function CheckoutSuccessPage() {
  // Generate a random order number for demo purposes
  const orderNumber = `SNNP-${Math.floor(100000 + Math.random() * 900000)}`;
  
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 6,
            border: "1px solid",
            borderColor: "grey.200",
            textAlign: "center",
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
             <Box sx={{ bgcolor: 'success.light', color: 'success.main', p: 2, borderRadius: '50%', display: 'flex', opacity: 0.9 }}>
                <TickCircle size="80" variant="Bold" color="currentColor" />
             </Box>
          </Box>
          
          <Typography variant="h3" fontWeight="900" color="success.main" mb={2}>
            การสั่งซื้อสำเร็จ!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" mb={4}>
            ขอบคุณที่อุดหนุนสินค้าจาก SNNP AT HOME คำสั่งซื้อของคุณได้รับการยืนยันแล้ว และเราจะรีบดำเนินการจัดส่งให้เร็วที่สุด
          </Typography>

          <Box sx={{ bgcolor: 'grey.50', borderRadius: 4, p: 3, mb: 4, border: '1px dashed', borderColor: 'grey.300' }}>
            <Typography variant="overline" fontWeight="700" color="text.secondary">
              หมายเลขคำสั่งซื้อ
            </Typography>
            <Typography variant="h5" fontWeight="900" color="primary.main" letterSpacing={2}>
              {orderNumber}
            </Typography>
          </Box>

          <Stack spacing={2}>
             <Button
               component={Link}
               href={`/payment-notification?order=${orderNumber}`}
               variant="contained"
               fullWidth
               size="large"
               startIcon={<DocumentUpload variant="Bold" color="#FFF" />}
               sx={{ py: 1.5, mb: 1, borderRadius: 10, fontWeight: 800, bgcolor: "primary.main", "&:hover": { bgcolor: "#cc0000" }, boxShadow: "0 8px 25px rgba(215,20,20,0.3)" }}
             >
               แจ้งชำระเงิน (แนบสลิป)
             </Button>

             <Button
               component={Link}
               href="/orders"
               variant="outlined"
               fullWidth
               size="large"
               startIcon={<Receipt21 variant="Bold" />}
               sx={{ py: 1.5, borderRadius: 10, fontWeight: 800, borderWidth: 2, "&:hover": { borderWidth: 2 } }}
             >
               ดูประวัติการสั่งซื้อ
             </Button>
             
             <Button
               component={Link}
               href="/all-products"
               variant="text"
               fullWidth
               size="large"
               startIcon={<ShoppingBag variant="Bold" />}
               sx={{ py: 1.5, borderRadius: 10, fontWeight: 800, color: "text.secondary" }}
             >
               กลับไปเลือกซื้อสินค้าต่อ
             </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
