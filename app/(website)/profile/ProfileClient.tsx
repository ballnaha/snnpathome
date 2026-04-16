"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Avatar,
  TextField,
  Button,
  Divider,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Tab,
  Tabs,
  Alert,
  Breadcrumbs,
} from "@mui/material";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Sms,
  Call,
  Location,
  ClipboardText,
  Logout,
  TickCircle,
  Lock,
  Eye,
  EyeSlash,
  ShieldSecurity,
  Crown,
  ArrowRight2,
  Profile,
} from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import { useCart } from "@/contexts/CartContext";

interface ProfileClientProps {
  initialName: string;
  initialPhone: string;
  initialAddress: string;
  initialSubdistrict: string;
  initialDistrict: string;
  initialProvince: string;
  initialPostcode: string;
  email: string;
  role: string;
  hasPassword: boolean;
  memberSince: string;
}

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box pt={3}>{children}</Box> : null;
}

export default function ProfileClient({
  initialName,
  initialPhone,
  initialAddress,
  initialSubdistrict,
  initialDistrict,
  initialProvince,
  initialPostcode,
  email,
  role,
  hasPassword,
  memberSince,
}: ProfileClientProps) {
  const { update: updateSession } = useSession();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { clearCart } = useCart();

  const [tab, setTab] = useState(0);

  // --- Info state ---
  const [infoSaving, setInfoSaving] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [subdistrict, setSubdistrict] = useState(initialSubdistrict);
  const [district, setDistrict] = useState(initialDistrict);
  const [province, setProvince] = useState(initialProvince);
  const [postcode, setPostcode] = useState(initialPostcode);

  // --- Password state ---
  const [pwSaving, setPwSaving] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const avatarLetter = name?.charAt(0)?.toUpperCase() || "U";

  const handleSaveInfo = async () => {
    if (!name.trim()) {
      showSnackbar("กรุณากรอกชื่อ-นามสกุล", "error");
      return;
    }
    setInfoSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "info", name, phone, address, subdistrict, district, province, postcode }),
      });
      const data = await res.json();
      if (!res.ok) { showSnackbar(data.error || "เกิดข้อผิดพลาด", "error"); return; }
      await updateSession({ name });
      showSnackbar("บันทึกข้อมูลสำเร็จ", "success");
      router.refresh();
    } catch {
      showSnackbar("เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
    } finally {
      setInfoSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      showSnackbar("กรุณากรอกข้อมูลให้ครบ", "error");
      return;
    }
    if (newPw.length < 8) {
      showSnackbar("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร", "error");
      return;
    }
    if (newPw !== confirmPw) {
      showSnackbar("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน", "error");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { showSnackbar(data.error || "เกิดข้อผิดพลาด", "error"); return; }
      showSnackbar("เปลี่ยนรหัสผ่านสำเร็จ", "success");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch {
      showSnackbar("เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
    } finally {
      setPwSaving(false);
    }
  };

  const handleSignOut = () => {
    clearCart();
    localStorage.removeItem("snnp-last-order");
    signOut({ callbackUrl: "/" });
  };

  const memberDate = new Date(memberSince).toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Hero — same style as other pages */}
      <Box sx={{ bgcolor: "#eee", py: { xs: 4, md: 6 }, textAlign: "center" }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            <Profile size="28" color="#d71414" variant="Bold" />
            <Typography variant="h2" fontWeight="900" sx={{ color: "#333", fontSize: { xs: "1.4rem", md: "2rem" } }}>
              โปรไฟล์ของฉัน
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            สมาชิกตั้งแต่ {memberDate}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, pb: { xs: 10, md: 5 } }}>         
        {/* Breadcrumb */}
        <Breadcrumbs
          separator={<ArrowRight2 size="14" color="#999" />}
          aria-label="breadcrumb"
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          <Link href="/" style={{ fontSize: "0.85rem", color: "inherit", textDecoration: "none" }}>
            หน้าแรก
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            โปรไฟล์ของฉัน
          </Typography>
        </Breadcrumbs>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "stretch", md: "flex-start" }}>

          {/* ── Left sidebar (desktop) / Top card (mobile) ── */}
          <Box sx={{ width: { xs: "100%", md: 280 }, flexShrink: 0 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "grey.200",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              {/* Avatar section — desktop only */}
              {/* Avatar section */}
              <Stack
                alignItems="center"
                sx={{ px: 2, pt: 3, pb: 2.5, borderBottom: "1px solid", borderColor: "grey.100" }}
              >
                <Avatar
                  sx={{ width: 72, height: 72, fontSize: "1.8rem", fontWeight: 900, bgcolor: "primary.main", color: "white", mb: 1.5, boxShadow: "0 4px 16px rgba(215,20,20,0.25)" }}
                >
                  {avatarLetter}
                </Avatar>
                <Typography variant="subtitle2" fontWeight={900} sx={{ lineHeight: 1.3, textAlign: "center" }}>
                  {name || "ผู้ใช้งาน"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all", textAlign: "center", mt: 0.3 }}>
                  {email}
                </Typography>
                <Stack direction="row" justifyContent="center" gap={1} mt={1} flexWrap="wrap">
                  {role === "ADMIN" && (
                    <Chip icon={<Crown size="12" color="#c62828" variant="Bold" />} label="Admin" size="small" sx={{ bgcolor: "#fff3f3", color: "primary.main", fontWeight: 900, fontSize: "0.68rem", height: 20 }} />
                  )}
                  <Chip label={memberDate} size="small" sx={{ bgcolor: "grey.100", color: "text.secondary", fontWeight: 600, fontSize: "0.65rem", height: 20 }} />
                </Stack>
              </Stack>

              {/* Quick links */}
              <Link href="/orders" style={{ textDecoration: "none", color: "inherit" }}>
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ px: 2.5, py: 1.8, cursor: "pointer", "&:hover": { bgcolor: "grey.50" }, transition: "0.15s" }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#fff3f3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ClipboardText size="18" color="#d71414" variant="Bold" />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={800}>ประวัติการสั่งซื้อ</Typography>
                    <Typography variant="caption" color="text.secondary">ดูรายการและสถานะ</Typography>
                  </Box>
                  <Typography color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1 }}>›</Typography>
                </Stack>
              </Link>
              <Divider />
              <Stack direction="row" alignItems="center" gap={1.5} onClick={handleSignOut} sx={{ px: 2.5, py: 1.8, cursor: "pointer", "&:hover": { bgcolor: "#fff5f5" }, transition: "0.15s" }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#fff3f3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Logout size="18" color="#d71414" variant="Bold" />
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={800} color="error">ออกจากระบบ</Typography>
                  <Typography variant="caption" color="text.secondary">ลงชื่อออกจากบัญชี</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* ── Right: Tabs ── */}
          <Box flex={1} minWidth={0}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "grey.200",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "grey.100",
                  "& .MuiTab-root": { fontWeight: 700, fontSize: "0.82rem", py: 1.8 },
                  "& .Mui-selected": { color: "primary.main" },
                  "& .MuiTabs-indicator": { bgcolor: "primary.main", height: 3 },
                }}
              >
                <Tab icon={<User size="16" color="currentColor" />} iconPosition="start" label="ข้อมูลส่วนตัว" />
                <Tab icon={<Location size="16" color="currentColor" />} iconPosition="start" label="ที่อยู่" />
                <Tab icon={<Lock size="16" color="currentColor" />} iconPosition="start" label="รหัสผ่าน" />
              </Tabs>

              <Box sx={{ px: { xs: 2.5, md: 3 }, pb: 3 }}>
                {/* ── Tab 0: Personal Info ── */}
                <TabPanel value={tab} index={0}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="ชื่อ-นามสกุล"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start"><User size="16" color="#aaa" /></InputAdornment> }}
                    />
                    <TextField
                      label="อีเมล"
                      value={email}
                      disabled
                      fullWidth
                      size="small"
                      helperText="ไม่สามารถเปลี่ยนอีเมลได้"
                      InputProps={{ startAdornment: <InputAdornment position="start"><Sms size="16" color="#ccc" /></InputAdornment> }}
                    />
                    <TextField
                      label="เบอร์โทรศัพท์"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{ maxLength: 10 }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Call size="16" color="#aaa" /></InputAdornment> }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleSaveInfo}
                      disabled={infoSaving}
                      startIcon={infoSaving ? <CircularProgress size={16} color="inherit" /> : <TickCircle size="18" color="white" />}
                      sx={{ borderRadius: 2.5, fontWeight: 800, py: 1.2 }}
                    >
                      บันทึกข้อมูล
                    </Button>
                  </Stack>
                </TabPanel>

                {/* ── Tab 1: Address ── */}
                <TabPanel value={tab} index={1}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="ที่อยู่ / บ้านเลขที่ / หมู่บ้าน"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                    />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <TextField label="แขวง/ตำบล" value={subdistrict} onChange={(e) => setSubdistrict(e.target.value)} fullWidth size="small" />
                      <TextField label="เขต/อำเภอ" value={district} onChange={(e) => setDistrict(e.target.value)} fullWidth size="small" />
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <TextField label="จังหวัด" value={province} onChange={(e) => setProvince(e.target.value)} fullWidth size="small" />
                      <TextField label="รหัสไปรษณีย์" value={postcode} onChange={(e) => setPostcode(e.target.value)} fullWidth size="small" inputProps={{ maxLength: 5 }} />
                    </Stack>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleSaveInfo}
                      disabled={infoSaving}
                      startIcon={infoSaving ? <CircularProgress size={16} color="inherit" /> : <TickCircle size="18" color="white" />}
                      sx={{ borderRadius: 2.5, fontWeight: 800, py: 1.2 }}
                    >
                      บันทึกที่อยู่
                    </Button>
                  </Stack>
                </TabPanel>

                {/* ── Tab 2: Password ── */}
                <TabPanel value={tab} index={2}>
                  {!hasPassword ? (
                    <Alert severity="info" sx={{ borderRadius: 2, fontSize: "0.82rem" }}>
                      บัญชีนี้เข้าสู่ระบบผ่าน Google จึงไม่มีรหัสผ่าน
                    </Alert>
                  ) : (
                    <Stack spacing={2.5}>
                      <TextField
                        label="รหัสผ่านปัจจุบัน"
                        type={showCurrent ? "text" : "password"}
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><ShieldSecurity size="16" color="#aaa" /></InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowCurrent((p) => !p)} edge="end">
                                {showCurrent ? <EyeSlash size="16" color="#666" /> : <Eye size="16" color="#666" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="รหัสผ่านใหม่"
                        type={showNew ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        fullWidth
                        size="small"
                        helperText="อย่างน้อย 8 ตัวอักษร"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Lock size="16" color="#aaa" /></InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowNew((p) => !p)} edge="end">
                                {showNew ? <EyeSlash size="16" color="#666" /> : <Eye size="16" color="#666" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="ยืนยันรหัสผ่านใหม่"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        fullWidth
                        size="small"
                        error={confirmPw.length > 0 && newPw !== confirmPw}
                        helperText={confirmPw.length > 0 && newPw !== confirmPw ? "รหัสผ่านไม่ตรงกัน" : ""}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Lock size="16" color="#aaa" /></InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowConfirm((p) => !p)} edge="end">
                                {showConfirm ? <EyeSlash size="16" color="#666" /> : <Eye size="16" color="#666" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleChangePassword}
                        disabled={pwSaving}
                        startIcon={pwSaving ? <CircularProgress size={16} color="inherit" /> : <TickCircle size="18" color="white" />}
                        sx={{ borderRadius: 2.5, fontWeight: 800, py: 1.2 }}
                      >
                        เปลี่ยนรหัสผ่าน
                      </Button>
                    </Stack>
                  )}
                </TabPanel>
              </Box>
            </Paper>
          </Box>

        </Stack>
      </Container>
    </Box>
  );
}
