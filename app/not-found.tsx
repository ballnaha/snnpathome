import React from "react";
import { Box, Container, Typography, Stack } from "@mui/material";
import { Danger } from "iconsax-react";
import NotFoundActions from "./NotFoundActions";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Simple static header — no interactive dropdown to avoid stale-state
          issues when the browser restores the previous page from bfcache */}
      <Box
        component="header"
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 1.5,
          textAlign: "center",
        }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
          <Image
            src="/images/logo.png"
            alt="SNNP Logo"
            width={100}
            height={32}
            style={{ objectFit: "contain", height: "auto" }}
          />
        </Link>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 10,
          bgcolor: "#fdfdfd",
        }}
      >
        <Container maxWidth="sm">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Box
              sx={{
                bgcolor: "error.light",
                color: "error.main",
                p: 3,
                borderRadius: "50%",
                opacity: 0.8,
                mb: 2,
              }}
            >
              <Danger size="80" variant="Bulk" color="white" />
            </Box>

            <Box>
              <Typography
                variant="h1"
                fontWeight="900"
                sx={{ fontSize: "6rem", color: "primary.main", lineHeight: 1 }}
              >
                404
              </Typography>
              <Typography variant="h4" fontWeight="800" gutterBottom>
                ขออภัย ไม่พบหน้าที่คุณต้องการ
              </Typography>
              <Typography variant="body1" color="text.secondary">
                หน้าเว็บที่คุณกำลังมองหาอาจถูกลบไปแล้ว เปลี่ยนชื่อ
                หรือไม่พร้อมใช้งานในขณะนี้
              </Typography>
            </Box>

            <NotFoundActions />
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
