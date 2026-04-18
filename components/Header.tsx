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

// Removed cleanupOrphanedMuiElements as it causes Drawer unclickable issues
// Use MUI's built-in disableScrollLock if needed, but avoid direct DOM mutations.

export default function Header() {
  const { data: session } = useSession();
  const { totalItems, openDrawer, clearCart } = useCart();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null);
  const menuTriggerRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const primaryMobileLinks = [
    { href: '/', label: 'หน้าแรก', Icon: Home2 },
    { href: '/all-products', label: 'สินค้าทั้งหมด', Icon: ShoppingBag },
    { href: '/promotions', label: 'โปรโมชั่น', Icon: Tag },
    { href: '/track-order', label: 'ติดตามสถานะใบสั่งซื้อ', Icon: Receipt1 },
    { href: '/payment-notification', label: 'แจ้งชำระเงิน', Icon: WalletMinus },
    { href: '/about-us', label: 'เกี่ยวกับเรา', Icon: InfoCircle },
  ];
  const accountLinks = [
    { href: '/profile', label: 'โปรไฟล์ของฉัน', Icon: UserEdit },
    { href: '/orders', label: 'ประวัติการสั่งซื้อ', Icon: ClipboardText },
  ];

  // Handle bfcache restore
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setMenuOpen(false);
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      setMenuOpen(false);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;

    if (mobileDrawerOpen) {
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.touchAction = previousTouchAction;
    };
  }, [mobileDrawerOpen]);

  const handleToggleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuOpen((prev) => !prev);
  }, []);

  const handleSignOut = useCallback(() => {
    clearCart();
    localStorage.removeItem("snnp-last-order");
    signOut({ callbackUrl: "/" });
  }, [clearCart]);

  const handleCloseMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuAnchorEl(null);
  }, []);

  const isRouteActive = useCallback((href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);

  return (
    <Box
      component="header"
      position="sticky"
      top={0}
      zIndex={mobileDrawerOpen ? 1500 : 1100}
      width="100%"
      sx={{ display: 'block' }}
    >
      {/* Top Red Bar */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 1 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* Left: Tracking — hidden on mobile */}
            <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Link href="/track-order" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Stack direction="row" spacing={0.8} alignItems="center" sx={{ cursor: 'pointer', "&:hover": { opacity: 0.8 } }}>
                  <Receipt1 size="16" variant="Bulk" color="#FFF" />
                  <Typography variant="caption" fontWeight="600" sx={{ fontSize: "0.8rem", letterSpacing: 0.3 }}>ติดตามสถานะใบสั่งซื้อ</Typography>
                </Stack>
              </Link>
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
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ minHeight: 32, display: { xs: 'none', md: 'flex' }, alignItems: 'center', position: 'relative' }}>
                {session ? (
                  <>
                    <Box
                      ref={menuTriggerRef}
                      onClick={handleToggleMenu}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.2, 
                        cursor: 'pointer', 
                        bgcolor: 'rgba(255,255,255,0.22)',
                        backdropFilter: 'blur(8px)',
                        pl: 0.8,
                        pr: 1.8,
                        py: 0.6,
                        borderRadius: 12,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        "&:hover": { 
                          bgcolor: 'rgba(255,255,255,0.35)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                        },
                        "&:active": { transform: 'scale(0.96)' },
                        userSelect: 'none',
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 26, 
                          height: 26, 
                          fontSize: '0.75rem', 
                          fontWeight: 900, 
                          bgcolor: 'white', 
                          color: 'primary.main',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {session.user?.name?.charAt(0) || "U"}
                      </Avatar>
                      <Typography variant="caption" fontWeight="800" sx={{ fontSize: "0.78rem", color: 'white', letterSpacing: 0.2 }}>
                        {session.user?.name?.split(' ')[0] || "คุณลูกค้า"}
                      </Typography>
                      <ArrowDown2 size="14" color="#FFF" variant="Bold" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: '0.4s' }} />
                    </Box>
                    <Popper
                      open={menuOpen}
                      anchorEl={menuAnchorEl}
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
                              mt: 2,
                              minWidth: 210,
                              borderRadius: 3.5,
                              boxShadow: '0 15px 45px rgba(0,0,0,0.18)',
                              border: '1px solid',
                              borderColor: 'grey.100',
                              p: 1.2,
                              overflow: 'visible',
                            }}
                          >
                            <ClickAwayListener onClickAway={handleCloseMenu}>
                              <Box>
                                <MenuItem
                                  onClick={handleCloseMenu}
                                  component={Link}
                                  href="/profile"
                                  selected={isRouteActive("/profile")}
                                  sx={{ borderRadius: 2.5, gap: 1.5, py: 1.2, "&.Mui-selected": { bgcolor: 'rgba(215,20,20,0.08)' } }}
                                >
                                   <UserEdit size="20" color="#d71414" variant="Bulk" />
                                   <Typography variant="body2" fontWeight="700">โปรไฟล์ของฉัน</Typography>
                                </MenuItem>
                                <MenuItem
                                  onClick={handleCloseMenu}
                                  component={Link}
                                  href="/orders"
                                  selected={isRouteActive("/orders")}
                                  sx={{ borderRadius: 2.5, gap: 1.5, py: 1.2, "&.Mui-selected": { bgcolor: 'rgba(215,20,20,0.08)' } }}
                                >
                                   <ClipboardText size="20" color="#d71414" variant="Bulk" />
                                   <Typography variant="body2" fontWeight="700">ประวัติการสั่งซื้อ</Typography>
                                </MenuItem>
                                {(session.user as { role?: string } | undefined)?.role === 'ADMIN' && (
                                  <MenuItem onClick={handleCloseMenu} component={Link} href="/admin/users" sx={{ borderRadius: 2.5, gap: 1.5, py: 1.2, bgcolor: 'grey.50', mt: 0.5 }}>
                                    <Setting2 size="20" color="#666" variant="Bulk" />
                                    <Typography variant="body2" fontWeight="800">แผงควบคุมแอดมิน</Typography>
                                  </MenuItem>
                                )}
                                <Divider sx={{ my: 1.2, borderColor: 'grey.50' }} />
                                <MenuItem onClick={() => { handleCloseMenu(); handleSignOut(); }} sx={{ borderRadius: 2.5, gap: 1.5, py: 1.2, color: 'error.main' }}>
                                    <Logout size="20" variant="Bulk" color="currentColor" />
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
                        gap: 1.2, 
                        cursor: 'pointer', 
                        bgcolor: 'rgba(255,255,255,0.22)',
                        backdropFilter: 'blur(8px)',
                        px: 2.5,
                        py: 0.8,
                        borderRadius: 12,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        "&:hover": { 
                          bgcolor: 'rgba(255,255,255,0.35)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                        }
                      }}
                    >
                      <Profile size="18" variant="Bulk" color="#FFF" />
                      <Typography variant="caption" fontWeight="800" sx={{ fontSize: "0.78rem", color: 'white', letterSpacing: 0.3 }}>
                        เข้าสู่ระบบ / สมัครสมาชิก
                      </Typography>
                    </Box>
                  </Link>
                )}
              </Box>

              <IconButton 
                onClick={openDrawer}
                sx={{ 
                  color: 'white', 
                  p: 0.8,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  "&:hover": { 
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'scale(1.1) rotate(-5deg)',
                  },
                  "&:active": { transform: 'scale(0.9)' }
                }}
              >
                <Badge
                  badgeContent={totalItems}
                  showZero
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#FFF",
                      color: "primary.main",
                      fontWeight: "900",
                      fontSize: '11px',
                      height: 19,
                      minWidth: 19,
                      boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                      border: '1.5px solid #d71414'
                    }
                  }}
                >
                  <ShoppingCart size="24" variant="Bulk" color="#FFF" />
                </Badge>
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Navigation Bar — desktop only */}
      <Box sx={{ bgcolor: "white", borderBottom: 1, borderColor: "grey.200", py: 1.5, display: { xs: 'none', md: 'block' } }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={5}>
            <NavLink href="/" active={isRouteActive("/")}>หน้าแรก</NavLink>
            <NavLink href="/all-products" active={isRouteActive("/all-products")}>สินค้าทั้งหมด</NavLink>
            <NavLink href="/promotions" active={isRouteActive("/promotions")}>โปรโมชั่น</NavLink>
            <NavLink href="/payment-notification" active={isRouteActive("/payment-notification")}>แจ้งชำระเงิน</NavLink>
            <NavLink href="/about-us" active={isRouteActive("/about-us")}>เกี่ยวกับเรา</NavLink>
          </Stack>
        </Container>
      </Box>

      {/* Mobile Sidebar */}
      <Box
        aria-hidden={!mobileDrawerOpen}
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          inset: 0,
          zIndex: 1350,
          pointerEvents: mobileDrawerOpen ? 'auto' : 'none',
        }}
      >
        <Box
          onClick={() => setMobileDrawerOpen(false)}
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(10, 15, 26, 0.38)',
            backdropFilter: 'blur(4px)',
            opacity: mobileDrawerOpen ? 1 : 0,
            transition: 'opacity 0.3s ease, backdrop-filter 0.3s ease',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 'min(82vw, 320px)',
            height: '100dvh',
            bgcolor: '#fffdf8',
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,248,243,0.98) 100%)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            transform: mobileDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ px: 2, pt: 2, pb: 1.5, bgcolor: 'primary.main', color: 'white' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Image src="/images/logo.png" alt="SNNP Logo" width={90} height={28} style={{ objectFit: 'contain', width: 'auto', height: 'auto' }} />
              <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: 'white' }}>
                <CloseCircle size="22" color="#FFF" />
              </IconButton>
            </Stack>
           
          </Box>

          {session ? (
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Typography sx={{ px: 0.5, mb: 1, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1, color: 'text.secondary' }}>
                ACCOUNT
              </Typography>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(215,20,20,0.06)', border: '1px solid', borderColor: 'rgba(215,20,20,0.14)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 46, height: 46, fontSize: '1rem', fontWeight: 900, bgcolor: 'primary.main', color: 'white', boxShadow: '0 8px 18px rgba(215,20,20,0.22)' }}>
                  {session.user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={800} fontSize="0.95rem" noWrap>{session.user?.name || 'คุณลูกค้า'}</Typography>
                  <Typography fontSize="0.75rem" color="text.secondary" noWrap>{session.user?.email || ''}</Typography>
                  <Typography sx={{ mt: 0.4, fontSize: '0.72rem', fontWeight: 700, color: 'primary.main' }}>
                    สมาชิก SNNP พร้อมช้อปต่อได้ทันที
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Typography sx={{ px: 0.5, mb: 1, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1, color: 'text.secondary' }}>
                WELCOME
              </Typography>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 46, height: 46, bgcolor: 'grey.300' }}>
                  <Profile size="20" color="#999" />
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography fontWeight={800} fontSize="0.9rem">ยังไม่ได้เข้าสู่ระบบ</Typography>
                  <Typography fontSize="0.74rem" color="text.secondary">เข้าสู่ระบบเพื่อดูออเดอร์และข้อมูลส่วนตัว</Typography>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Typography sx={{ mt: 0.7, fontSize: '0.76rem', color: 'primary.main', fontWeight: 800 }}>เข้าสู่ระบบ / สมัครสมาชิก</Typography>
                  </Link>
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ px: 2, pt: 0.5 }}>
            <Typography sx={{ px: 0.5, mb: 1, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1, color: 'text.secondary' }}>
              SHOP MENU
            </Typography>
          </Box>

          <List sx={{ px: 1, pt: 0, pb: 1, flexGrow: 0 }}>
            {primaryMobileLinks.map(({ href, label, Icon }) => (
              <ListItemButton
                key={href}
                component={Link}
                href={href}
                selected={isRouteActive(href)}
                onClick={() => setMobileDrawerOpen(false)}
                sx={{
                  borderRadius: 3,
                  mx: 1,
                  mb: 0.75,
                  py: 1.1,
                  '&.Mui-selected': { bgcolor: 'rgba(215,20,20,0.08)', color: 'primary.main' },
                  '&:hover': { bgcolor: 'rgba(215,20,20,0.05)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: isRouteActive(href) ? 'rgba(215,20,20,0.12)' : 'rgba(0,0,0,0.04)' }}>
                    <Icon size="18" color={isRouteActive(href) ? '#d71414' : '#666'} variant={isRouteActive(href) ? 'Bold' : 'Linear'} />
                  </Box>
                </ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 800, fontSize: '0.92rem' }} />
              </ListItemButton>
            ))}
          </List>

          {session ? (
            <>
              <Box sx={{ px: 2, pt: 0.5 }}>
                <Typography sx={{ px: 0.5, mb: 1, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1, color: 'text.secondary' }}>
                  MY ACCOUNT
                </Typography>
              </Box>
              <List sx={{ px: 1, pt: 0, pb: 2, flexGrow: 1 }}>
                {accountLinks.map(({ href, label, Icon }) => (
                  <ListItemButton
                    component={Link}
                    href={href}
                    key={href}
                    selected={isRouteActive(href)}
                    onClick={() => setMobileDrawerOpen(false)}
                    sx={{
                      borderRadius: 3,
                      mx: 1,
                      mb: 0.75,
                      py: 1.05,
                      '&.Mui-selected': { bgcolor: 'rgba(215,20,20,0.08)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: isRouteActive(href) ? 'rgba(215,20,20,0.12)' : 'rgba(0,0,0,0.04)' }}>
                        <Icon size="18" color={isRouteActive(href) ? '#d71414' : '#666'} variant={isRouteActive(href) ? 'Bold' : 'Linear'} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={label} primaryTypographyProps={{ fontWeight: isRouteActive(href) ? 800 : 700, fontSize: '0.9rem', color: isRouteActive(href) ? 'primary.main' : 'text.primary' }} />
                  </ListItemButton>
                ))}
                <Divider sx={{ my: 1, mx: 2 }} />
                <ListItemButton onClick={() => { setMobileDrawerOpen(false); handleSignOut(); }} sx={{ borderRadius: 3, mx: 1, py: 1.05, color: 'error.main', bgcolor: 'rgba(211,47,47,0.04)' }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'rgba(211,47,47,0.1)' }}>
                      <Logout size="18" color="#d32f2f" />
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary="ออกจากระบบ" primaryTypographyProps={{ fontWeight: 800, fontSize: '0.9rem', color: '#d32f2f' }} />
                </ListItemButton>
              </List>
            </>
          ) : (
            <Box sx={{ p: 2, pt: 1.5, mt: 'auto' }}>
              <Box sx={{ borderRadius: 3, p: 1.5, bgcolor: 'rgba(215,20,20,0.05)', border: '1px solid', borderColor: 'rgba(215,20,20,0.12)' }}>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 800 }}>ช้อปไวขึ้นเมื่อเข้าสู่ระบบ</Typography>
                <Typography sx={{ mt: 0.4, fontSize: '0.74rem', color: 'text.secondary' }}>บันทึกที่อยู่ ตรวจสอบออเดอร์ และรับสิทธิ์โปรโมชันได้สะดวกกว่าเดิม</Typography>
              </Box>
            </Box>
          )}
        </Box>
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
