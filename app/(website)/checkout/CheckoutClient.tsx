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
import { ArrowLeft2, SecuritySafe, Cards, TruckFast, Trash, TicketDiscount, Add, Minus } from "iconsax-react";
import Link from "next/link";
import { useSnackbar } from "@/components/SnackbarProvider";

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

const DEFAULT_BANK_ACCOUNT_INFO = [
  "ธนาคาร: ไทยพาณิชย์ (SCB)",
  "ชื่อบัญชี: บริษัท ศรีนานาพร มาร์เก็ตติ้ง จำกัด(มหาชน)",
  "เลขที่บัญชี: 366-415149-5",
].join("\n");

export default function CheckoutClient({ profile, bankAccountInfo }: { profile: ProfileData; bankAccountInfo?: string | null }) {
  const { items, totalPrice, clearCart, removeItem, updateQuantity } = useCart();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const bankInfoText = (bankAccountInfo && bankAccountInfo.trim()) || DEFAULT_BANK_ACCOUNT_INFO;

  const [email, setEmail] = useState(profile.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

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

  React.useEffect(() => {
    fetch("/api/shipping-methods")
      .then((r) => r.json())
      .then((data: ShippingMethod[]) => {
        setShippingMethods(data);
        if (data.length > 0) setSelectedShippingId(data[0].id);
      })
      .finally(() => setShippingLoading(false));
  }, []);

  const selectedMethod = shippingMethods.find((m) => m.id === selectedShippingId) ?? null;
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

  const handleApplyDiscount = () => {
    if (discountCode.trim().toUpperCase() === "SNNP10") {
      setDiscountAmount(10);
      setDiscountApplied(true);
    } else {
      setDiscountAmount(0);
      setDiscountApplied(false);
    }
  };

  // If cart is empty, redirect back to products or home
  React.useEffect(() => {
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

      // Cache snapshot for success page display
      const orderSnapshot = {
        orderNumber: data.orderNumber,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, image: i.image, quantity: i.quantity })),
        subtotal: totalPrice,
        discount: discountAmount,
        total: totalPrice + effectiveShippingCost - discountAmount,
        discountCode: discountApplied ? discountCode.toUpperCase() : null,
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
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

        <Typography variant="h4" fontWeight="900" mb={4}>
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
                  <Box sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 2, p: 2, bgcolor: 'rgb(215, 20, 20, 0.05)' }}>
                    <Typography fontWeight="800" mb={1} color="primary.main">โอนเงินเข้าบัญชีธนาคาร</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      กรุณาโอนเงินมาที่บัญชีด้านล่างเพื่อชำระค่าสินค้า
                    </Typography>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                        {bankInfoText}
                      </Typography>
                    </Box>
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
                <Stack direction="row" spacing={1} mb={3}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="กรอก Code ส่วนลด"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value);
                      setDiscountApplied(false);
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
                    ใช้งาน
                  </Button>
                </Stack>
                {discountApplied && (
                  <Typography variant="caption" color="success.main" fontWeight="700" display="block" mb={2}>
                    ✓ ใช้โค้ดส่วนลด &quot;{discountCode.toUpperCase()}&quot; สำเร็จ ลด ฿{discountAmount}
                  </Typography>
                )}
                {!discountApplied && discountCode.trim() !== "" && (
                  <Typography variant="caption" color="error.main" fontWeight="700" display="block" mb={2}>
                    โค้ดส่วนลดไม่ถูกต้อง
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
