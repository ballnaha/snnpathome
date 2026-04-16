"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Container, Typography, Paper, TextField, Button, Stack, Divider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { useSearchParams, useRouter } from "next/navigation";
import { DocumentUpload, GalleryAdd, TickCircle, ArrowLeft2, CloseCircle } from "iconsax-react";
import Link from "next/link";
import { useSnackbar } from "@/components/SnackbarProvider";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_BANK_ACCOUNT_INFO = [
  "ธนาคาร: ไทยพาณิชย์ (SCB)",
  "ชื่อบัญชี: บริษัท ศรีนานาพร มาร์เก็ตติ้ง จำกัด(มหาชน)",
  "เลขที่บัญชี: 366-415149-5",
].join("\n");

export default function PaymentNotificationClient({ bankAccountInfo }: { bankAccountInfo?: string | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [orderNumber, setOrderNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [transferDate, setTransferDate] = useState<Dayjs | null>(dayjs());
  const [transferTime, setTransferTime] = useState<Dayjs | null>(dayjs());
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bankInfoText = (bankAccountInfo && bankAccountInfo.trim()) || DEFAULT_BANK_ACCOUNT_INFO;

  const lockedOrderNumber = searchParams.get("order") ?? "";

  useEffect(() => {
    if (lockedOrderNumber) setOrderNumber(lockedOrderNumber);
  }, [lockedOrderNumber]);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showSnackbar("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น", "error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showSnackbar("ขนาดไฟล์ต้องไม่เกิน 5 MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setSlipImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipImage) {
      showSnackbar("กรุณาอัปโหลดสลิปการโอนเงิน", "error");
      return;
    }
    if (!orderNumber.trim()) {
      showSnackbar("กรุณากรอกหมายเลขคำสั่งซื้อ", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderNumber.trim()}/slip`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slipUrl: slipImage }),
      });
      const data = await res.json();
      if (!res.ok) {
        showSnackbar(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
        return;
      }
      setIsSuccess(true);
      showSnackbar("แจ้งชำระเงินสำเร็จ! คำสั่งซื้อกำลังรอการตรวจสอบ", "success");
    } catch {
      showSnackbar("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", py: 10 }}>
        <Stack spacing={3} alignItems="center" textAlign="center" maxWidth={400}>
          <Box sx={{ bgcolor: "success.light", p: 3, borderRadius: "50%", opacity: 0.9 }}>
            <TickCircle size="72" variant="Bold" color="#2e7d32" />
          </Box>
          <Typography variant="h4" fontWeight="900" color="success.main">
            แจ้งชำระเงินสำเร็จ!
          </Typography>
          <Typography color="text.secondary">
            ทีมงานจะตรวจสอบและยืนยันการชำระเงินภายใน 1–2 ชั่วโมง<br />
            หมายเลขคำสั่งซื้อ: <strong>{orderNumber}</strong>
          </Typography>
          <Button
            component={Link}
            href="/all-products"
            variant="contained"
            size="large"
            sx={{ borderRadius: 10, fontWeight: 800, px: 5 }}
          >
            กลับไปเลือกซื้อสินค้า
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: { xs: 4, md: 8 }, overflowX: "hidden" }}>
      <Container maxWidth="lg">
        <Box mb={4}>
          <Button
            onClick={() => router.back()}
            startIcon={<ArrowLeft2 size="16" color="currentColor" />}
            sx={{ color: "text.secondary", fontWeight: 700 }}
          >
            ย้อนกลับ
          </Button>
        </Box>

        <Typography variant="h4" fontWeight="900" mb={1} sx={{ fontSize: { xs: '1.6rem', md: '2.125rem' } }}>
          แจ้งชำระเงิน
        </Typography>
        <Typography color="text.secondary" mb={4}>
          กรอกข้อมูลการโอนเงินและอัปโหลดสลิปเพื่อยืนยันการชำระเงิน
        </Typography>

        <form onSubmit={handleSubmit}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "7fr 5fr" }} gap={4}>
            {/* Form Column */}
            <Paper
              elevation={0}
              sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "grey.200" }}
            >
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="หมายเลขคำสั่งซื้อ"
                  placeholder="เช่น SNNP-123456"
                  variant="outlined"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  InputProps={{ readOnly: !!lockedOrderNumber }}
                  sx={lockedOrderNumber ? { bgcolor: "grey.50" } : {}}
                />

                <TextField
                  fullWidth
                  label="ยอดเงินที่โอน (บาท)"
                  type="number"
                  inputProps={{ min: 1, step: "0.01" }}
                  variant="outlined"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <Typography color="text.secondary" sx={{ mr: 1 }}>฿</Typography>
                    ),
                  }}
                />

                <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
                  <DatePicker
                    label="วันที่โอน"
                    value={transferDate}
                    onChange={(val) => setTransferDate(val)}
                    slotProps={{
                      textField: { fullWidth: true, required: true, variant: "outlined" },
                    }}
                  />
                  <TimePicker
                    label="เวลาที่โอน"
                    value={transferTime}
                    onChange={(val) => setTransferTime(val)}
                    slotProps={{
                      textField: { fullWidth: true, required: true, variant: "outlined" },
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="โอนเข้าบัญชี"
                  value={bankInfoText}
                  variant="outlined"
                  multiline
                  minRows={3}
                  InputProps={{ readOnly: true }}
                  helperText="ข้อมูลบัญชีธนาคารมาจากการตั้งค่าในระบบ"
                />
              </Stack>
            </Paper>

            {/* Slip Upload Column */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "grey.200",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" fontWeight="800" mb={2}>
                อัปโหลดสลิปโอนเงิน
              </Typography>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFile(e.dataTransfer.files?.[0] ?? null);
                }}
                sx={{
                  flex: 1,
                  minHeight: { xs: 200, md: 250 },
                  border: "2px dashed",
                  borderColor: slipImage ? "success.main" : "grey.300",
                  borderRadius: 4,
                  bgcolor: slipImage ? "transparent" : "grey.50",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "0.2s",
                  "&:hover": {
                    borderColor: slipImage ? "success.main" : "primary.main",
                    bgcolor: slipImage ? "transparent" : "rgba(215,20,20,0.02)",
                  },
                }}
              >
                {slipImage ? (
                  <>
                    <Box
                      component="img"
                      src={slipImage}
                      alt="Slip preview"
                      sx={{ width: "100%", height: "100%", objectFit: "contain", p: 1 }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        bgcolor: "success.main",
                        color: "white",
                        borderRadius: "50%",
                        p: 0.5,
                        display: "flex",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      <TickCircle size="20" variant="Bold" color="white" />
                    </Box>
                  </>
                ) : (
                  <Stack spacing={2} alignItems="center" p={3} textAlign="center">
                    <GalleryAdd size="48" color="#999" variant="Bulk" />
                    <Box>
                      <Typography variant="body1" fontWeight="700">
                        แตะเพื่อเลือกรูปภาพ
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                        หรือลากไฟล์มาวางที่นี่
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        รองรับ JPG, PNG, WEBP (ไม่เกิน 5 MB)
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      sx={{ borderRadius: 10, fontWeight: 700, mt: 1, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                    >
                      เลือกไฟล์
                    </Button>
                  </Stack>
                )}
              </Box>

              {slipImage && (
                <Button
                  variant="text"
                  color="error"
                  startIcon={<CloseCircle size="16" color="currentColor" />}
                  onClick={() => setSlipImage(null)}
                  sx={{ mt: 1.5, fontWeight: 700 }}
                >
                  เปลี่ยนรูป
                </Button>
              )}

              <Divider sx={{ my: 3 }} />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isSubmitting || !slipImage}
                startIcon={<DocumentUpload variant="Bold" color="#FFF" />}
                sx={{
                  py: 1.8,
                  borderRadius: 15,
                  fontWeight: 900,
                  fontSize: "1rem",
                  bgcolor: "primary.main",
                  boxShadow: "0 8px 25px rgba(215,20,20,0.3)",
                  "&:hover": { bgcolor: "#cc0000" },
                }}
              >
                {isSubmitting ? "กำลังอัปโหลด..." : "ยืนยันการแจ้งชำระเงิน"}
              </Button>
            </Paper>
          </Box>
          </LocalizationProvider>
        </form>
      </Container>
    </Box>
  );
}
