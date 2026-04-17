"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { useSearchParams } from "next/navigation";
import { DocumentUpload, GalleryAdd, TickCircle, CloseCircle } from "iconsax-react";
import Link from "next/link";
import { useSnackbar } from "@/components/SnackbarProvider";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_BANK_ACCOUNT_INFO = [
  "ธนาคาร: ไทยพาณิชย์ (SCB)",
  "ชื่อบัญชี: บริษัท ศรีนานาพร มาร์เก็ตติ้ง จำกัด(มหาชน)",
  "เลขที่บัญชี: 366-415149-5",
].join("\n");

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

const ORDER_STATUS_LABELS: Record<string, { label: string; color: "warning" | "info" | "success" | "error" | "default" }> = {
  PENDING: { label: "รอชำระเงิน", color: "warning" },
  PAID: { label: "ชำระแล้ว", color: "info" },
  PROCESSING: { label: "กำลังเตรียม", color: "info" },
  SHIPPED: { label: "จัดส่งแล้ว", color: "info" },
  DELIVERED: { label: "จัดส่งสำเร็จ", color: "success" },
  CANCELLED: { label: "ยกเลิก", color: "error" },
};

function StepHeading({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          flexShrink: 0,
          boxShadow: "0 10px 24px rgba(215,20,20,0.2)",
        }}
      >
        {index}
      </Box>
      <Box>
        <Typography variant="h6" fontWeight="900">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function PaymentNotificationClient({ bankAccountInfo }: { bankAccountInfo?: string | null }) {
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const [orderNumber, setOrderNumber] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("email");
  const [email, setEmail] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [amount, setAmount] = useState("");
  const [amountEdited, setAmountEdited] = useState(false);
  const [transferDate, setTransferDate] = useState<Dayjs | null>(dayjs());
  const [transferTime, setTransferTime] = useState<Dayjs | null>(dayjs());
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bankInfoText = (bankAccountInfo && bankAccountInfo.trim()) || DEFAULT_BANK_ACCOUNT_INFO;

  const lockedOrderNumber = searchParams.get("order") ?? "";

  useEffect(() => {
    if (lockedOrderNumber) setOrderNumber(lockedOrderNumber);
  }, [lockedOrderNumber]);

  const resetVerification = () => {
    setAccessToken("");
    setOrderPreview(null);
  };

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
      const data = await res.json();
      if (!res.ok) {
        resetVerification();
        showSnackbar(data.error || "ไม่สามารถยืนยันคำสั่งซื้อได้", "error");
        return;
      }

      setAccessToken(data.accessToken);
      setOrderPreview(data.preview as OrderPreview);
      setAmount(String((data.preview as OrderPreview).total));
      setAmountEdited(false);
      showSnackbar("ยืนยันคำสั่งซื้อสำเร็จ", "success");
    } catch {
      resetVerification();
      showSnackbar("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่", "error");
    } finally {
      setIsVerifying(false);
    }
  };

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
    if (!accessToken) {
      showSnackbar("กรุณายืนยันคำสั่งซื้อก่อนส่งสลิป", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderNumber.trim()}/slip`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slipUrl: slipImage, accessToken }),
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

  const handleVerificationMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextMethod = event.target.value as VerificationMethod;
    setVerificationMethod(nextMethod);
    resetVerification();
  };

  const verificationStatus = orderPreview
    ? ORDER_STATUS_LABELS[orderPreview.status] ?? { label: orderPreview.status, color: "default" as const }
    : null;
  const expectedAmount = orderPreview?.total ?? null;
  const parsedAmount = Number(amount);
  const hasAmountMismatch = Boolean(
    orderPreview &&
    amount &&
    amountEdited &&
    Number.isFinite(parsedAmount) &&
    Math.abs(parsedAmount - orderPreview.total) > 0.009
  );

  const verificationInput = verificationMethod === "email" ? (
    <TextField
      fullWidth
      label="อีเมลที่ใช้สั่งซื้อ"
      type="email"
      variant="outlined"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
        resetVerification();
      }}
      helperText="กรอกอีเมลที่ใช้ตอนสร้างคำสั่งซื้อ"
    />
  ) : (
    <TextField
      fullWidth
      label="เบอร์โทร 4 หลักท้าย"
      placeholder="เช่น 4321"
      variant="outlined"
      value={phoneLast4}
      onChange={(e) => {
        setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4));
        resetVerification();
      }}
      inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 4 }}
      helperText="กรอก 4 หลักท้ายของเบอร์โทรที่ใช้สั่งซื้อ"
    />
  );

  const lockedPaymentStep = !accessToken;

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
    <Box sx={{ overflowX: "hidden" }}>
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: { xs: 2.5, md: 3 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "grey.200",
            background: "linear-gradient(135deg, rgba(215,20,20,0.08), rgba(255,255,255,0.98))",
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight="900">
              แจ้งชำระเงินให้ครบใน 3 ขั้นตอน
            </Typography>
            <Typography color="text.secondary">
              ยืนยันคำสั่งซื้อก่อน แล้วค่อยอัปโหลดสลิปการโอนเงิน ระบบจะปลดล็อกขั้นถัดไปให้อัตโนมัติเมื่อข้อมูลตรงกัน
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Chip label="1. ยืนยันคำสั่งซื้อ" color={accessToken ? "success" : "primary"} sx={{ fontWeight: 800 }} />
              <Chip label="2. กรอกข้อมูลการโอน" color={accessToken ? "primary" : "default"} sx={{ fontWeight: 800 }} />
              <Chip label="3. อัปโหลดสลิปและส่งข้อมูล" color={slipImage ? "primary" : "default"} sx={{ fontWeight: 800 }} />
            </Stack>
          </Stack>
        </Paper>

        <form onSubmit={handleSubmit}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "7fr 5fr" }} gap={4} alignItems="start">
              <Stack spacing={3}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: orderPreview ? "success.light" : "grey.200" }}>
                  <Stack spacing={3}>
                    <StepHeading index="1" title="ยืนยันคำสั่งซื้อ" description="กรอกหมายเลขคำสั่งซื้อ แล้วเลือก 1 วิธีสำหรับยืนยันตัวตนเพื่อปลดล็อกการแจ้งชำระเงิน" />

                    <TextField
                      fullWidth
                      label="หมายเลขคำสั่งซื้อ"
                      placeholder="เช่น 2604001"
                      variant="outlined"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value);
                        resetVerification();
                      }}
                      required
                      InputProps={{ readOnly: !!lockedOrderNumber }}
                      sx={lockedOrderNumber ? { bgcolor: "grey.50" } : {}}
                    />

                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "grey.50" }}>
                      <Stack spacing={2}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                          <Typography fontWeight="800">เลือกวิธียืนยันตัวตน 1 วิธี</Typography>
                          <Chip label="เลือก 1 วิธี" size="small" color="primary" sx={{ fontWeight: 800 }} />
                        </Stack>

                        <FormControl>
                          <RadioGroup value={verificationMethod} onChange={handleVerificationMethodChange}>
                            <FormControlLabel
                              value="email"
                              control={<Radio />}
                              label={<Box><Typography fontWeight="700">ใช้อีเมลที่ใช้สั่งซื้อ</Typography><Typography variant="caption" color="text.secondary">เหมาะเมื่อจำอีเมลที่ใช้สั่งซื้อได้</Typography></Box>}
                            />
                            <FormControlLabel
                              value="phone"
                              control={<Radio />}
                              label={<Box><Typography fontWeight="700">ใช้เบอร์โทร 4 หลักท้าย</Typography><Typography variant="caption" color="text.secondary">เหมาะเมื่อจำเบอร์โทรที่ใช้สั่งซื้อได้ง่ายกว่า</Typography></Box>}
                            />
                          </RadioGroup>
                        </FormControl>

                        {verificationInput}
                      </Stack>
                    </Paper>

                    <Button
                      type="button"
                      variant="contained"
                      onClick={handleVerifyOrder}
                      disabled={isVerifying}
                      sx={{ alignSelf: "flex-start", borderRadius: 10, fontWeight: 800, px: 3.5 }}
                    >
                      {isVerifying ? "กำลังตรวจสอบคำสั่งซื้อ..." : "ตรวจสอบคำสั่งซื้อ"}
                    </Button>

                    {orderPreview && (
                      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(46,125,50,0.04)", borderColor: "success.light" }}>
                        <Stack spacing={1.25}>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                            <Typography variant="subtitle1" fontWeight="900" color="success.main">
                              ยืนยันคำสั่งซื้อสำเร็จ
                            </Typography>
                            {verificationStatus && (
                              <Chip label={verificationStatus.label} color={verificationStatus.color} size="small" sx={{ fontWeight: 800 }} />
                            )}
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            หมายเลขคำสั่งซื้อ: <strong>{orderPreview.orderNumber}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ผู้สั่งซื้อ: {orderPreview.firstName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            อีเมล: {orderPreview.email ?? "-"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            เบอร์โทร 4 หลักท้าย: {orderPreview.phoneLast4}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            สร้างคำสั่งซื้อเมื่อ: {new Date(orderPreview.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                          </Typography>
                          <Typography variant="body2" fontWeight="800">
                            ยอดคำสั่งซื้อ: ฿{orderPreview.total.toLocaleString()}
                          </Typography>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Paper>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: lockedPaymentStep ? "grey.200" : "primary.light", opacity: lockedPaymentStep ? 0.65 : 1, transition: "0.2s" }}>
                  <Stack spacing={3}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                      <StepHeading index="2" title="กรอกข้อมูลการโอน" description="กรอกยอดเงิน วันที่ และเวลาที่โอน เพื่อแนบไปพร้อมสลิปการชำระเงิน" />
                      <Chip label={lockedPaymentStep ? "รอยืนยันคำสั่งซื้อ" : "พร้อมกรอกข้อมูล"} color={lockedPaymentStep ? "default" : "primary"} sx={{ fontWeight: 800 }} />
                    </Stack>

                    {lockedPaymentStep && (
                      <Typography variant="body2" color="warning.main">
                        ยืนยันคำสั่งซื้อให้สำเร็จก่อน ระบบจึงจะเปิดให้กรอกข้อมูลการโอนและอัปโหลดสลิป
                      </Typography>
                    )}

                    <Box sx={{ pointerEvents: lockedPaymentStep ? "none" : "auto" }}>
                      <Stack spacing={3}>
                        <TextField
                          fullWidth
                          label="ยอดเงินที่โอน (บาท)"
                          type="number"
                          inputProps={{ min: 1, step: "0.01" }}
                          variant="outlined"
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value);
                            setAmountEdited(true);
                          }}
                          required
                          error={hasAmountMismatch}
                          helperText={
                            orderPreview
                              ? hasAmountMismatch
                                ? `ยอดที่กรอกไม่ตรงกับยอดคำสั่งซื้อ ฿${orderPreview.total.toLocaleString()}`
                                : `ระบบเติมยอดจากคำสั่งซื้อให้อัตโนมัติ: ฿${orderPreview.total.toLocaleString()}`
                              : undefined
                          }
                          InputProps={{
                            startAdornment: (
                              <Typography color="text.secondary" sx={{ mr: 1 }}>
                                ฿
                              </Typography>
                            ),
                          }}
                        />

                        {expectedAmount !== null && (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              borderColor: hasAmountMismatch ? "warning.light" : "grey.200",
                              bgcolor: hasAmountMismatch ? "warning.50" : "grey.50",
                            }}
                          >
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                              <Box>
                                <Typography variant="body2" fontWeight="800" color={hasAmountMismatch ? "warning.dark" : "text.primary"}>
                                  ยอดคำสั่งซื้อที่ระบบตรวจพบ: ฿{expectedAmount.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {hasAmountMismatch
                                    ? "ตรวจสอบยอดโอนอีกครั้งก่อนส่งข้อมูล เพื่อช่วยให้ทีมงานยืนยันการชำระเงินได้เร็วขึ้น"
                                    : "หากยอดที่โอนตรงตามคำสั่งซื้อ คุณสามารถส่งข้อมูลต่อได้ทันที"}
                                </Typography>
                              </Box>
                              <Button
                                type="button"
                                variant={hasAmountMismatch ? "contained" : "outlined"}
                                size="small"
                                onClick={() => {
                                  setAmount(String(expectedAmount));
                                  setAmountEdited(false);
                                }}
                                sx={{ borderRadius: 10, fontWeight: 800, flexShrink: 0 }}
                              >
                                ใช้ยอดตามคำสั่งซื้อ
                              </Button>
                            </Stack>
                          </Paper>
                        )}

                        <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
                          <DatePicker
                            label="วันที่โอน"
                            value={transferDate}
                            onChange={(val) => setTransferDate(val)}
                            slotProps={{ textField: { fullWidth: true, required: true, variant: "outlined" } }}
                          />
                          <TimePicker
                            label="เวลาที่โอน"
                            value={transferTime}
                            onChange={(val) => setTransferTime(val)}
                            slotProps={{ textField: { fullWidth: true, required: true, variant: "outlined" } }}
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
                    </Box>
                  </Stack>
                </Paper>
              </Stack>

              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: slipImage ? "success.light" : "grey.200", display: "flex", flexDirection: "column", position: { md: "sticky" }, top: { md: 96 } }}>
                <Stack spacing={3} sx={{ height: "100%" }}>
                  <StepHeading index="3" title="แนบสลิปและส่งข้อมูล" description="อัปโหลดหลักฐานการโอนเงิน แล้วส่งข้อมูลเพื่อให้ทีมงานตรวจสอบคำสั่งซื้อ" />

                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "grey.50" }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight="800">
                        สถานะการแจ้งชำระเงิน
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row", md: "column" }} spacing={1}>
                        <Chip label={accessToken ? "ยืนยันคำสั่งซื้อแล้ว" : "ยังไม่ยืนยันคำสั่งซื้อ"} color={accessToken ? "success" : "default"} sx={{ fontWeight: 800, justifyContent: "flex-start" }} />
                        <Chip label={slipImage ? "เลือกรูปสลิปแล้ว" : "ยังไม่ได้เลือกรูปสลิป"} color={slipImage ? "primary" : "default"} sx={{ fontWeight: 800, justifyContent: "flex-start" }} />
                      </Stack>
                      {orderPreview && (
                        <Typography variant="body2" color="text.secondary">
                          ยอดที่ควรโอน: ฿{orderPreview.total.toLocaleString()}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              <Box
                onClick={() => {
                  if (!accessToken) return;
                  fileInputRef.current?.click();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!accessToken) return;
                  handleFile(e.dataTransfer.files?.[0] ?? null);
                }}
                sx={{
                  flex: 1,
                  minHeight: { xs: 200, md: 250 },
                  border: "2px dashed",
                  borderColor: slipImage ? "success.main" : accessToken ? "grey.300" : "grey.200",
                  borderRadius: 4,
                  bgcolor: slipImage ? "transparent" : accessToken ? "grey.50" : "grey.100",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: accessToken ? "pointer" : "not-allowed",
                  position: "relative",
                  overflow: "hidden",
                  transition: "0.2s",
                  "&:hover": {
                    borderColor: slipImage ? "success.main" : accessToken ? "primary.main" : "grey.200",
                    bgcolor: slipImage ? "transparent" : accessToken ? "rgba(215,20,20,0.02)" : "grey.100",
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
                        {accessToken ? "แตะเพื่อเลือกรูปภาพ" : "ยืนยันคำสั่งซื้อก่อนอัปโหลดสลิป"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                        {accessToken ? "หรือลากไฟล์มาวางที่นี่" : "ระบบจะเปิดให้เลือกไฟล์หลังจากตรวจสอบคำสั่งซื้อสำเร็จ"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        รองรับ JPG, PNG, WEBP (ไม่เกิน 5 MB)
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      disabled={!accessToken}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!accessToken) return;
                        fileInputRef.current?.click();
                      }}
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
                disabled={isSubmitting || !slipImage || !accessToken}
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
                </Stack>
              </Paper>
            </Box>
          </LocalizationProvider>
        </form>
      </Container>
    </Box>
  );
}
