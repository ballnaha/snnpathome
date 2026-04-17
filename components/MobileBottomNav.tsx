"use client";

import React from "react";
import { Box, Typography, Badge } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home2, ShoppingBag, ShoppingCart, Profile, ClipboardText, LoginCurve } from "iconsax-react";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "next-auth/react";

const navItems = [
  { label: "หน้าแรก", href: "/", icon: Home2 },
  { label: "สินค้า", href: "/all-products", icon: ShoppingBag },
  { label: "ติดตามสั่งซื้อ", href: "/track-order", icon: ClipboardText },
  { label: "ตะกร้า", href: "#cart", icon: ShoppingCart },
  { label: "โปรไฟล์", href: "/login", icon: Profile },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const { data: session } = useSession();

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (pathname.startsWith("/product/")) {
    return null;
  }

  return (
    <Box
      component="nav"
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        bgcolor: "white",
        borderTop: "1px solid",
        borderColor: "grey.100",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        height: 64,
        alignItems: "stretch",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isCart = item.href === "#cart";
        const isProfile = item.label === "โปรไฟล์";
        const loggedIn = !!session;
        const resolvedHref = isProfile ? (loggedIn ? "/profile" : "/login") : item.href;
        const resolvedLabel = isProfile ? (loggedIn ? "โปรไฟล์" : "เข้าสู่ระบบ") : item.label;
        const ResolvedIcon = isProfile ? (loggedIn ? Profile : LoginCurve) : item.icon;
        const isActive = !isCart && isRouteActive(resolvedHref);

        if (isCart) {
          return (
            <Box
              key={item.label}
              onClick={openDrawer}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.3,
                cursor: "pointer",
                color: "text.secondary",
                transition: "0.2s",
                "&:active": { bgcolor: "grey.50" },
              }}
            >
              <Badge
                badgeContent={totalItems > 0 ? totalItems : null}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "primary.main",
                    color: "white",
                    fontWeight: 900,
                    fontSize: "0.6rem",
                    minWidth: 16,
                    height: 16,
                  },
                }}
              >
                <Icon size="22" variant={isActive ? "Bold" : "Linear"} color="#999" />
              </Badge>
              <Typography variant="caption" fontWeight="700" sx={{ fontSize: "0.6rem", color: "#999" }}>
                {item.label}
              </Typography>
            </Box>
          );
        }

        return (
          <Link key={item.label} href={resolvedHref} style={{ flex: 1, textDecoration: "none" }}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.3,
                color: isActive ? "primary.main" : "text.secondary",
                transition: "0.2s",
                "&:active": { bgcolor: "grey.50" },
              }}
            >
              <ResolvedIcon
                size="22"
                variant={isActive ? "Bold" : "Linear"}
                color={isActive ? "#d71414" : "#999"}
              />
              <Typography
                variant="caption"
                fontWeight="700"
                sx={{ fontSize: "0.6rem", color: isActive ? "primary.main" : "#999" }}
              >
                {resolvedLabel}
              </Typography>
            </Box>
          </Link>
        );
      })}
    </Box>
  );
}
