"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, Paper, Stack, Button, IconButton, TextField,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Tooltip, Switch,
} from "@mui/material";
import { Add, Edit2, Trash, BagHappy, TickCircle, CloseCircle, Gallery } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import ImageUploader, { type ImageUploaderRef } from "@/components/ImageUploader";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface Brand { id: string; name: string; slug: string; logo: string | null; priority: number; isActive: boolean; _count: { products: number } }

const EMPTY = { name: "", slug: "", logo: "", priority: 0 };
function slugify(s: string) { return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }

export default function AdminBrandsPage() {
  const { showSnackbar } = useSnackbar();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<{ brandId: string; nextActive: boolean } | null>(null);
  const imageRef = useRef<ImageUploaderRef>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/brands");
    setBrands(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (b: Brand) => { setEditingId(b.id); setForm({ name: b.name, slug: b.slug, logo: b.logo ?? "", priority: b.priority }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { showSnackbar("กรุณากรอกชื่อแบรนด์", "error"); return; }
    setSaving(true);
    try {
      const logoUrl = await imageRef.current!.upload();
      const payload = { ...form, logo: logoUrl, priority: Number(form.priority) };
      const res = editingId
        ? await fetch(`/api/admin/brands/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/admin/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); showSnackbar(d.error ?? "เกิดข้อผิดพลาด", "error"); return; }
      showSnackbar(editingId ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ", "success");
      setDialogOpen(false); load();
    } catch {
      showSnackbar("อัปโหลดรูปไม่สำเร็จ", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSnackbar("ลบสำเร็จ", "success");
        setDeleteConfirm(null);
        load();
      } else {
        showSnackbar("เกิดข้อผิดพลาด", "error");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (b: Brand) => {
    setUpdatingId(b.id);
    try {
      const res = await fetch(`/api/admin/brands/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      if (res.ok) {
        setToggleConfirm(null);
        load();
      } else {
        showSnackbar("เปลี่ยนสถานะแบรนด์ไม่สำเร็จ", "error");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const requestToggle = (brand: Brand) => {
    if (brand.isActive) {
      setToggleConfirm({ brandId: brand.id, nextActive: false });
      return;
    }

    void handleToggle(brand);
  };

  const confirmedBrand = toggleConfirm
    ? brands.find((brand) => brand.id === toggleConfirm.brandId) ?? null
    : null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <BagHappy size="28" color="#d71414" variant="Bold" />
          <Typography variant="h5" fontWeight={900}>แบรนด์สินค้า</Typography>
        </Stack>
        <Button variant="contained" startIcon={<Add size="18" color="white" />} onClick={openCreate} sx={{ borderRadius: 2.5, fontWeight: 800 }}>เพิ่มแบรนด์</Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.100", overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 800 }}>แบรนด์</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Slug</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">สินค้า</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">ลำดับ</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>สถานะ</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar src={b.logo ?? undefined} variant="rounded" sx={{ width: 44, height: 44, bgcolor: "grey.100" }}>
                          <Gallery size="20" color="#ccc" />
                        </Avatar>
                        <Typography fontWeight={700}>{b.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{b.slug}</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight={700}>{b._count?.products ?? 0}</Typography></TableCell>
                    <TableCell align="right"><Typography>{b.priority}</Typography></TableCell>
                    <TableCell>
                      <Switch checked={b.isActive} disabled={updatingId === b.id} onChange={() => requestToggle(b)} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" gap={0.5} justifyContent="flex-end">
                        <Tooltip title="แก้ไข"><IconButton size="small" onClick={() => openEdit(b)}><Edit2 size="16" color="#666" /></IconButton></Tooltip>
                        <Tooltip title="ลบ"><IconButton size="small" onClick={() => setDeleteConfirm(b.id)}><Trash size="16" color="#d71414" /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {brands.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>ยังไม่มีแบรนด์</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>{editingId ? "แก้ไขแบรนด์" : "เพิ่มแบรนด์"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ImageUploader
                ref={imageRef}
                value={form.logo}
                onChange={(url) => setForm((p) => ({ ...p, logo: url }))}
                endpoint="/api/admin/upload?folder=brands"
                size={130}
              />
            </Box>
            <TextField label="ชื่อแบรนด์" fullWidth value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))} />
            <TextField label="Slug" fullWidth value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
            <TextField label="ลำดับการแสดง" type="number" fullWidth inputProps={{ min: 0 }} value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} startIcon={<CloseCircle size="16" color="currentColor" />} sx={{ fontWeight: 700 }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <TickCircle size="16" color="white" />} sx={{ fontWeight: 800, borderRadius: 2.5 }}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        message="คุณต้องการลบแบรนด์นี้ใช่หรือไม่? สินค้าในแบรนด์จะถูกลบด้วย"
        loading={Boolean(deleteConfirm && deletingId === deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && void handleDelete(deleteConfirm)}
      />

      <ConfirmActionDialog
        open={!!toggleConfirm}
        title="ยืนยันการปิดใช้งานแบรนด์"
        message={confirmedBrand ? `คุณต้องการปิดใช้งานแบรนด์ ${confirmedBrand.name} ใช่หรือไม่? เมื่่อปิดแล้วสินค้าของแบรนด์นี้จะไม่ถูกใช้งานต่อในหน้าเว็บ` : "คุณต้องการปิดใช้งานแบรนด์นี้ใช่หรือไม่?"}
        confirmText="ปิดใช้งาน"
        confirmColor="warning"
        loadingText="กำลังอัปเดตสถานะ..."
        loading={Boolean(toggleConfirm && updatingId === toggleConfirm.brandId)}
        onClose={() => setToggleConfirm(null)}
        onConfirm={() => confirmedBrand && void handleToggle(confirmedBrand)}
      />
    </Box>
  );
}
