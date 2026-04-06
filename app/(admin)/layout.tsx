"use client";

import React, { useState } from "react";
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Fade
} from "@mui/material";
import { 
  HambergerMenu, 
  Category, 
  User, 
  Shop, 
  BagHappy, 
  Chart, 
  Setting2, 
  LogoutCurve,
  Notification,
  SearchNormal1,
  ArrowDown2,
  ProfileCircle,
  MagicStar
} from "iconsax-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const drawerWidth = 260;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: "แดชบอร์ด", icon: <Category size="22" />, path: "/admin" },
    { text: "จัดการผู้ใช้งาน", icon: <User size="22" />, path: "/admin/users" },
    { text: "จัดการสินค้า", icon: <Shop size="22" />, path: "/admin/products" },
    { text: "แบรนด์สินค้า", icon: <BagHappy size="22" />, path: "/admin/brands" },
    { text: "รายงานการขาย", icon: <Chart size="22" />, path: "/admin/reports" },
    { text: "ตั้งค่าระบบ", icon: <Setting2 size="22" />, path: "/admin/settings" },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: "white" }}>
         <Image src="/images/logo.png" alt="SNNP Admin" width={100} height={32} style={{ objectFit: 'contain', filter: 'brightness(0)' }} />
         <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', borderLeft: '1px solid #eee', pl: 1.5, lineHeight: 1 }}>Admin</Typography>
      </Box>
      <Divider sx={{ borderColor: 'grey.50' }} />
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  component={Link} 
                  href={item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.2,
                    bgcolor: isActive ? "primary.main" : "transparent",
                    color: isActive ? "white" : "text.secondary",
                    "&:hover": { 
                      bgcolor: isActive ? "primary.main" : "grey.100",
                      color: isActive ? "white" : "primary.main"
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { variant: isActive ? "Bold" : "Linear" })}
                  </ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 800 : 600, fontSize: '0.9rem' }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Divider sx={{ borderColor: 'grey.50' }} />
      <Box sx={{ p: 3 }}>
        <Button 
          fullWidth 
          variant="outlined" 
          color="inherit" 
          onClick={() => signOut()}
          startIcon={<LogoutCurve size="18" />}
          sx={{ borderRadius: 3, py: 1, fontWeight: 700, borderColor: 'grey.200', color: 'grey.600' }}
        >
          ออกจากระบบ
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7f6', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'grey.100',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, lg: 4 } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { lg: 'none' } }}
            >
                <HambergerMenu size="24" />
            </IconButton>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', bgcolor: 'grey.50', px: 2, py: 0.8, borderRadius: 2, gap: 1 }}>
               <SearchNormal1 size="18" color="#999" />
               <Typography variant="body2" color="grey.400" sx={{ minWidth: 150 }}>ค้นหาข้อมูล...</Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
             <IconButton sx={{ bgcolor: 'grey.50' }}><Notification size="22" /></IconButton>
             <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />
             
             {/* Professional User Toggle */}
             <Box 
                onClick={handleUserMenuOpen}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  cursor: 'pointer',
                  p: 0.5,
                  pr: 1.5,
                  borderRadius: 10,
                  transition: 'all 0.2s',
                  "&:hover": { bgcolor: 'grey.50' }
                }}
             >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 38, 
                    height: 38, 
                    boxShadow: '0 4px 10px rgba(215, 20, 20, 0.2)',
                    fontSize: '0.9rem',
                    fontWeight: 800
                  }}
                >
                   {session?.user?.name?.charAt(0) || "A"}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                   <Typography variant="subtitle2" fontWeight="900" sx={{ lineHeight: 1.1 }}>
                      {session?.user?.name || "Admin User"}
                   </Typography>
                   <Typography variant="caption" color="primary.main" fontWeight="800" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Administrator
                   </Typography>
                </Box>
                <ArrowDown2 size="14" color="#999" variant="Bold" style={{ transform: anchorEl ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
             </Box>

             <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                TransitionComponent={Fade}
                elevation={0}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'grey.100',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
                    p: 1
                  }
                }}
             >
                <Box sx={{ px: 2, py: 1.5 }}>
                   <Typography variant="caption" color="grey.400" fontWeight="800" sx={{ textTransform: 'uppercase' }}>บัญชีผู้ใช้</Typography>
                </Box>
                <MenuItem onClick={handleUserMenuClose} sx={{ borderRadius: 2, gap: 1.5, py: 1 }}>
                   <ProfileCircle size="20" color="#d71414" variant="Bulk" />
                   <Typography variant="body2" fontWeight="700">ดูโปรไฟล์</Typography>
                </MenuItem>
                <MenuItem onClick={handleUserMenuClose} sx={{ borderRadius: 2, gap: 1.5, py: 1 }}>
                   <MagicStar size="20" color="#d71414" variant="Bulk" />
                   <Typography variant="body2" fontWeight="700">สิทธิ์การเข้าถึง</Typography>
                </MenuItem>
                <Divider sx={{ my: 1, borderColor: 'grey.50' }} />
                <MenuItem 
                  onClick={() => { handleUserMenuClose(); signOut(); }}
                  sx={{ borderRadius: 2, gap: 1.5, py: 1, color: 'error.main' }}
                >
                   <LogoutCurve size="20" color="currentColor" variant="Bulk" />
                   <Typography variant="body2" fontWeight="700">ออกจากระบบ</Typography>
                </MenuItem>
             </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', boxShadow: '10px 0 30px rgba(0,0,0,0.05)' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'grey.100' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, lg: 4 }, width: { lg: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
