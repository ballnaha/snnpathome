"use client";

import React, { useEffect, useState } from "react";
import { 
  Box, 
  Container, 
  Stack, 
  Typography, 
  Badge, 
  IconButton, 
  Menu, 
  MenuItem,
  Fade,
  Divider,
  Avatar
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  ShoppingCart, 
  Profile, 
  SearchNormal1, 
  Receipt1, 
  Logout, 
  ArrowDown2,
  Heart,
  Setting2,
  UserEdit,
  ClipboardText
} from "iconsax-react";

export default function Header() {
  const { data: session, status } = useSession();
  const [isSearchHovered, setIsSearchHovered] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const pathname = usePathname();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box component="header" position="sticky" top={0} zIndex={1100} width="100%">
      {/* Top Red Bar */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 0.8 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* Left: Tracking */}
            <Stack direction="row" spacing={3} alignItems="center">
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ cursor: 'pointer', "&:hover": { opacity: 0.8 } }}>
                <Receipt1 size="16" variant="Bulk" color="#FFF" />
                <Typography variant="caption" fontWeight="600" sx={{ fontSize: "0.8rem", letterSpacing: 0.3 }}>ติดตามสถานะใบสั่งซื้อ</Typography>
              </Stack>
            </Stack>

            {/* Middle: Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ px: 1 }}>
                <Image
                  src="/images/logo.png"
                  alt="SNNP Logo"
                  width={100}
                  height={32}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Link>

            {/* Right: User & Cart */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ minHeight: 32, display: 'flex', alignItems: 'center' }}>
                {session ? (
                  <>
                    <Box
                      onClick={handleOpenUserMenu}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        cursor: 'pointer', 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        pl: 1,
                        pr: 1.5,
                        py: 0.5,
                        borderRadius: 10,
                        transition: '0.2s',
                        "&:hover": { bgcolor: 'rgba(255,255,255,0.25)' }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.7rem', 
                          fontWeight: 900, 
                          bgcolor: 'white', 
                          color: 'primary.main' 
                        }}
                      >
                        {session.user?.name?.charAt(0) || "U"}
                      </Avatar>
                      <Typography variant="caption" fontWeight="700" sx={{ fontSize: "0.75rem", color: 'white' }}>
                        สวัสดี, {session.user?.name?.split(' ')[0] || "คุณลูกค้า"}
                      </Typography>
                      <ArrowDown2 size="12" color="#FFF" variant="Bold" style={{ transform: anchorEl ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                    </Box>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleCloseUserMenu}
                      TransitionComponent={Fade}
                      elevation={0}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      PaperProps={{
                        sx: {
                          mt: 1.5,
                          minWidth: 200,
                          borderRadius: 3,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          border: '1px solid',
                          borderColor: 'grey.100',
                          p: 1
                        }
                      }}
                    >
                      <MenuItem onClick={handleCloseUserMenu} component={Link} href="/profile" sx={{ borderRadius: 2, gap: 1.5, py: 1 }}>
                         <UserEdit size="18" color="#d71414" variant="Bulk" />
                         <Typography variant="body2" fontWeight="700">โปรไฟล์ของฉัน</Typography>
                      </MenuItem>
                      <MenuItem onClick={handleCloseUserMenu} component={Link} href="/orders" sx={{ borderRadius: 2, gap: 1.5, py: 1 }}>
                         <ClipboardText size="18" color="#d71414" variant="Bulk" />
                         <Typography variant="body2" fontWeight="700">ประวัติการสั่งซื้อ</Typography>
                      </MenuItem>
                      <MenuItem onClick={handleCloseUserMenu} component={Link} href="/wishlist" sx={{ borderRadius: 2, gap: 1.5, py: 1 }}>
                         <Heart size="18" color="#d71414" variant="Bulk" />
                         <Typography variant="body2" fontWeight="700">สินค้าที่ชอบ</Typography>
                      </MenuItem>
                      {(session.user as any)?.role === 'ADMIN' && (
                        <MenuItem onClick={handleCloseUserMenu} component={Link} href="/admin/users" sx={{ borderRadius: 2, gap: 1.5, py: 1, bgcolor: 'grey.50' }}>
                          <Setting2 size="18" color="#666" variant="Bulk" />
                          <Typography variant="body2" fontWeight="800">แผงควบคุมแอดมิน</Typography>
                        </MenuItem>
                      )}
                      <Divider sx={{ my: 1, borderColor: 'grey.50' }} />
                      <MenuItem onClick={() => { handleCloseUserMenu(); signOut(); }} sx={{ borderRadius: 2, gap: 1.5, py: 1, color: 'error.main' }}>
                          <Logout size="18" variant="Bulk" color="currentColor" />
                          <Typography variant="body2" fontWeight="700">ออกจากระบบ</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Box
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        cursor: 'pointer', 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        px: 2,
                        py: 0.6,
                        borderRadius: 10,
                        transition: '0.2s',
                        "&:hover": { bgcolor: 'rgba(255,255,255,0.25)' }
                      }}
                    >
                      <Profile size="16" variant="Bulk" color="#FFF" />
                      <Typography variant="caption" fontWeight="700" sx={{ fontSize: "0.75rem", color: 'white' }}>
                        เข้าสู่ระบบ / สมัครสมาชิก
                      </Typography>
                    </Box>
                  </Link>
                )}
              </Box>

              <Badge
                badgeContent={0}
                showZero
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#FFF",
                    color: "primary.main",
                    fontWeight: "900",
                    fontSize: '10px',
                    height: 18,
                    minWidth: 18,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  },
                  cursor: 'pointer',
                  "&:hover": { opacity: 0.8 }
                }}
              >
                <ShoppingCart size="22" variant="Bulk" color="#FFF" />
              </Badge>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Navigation Bar */}
      <Box sx={{ bgcolor: "white", borderBottom: 1, borderColor: "grey.200", py: 1.5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Box sx={{ flex: 1 }} />

            {/* Centered Menu */}
            <Stack direction="row" spacing={5} sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              <NavLink href="/" active={pathname === "/"}>หน้าแรก</NavLink>
              <NavLink href="/all-products" active={pathname === "/all-products"}>สินค้าทั้งหมด</NavLink>
              <NavLink href="/promotions" active={pathname === "/promotions"}>โปรโมชั่น</NavLink>
              <NavLink href="/about-us" active={pathname === "/about-us"}>เกี่ยวกับเรา</NavLink>
            </Stack>

            {/* Right-aligned Search */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                size="small"
                onMouseEnter={() => setIsSearchHovered(true)}
                onMouseLeave={() => setIsSearchHovered(false)}
                sx={{
                  color: "primary.main",
                  transition: '0.3s',
                  "&:hover": {
                    bgcolor: "primary.main"
                  }
                }}
              >
                <SearchNormal1
                  size="20"
                  variant="Linear"
                  color={isSearchHovered ? "white" : "#d71414"}
                />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

function NavLink({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Typography
        variant="body2"
        fontWeight="700"
        sx={{
          color: active ? "primary.main" : "text.primary",
          borderBottom: active ? 2 : 0,
          borderColor: "primary.main",
          pb: 0.5,
          cursor: "pointer",
          whiteSpace: 'nowrap',
          transition: '0.2s',
          fontSize: '0.9rem',
          "&:hover": { color: "primary.main" }
        }}
      >
        {children}
      </Typography>
    </Link>
  );
}
