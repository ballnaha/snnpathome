"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight2, ReceiptText, SearchNormal1 } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import OrderStatusTimeline, { ORDER_STATUS_LABEL, getStatusChipSx } from "@/components/OrderStatusTimeline";

type VerificationMethod = "email" | "phone";

interface OrderPreview {
  orderNumber: string;
  firstName: string;
  email: string | null;
  phoneLast4: string;
  total: number;
  createdAt: string;
  status: string;
}

export default function TrackOrderClient() {
  const { showSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("email");
  const [email, setEmail] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);

  const resetPreview = () => {
    setOrderPreview(null);
  };

  useEffect(() => {
    const orderFromQuery = searchParams.get("order")?.trim() ?? "";
    if (!orderFromQuery) {
      return;
    }

    setOrderNumber((currentValue) => (currentValue === orderFromQuery ? currentValue : orderFromQuery));
  }, [searchParams]);

  const handleVerifyOrder = async () => {
    const trimmedOrderNumber = orderNumber.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoneLast4 = phoneLast4.replace(/\D/g, "").slice(-4);

    if (!trimmedOrderNumber) {
      showSnackbar("กรุณากรอกหมายเลขคำสั่งซื้อ", "error");
      return;
    }

    if (verificationMethod === "email" && !trimmedEmail) {
      showSnackbar("กรุณากรอกอีเมลที่ใช้สั่งซื้อ", "error");
      return;
    }

    if (verificationMethod === "phone" && trimmedPhoneLast4.length !== 4) {
      showSnackbar("กรุณากรอกเบอร์โทร 4 หลักท้าย", "error");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/order-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: trimmedOrderNumber,
          email: verificationMethod === "email" ? trimmedEmail || undefined : undefined,
          phoneLast4: verificationMethod === "phone" ? trimmedPhoneLast4 || undefined : undefined,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        resetPreview();
        showSnackbar(typeof data?.error === "string" ? data.error : "ไม่สามารถตรวจสอบคำสั่งซื้อได้", "error");
        return;
      }

      setOrderPreview(data.preview as OrderPreview);
      showSnackbar("พบข้อมูลคำสั่งซื้อแล้ว", "success");
    } catch {
      resetPreview();
      showSnackbar("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const verificationInput = verificationMethod === "email" ? (
    <TextField
      fullWidth
      label="อีเมลที่ใช้สั่งซื้อ"
      type="email"
      value={email}
      onChange={(event) => {
        setEmail(event.target.value);
        resetPreview();
      }}
      helperText="กรอกอีเมลเดิมที่ใช้สร้างคำสั่งซื้อ"
    />
  ) : (
    <TextField
      fullWidth
      label="เบอร์โทร 4 หลักท้าย"
      placeholder="เช่น 4321"
      value={phoneLast4}
      onChange={(event) => {
        setPhoneLast4(event.target.value.replace(/\D/g, "").slice(0, 4));
        resetPreview();
      }}
      inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 4 }}
      helperText="ใช้ 4 หลักท้ายของเบอร์โทรที่ใช้สั่งซื้อ"
    />
  );

  const previewStatus = useMemo(() => {
    if (!orderPreview) {
      return null;
    }

    return ORDER_STATUS_LABEL[orderPreview.status] ?? { label: orderPreview.status, color: "default" as const };
  }, [orderPreview]);

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 4, border: "1px solid", borderColor: "grey.200", background: "linear-gradient(135deg, rgba(255,247,223,0.96), rgba(255,255,255,1))" }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 42, height: 42, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "rgba(216,183,90,0.18)", color: "#8a6a18" }}>
              <ReceiptText size="22" variant="Bold" color="currentColor" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900}>ติดตามสถานะใบสั่งซื้อ</Typography>
              <Typography variant="body2" color="text.secondary">
                สำหรับลูกค้าที่ไม่ได้เข้าสู่ระบบ กรอกเลขคำสั่งซื้อแล้วตรวจสอบด้วยอีเมลหรือเบอร์โทร 4 หลักท้าย
              </Typography>
            </Box>
          </Stack>

          <Alert severity="info" sx={{ borderRadius: 3 }}>
            เพื่อความปลอดภัย ระบบจะไม่แสดงข้อมูลจากหมายเลขคำสั่งซื้ออย่างเดียว ต้องยืนยันข้อมูลประกอบก่อนทุกครั้ง
          </Alert>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 4, border: "1px solid", borderColor: "grey.200" }}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <SearchNormal1 size="20" color="#8a6a18" variant="Bold" />
            <Typography variant="h6" fontWeight={900}>ค้นหาคำสั่งซื้อ</Typography>
          </Stack>

          <TextField
            fullWidth
            label="หมายเลขคำสั่งซื้อ"
            placeholder="เช่น 2604001"
            value={orderNumber}
            onChange={(event) => {
              setOrderNumber(event.target.value);
              resetPreview();
            }}
          />

          <FormControl>
            <Typography variant="body2" fontWeight={800} mb={1}>เลือกวิธียืนยันข้อมูล</Typography>
            <RadioGroup row value={verificationMethod} onChange={(event) => {
              setVerificationMethod(event.target.value as VerificationMethod);
              resetPreview();
            }}>
              <FormControlLabel value="email" control={<Radio />} label="อีเมล" />
              <FormControlLabel value="phone" control={<Radio />} label="เบอร์โทร 4 หลักท้าย" />
            </RadioGroup>
          </FormControl>

          {verificationInput}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button variant="contained" onClick={handleVerifyOrder} disabled={isVerifying} sx={{ borderRadius: 10, px: 3, fontWeight: 800 }}>
              {isVerifying ? "กำลังตรวจสอบ..." : "ตรวจสอบสถานะคำสั่งซื้อ"}
            </Button>
            <Button component={Link} href="/payment-notification" variant="text" sx={{ borderRadius: 10, fontWeight: 800 }}>
              ไปหน้าแจ้งชำระเงิน
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {orderPreview && (
        <Paper elevation={0} sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 4, border: "1px solid", borderColor: "grey.200" }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
              <Box>
                <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 800, letterSpacing: 1 }}>รายละเอียดคำสั่งซื้อ</Typography>
                <Typography variant="h6" fontWeight={900}>{orderPreview.orderNumber}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ลูกค้า {orderPreview.firstName} {orderPreview.email ? `• ${orderPreview.email}` : `• โทรลงท้าย ${orderPreview.phoneLast4}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  สั่งซื้อเมื่อ {new Date(orderPreview.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                </Typography>
              </Box>
              {previewStatus && (
                <Chip label={previewStatus.label} color="default" sx={getStatusChipSx(orderPreview.status)} />
              )}
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">ยอดคำสั่งซื้อ</Typography>
                <Typography variant="h5" fontWeight={900}>฿{orderPreview.total.toLocaleString()}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">ถัดไปที่แนะนำ</Typography>
                <Typography variant="body1" fontWeight={800}>
                  {orderPreview.status === "PENDING" ? "หากโอนแล้วสามารถแจ้งชำระเงินต่อได้ทันที" : "รอติดตามการอัปเดตสถานะจากหน้านี้ได้เลย"}
                </Typography>
                {orderPreview.status === "PENDING" && (
                  <Button component={Link} href={`/payment-notification?order=${orderPreview.orderNumber}`} variant="text" sx={{ mt: 1, px: 0, fontWeight: 800 }} endIcon={<ArrowRight2 size="16" color="currentColor" />}>
                    แจ้งชำระเงินสำหรับออเดอร์นี้
                  </Button>
                )}
              </Paper>
            </Box>

            <OrderStatusTimeline status={orderPreview.status} compact />
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}