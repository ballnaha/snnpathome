"use client";

import React, { useState } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { SearchNormal1, UserAdd, Edit2, Trash, Profile2User, TickCircle, CloseCircle } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

interface UsersClientProps {
  users: User[];
}

const EMPTY_FORM = { name: "", email: "", password: "", phone: "", role: "USER", isActive: true };

export default function UsersClient({ users: initialUsers }: UsersClientProps) {
  const { showSnackbar } = useSnackbar();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = users.filter((user) => {
    const q = search.toLowerCase();
    const matchSearch =
      (user.name ?? "").toLowerCase().includes(q) ||
      (user.email ?? "").toLowerCase().includes(q) ||
      (user.phone ?? "").toLowerCase().includes(q);
    const matchRole = filterRole === "" || user.role === filterRole;
    return matchSearch && matchRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const userCount = totalUsers - adminCount;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ 
      name: user.name ?? "", 
      email: user.email ?? "", 
      password: "", 
      phone: user.phone ?? "", 
      role: user.role,
      isActive: user.isActive
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showSnackbar("กรุณากรอกชื่อ", "error");
      return;
    }
    if (!editingId) {
      if (!form.email.trim()) {
        showSnackbar("กรุณากรอกอีเมล", "error");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        showSnackbar("รูปแบบอีเมลไม่ถูกต้อง", "error");
        return;
      }
      if (!form.password.trim()) {
        showSnackbar("กรุณากรอกรหัสผ่าน", "error");
        return;
      }
    }
    setSaving(true);
    try {
      const res = editingId
        ? await fetch(`/api/admin/users/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      const data = await res.json();
      if (!res.ok) {
        showSnackbar(data.error ?? "เกิดข้อผิดพลาด", "error");
        return;
      }
      if (editingId) {
        setUsers((prev) => prev.map((u) => u.id === editingId ? { ...u, ...data, createdAt: new Date(data.createdAt) } : u));
        showSnackbar("แก้ไขสำเร็จ", "success");
      } else {
        setUsers((prev) => [{ ...data, createdAt: new Date(data.createdAt), image: null }, ...prev]);
        showSnackbar("เพิ่มผู้ใช้งานสำเร็จ", "success");
      }
      setDialogOpen(false);
    } catch {
      showSnackbar("เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showSnackbar("ลบผู้ใช้งานสำเร็จ", "success");
        setDeleteConfirm(null);
      } else {
        showSnackbar("เกิดข้อผิดพลาด", "error");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Profile2User size="28" color="#d71414" variant="Bold" />
          <Typography variant="h5" fontWeight={900}>จัดการผู้ใช้งาน</Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<UserAdd size="20" variant="Bold" color="white" />}
          onClick={openCreate}
          sx={{ borderRadius: 2.5, fontWeight: 800 }}
        >
          เพิ่มผู้ใช้งาน
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.100" }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField
            size="small"
            placeholder="ค้นหาชื่อ, อีเมล หรือเบอร์โทร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: "100%", md: 360 }, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size="18" color="#999" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 200 } }}>
            <InputLabel id="role-filter-label">กรองตามบทบาท</InputLabel>
            <Select
              labelId="role-filter-label"
              value={filterRole}
              label="กรองตามบทบาท"
              onChange={(e) => setFilterRole(e.target.value)}
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="">ทั้งหมด ({totalUsers})</MenuItem>
              <MenuItem value="ADMIN">Admin ({adminCount})</MenuItem>
              <MenuItem value="USER">User ({userCount})</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.100", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 800 }}>ผู้ใช้งาน</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>บทบาท</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>เบอร์โทรศัพท์</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>สถานะ</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>วันที่สมัคร</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((user) => (
                  <TableRow key={user.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={user.image ?? undefined}
                          sx={{
                            bgcolor: user.role === "ADMIN" ? "error.light" : "primary.light",
                            color: user.role === "ADMIN" ? "error.dark" : "primary.dark",
                            fontWeight: 800,
                          }}
                        >
                          {user.name?.charAt(0) || "U"}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={800} fontSize="0.95rem">
                            {user.name || "ไม่ระบุชื่อ"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email || "No Email"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          bgcolor: user.role === "ADMIN" ? "error.50" : "primary.50",
                          color: user.role === "ADMIN" ? "error.main" : "primary.main",
                          border: "1px solid transparent",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {user.phone || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? "ใช้งานปกติ" : "ระงับการใช้งาน"}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.75rem",
                          bgcolor: user.isActive ? "success.50" : "error.50",
                          color: user.isActive ? "success.main" : "error.main",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {new Date(user.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => openEdit(user)} sx={{ color: "primary.main", bgcolor: "primary.50" }}>
                          <Edit2 size="18" color="#1976d2" variant="Bold" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteConfirm(user.id)} sx={{ color: "error.main", bgcolor: "error.50" }}>
                          <Trash size="18" color="#d71414" variant="Bold" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary" fontWeight={700}>ไม่พบข้อมูลผู้ใช้งาน</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create / Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>{editingId ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <TextField
              label="ชื่อ-นามสกุล"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            {!editingId && (
              <TextField
                label="อีเมล"
                fullWidth
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            )}
            <TextField
              label={editingId ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" : "รหัสผ่าน"}
              fullWidth
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
            <TextField
              label="เบอร์โทรศัพท์"
              fullWidth
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>บทบาท</InputLabel>
              <Select
                value={form.role}
                label="บทบาท"
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>สถานะการใช้งาน</InputLabel>
              <Select
                value={form.isActive ? 1 : 0}
                label="สถานะการใช้งาน"
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === 1 }))}
              >
                <MenuItem value={1}>ใช้งานปกติ (Active)</MenuItem>
                <MenuItem value={0}>ระงับการใช้งาน (Disabled)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            startIcon={<CloseCircle size="16" color="#64748b" />}
            sx={{ fontWeight: 700 }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <TickCircle size="16" color="white" />}
            sx={{ fontWeight: 800, borderRadius: 2.5 }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        message="คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?"
        loading={Boolean(deleteConfirm && deletingId === deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && void handleDelete(deleteConfirm)}
      />
    </Box>
  );
}
