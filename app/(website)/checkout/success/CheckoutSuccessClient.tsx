"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Divider,
  Avatar,
  Chip,
} from "@mui/material";
import {
  TickCircle,
  ShoppingBag,
  DocumentUpload,
  GalleryAdd,
  CloseCircle,
  Receipt21,
} from "iconsax-react";
import Link from "next/link";
import { useSnackbar } from "@/components/SnackbarProvider";
import BankAccountCard from "@/components/BankAccountCard";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface OrderSnapshot {
  orderNumber: string;
  accessToken?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  discountCode: string | null;
  createdAt: string;
}

export default function CheckoutSuccessClient({ bankAccountInfo }: { bankAccountInfo?: string | null }) {
  const { showSnackbar } = useSnackbar();
  const [order, setOrder] = useState<OrderSnapshot | null>(null);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slipSubmitted, setSlipSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("snnp-last-order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showSnackbar("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar("ขนาดไฟล์ต้องไม่เกิน 5 MB", "error");
      return;
    }
    setSlipFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setSlipImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  };

  const handleSubmitSlip = async () => {
    if (!slipFile || !slipImage) {
      showSnackbar("กรุณาเลือกไฟล์สลิปก่อน", "error");
      return;
    }
    if (!order?.orderNumber) {
      showSnackbar("ไม่พบหมายเลขคำสั่งซื้อ", "error");
      return;
    }
    if (!order.accessToken) {
      showSnackbar("กรุณายืนยันคำสั่งซื้ออีกครั้งในหน้าแจ้งชำระเงิน", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}/slip`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slipUrl: slipImage, accessToken: order.accessToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          showSnackbar("สิทธิ์สำหรับแนบสลิปหมดอายุ กรุณาไปที่หน้าแจ้งชำระเงินเพื่อยืนยันอีกครั้ง", "error");
          return;
        }
        showSnackbar(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
        return;
      }
      setSlipSubmitted(true);
      showSnackbar("แนบสลิปสำเร็จ! คำสั่งซื้อกำลังรอตรวจสอบ", "success");
    } catch {
      showSnackbar("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          {/* Header Card */}
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
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Box
                sx={{
                  bgcolor: "success.light",
                  p: 2,
                  borderRadius: "50%",
                  display: "flex",
                  opacity: 0.9,
                }}
              >
                <TickCircle size="72" variant="Bold" color="#2e7d32" />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight="900" color="success.main" mb={1}>
              การสั่งซื้อสำเร็จ!
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              ขอบคุณที่อุดหนุนสินค้าจาก SNNP AT HOME เราจะรีบดำเนินการให้เร็วที่สุด
            </Typography>
            {order && (
              <Box
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: 3,
                  px: 4,
                  py: 2,
                  display: "inline-block",
                  border: "1px dashed",
                  borderColor: "grey.300",
                }}
              >
                <Typography variant="overline" fontWeight="700" color="text.secondary" display="block">
                  หมายเลขคำสั่งซื้อ
                </Typography>
                <Typography variant="h5" fontWeight="900" color="primary.main" letterSpacing={2}>
                  {order.orderNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(order.createdAt)}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Order Details */}
          {order && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Typography variant="h6" fontWeight="900" mb={3} display="flex" alignItems="center" gap={1}>
                <Receipt21 size="22" color="#d71414" variant="Bold" />
                รายการสินค้า
              </Typography>

              <Stack spacing={2} mb={3}>
                {order.items.map((item) => (
                  <Stack key={item.id} direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={item.image}
                      alt={item.name}
                      variant="rounded"
                      sx={{ width: 56, height: 56, border: "1px solid", borderColor: "grey.200", bgcolor: "white", p: 0.5, "& img": { objectFit: "contain" } }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="700" noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ฿{item.price.toLocaleString()} × {item.quantity}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="900" flexShrink={0}>
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary" variant="body2">ยอดรวมสินค้า</Typography>
                  <Typography fontWeight="700" variant="body2">฿{order.subtotal.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary" variant="body2">ค่าจัดส่ง</Typography>
                  <Typography fontWeight="700" variant="body2" color="success.main">ฟรี</Typography>
                </Stack>
                {order.discount > 0 && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography color="text.secondary" variant="body2">ส่วนลด</Typography>
                      {order.discountCode && (
                        <Chip label={order.discountCode} size="small" color="error" sx={{ fontWeight: 800, height: 18, fontSize: "0.65rem" }} />
                      )}
                    </Stack>
                    <Typography fontWeight="700" variant="body2" color="error.main">
                      -฿{order.discount.toLocaleString()}
                    </Typography>
                  </Stack>
                )}
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight="900" variant="subtitle1">ยอดรวมทั้งสิ้น</Typography>
                  <Typography fontWeight="900" variant="h6" color="primary.main">
                    ฿{order.total.toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>

              {/* Bank Info */}
              <Box sx={{ mt: 3 }}>
                <BankAccountCard bankAccountInfo={bankAccountInfo} amount={order.total} />
              </Box>
            </Paper>
          )}

          {/* Slip Upload */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: slipSubmitted ? "success.main" : "grey.200",
              bgcolor: slipSubmitted ? "rgba(46,125,50,0.03)" : "white",
            }}
          >
            <Typography variant="h6" fontWeight="900" mb={1} display="flex" alignItems="center" gap={1}>
              <DocumentUpload size="22" color="#d71414" variant="Bold" />
              แนบสลิปการโอนเงิน
            </Typography>

            {slipSubmitted ? (
              <Stack spacing={2} alignItems="center" py={3}>
                <TickCircle size="56" variant="Bold" color="#2e7d32" />
                <Typography fontWeight="800" color="success.main">แนบสลิปสำเร็จแล้ว!</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  ทีมงานจะตรวจสอบและยืนยันการชำระเงินภายใน 1-2 ชั่วโมง
                </Typography>
              </Stack>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  กรุณาอัปโหลดหลักฐานการโอนเงิน เพื่อให้เราดำเนินการจัดส่งสินค้าได้รวดเร็วยิ่งขึ้น
                </Typography>
                {!order?.accessToken && (
                  <Typography variant="body2" color="warning.main" mb={2}>
                    เซสชันยืนยันคำสั่งซื้อหมดอายุแล้ว กรุณาไปที่หน้าแจ้งชำระเงินเพื่อยืนยันด้วยอีเมลหรือเบอร์โทรอีกครั้ง
                  </Typography>
                )}

                {/* Drop zone */}
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  sx={{
                    border: "2px dashed",
                    borderColor: slipImage ? "success.main" : "grey.300",
                    borderRadius: 3,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: slipImage ? "rgba(46,125,50,0.03)" : "grey.50",
                    transition: "0.2s",
                    "&:hover": { borderColor: "primary.main", bgcolor: "rgba(215,20,20,0.02)" },
                    position: "relative",
                    minHeight: 160,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {slipImage ? (
                    <>
                      <Box
                        component="img"
                        src={slipImage}
                        alt="slip preview"
                        sx={{ maxHeight: 220, maxWidth: "100%", borderRadius: 2, objectFit: "contain" }}
                      />
                      <Button
                        size="small"
                        onClick={(e) => { e.stopPropagation(); setSlipImage(null); setSlipFile(null); }}
                        startIcon={<CloseCircle size="14" color="currentColor" />}
                        sx={{ mt: 1.5, color: "error.main", fontWeight: 700, fontSize: "0.75rem" }}
                      >
                        เปลี่ยนรูป
                      </Button>
                    </>
                  ) : (
                    <>
                      <GalleryAdd size="48" color="#ccc" variant="Bulk" />
                      <Typography variant="body2" color="text.secondary" mt={1.5} fontWeight="700">
                        คลิกหรือลากไฟล์มาวางที่นี่
                      </Typography>
                      <Typography variant="caption" color="grey.400">
                        รองรับ JPG, PNG, WEBP (ไม่เกิน 5 MB)
                      </Typography>
                    </>
                  )}
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmitSlip}
                  disabled={!slipFile || isSubmitting || !order?.accessToken}
                  startIcon={<DocumentUpload variant="Bold" color="#FFF" />}
                  sx={{
                    mt: 3,
                    py: 1.6,
                    borderRadius: 15,
                    fontWeight: 900,
                    fontSize: "1rem",
                    bgcolor: "primary.main",
                    boxShadow: "0 8px 25px rgba(215,20,20,0.3)",
                    "&:hover": { bgcolor: "#cc0000" },
                  }}
                >
                  {isSubmitting ? "กำลังส่งข้อมูล..." : "ยืนยันแนบสลิป"}
                </Button>
              </>
            )}
          </Paper>

          {/* Action Buttons */}
          <Stack spacing={2}>
            <Button
              component={Link}
              href="/all-products"
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<ShoppingBag variant="Bold" color="currentColor" />}
              sx={{
                py: 1.5,
                borderRadius: 10,
                fontWeight: 800,
                borderWidth: 2,
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": { borderWidth: 2 },
              }}
            >
              กลับไปเลือกซื้อสินค้าต่อ
            </Button>
            {!slipSubmitted && order && (
              <Button
                component={Link}
                href={`/payment-notification?order=${order.orderNumber}`}
                variant="text"
                fullWidth
                sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.85rem" }}
              >
                แจ้งชำระเงินภายหลัง →
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
