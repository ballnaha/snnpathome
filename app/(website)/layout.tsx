import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Box } from "@mui/material";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flexGrow: 1 }}>{children}</main>
      <Footer />
    </Box>
  );
}
