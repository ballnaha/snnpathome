"use client";

import React, { useEffect, useCallback } from "react";
import { 
  Box, 
  Container, 
  Stack, 
  Typography, 
  Badge, 
  IconButton, 
  MenuItem,
  Divider,
  Avatar,
  ClickAwayListener,
  Paper,
  Grow,
  Popper,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { 
  ShoppingCart, 
  Profile, 
  Receipt1, 
  Logout, 
  ArrowDown2,
  Heart,
  Setting2,
  UserEdit,
  ClipboardText,
  HambergerMenu,
  Home2,
  ShoppingBag,
  CloseCircle,
  Tag,
  InfoCircle,
  WalletMinus,
} from "iconsax-react";

/**
 * Remove any orphaned MUI modal/backdrop elements left in document.body.
 * This can happen when navigating away from a page (e.g. 404) that had
 * a MUI Menu/Modal mounted via Portal — the portal container may survive
 * the React unmount and block clicks on the restored page.
 */
function cleanupOrphanedMuiElements() {
  if (typeof document === "undefined") return;
  // Remove stale MUI backdrop/modal root elements
  document.querySelectorAll(".MuiModal-root, .MuiPopover-root, .MuiBackdrop-root").forEach((el) => {
    // Only remove if it's a direct child of body (portal artifact)
    if (el.parentElement === document.body) {
      el.remove();
    }
  });
  // Restore body styles that MUI Modal may have set
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("padding-right");
}

export default function Header() {
  const { data: session, status } = useSession();
  const { totalItems, openDrawer, clearCart } = useCart();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const menuTriggerRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Clean up orphaned MUI modal elements on mount and on bfcache restore
  useEffect(() => {
    cleanupOrphanedMuiElements();

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page was restored from bfcache
        cleanupOrphanedMuiElements();
        setMenuOpen(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      setMenuOpen(false);
    };
  }, []);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleSignOut = useCallback(() => {
    clearCart();
    localStorage.removeItem("snnp-last-order");
    signOut({ callbackUrl: "/" });
  }, [clearCart]);

  const handleCloseMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <Box component="header" position="sticky" top={0} zIndex={1100} width="100%">
      {/* Top Red Bar */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 1 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* Left: Tracking — hidden on mobile */}
            <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ cursor: 'pointer', "&:hover": { opacity: 0.8 } }}>
                <Receipt1 size="16" variant="Bulk" color="#FFF" />
                <Typography variant="caption" fontWeight="600" sx={{ fontSize: "0.8rem", letterSpacing: 0.3 }}>ติดตามสถานะใบสั่งซื้อ</Typography>
              </Stack>
            </Stack>

            {/* Mobile: hamburger */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton onClick={() => setMobileDrawerOpen(true)} sx={{ color: 'white', p: 0.5 }}>
                <HambergerMenu size="22" color="#FFF" />
              </IconButton>
            </Box>

            {/* Middle: Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ px: 1 }}>
                <Image
                  src="/images/logo.png"
                  alt="SNNP Logo"
                  width={100}
                  height={32}
                  style={{ objectFit: 'contain', height: 'auto' }}
                />
              </Box>
            </Link>

            {/* Right: User & Cart */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ minHeight: 32, display: { xs: 'none', md: 'flex' }, alignItems: 'center', position: 'relative' }}>
                {session ? (
                  <>
                    <Box
                      ref={menuTriggerRef}
                      onClick={handleToggleMenu}
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
                        "&:hover": { bgcolor: 'rgba(255,255,255,0.25)' },
                        userSelect: 'none',
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
                      <ArrowDown2 size="12" color="#FFF" variant="Bold" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                    </Box>
                    <Popper
                      open={menuOpen}
                      anchorEl={menuTriggerRef.current}
                      placement="bottom-end"
                      transition
                      disablePortal
                      style={{ zIndex: 1300 }}
                    >
                      {({ TransitionProps }) => (
                        <Grow {...TransitionProps} style={{ transformOrigin: 'right top' }}>
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 1.5,
                              minWidth: 200,
                              borderRadius: 3,
                              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                              border: '1px solid',
                              borderColor: 'grey.100',
                              p: 1,
                              overflow: 'visible',
                            }}
                          >
                            <ClickAwayListener onClickAway={handleCloseMenu}>
                              <Box>
                                <MenuItem onClick={handleCloseMenu} component={Link} href="/profile" sx={{ borderRadius: 2, gap: 1.5, py: 1 }}>
                                   <UserEdit size="18" color="#d71414" variant="Bulk" />
                                   <Typography variant="body2" fontWeight="700">โปรไฟล์ของฉัน</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleCloseMenu} component={Link} href="/orders" sx={{ borderRadius: 2, gap: 1.5, py: 1 }}>
                                   <ClipboardText size="18" color="#d71414" variant="Bulk" />
                                   <Typography variant="body2" fontWeight="700">ประวัติการสั่งซื้อ</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleCloseMenu} component={Link} href="/wishlist" sx={{ borderRadius: 2, gap: 1.5, py: 1 }}>
                                   <Heart size="18" color="#d71414" variant="Bulk" />
                                   <Typography variant="body2" fontWeight="700">สินค้าที่ชอบ</Typography>
                                </MenuItem>
                                {(session.user as any)?.role === 'ADMIN' && (
                                  <MenuItem onClick={handleCloseMenu} component={Link} href="/admin/users" sx={{ borderRadius: 2, gap: 1.5, py: 1, bgcolor: 'grey.50' }}>
                                    <Setting2 size="18" color="#666" variant="Bulk" />
                                    <Typography variant="body2" fontWeight="800">แผงควบคุมแอดมิน</Typography>
                                  </MenuItem>
                                )}
                                <Divider sx={{ my: 1, borderColor: 'grey.50' }} />
                                <MenuItem onClick={() => { handleCloseMenu(); handleSignOut(); }} sx={{ borderRadius: 2, gap: 1.5, py: 1, color: 'error.main' }}>
                                    <Logout size="18" variant="Bulk" color="currentColor" />
                                    <Typography variant="body2" fontWeight="700">ออกจากระบบ</Typography>
                                </MenuItem>
                              </Box>
                            </ClickAwayListener>
                          </Paper>
                        </Grow>
                      )}
                    </Popper>
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
                badgeContent={totalItems}
                showZero
                onClick={openDrawer}
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
                  "&:hover": { opacity: 0.8 },
                  transition: 'transform 0.2s',
                  "&:active": { transform: 'scale(0.9)' }
                }}
              >
                <ShoppingCart size="22" variant="Bulk" color="#FFF" />
              </Badge>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Navigation Bar — desktop only */}
      <Box sx={{ bgcolor: "white", borderBottom: 1, borderColor: "grey.200", py: 1.5, display: { xs: 'none', md: 'block' } }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={5}>
            <NavLink href="/" active={pathname === "/"}>หน้าแรก</NavLink>
            <NavLink href="/all-products" active={pathname === "/all-products"}>สินค้าทั้งหมด</NavLink>
            <NavLink href="/promotions" active={pathname === "/promotions"}>โปรโมชั่น</NavLink>
            <NavLink href="/payment-notification" active={pathname === "/payment-notification"}>แจ้งชำระเงิน</NavLink>
            <NavLink href="/about-us" active={pathname === "/about-us"}>เกี่ยวกับเรา</NavLink>
          </Stack>
        </Container>
      </Box>

      {/* Mobile Drawer Nav */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image src="/images/logo.png" alt="SNNP Logo" width={90} height={28} style={{ objectFit: 'contain', height: 'auto' }} />
          <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: 'white' }}>
            <CloseCircle size="22" color="#FFF" />
          </IconButton>
        </Box>

        {/* User info section */}
        {session ? (
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, fontSize: '1rem', fontWeight: 900, bgcolor: 'primary.main', color: 'white' }}>
              {session.user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={800} fontSize="0.9rem" noWrap>{session.user?.name || 'คุณลูกค้า'}</Typography>
              <Typography fontSize="0.75rem" color="text.secondary" noWrap>{session.user?.email || ''}</Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
              <Profile size="20" color="#999" />
            </Avatar>
            <Box>
              <Typography fontWeight={700} fontSize="0.85rem" color="text.secondary">ยังไม่ได้เข้าสู่ระบบ</Typography>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Typography fontSize="0.75rem" color="primary.main" fontWeight={700}>เข้าสู่ระบบ / สมัครสมาชิก</Typography>
              </Link>
            </Box>
          </Box>
        )}

        <List sx={{ pt: 1 }}>
          {[
            { href: '/', label: 'หน้าแรก', Icon: Home2 },
            { href: '/all-products', label: 'สินค้าทั้งหมด', Icon: ShoppingBag },
            { href: '/promotions', label: 'โปรโมชั่น', Icon: Tag },
            { href: '/payment-notification', label: 'แจ้งชำระเงิน', Icon: WalletMinus },
            { href: '/about-us', label: 'เกี่ยวกับเรา', Icon: InfoCircle },
          ].map(({ href, label, Icon }) => (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={pathname === href}
              sx={{ borderRadius: 2, mx: 1, mb: 0.5, '&.Mui-selected': { bgcolor: 'rgba(215,20,20,0.08)', color: 'primary.main' } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon size="20" color={pathname === href ? '#d71414' : '#666'} variant={pathname === href ? 'Bold' : 'Linear'} />
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} />
            </ListItemButton>
          ))}
          <Divider sx={{ my: 1, mx: 2 }} />
          {session ? (
            <>
              <ListItemButton component={Link} href="/profile" sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}><UserEdit size="20" color="#666" /></ListItemIcon>
                <ListItemText primary="โปรไฟล์ของฉัน" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} />
              </ListItemButton>
              <ListItemButton component={Link} href="/orders" sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}><ClipboardText size="20" color="#666" /></ListItemIcon>
                <ListItemText primary="ประวัติการสั่งซื้อ" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} />
              </ListItemButton>
              <ListItemButton onClick={handleSignOut} sx={{ borderRadius: 2, mx: 1, color: 'error.main' }}>
                <ListItemIcon sx={{ minWidth: 36 }}><Logout size="20" color="#d32f2f" /></ListItemIcon>
                <ListItemText primary="ออกจากระบบ" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem', color: '#d32f2f' }} />
              </ListItemButton>
            </>
          ) : null}
        </List>
      </Drawer>
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
