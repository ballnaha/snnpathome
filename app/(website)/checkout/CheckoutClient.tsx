"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Chip,
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Paper,
  IconButton,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  Skeleton,
  Alert,
} from "@mui/material";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { ArrowLeft2, ArrowRight2, SecuritySafe, Cards, TruckFast, Trash, TicketDiscount, Add, Minus } from "iconsax-react";
import Link from "next/link";
import { useSnackbar } from "@/components/SnackbarProvider";
import type { PublicCoupon } from "@/lib/public-coupons";
import { formatCouponBenefit, formatCouponCondition } from "@/lib/public-coupons";
import BankAccountCard from "@/components/BankAccountCard";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
}

export default function CheckoutClient({ profile, bankAccountInfo, availableCoupons }: { profile: ProfileData; bankAccountInfo?: string | null; availableCoupons: PublicCoupon[] }) {
  const { items, totalPrice, clearCart, removeItem, updateQuantity } = useCart();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [email, setEmail] = useState(profile.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountMessageTone, setDiscountMessageTone] = useState<"success" | "error" | "info">("info");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const [postcode, setPostcode] = useState(profile.postcode);
  const [postcodeError, setPostcodeError] = useState("");
  const [phone, setPhone] = useState(profile.phone);
  const [phoneError, setPhoneError] = useState("");

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [address, setAddress] = useState(profile.address);
  const [subdistrict, setSubdistrict] = useState(profile.subdistrict);
  const [district, setDistrict] = useState(profile.district);
  const [province, setProvince] = useState(profile.province);

  // Shipping methods
  interface ShippingMethod { id: string; name: string; price: number; freeThreshold: number | null; }
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");

  useEffect(() => {
    fetch("/api/shipping-methods")
      .then((r) => r.json())
      .then((data: ShippingMethod[]) => {
        setShippingMethods(data);
        if (data.length > 0) setSelectedShippingId(data[0].id);
      })
      .finally(() => setShippingLoading(false));
  }, []);

  const selectedMethod = shippingMethods.find((m) => m.id === selectedShippingId) ?? null;
  const selectedAvailableCoupon = availableCoupons.find(
    (coupon) => coupon.code.toUpperCase() === discountCode.trim().toUpperCase()
  ) ?? null;
  const effectiveShippingCost =
    selectedMethod === null
      ? 0
      : selectedMethod.freeThreshold !== null && totalPrice >= selectedMethod.freeThreshold
      ? 0
      : selectedMethod.price;

  const validatePostcode = (value: string) => {
    if (!value) return "กรุณากรอกรหัสไปรษณีย์";
    if (!/^\d{5}$/.test(value)) return "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
    return "";
  };

  const validatePhone = (value: string) => {
    if (!value) return "กรุณากรอกเบอร์โทรศัพท์";
    if (!/^0\d{8,9}$/.test(value.replace(/-/g, ""))) return "เบอร์โทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 0812345678)";
    return "";
  };

  const handleApplyDiscount = async () => {
    const code = discountCode.trim();
    if (!code) {
      setDiscountApplied(false);
      setDiscountAmount(0);
      setDiscountMessage("กรุณากรอกโค้ดส่วนลด");
      setDiscountMessageTone("error");
      return;
    }

    setIsApplyingDiscount(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: totalPrice }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setDiscountApplied(false);
        setDiscountAmount(0);
        setDiscountMessage(typeof data?.error === "string" ? data.error : "โค้ดส่วนลดไม่ถูกต้อง");
        setDiscountMessageTone("error");
        return;
      }

      setDiscountCode(data?.coupon?.code ?? code.toUpperCase());
      setDiscountAmount(Number(data?.discountAmount ?? 0));
      setDiscountApplied(true);
      setDiscountMessage(`ใช้โค้ดส่วนลด "${data?.coupon?.code ?? code.toUpperCase()}" สำเร็จ`);
      setDiscountMessageTone("success");
    } catch {
      setDiscountApplied(false);
      setDiscountAmount(0);
      setDiscountMessage("ไม่สามารถตรวจสอบคูปองได้ กรุณาลองใหม่");
      setDiscountMessageTone("error");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleSelectCoupon = async (code: string) => {
    setDiscountCode(code);
    setDiscountMessage("");
    setDiscountApplied(false);
    setDiscountAmount(0);

    setIsApplyingDiscount(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: totalPrice }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setDiscountMessage(typeof data?.error === "string" ? data.error : "คูปองนี้ยังใช้ไม่ได้กับยอดปัจจุบัน");
        setDiscountMessageTone("error");
        return;
      }

      setDiscountCode(data?.coupon?.code ?? code.toUpperCase());
      setDiscountAmount(Number(data?.discountAmount ?? 0));
      setDiscountApplied(true);
      setDiscountMessage(`ใช้โค้ดส่วนลด "${data?.coupon?.code ?? code.toUpperCase()}" สำเร็จ`);
      setDiscountMessageTone("success");
    } catch {
      setDiscountMessage("ไม่สามารถตรวจสอบคูปองได้ กรุณาลองใหม่");
      setDiscountMessageTone("error");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  useEffect(() => {
    if (!discountCode.trim()) {
      return;
    }

    setDiscountApplied(false);
    setDiscountAmount(0);
    setDiscountMessage("ยอดสินค้าเปลี่ยน กรุณากดใช้งานคูปองอีกครั้ง");
    setDiscountMessageTone("info");
  }, [discountCode, totalPrice]);

  // If cart is empty, redirect back to products or home
  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      router.push("/all-products");
    }
  }, [items, router, isSuccess]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const pErr = validatePostcode(postcode);
    const tErr = validatePhone(phone);
    setPostcodeError(pErr);
    setPhoneError(tErr);
    if (pErr || tErr) return;
    if (!selectedShippingId) {
      showSnackbar("กรุณาเลือกรูปแบบการจัดส่ง", "error");
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, image: i.image, quantity: i.quantity })),
          subtotal: totalPrice,
          discount: discountAmount,
          discountCode: discountApplied ? discountCode.toUpperCase() : null,
          total: totalPrice + effectiveShippingCost - discountAmount,
          shippingMethodId: selectedShippingId || null,
          shippingMethodName: selectedMethod?.name ?? null,
          shippingCost: effectiveShippingCost,
          firstName,
          lastName,
          email,
          address,
          subdistrict,
          district,
          province,
          postcode,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showSnackbar(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
        setIsSubmitting(false);
        return;
      }

      const finalSubtotal = Number(data.subtotal ?? totalPrice);
      const finalDiscount = Number(data.discount ?? 0);
      const finalTotal = Number(data.total ?? finalSubtotal + effectiveShippingCost - finalDiscount);
      const finalDiscountCode = typeof data.discountCode === "string" ? data.discountCode : null;

      // Cache snapshot for success page display
      const orderSnapshot = {
        orderNumber: data.orderNumber,
        accessToken: data.accessToken,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, image: i.image, quantity: i.quantity })),
        subtotal: finalSubtotal,
        discount: finalDiscount,
        total: finalTotal,
        discountCode: finalDiscountCode,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("snnp-last-order", JSON.stringify(orderSnapshot));

      showSnackbar("สั่งซื้อสำเร็จ! ขอบคุณที่อุดหนุน", "success");
      setIsSuccess(true);
      clearCart();
      router.push("/checkout/success");
    } catch {
      showSnackbar("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่", "error");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null; // Prevent flicker before redirect

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", pb: { xs: 10, md: 8 } }}>
      <Box sx={{ bgcolor: "#eee", py: { xs: 4, md: 6 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            
            <Typography variant="h2" fontWeight="900" sx={{ color: "#333", fontSize: { xs: "1.4rem", md: "2rem" } }}>
              ชำระเงิน
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            ตรวจสอบคำสั่งซื้อ กรอกข้อมูลการจัดส่ง และยืนยันการชำระเงินอย่างปลอดภัย
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
        <Breadcrumbs
          separator={<ArrowRight2 size="14" color="#999" />}
          aria-label="breadcrumb"
          sx={{ mb: { xs: 2, md: 4 } }}
        >
          <Link href="/" style={{ fontSize: "0.85rem", color: "inherit", textDecoration: "none" }}>
            หน้าแรก
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            ชำระเงิน
          </Typography>
        </Breadcrumbs>

        <Box mb={4}>
          <Button
            component={Link}
            href="/all-products"
            startIcon={<ArrowLeft2 size="16" color="currentColor" />}
            sx={{ color: "text.secondary", fontWeight: 700 }}
          >
            กลับไปเลือกสินค้าต่อ
          </Button>
        </Box>

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
                      <TextField fullWidth label="ชื่อจริง" variant="outlined" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}>
                      <TextField fullWidth label="นามสกุล" variant="outlined" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <TextField fullWidth label="อีเมล (สำหรับรับใบยืนยันคำสั่งซื้อ)" variant="outlined" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <TextField fullWidth label="ที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)" variant="outlined" required value={address} onChange={(e) => setAddress(e.target.value)} />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                      <TextField fullWidth label="ตำบล / แขวง" variant="outlined" required value={subdistrict} onChange={(e) => setSubdistrict(e.target.value)} />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                      <TextField fullWidth label="อำเภอ / เขต" variant="outlined" required value={district} onChange={(e) => setDistrict(e.target.value)} />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                      <TextField fullWidth label="จังหวัด" variant="outlined" required value={province} onChange={(e) => setProvince(e.target.value)} />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}>
                      <TextField
                        fullWidth
                        label="รหัสไปรษณีย์"
                        variant="outlined"
                        required
                        value={postcode}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                          setPostcode(v);
                          setPostcodeError(validatePostcode(v));
                        }}
                        error={!!postcodeError}
                        helperText={postcodeError}
                        inputProps={{ maxLength: 5, inputMode: "numeric" }}
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}>
                      <TextField
                        fullWidth
                        label="เบอร์โทรศัพท์"
                        variant="outlined"
                        required
                        value={phone}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d-]/g, "").slice(0, 10);
                          setPhone(v);
                          setPhoneError(validatePhone(v));
                        }}
                        error={!!phoneError}
                        helperText={phoneError}
                        inputProps={{ maxLength: 10, inputMode: "tel" }}
                      />
                    </Box>
                  </Box>
                </Paper>

                {/* Shipping Method */}
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
                    รูปแบบการจัดส่ง
                  </Typography>

                  {shippingLoading ? (
                    <Stack spacing={1.5}>
                      <Skeleton variant="rounded" height={64} />
                      <Skeleton variant="rounded" height={64} />
                    </Stack>
                  ) : shippingMethods.length === 0 ? (
                    <Alert severity="warning">ยังไม่มีรูปแบบการจัดส่ง กรุณาติดต่อผู้ดูแลระบบ</Alert>
                  ) : (
                    <RadioGroup value={selectedShippingId} onChange={(e) => setSelectedShippingId(e.target.value)}>
                      <Stack spacing={1.5}>
                        {shippingMethods.map((m) => {
                          const isFree = m.freeThreshold !== null && totalPrice >= m.freeThreshold;
                          const cost = isFree ? 0 : m.price;
                          return (
                            <Box
                              key={m.id}
                              onClick={() => setSelectedShippingId(m.id)}
                              sx={{
                                border: "2px solid",
                                borderColor: selectedShippingId === m.id ? "primary.main" : "grey.200",
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                                cursor: "pointer",
                                bgcolor: selectedShippingId === m.id ? "rgb(215,20,20,0.04)" : "white",
                                transition: "0.15s",
                              }}
                            >
                              <FormControlLabel
                                value={m.id}
                                control={<Radio size="small" color="primary" />}
                                label={
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                                    <Box>
                                      <Typography variant="body2" fontWeight="800">{m.name}</Typography>
                                      {m.freeThreshold !== null && (
                                        <Typography variant="caption" color="text.secondary">
                                          {m.freeThreshold === 0
                                            ? "จัดส่งฟรีทุกคำสั่งซื้อ"
                                            : `ฟรีเมื่อสั่งซื้อครบ ฿${m.freeThreshold.toLocaleString()}`}
                                        </Typography>
                                      )}
                                    </Box>
                                    {isFree ? (
                                      <Stack direction="row" alignItems="center" gap={0.5}>
                                        <Typography variant="body2" sx={{ textDecoration: "line-through", color: "text.disabled", fontSize: "0.75rem" }}>
                                          ฿{m.price.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" fontWeight="900" color="success.main">ฟรี</Typography>
                                      </Stack>
                                    ) : (
                                      <Typography variant="body2" fontWeight="900">
                                        {cost === 0 ? "ฟรี" : `฿${cost.toLocaleString()}`}
                                      </Typography>
                                    )}
                                  </Stack>
                                }
                                sx={{ m: 0, width: "100%", "& .MuiFormControlLabel-label": { flex: 1, minWidth: 0 } }}
                              />
                            </Box>
                          );
                        })}
                      </Stack>
                    </RadioGroup>
                  )}
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
                  <BankAccountCard
                    bankAccountInfo={bankAccountInfo}
                    amount={totalPrice + effectiveShippingCost - discountAmount}
                    title="โอนเงินเข้าบัญชีธนาคาร"
                    subtitle="กรุณาโอนเงินมาที่บัญชีด้านล่างเพื่อชำระค่าสินค้า"
                  />
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
                      <Stack direction="row" key={item.id} spacing={2} alignItems="flex-start">
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
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="700" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.2, mb: 1 }}>
                            {item.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 10, width: 'fit-content', overflow: 'hidden' }}>
                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} sx={{ borderRadius: 0, px: 0.8, "&:hover": { bgcolor: 'grey.50' } }}>
                              <Minus size="13" color="#999" />
                            </IconButton>
                            <Typography sx={{ px: 1.5, fontWeight: 900, fontSize: '0.8rem', minWidth: 24, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)} sx={{ borderRadius: 0, px: 0.8, "&:hover": { bgcolor: 'grey.50' } }}>
                              <Add size="13" color="#d71414" />
                            </IconButton>
                          </Stack>
                        </Box>
                        <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
                          <Typography variant="body2" fontWeight="900">
                            ฿{(item.price * item.quantity).toLocaleString()}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => removeItem(item.id)}
                            sx={{ color: "grey.400", p: 0.3, "&:hover": { color: "error.main" } }}
                            aria-label="ลบสินค้า"
                          >
                            <Trash size="16" variant="Bold" color="currentColor" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Discount Code */}
                {availableCoupons.length > 0 && (
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" fontWeight="900" sx={{ mb: 1 }}>
                      คูปองที่ใช้ได้ตอนนี้
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {availableCoupons.map((coupon) => (
                        <Chip
                          key={coupon.id}
                          clickable
                          disabled={isApplyingDiscount}
                          label={`${coupon.code} · ${formatCouponBenefit(coupon)}`}
                          onClick={() => void handleSelectCoupon(coupon.code)}
                          color={selectedAvailableCoupon?.id === coupon.id ? "warning" : "default"}
                          variant={selectedAvailableCoupon?.id === coupon.id ? "filled" : "outlined"}
                          sx={{
                            height: 34,
                            borderRadius: 999,
                            fontWeight: 800,
                            bgcolor: selectedAvailableCoupon?.id === coupon.id ? "warning.light" : "transparent",
                            borderColor: selectedAvailableCoupon?.id === coupon.id ? "warning.main" : "grey.300",
                            "& .MuiChip-label": {
                              px: 1.5,
                            },
                          }}
                        />
                      ))}
                    </Stack>
                    {selectedAvailableCoupon && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                        {selectedAvailableCoupon.name} • {formatCouponCondition(selectedAvailableCoupon)}
                      </Typography>
                    )}
                  </Box>
                )}

                <Stack direction="row" spacing={1} mb={3}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="กรอก Code ส่วนลด"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value);
                      setDiscountApplied(false);
                      setDiscountAmount(0);
                      setDiscountMessage("");
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TicketDiscount size="16" color="#999" variant="Bold" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleApplyDiscount}
                    disabled={isApplyingDiscount}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                      borderColor: "primary.main",
                      color: "primary.main",
                      borderWidth: 2,
                      "&:hover": { borderWidth: 2 },
                      px: 2,
                    }}
                  >
                    {isApplyingDiscount ? "กำลังตรวจสอบ..." : "ใช้งาน"}
                  </Button>
                </Stack>
                {discountMessage && (
                  <Typography variant="caption" color={discountMessageTone === "success" ? "success.main" : discountMessageTone === "info" ? "text.secondary" : "error.main"} fontWeight="700" display="block" mb={2}>
                    {discountApplied ? `✓ ${discountMessage} ลด ฿${discountAmount.toLocaleString()}` : discountMessage}
                  </Typography>
                )}

                {/* Price Breakdown */}
                <Stack spacing={2} mb={3}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" fontWeight="500">ยอดรวมสินค้า</Typography>
                    <Typography fontWeight="700">฿{totalPrice.toLocaleString()}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" fontWeight="500">ค่าจัดส่ง</Typography>
                    {effectiveShippingCost === 0 ? (
                      <Typography fontWeight="700" color="success.main">ฟรี</Typography>
                    ) : (
                      <Typography fontWeight="700">฿{effectiveShippingCost.toLocaleString()}</Typography>
                    )}
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" fontWeight="500">ส่วนลด</Typography>
                    <Typography fontWeight="700" color="error.main">-฿{discountAmount}</Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                  <Typography variant="subtitle1" fontWeight="900">ยอดรวมทั้งสิ้น</Typography>
                  <Typography variant="h5" fontWeight="900" color="primary.main">
                    ฿{(totalPrice + effectiveShippingCost - discountAmount).toLocaleString()}
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
