"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Edit2, Gallery, Tag, TickCircle, CloseCircle, Trash } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import ImageUploader, { type ImageUploaderRef } from "@/components/ImageUploader";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  imageUrl: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminPromotionsPage() {
  const { showSnackbar } = useSnackbar();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<{ promotionId: string; nextActive: boolean } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const imageRef = useRef<ImageUploaderRef>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/promotions");
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setPromotions([]);
        showSnackbar(
          typeof data?.error === "string" ? data.error : "ไม่สามารถโหลดรายการโปรโมชันได้",
          "error"
        );
        return;
      }

      setPromotions(Array.isArray(data) ? data : []);
    } catch {
      setPromotions([]);
      showSnackbar("ไม่สามารถโหลดรายการโปรโมชันได้", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (promotion: Promotion) => {
    setEditingId(promotion.id);
    setForm({
      title: promotion.title,
      description: promotion.description,
      imageUrl: promotion.imageUrl,
      isActive: promotion.isActive,
      sortOrder: promotion.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      showSnackbar("กรุณากรอกชื่อโปรโมชันและรายละเอียด", "error");
      return;
    }

    setSaving(true);
    try {
      const uploadedImageUrl = await imageRef.current?.upload();
      const payload = {
        ...form,
        imageUrl: uploadedImageUrl || form.imageUrl,
        sortOrder: Number(form.sortOrder ?? 0),
      };

      const response = editingId
        ? await fetch(`/api/admin/promotions/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/promotions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showSnackbar(data?.error ?? "เกิดข้อผิดพลาดในการบันทึกโปรโมชัน", "error");
        return;
      }

      showSnackbar(editingId ? "แก้ไขโปรโมชันสำเร็จ" : "เพิ่มโปรโมชันสำเร็จ", "success");
      setDialogOpen(false);
      load();
    } catch {
      showSnackbar("อัปโหลดรูปไม่สำเร็จ", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      if (response.ok) {
        showSnackbar("ลบโปรโมชันสำเร็จ", "success");
        setDeleteConfirm(null);
        load();
      } else {
        showSnackbar("เกิดข้อผิดพลาดในการลบ", "error");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    setUpdatingId(promotion.id);
    try {
      const response = await fetch(`/api/admin/promotions/${promotion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promotion.isActive }),
      });
      if (response.ok) {
        setToggleConfirm(null);
        load();
        return;
      }

      showSnackbar("เปลี่ยนสถานะโปรโมชันไม่สำเร็จ", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const requestToggleActive = (promotion: Promotion) => {
    if (promotion.isActive) {
      setToggleConfirm({ promotionId: promotion.id, nextActive: false });
      return;
    }

    void handleToggleActive(promotion);
  };

  const confirmedPromotion = toggleConfirm
    ? promotions.find((promotion) => promotion.id === toggleConfirm.promotionId) ?? null
    : null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Tag size="28" color="#d71414" variant="Bold" />
          <Typography variant="h5" fontWeight={900}>จัดการโปรโมชั่น</Typography>
        </Stack>
        <Button variant="contained" startIcon={<Add size="18" color="white" />} onClick={openCreate} sx={{ borderRadius: 2.5, fontWeight: 800 }}>
          เพิ่มโปรโมชัน
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.100", overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 800 }}>โปรโมชัน</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>รายละเอียด</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">ลำดับ</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>สถานะ</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar src={promotion.imageUrl || undefined} variant="rounded" sx={{ width: 52, height: 52, bgcolor: "grey.100" }}>
                          <Gallery size="20" color="#ccc" />
                        </Avatar>
                        <Typography fontWeight={800}>{promotion.title}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {promotion.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="right"><Typography fontWeight={700}>{promotion.sortOrder}</Typography></TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={<Switch checked={promotion.isActive} disabled={updatingId === promotion.id} onChange={() => requestToggleActive(promotion)} size="small" />}
                        label=""
                        sx={{ m: 0 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" gap={0.5} justifyContent="flex-end">
                        <Tooltip title="แก้ไข"><IconButton size="small" onClick={() => openEdit(promotion)}><Edit2 size="16" color="#666" /></IconButton></Tooltip>
                        <Tooltip title="ลบ"><IconButton size="small" onClick={() => setDeleteConfirm(promotion.id)}><Trash size="16" color="#d71414" /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {promotions.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.disabled" }}>ยังไม่มีโปรโมชัน</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>{editingId ? "แก้ไขโปรโมชัน" : "เพิ่มโปรโมชัน"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ImageUploader
                ref={imageRef}
                value={form.imageUrl}
                onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
                endpoint="/api/admin/upload?folder=promotions"
                size={150}
              />
            </Box>
            <TextField label="ชื่อโปรโมชัน" fullWidth value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            <TextField label="รายละเอียด" fullWidth multiline rows={5} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            <TextField label="ลำดับการแสดง" type="number" fullWidth inputProps={{ min: 0 }} value={form.sortOrder} onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))} />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(_, checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />} label="เปิดใช้งานโปรโมชัน" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} startIcon={<CloseCircle size="16" color="currentColor" />} sx={{ fontWeight: 700 }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <TickCircle size="16" color="white" />} sx={{ fontWeight: 800, borderRadius: 2.5 }}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        message="คุณต้องการลบโปรโมชันนี้ใช่หรือไม่?"
        loading={Boolean(deleteConfirm && deletingId === deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && void handleDelete(deleteConfirm)}
      />

      <ConfirmActionDialog
        open={!!toggleConfirm}
        title="ยืนยันการปิดใช้งานโปรโมชัน"
        message={confirmedPromotion ? `คุณต้องการปิดใช้งานโปรโมชัน ${confirmedPromotion.title} ใช่หรือไม่? เมื่่อปิดแล้วโปรโมชันนี้จะไม่แสดงบนหน้าเว็บไซต์` : "คุณต้องการปิดใช้งานโปรโมชันนี้ใช่หรือไม่?"}
        confirmText="ปิดใช้งาน"
        confirmColor="warning"
        loadingText="กำลังอัปเดตสถานะ..."
        loading={Boolean(toggleConfirm && updatingId === toggleConfirm.promotionId)}
        onClose={() => setToggleConfirm(null)}
        onConfirm={() => confirmedPromotion && void handleToggleActive(confirmedPromotion)}
      />
    </Box>
  );
}