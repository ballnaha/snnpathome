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
  CircularProgress,
  Link as MuiLink
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeSlash, Google, DirectRight, Sms, Lock } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import { getGoogleOAuthDevHint, isUnsupportedGoogleOAuthOrigin } from "@/lib/google-oauth-origin";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const errorType = searchParams.get("error");
  const loginReason = searchParams.get("reason");
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(false);
  const [googleHint, setGoogleHint] = React.useState<string | null>(null);

  const loginNotice = loginReason === "admin-auth"
    ? "กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลเพื่อเข้าใช้งานหน้าจัดการระบบ"
    : loginReason === "signed-out"
      ? "คุณออกจากระบบแล้ว"
      : null;

  React.useEffect(() => {
    setGoogleHint(getGoogleOAuthDevHint(window.location.href));
  }, []);

  React.useEffect(() => {
    if (errorType === "CredentialsSignin") {
      showSnackbar("อีเมลหรือรหัสผ่านไม่ถูกต้อง", "error");
    } else if (errorType) {
      showSnackbar("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง", "error");
    }
  }, [errorType, showSnackbar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showSnackbar("กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", { 
        email, 
        password, 
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin" || res.error === "Invalid credentials") {
          showSnackbar("อีเมลหรือรหัสผ่านไม่ถูกต้อง", "error");
        } else if (res.error === "ACCOUNT_DISABLED") {
          showSnackbar("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อเจ้าหน้าที่", "error");
        } else {
          showSnackbar("ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูลอีกครั้ง", "error");
        }
      } else {
        showSnackbar("เข้าสู่ระบบสำเร็จ!", "success");
        window.location.href = searchParams.get("callbackUrl") || "/";
      }
    } catch (error) {
      showSnackbar("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (loading || isUnsupportedGoogleOAuthOrigin(window.location.href)) {
      return;
    }
    setLoading(true);
    signIn("google", { callbackUrl: searchParams.get("callbackUrl") || "/" });
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
                เข้าสู่ระบบสมาชิก
              </Typography>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            {loginNotice && (
              <Box sx={{ mb: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: "warning.50", border: "1px solid", borderColor: "warning.200" }}>
                <Typography variant="body2" color="warning.dark" fontWeight="700">
                  {loginNotice}
                </Typography>
              </Box>
            )}

            {/* Social Login Buttons */}
            <Stack spacing={1.5} mb={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={handleGoogleLogin}
                disabled={loading || !!googleHint}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Google variant="Bold" color={loading ? "#ccc" : "#EA4335"} size="18" />}
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
                Sign in with Google
              </Button>
              {googleHint && (
                <Typography variant="caption" color="warning.main">
                  {googleHint}
                </Typography>
              )}
            </Stack>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="caption" color="grey.400" fontWeight="700">หรือใช้อีเมล</Typography>
            </Divider>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField 
                  fullWidth 
                  size="small"
                  label="อีเมล / เบอร์โทรศัพท์" 
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Sms size="18" color="#d71414" variant="Bold" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                
                <Box>
                  <TextField 
                    fullWidth 
                    size="small"
                    label="รหัสผ่าน" 
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size="18" color="#d71414" variant="Bold" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <Eye size="16" color="#999" /> : <EyeSlash size="16" color="#999" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <Box textAlign="right" mt={0.5}>
                    <MuiLink component={Link} href="/forgot-password" variant="caption" fontWeight="700" color="primary.main" underline="hover">
                      ลืมรหัสผ่าน?
                    </MuiLink>
                  </Box>
                </Box>

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
                  {loading ? <CircularProgress size={24} color="inherit" /> : "เข้าสู่ระบบ"}
                </Button>
              </Stack>
            </Box>

            <Box textAlign="center" mt={3}>
                <Typography variant="caption" color="text.secondary">
                  ยังไม่มีบัญชีสมาชิก? {" "}
                  <MuiLink component={Link} href="/register" fontWeight="900" color="primary.main" underline="always">
                      สมัครสมาชิกใหม่
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
