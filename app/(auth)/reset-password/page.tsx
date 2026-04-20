"use client";

import React, { Suspense } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  CircularProgress
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeSlash, DirectRight, Lock, ArrowLeft } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { showSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  if (!token) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error" fontWeight="700">ลิงก์ไม่ถูกต้องหรือหมดอายุ</Typography>
        <Button component={Link} href="/forgot-password" sx={{ mt: 2 }}>ขอลิงก์ใหม่</Button>
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      showSnackbar("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", "error");
      return;
    }
    if (password !== confirmPassword) {
      showSnackbar("รหัสผ่านไม่ตรงกัน", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
      }

      showSnackbar("เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่", "success");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          size="small"
          label="รหัสผ่านใหม่"
          type={showPassword ? "text" : "password"}
          placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size="18" color={loading ? "#ccc" : "#d71414"} variant="Bold" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" disabled={loading}>
                  {showPassword ? <Eye size="16" variant="Bold" color="#d71414" /> : <EyeSlash size="16" color="#d71414" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          required
        />

        <TextField
          fullWidth
          size="small"
          label="ยืนยันรหัสผ่านใหม่"
          type={showPassword ? "text" : "password"}
          placeholder="กรอกรหัสผ่านอีกครั้ง"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size="18" color={loading ? "#ccc" : "#d71414"} variant="Bold" />
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{
            py: 1.2,
            borderRadius: 2,
            fontWeight: 900,
            fontSize: '0.95rem',
            boxShadow: "0 4px 15px rgba(215, 20, 20, 0.2)",
            height: 48
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "บันทึกรหัสผ่านใหม่"}
        </Button>
      </Stack>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", bgcolor: "#f8f9fa", py: 4 }}>
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 6,
            border: "1px solid",
            borderColor: "grey.200",
            boxShadow: "0 15px 40px rgba(0,0,0,0.04)",
            overflow: "hidden"
          }}
        >
          {/* Logo Section */}
          <Box sx={{ bgcolor: "primary.main", py: 3, textAlign: "center", px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Link href="/">
                <Image src="/images/logo.png" alt="SNNP Logo" width={110} height={35} style={{ objectFit: 'contain', height: 'auto' }} />
              </Link>
            </Box>
            <Typography variant="subtitle1" fontWeight="800" mt={1.5} sx={{ color: "white", fontSize: "1.1rem" }}>
              กำหนดรหัสผ่านใหม่
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Suspense fallback={<Box textAlign="center"><CircularProgress size={30} /></Box>}>
              <ResetPasswordForm />
            </Suspense>

            <Box textAlign="center" mt={3}>
              <MuiLink component={Link} href="/login" display="inline-flex" alignItems="center" fontWeight="800" color="text.secondary" underline="hover" sx={{ fontSize: "0.85rem" }}>
                <ArrowLeft size="16" style={{ marginRight: 6 }} /> กลับไปหน้าเข้าสู่ระบบ
              </MuiLink>
            </Box>
          </Box>
        </Paper>

        <Box textAlign="center" mt={3}>
          <Button
            component={Link}
            href="/"
            startIcon={<DirectRight size="16" color="#999" />}
            sx={{ color: "grey.500", fontWeight: 700, fontSize: "0.8rem", "&:hover": { color: "primary.main" } }}
          >
            กลับไปยังร้านค้า
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
