import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Danger } from "iconsax-react";
import NotFoundActions from "../NotFoundActions";

export default function WebsiteNotFound() {
  return (
    <Box
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
  );
}