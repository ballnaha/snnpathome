"use client";

import React from "react";
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  Divider, 
  IconButton, 
  InputAdornment,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, Google, DirectRight, User, Sms, Call, Lock } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { showSnackbar } = useSnackbar();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    if (!formData.name.trim()) {
      showSnackbar("กรุณากรอกชื่อ-นามสกุล", "error");
      return;
    }

    if (!formData.email.trim()) {
      showSnackbar("กรุณากรอกอีเมล", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showSnackbar("รูปแบบอีเมลไม่ถูกต้อง", "error");
      return;
    }

    if (formData.password.length < 6) {
      showSnackbar("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showSnackbar("รหัสผ่านไม่ตรงกัน", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        }),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "การสมัครสมาชิกไม่สำเร็จ");
      }

      showSnackbar("สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบให้ท่านอัตโนมัติ...", "success");
      
      // Auto-Login after registration
      const loginResponse = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginResponse?.error) {
        showSnackbar("สมัครสมาชิกสำเร็จแล้ว โปรดเข้าสู่ระบบด้วยตนเอง", "info");
        router.push("/login");
      } else {
        // Success login redirect to home
        setTimeout(() => {
          router.replace("/");
        }, 1500);
      }
      
    } catch (error: any) {
      showSnackbar(error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setLoading(false);
    }
  };

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
          {/* Logo Section with Red Background */}
          <Box sx={{ bgcolor: "primary.main", py: 3, textAlign: "center", px: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Link href="/">
                  <Image src="/images/logo.png" alt="SNNP Logo" width={110} height={35} style={{ objectFit: 'contain', height: 'auto' }} />
                </Link>
              </Box>
              <Typography variant="subtitle1" fontWeight="800" mt={1.5} sx={{ color: "white", fontSize: "1.1rem" }}>
                สมัครสมาชิกใหม่
              </Typography>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField 
                  fullWidth 
                  size="small"
                  label="ชื่อ-นามสกุล" 
                  name="name"
                  placeholder="กรอกชื่อและนามสกุลของคุณ"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size="18" color={loading ? "#ccc" : "#d71414"} variant="Bold" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  required
                />

                <TextField 
                  fullWidth 
                  size="small"
                  type="email"
                  label="อีเมล" 
                  name="email"
                  placeholder="example@mail.com"
                  variant="outlined"
                  value={formData.email}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Sms size="18" color={loading ? "#ccc" : "#d71414"} variant="Bold" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  required
                />

                <TextField 
                  fullWidth 
                  size="small"
                  type="tel"
                  label="เบอร์โทรศัพท์" 
                  name="phone"
                  placeholder="08XXXXXXXX"
                  variant="outlined"
                  value={formData.phone}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Call size="18" color={loading ? "#ccc" : "#d71414"} variant="Bold" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                
                <TextField 
                  fullWidth 
                  size="small"
                  label="รหัสผ่าน" 
                  name="password"
                  placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={formData.password}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size="18" color={loading ? "#ccc" : "#d71414"} variant="Bold" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" disabled={loading}>
                          {showPassword ? <Eye size="16" variant="Bold" color="#999" /> : <EyeSlash size="16" color="#999" variant="Bold" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />

                <TextField 
                  fullWidth 
                  size="small"
                  label="ยืนยันรหัสผ่าน" 
                  name="confirmPassword"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size="18" color={loading ? "#ccc" : "#d71414"} variant="Bold" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />

                <FormControlLabel 
                  control={<Checkbox size="small" defaultChecked color="primary" disabled={loading} />}
                  label={<Typography variant="caption" color="text.secondary">ฉันยอมรับเงื่อนไขและข้อตกลงการใช้งาน</Typography>}
                  sx={{ mt: -1 }}
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
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "สมัครสมาชิก"
                  )}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="grey.400" fontWeight="700">หรือสมัครด้วยวิธีอื่น</Typography>
            </Divider>

            <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => signIn("google", { callbackUrl: "/" })}
                disabled={loading}
                startIcon={<Google variant="Bold" color={loading ? "#ccc" : "#EA4335"} size="18" />}
                sx={{ 
                  py: 1.2, 
                  borderRadius: 2, 
                  borderColor: "grey.200", 
                  color: "text.primary", 
                  fontWeight: 800, 
                  fontSize: "0.85rem",
                  "&:hover": { bgcolor: "grey.50" } 
                }}
              >
                Sign up with Google
              </Button>

            <Box textAlign="center" mt={3}>
                <Typography variant="caption" color="text.secondary">
                  มีบัญชีอยู่แล้ว? {" "}
                  <MuiLink component={Link} href="/login" fontWeight="900" color="primary.main" underline="always">
                      เข้าสู่ระบบ
                  </MuiLink>
                </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Back to Shop */}
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
