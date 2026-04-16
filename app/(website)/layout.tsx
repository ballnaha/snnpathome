import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Box } from "@mui/material";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header key="website-header" />
      <Box component="main" sx={{ flexGrow: 1, pb: { xs: "calc(64px + env(safe-area-inset-bottom))", md: 0 } }}>{children}</Box>
      <Footer />
      <CartDrawer />
      <MobileBottomNav />
    </Box>
  );
}
