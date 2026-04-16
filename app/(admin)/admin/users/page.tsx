import React from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Avatar, 
  Chip, 
  IconButton, 
  Button, 
  Stack, 
  TextField, 
  InputAdornment,
  Breadcrumbs,
  Menu,
  MenuItem
} from "@mui/material";
import { SearchNormal1, More, UserAdd, Edit2, Trash, ShieldTick } from "iconsax-react";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "จัดการผู้ใช้งาน | SNNP Admin"
};

export default async function AdminUsersPage() {
  // Fetch real users from Prisma
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <Box>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
           <Typography variant="h4" fontWeight="900" gutterBottom sx={{ fontSize: '1.8rem' }}>จัดการผู้ใช้งาน</Typography>
           <Breadcrumbs sx={{ fontSize: '0.8rem' }}>
             <Typography color="text.secondary">Admin</Typography>
             <Typography color="text.primary" fontWeight="700">Users</Typography>
           </Breadcrumbs>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<UserAdd size="20" variant="Bold" color="white" />}
          sx={{ borderRadius: 3, fontWeight: 800, px: 3, py: 1.2, bgcolor: 'primary.main', boxShadow: '0 8px 20px rgba(215, 20, 20, 0.2)' }}
        >
          เพิ่มผู้ใช้งาน
        </Button>
      </Stack>

      {/* Filter and Search */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100' }}>
         <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <TextField 
               size="small"
               placeholder="ค้นหาชื่อ, อีเมล หรือเบอร์โทร..."
               sx={{ width: { xs: '100%', md: 350 }, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
               InputProps={{
                 startAdornment: (
                   <InputAdornment position="start">
                     <SearchNormal1 size="18" color="#999" />
                   </InputAdornment>
                 ),
               }}
            />
            <Stack direction="row" spacing={1}>
               <Chip label="ทั้งหมด" color="primary" sx={{ fontWeight: 800, borderRadius: 2 }} />
               <Chip label="Admin" variant="outlined" sx={{ fontWeight: 800, borderRadius: 2, borderColor: 'grey.200' }} />
               <Chip label="User" variant="outlined" sx={{ fontWeight: 800, borderRadius: 2, borderColor: 'grey.200' }} />
            </Stack>
         </Stack>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 6, border: '1px solid', borderColor: 'grey.100' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 900, color: 'grey.600', py: 2.5 }}>ผู้ใช้งาน</TableCell>
              <TableCell sx={{ fontWeight: 900, color: 'grey.600' }}>บทบาท</TableCell>
              <TableCell sx={{ fontWeight: 900, color: 'grey.600' }}>เบอร์โทรศัพท์</TableCell>
              <TableCell sx={{ fontWeight: 900, color: 'grey.600' }}>วันที่สมัคร</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: 'grey.600' }}>จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? users.map((user) => (
              <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: user.role === 'ADMIN' ? 'error.light' : 'primary.light', color: user.role === 'ADMIN' ? 'error.dark' : 'primary.dark', fontWeight: 800 }}>
                       {user.image ? <Box component="img" src={user.image} /> : user.name?.charAt(0) || "U"}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="800" sx={{ fontSize: '0.95rem' }}>{user.name || "ไม่ระบุชื่อ"}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email || "No Email"}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    icon={user.role === 'ADMIN' ? <ShieldTick size="14" variant="Bold" color="#d71414" /> : undefined}
                    sx={{ 
                      fontWeight: 800, 
                      fontSize: '0.7rem',
                      bgcolor: user.role === 'ADMIN' ? 'error.50' : 'primary.50',
                      color: user.role === 'ADMIN' ? 'error.main' : 'primary.main',
                      border: '1px solid',
                      borderColor: 'transparent'
                    }} 
                  />
                </TableCell>
                <TableCell>
                   <Typography variant="body2" color="text.secondary" fontWeight="600">{user.phone || "-"}</Typography>
                </TableCell>
                <TableCell>
                   <Typography variant="caption" color="text.secondary" fontWeight="700">
                     {new Date(user.createdAt).toLocaleDateString('th-TH', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                     })}
                   </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                     <IconButton size="small" sx={{ color: 'primary.main', bgcolor: 'primary.50' }}><Edit2 size="18" variant="Bold" color="primary.main" /></IconButton>
                     <IconButton size="small" sx={{ color: 'error.main', bgcolor: 'error.50' }}><Trash size="18" variant="Bold" color="error.main" /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            )) : (
               <TableRow>
                 <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                   <Typography color="text.secondary" fontWeight="700">ไม่พบข้อมูลผู้ใช้งานในระบบ</Typography>
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
