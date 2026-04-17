"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { Add, Edit2, Trash, Truck, TickCircle, CloseCircle } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  freeThreshold: number | null;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY: Omit<ShippingMethod, "id"> = {
  name: "",
  price: 0,
  freeThreshold: null,
  isActive: true,
  sortOrder: 0,
};

export default function ShippingMethodsPage() {
  const { showSnackbar } = useSnackbar();
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ShippingMethod, "id">>(EMPTY);
  const [hasFreeThreshold, setHasFreeThreshold] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<{ methodId: string; nextActive: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipping-methods");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMethods([]);
        showSnackbar(
          typeof data?.error === "string" ? data.error : "ไม่สามารถโหลดรูปแบบการจัดส่งได้",
          "error"
        );
        return;
      }

      setMethods(Array.isArray(data) ? data : []);
    } catch {
      setMethods([]);
      showSnackbar("ไม่สามารถโหลดรูปแบบการจัดส่งได้", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setHasFreeThreshold(false);
    setDialogOpen(true);
  };

  const openEdit = (m: ShippingMethod) => {
    setEditingId(m.id);
    setForm({ name: m.name, price: m.price, freeThreshold: m.freeThreshold, isActive: m.isActive, sortOrder: m.sortOrder });
    setHasFreeThreshold(m.freeThreshold !== null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showSnackbar("กรุณากรอกชื่อรูปแบบการจัดส่ง", "error"); return; }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      freeThreshold: hasFreeThreshold ? Number(form.freeThreshold ?? 0) : null,
    };
    try {
      const res = editingId
        ? await fetch(`/api/admin/shipping-methods/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/admin/shipping-methods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      if (!res.ok) { showSnackbar("เกิดข้อผิดพลาด", "error"); return; }
      showSnackbar(editingId ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ", "success");
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/shipping-methods/${id}`, { method: "DELETE" });
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

  const handleToggleActive = async (m: ShippingMethod) => {
    setUpdatingId(m.id);
    try {
      const res = await fetch(`/api/admin/shipping-methods/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !m.isActive }),
      });

      if (res.ok) {
        setToggleConfirm(null);
        load();
        return;
      }

      showSnackbar("เปลี่ยนสถานะรูปแบบการจัดส่งไม่สำเร็จ", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const requestToggleActive = (method: ShippingMethod) => {
    if (method.isActive) {
      setToggleConfirm({ methodId: method.id, nextActive: false });
      return;
    }

    void handleToggleActive(method);
  };

  const confirmedMethod = toggleConfirm
    ? methods.find((method) => method.id === toggleConfirm.methodId) ?? null
    : null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Truck size="28" color="#d71414" variant="Bold" />
          <Typography variant="h5" fontWeight={900}>รูปแบบการจัดส่ง</Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Add size="18" color="white" />}
          onClick={openCreate}
          sx={{ borderRadius: 2.5, fontWeight: 800 }}
        >
          เพิ่มรูปแบบการจัดส่ง
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : methods.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
            <Truck size="48" color="#ccc" variant="Bulk" />
            <Typography color="text.secondary" mt={2}>ยังไม่มีรูปแบบการจัดส่ง</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 800 }}>ชื่อ</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">ค่าจัดส่ง</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>จัดส่งฟรีเมื่อ</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>ลำดับ</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>สถานะ</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {methods.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{m.name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700}>฿{m.price.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>
                      {m.freeThreshold === null ? (
                        <Typography variant="body2" color="text.disabled">-</Typography>
                      ) : m.freeThreshold === 0 ? (
                        <Chip label="ฟรีเสมอ" size="small" color="success" />
                      ) : (
                        <Chip label={`ครบ ฿${m.freeThreshold.toLocaleString()}`} size="small" color="info" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{m.sortOrder}</Typography>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={m.isActive}
                        disabled={updatingId === m.id}
                        onChange={() => requestToggleActive(m)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" gap={0.5} justifyContent="flex-end">
                        <Tooltip title="แก้ไข">
                          <IconButton size="small" onClick={() => openEdit(m)}>
                            <Edit2 size="16" color="#666" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ลบ">
                          <IconButton size="small" onClick={() => setDeleteConfirm(m.id)}>
                            <Trash size="16" color="#d71414" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editingId ? "แก้ไขรูปแบบการจัดส่ง" : "เพิ่มรูปแบบการจัดส่ง"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <TextField
              label="ชื่อรูปแบบ"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="เช่น ไปรษณีย์ไทย (EMS)"
            />
            <TextField
              label="ค่าจัดส่ง (บาท)"
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
            />
            <FormControlLabel
              control={<Switch checked={hasFreeThreshold} onChange={(e) => setHasFreeThreshold(e.target.checked)} />}
              label="มีเงื่อนไขจัดส่งฟรี"
            />
            {hasFreeThreshold && (
              <TextField
                label="สั่งซื้อขั้นต่ำ (บาท) — ใส่ 0 = ฟรีเสมอ"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                value={form.freeThreshold ?? 0}
                onChange={(e) => setForm((p) => ({ ...p, freeThreshold: Number(e.target.value) }))}
                InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
                helperText="เช่น 1000 = ฟรีเมื่อสั่งซื้อครบ ฿1,000"
              />
            )}
            <TextField
              label="ลำดับการแสดง"
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
            />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />}
              label="เปิดใช้งาน"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} startIcon={<CloseCircle size="16" color="currentColor" />} sx={{ fontWeight: 700 }}>
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
        message="คุณต้องการลบรูปแบบการจัดส่งนี้ใช่หรือไม่?"
        loading={Boolean(deleteConfirm && deletingId === deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && void handleDelete(deleteConfirm)}
      />

      <ConfirmActionDialog
        open={!!toggleConfirm}
        title="ยืนยันการปิดใช้งานรูปแบบการจัดส่ง"
        message={confirmedMethod ? `คุณต้องการปิดใช้งาน ${confirmedMethod.name} ใช่หรือไม่? เมื่่อปิดแล้วลูกค้าจะไม่สามารถเลือกวิธีจัดส่งนี้ได้` : "คุณต้องการปิดใช้งานรูปแบบการจัดส่งนี้ใช่หรือไม่?"}
        confirmText="ปิดใช้งาน"
        confirmColor="warning"
        loadingText="กำลังอัปเดตสถานะ..."
        loading={Boolean(toggleConfirm && updatingId === toggleConfirm.methodId)}
        onClose={() => setToggleConfirm(null)}
        onConfirm={() => confirmedMethod && void handleToggleActive(confirmedMethod)}
      />
    </Box>
  );
}
