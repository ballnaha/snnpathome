"use client";

import React from "react";
import { Pagination, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface ProductPaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function ProductPagination({
  totalPages,
  currentPage,
}: ProductPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (totalPages <= 1) return null;

  function handleChange(_: React.ChangeEvent<unknown>, page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  return (
    <Stack
      alignItems="center"
      spacing={1.5}
      sx={{ mt: { xs: 3, md: 5 }, mb: 2 }}
    >
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handleChange}
        color="primary"
        size={isMobile ? "medium" : "large"}
        showFirstButton
        showLastButton
        siblingCount={isMobile ? 0 : 1}
        sx={{
          "& .MuiPaginationItem-root": {
            fontWeight: 700,
            borderRadius: 2,
            mx: 0.3,
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "white",
              boxShadow: "0 2px 8px rgba(215,20,20,0.3)",
              "&:hover": { bgcolor: "#cc0000" },
            },
          },
        }}
      />
      <Typography variant="caption" color="text.secondary">
        หน้า {currentPage} จาก {totalPages}
      </Typography>
    </Stack>
  );
}
