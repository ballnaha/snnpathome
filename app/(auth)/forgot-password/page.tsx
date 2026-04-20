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
  IconButton, 
  InputAdornment,
  Link as MuiLink,
  CircularProgress
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { DirectRight, Sms, ArrowLeft } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showSnackbar("กรุณากรอกอีเมล์ของคุณ", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }

      setSubmitted(true);
      showSnackbar("ส่งคำขอเรียบร้อยแล้ว กรุณาตรวจสอบอีเมล์ของคุณ", "success");
    } catch (error: any) {
      showSnackbar(error.message, "error");
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
          {/* Logo Section */}
          <Box sx={{ bgcolor: "primary.main", py: 3, textAlign: "center", px: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Link href="/">
                  <Image src="/images/logo.png" alt="SNNP Logo" width={110} height={35} style={{ objectFit: 'contain', height: 'auto' }} />
                </Link>
              </Box>
              <Typography variant="subtitle1" fontWeight="800" mt={1.5} sx={{ color: "white", fontSize: "1.1rem" }}>
                ลืมรหัสผ่าน
              </Typography>
          </Box>

          <Box sx={{ p: { xs: 3, md: 4 } }}>
            {!submitted ? (
              <>
                <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                  กรอกอีเมลที่คุณใช้สมัครสมาชิก เพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField 
                      fullWidth 
                      size="small"
                      label="อีเมล" 
                      type="email"
                      placeholder="example@mail.com"
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
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
                      {loading ? <CircularProgress size={24} color="inherit" /> : "ส่งคำขอเปลี่ยนรหัสผ่าน"}
                    </Button>
                  </Stack>
                </Box>
              </>
            ) : (
              <Box textAlign="center" py={2}>
                <Box sx={{ bgcolor: "success.50", color: "success.main", p: 2, borderRadius: 2, mb: 3 }}>
                  <Typography variant="body2" fontWeight="700">
                    เราได้ส่งลิงก์เปลี่ยนรหัสผ่านไปยัง <strong>{email}</strong> แล้ว กรุณาตรวจสอบในกล่องจดหมายของคุณ (รวมถึงใน Junk/Spam)
                  </Typography>
                </Box>
                <Button 
                  component={Link} 
                  href="/login" 
                  fullWidth 
                  variant="outlined" 
                  sx={{ borderRadius: 2, fontWeight: 800 }}
                >
                  กลับไปน้าเข้าสู่ระบบ
                </Button>
              </Box>
            )}

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
