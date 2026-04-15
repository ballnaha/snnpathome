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
  Link as MuiLink
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Eye, EyeSlash, Google, DirectRight, Sms, Lock } from "iconsax-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", { 
      email, 
      password, 
      callbackUrl: "/" 
    });
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
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
            {/* Social Login Buttons */}
            <Stack spacing={1.5} mb={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={handleGoogleLogin}
                startIcon={<Google variant="Bold" color="#EA4335" size="18" />}
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
                  sx={{ 
                    py: 1.2, 
                    borderRadius: 2, 
                    fontWeight: 900, 
                    fontSize: '0.95rem',
                    boxShadow: "0 4px 15px rgba(215, 20, 20, 0.2)" 
                  }}
                >
                  เข้าสู่ระบบ
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
