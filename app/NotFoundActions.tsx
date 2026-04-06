"use client";

import React from "react";
import Link from "next/link";
import { Button, Stack } from "@mui/material";
import { Home2 } from "iconsax-react";

export default function NotFoundActions() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
      <Button
        component={Link}
        href="/"
        variant="contained"
        size="large"
        startIcon={<Home2 variant="Bold" color="white" />}
        sx={{
          borderRadius: 10,
          px: 4,
          py: 1.5,
          fontWeight: 800,
          bgcolor: 'primary.main',
          '&:hover': { bgcolor: '#cc0000' }
        }}
      >
        กลับสู่หน้าหลัก
      </Button>
      <Button
        onClick={() => window.history.back()}
        variant="outlined"
        size="large"
        sx={{
          borderRadius: 10,
          px: 4,
          py: 1.5,
          fontWeight: 800,
          borderColor: 'primary.main',
          color: 'primary.main',
          borderWidth: 2,
          '&:hover': { borderWidth: 2, bgcolor: 'rgba(215, 20, 20, 0.05)' }
        }}
      >
        กลับไปก่อนหน้า
      </Button>
    </Stack>
  );
}
