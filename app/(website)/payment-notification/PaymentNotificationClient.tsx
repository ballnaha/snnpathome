"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Container, Typography, Paper, TextField, Button, Stack, MenuItem, Divider } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { DocumentUpload, GalleryAdd, TickCircle, ArrowLeft2, Clock, Calendar, WalletMinus } from "iconsax-react";
import Link from "next/link";
import { useSnackbar } from "@/components/SnackbarProvider";

export default function PaymentNotificationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  
  const [orderNumber, setOrderNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [transferTime, setTransferTime] = useState("");
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const orderQuery = searchParams.get("order");
    if (orderQuery) {
      setOrderNumber(orderQuery);
    }
    
    // Set current date/time as default
    const now = new Date();
    // Offset for local timezone
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, -1);
    
    setTransferDate(localISOTime.split("T")[0]);
    setTransferTime(localISOTime.split("T")[1].slice(0, 5));
  }, [searchParams]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      showSnackbar("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น", "error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipImage) {
      showSnackbar("กรุณาอัปโหลดสลิปการโอนเงิน", "error");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      showSnackbar("แจ้งชำระเงินสำเร็จ! คำสั่งซื้อของคุณกำลังรอการตรวจสอบ", "success");
      // Could redirect to order status or profile page
      router.push("/orders?status=processing");
    }, 2000);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Box mb={4}>
           <Button
             onClick={() => router.back()}
             startIcon={<ArrowLeft2 size="16" />}
             sx={{ color: "text.secondary", fontWeight: 700 }}
           >
             ย้อนกลับ
           </Button>
        </Box>

        <Typography variant="h3" fontWeight="900" mb={4}>
          แจ้งชำระเงิน
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '7fr 5fr' }} gap={4}>
            {/* Form Column */}
            <Box>
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "grey.200",
                  boxShadow: "none",
                }}
              >
                <Stack spacing={3}>
                  <TextField 
                    fullWidth 
                    label="หมายเลขคำสั่งซื้อ (Order Number)" 
                    variant="outlined" 
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required 
                    InputProps={{
                      readOnly: !!searchParams.get("order"),
                    }}
                    sx={!!searchParams.get("order") ? { bgcolor: 'grey.50' } : {}}
                  />
                  
                  <TextField 
                    fullWidth 
                    label="ยอดเงินที่โอน (Amount)" 
                    type="number"
                    variant="outlined" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                    InputProps={{
                      startAdornment: <Typography color="text.secondary" sx={{ mr: 1 }}>฿</Typography>
                    }}
                  />

                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                    <TextField 
                      fullWidth 
                      label="วันที่โอน (Transfer Date)" 
                      type="date"
                      variant="outlined" 
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      required 
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField 
                      fullWidth 
                      label="เวลาที่โอน (Transfer Time)" 
                      type="time"
                      variant="outlined" 
                      value={transferTime}
                      onChange={(e) => setTransferTime(e.target.value)}
                      required 
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>

                  <TextField 
                    select 
                    fullWidth 
                    label="โอนเข้าธนาคาร (Transferred To)" 
                    defaultValue="kbank"
                    variant="outlined" 
                    required 
                  >
                    <MenuItem value="kbank">กสิกรไทย (KBank) - 123-4-56789-0 - บมจ. ศรีนานาพรฯ</MenuItem>
                  </TextField>

                </Stack>
              </Paper>
            </Box>

            {/* Slip Upload Column */}
            <Box>
               <Paper
                 sx={{
                   p: { xs: 3, md: 4 },
                   borderRadius: 4,
                   border: "1px solid",
                   borderColor: "grey.200",
                   boxShadow: "none",
                   height: "100%",
                   display: "flex",
                   flexDirection: "column"
                 }}
               >
                 <Typography variant="h6" fontWeight="800" mb={2}>
                   อัปโหลดสลิปโอนเงิน
                 </Typography>

                 <input 
                   type="file" 
                   accept="image/*" 
                   ref={fileInputRef}
                   style={{ display: 'none' }}
                   onChange={handleImageUpload}
                 />

                 <Box
                   onClick={() => fileInputRef.current?.click()}
                   onDragOver={handleDragOver}
                   onDrop={handleDrop}
                   sx={{
                     flex: 1,
                     minHeight: 250,
                     border: "2px dashed",
                     borderColor: slipImage ? 'success.main' : 'grey.300',
                     borderRadius: 4,
                     bgcolor: slipImage ? 'transparent' : 'grey.50',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     cursor: 'pointer',
                     position: 'relative',
                     overflow: 'hidden',
                     transition: '0.2s',
                     "&:hover": {
                       borderColor: slipImage ? 'success.main' : 'primary.main',
                       bgcolor: slipImage ? 'transparent' : 'rgba(215,20,20,0.02)'
                     }
                   }}
                 >
                   {slipImage ? (
                     <>
                       <Box component="img" src={slipImage} alt="Slip" sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1 }} />
                       <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'success.main', color: 'white', borderRadius: '50%', p: 0.5, display: 'flex', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                         <TickCircle size="20" variant="Bold" />
                       </Box>
                     </>
                   ) : (
                     <Stack spacing={2} alignItems="center" p={3} textAlign="center">
                       <GalleryAdd size="48" color="#999" variant="Bulk" />
                       <Box>
                         <Typography variant="body1" fontWeight="700" color="text.primary">
                           คลิก หรือ ลากไฟล์มาวางที่นี่
                         </Typography>
                         <Typography variant="caption" color="text.secondary">
                           รองรับไฟล์ .JPG, .PNG ขนาดไม่เกิน 5MB
                         </Typography>
                       </Box>
                     </Stack>
                   )}
                 </Box>

                 {slipImage && (
                   <Button 
                     variant="text" 
                     color="error"
                     onClick={(e) => {
                       e.stopPropagation();
                       setSlipImage(null);
                     }}
                     sx={{ mt: 2, fontWeight: 700 }}
                   >
                     ลบรูปภาพ
                   </Button>
                 )}

                 <Divider sx={{ my: 3 }} />

                 <Button
                   type="submit"
                   variant="contained"
                   fullWidth
                   size="large"
                   disabled={isSubmitting}
                   startIcon={<DocumentUpload variant="Bold" color="#FFF" />}
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
                   {isSubmitting ? "กำลังอัปโหลด..." : "ยืนยันการแจ้งโอนเงิน"}
                 </Button>

               </Paper>
            </Box>
          </Box>
        </form>
      </Container>
    </Box>
  );
}
