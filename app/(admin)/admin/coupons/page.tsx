"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
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
import { Add, Edit2, TickCircle, CloseCircle, Trash, TicketDiscount } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: "FIXED" | "PERCENT";
  value: number;
  minSubtotal: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

const EMPTY_FORM = {
  code: "",
  name: "",
  description: "",
  type: "FIXED" as "FIXED" | "PERCENT",
  value: "",
  minSubtotal: "",
  maxDiscount: "",
  usageLimit: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
};

function toDayjsValue(value: string | null) {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

function formatCouponDate(value: string | null) {
  if (!value) return null;

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : null;
}

export default function AdminCouponsPage() {
  const { showSnackbar } = useSnackbar();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<{ couponId: string; nextActive: boolean } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/coupons");
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setCoupons([]);
        showSnackbar(typeof data?.error === "string" ? data.error : "ไม่สามารถโหลดคูปองส่วนลดได้", "error");
        return;
      }

      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      setCoupons([]);
      showSnackbar("ไม่สามารถโหลดคูปองส่วนลดได้", "error");
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

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description ?? "",
      type: coupon.type,
      value: String(coupon.value),
      minSubtotal: coupon.minSubtotal == null ? "" : String(coupon.minSubtotal),
      maxDiscount: coupon.maxDiscount == null ? "" : String(coupon.maxDiscount),
      usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit),
      isActive: coupon.isActive,
      startsAt: coupon.startsAt ?? "",
      endsAt: coupon.endsAt ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      showSnackbar("กรุณากรอกรหัสคูปองและชื่อคูปอง", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        value: form.value === "" ? null : Number(form.value),
        minSubtotal: form.minSubtotal === "" ? null : Number(form.minSubtotal),
        maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
        usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      };

      const response = editingId
        ? await fetch(`/api/admin/coupons/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showSnackbar(typeof data?.error === "string" ? data.error : "ไม่สามารถบันทึกคูปองส่วนลดได้", "error");
        return;
      }

      showSnackbar(editingId ? "แก้ไขคูปองสำเร็จ" : "เพิ่มคูปองสำเร็จ", "success");
      setDialogOpen(false);
      load();
    } catch {
      showSnackbar("ไม่สามารถบันทึกคูปองส่วนลดได้", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (response.ok) {
        showSnackbar("ลบคูปองสำเร็จ", "success");
        setDeleteConfirm(null);
        load();
      } else {
        const data = await response.json().catch(() => null);
        showSnackbar(typeof data?.error === "string" ? data.error : "เกิดข้อผิดพลาดในการลบคูปอง", "error");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setUpdatingId(coupon.id);
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      if (response.ok) {
        setToggleConfirm(null);
        load();
        return;
      }

      const data = await response.json().catch(() => null);
      showSnackbar(typeof data?.error === "string" ? data.error : "ไม่สามารถอัปเดตสถานะคูปองได้", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const requestToggleActive = (coupon: Coupon) => {
    if (coupon.isActive) {
      setToggleConfirm({ couponId: coupon.id, nextActive: false });
      return;
    }

    void handleToggleActive(coupon);
  };

  const sortedCoupons = useMemo(
    () => [...coupons].sort((left, right) => right.code.localeCompare(left.code)),
    [coupons]
  );

  const confirmedCoupon = toggleConfirm
    ? coupons.find((coupon) => coupon.id === toggleConfirm.couponId) ?? null
    : null;
  const startsAtValue = toDayjsValue(form.startsAt || null);
  const endsAtValue = toDayjsValue(form.endsAt || null);

  const handleStartsAtChange = (value: Dayjs | null) => {
    setForm((prev) => ({
      ...prev,
      startsAt: value ? value.startOf("day").toISOString() : "",
    }));
  };

  const handleEndsAtChange = (value: Dayjs | null) => {
    setForm((prev) => ({
      ...prev,
      endsAt: value ? value.endOf("day").toISOString() : "",
    }));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <TicketDiscount size="28" color="#d71414" variant="Bold" />
          <Typography variant="h5" fontWeight={900}>จัดการคูปองส่วนลด</Typography>
        </Stack>
        <Button variant="contained" startIcon={<Add size="18" color="white" />} onClick={openCreate} sx={{ borderRadius: 2.5, fontWeight: 800 }}>
          เพิ่มคูปอง
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
                  <TableCell sx={{ fontWeight: 800 }}>คูปอง</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>ส่วนลด</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>เงื่อนไข</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>จำนวนคูปอง</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>ช่วงเวลา</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>สถานะ</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedCoupons.map((coupon) => (
                  <TableRow key={coupon.id} hover>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Chip label={coupon.code} color="error" size="small" sx={{ fontWeight: 900 }} />
                          <Typography fontWeight={800}>{coupon.name}</Typography>
                        </Stack>
                        {coupon.description && (
                          <Typography variant="body2" color="text.secondary">{coupon.description}</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={800}>
                        {coupon.type === "PERCENT" ? `${coupon.value}%` : `฿${coupon.value.toLocaleString()}`}
                      </Typography>
                      {coupon.type === "PERCENT" && coupon.maxDiscount != null && (
                        <Typography variant="caption" color="text.secondary">สูงสุด ฿{coupon.maxDiscount.toLocaleString()}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {coupon.minSubtotal != null ? `ขั้นต่ำ ฿${coupon.minSubtotal.toLocaleString()}` : "ไม่มีขั้นต่ำ"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>
                        {coupon.usageLimit != null ? `${coupon.usageCount.toLocaleString()} / ${coupon.usageLimit.toLocaleString()}` : "ไม่จำกัด"}
                      </Typography>
                      {coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit && (
                        <Typography variant="caption" color="error.main">ใช้ครบจำนวนแล้ว</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {formatCouponDate(coupon.startsAt) ?? "เริ่มทันที"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {coupon.endsAt ? `ถึง ${formatCouponDate(coupon.endsAt)}` : "ไม่กำหนดวันหมดอายุ"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={<Switch checked={coupon.isActive} disabled={updatingId === coupon.id} onChange={() => requestToggleActive(coupon)} size="small" />}
                        label=""
                        sx={{ m: 0 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" gap={0.5} justifyContent="flex-end">
                        <Tooltip title="แก้ไข"><IconButton size="small" onClick={() => openEdit(coupon)}><Edit2 size="16" color="#666" /></IconButton></Tooltip>
                        <Tooltip title="ลบ"><IconButton size="small" onClick={() => setDeleteConfirm(coupon.id)}><Trash size="16" color="#d71414" /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedCoupons.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.disabled" }}>ยังไม่มีคูปองส่วนลด</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 900 }}>{editingId ? "แก้ไขคูปองส่วนลด" : "เพิ่มคูปองส่วนลด"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} pt={1}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="รหัสคูปอง" fullWidth value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} />
                <TextField label="ชื่อคูปอง" fullWidth value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              </Stack>
              <TextField label="คำอธิบาย" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select label="ประเภทส่วนลด" fullWidth value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as "FIXED" | "PERCENT" }))}>
                  <MenuItem value="FIXED">ส่วนลดแบบจำนวนเงิน</MenuItem>
                  <MenuItem value="PERCENT">ส่วนลดแบบเปอร์เซ็นต์</MenuItem>
                </TextField>
                <TextField label={form.type === "PERCENT" ? "เปอร์เซ็นต์ส่วนลด" : "จำนวนเงินส่วนลด"} type="number" fullWidth inputProps={{ min: 0, max: form.type === "PERCENT" ? 100 : undefined, step: "0.01" }} value={form.value} onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))} />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="ยอดขั้นต่ำ" type="number" fullWidth inputProps={{ min: 0, step: "0.01" }} value={form.minSubtotal} onChange={(e) => setForm((prev) => ({ ...prev, minSubtotal: e.target.value }))} helperText="เว้นว่างได้ถ้าไม่มีขั้นต่ำ" />
                <TextField label="ส่วนลดสูงสุด" type="number" fullWidth disabled={form.type !== "PERCENT"} inputProps={{ min: 0, step: "0.01" }} value={form.maxDiscount} onChange={(e) => setForm((prev) => ({ ...prev, maxDiscount: e.target.value }))} helperText={form.type === "PERCENT" ? "ใช้เฉพาะคูปองเปอร์เซ็นต์" : "ไม่ใช้กับคูปองจำนวนเงิน"} />
              </Stack>
              <TextField
                label="จำนวนคูปองใช้ได้"
                type="number"
                fullWidth
                inputProps={{ min: 1, step: 1 }}
                value={form.usageLimit}
                onChange={(e) => setForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
                helperText="เช่น 10 = ใช้ได้รวม 10 ออเดอร์, เว้นว่าง = ไม่จำกัด"
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <DatePicker
                  label="เริ่มใช้งาน"
                  value={startsAtValue}
                  onChange={handleStartsAtChange}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
                <DatePicker
                  label="หมดอายุ"
                  value={endsAtValue}
                  onChange={handleEndsAtChange}
                  format="DD/MM/YYYY"
                  minDate={startsAtValue ?? undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: "เว้นว่างได้หากไม่กำหนดวันหมดอายุ",
                    },
                  }}
                />
              </Stack>
              <FormControlLabel control={<Switch checked={form.isActive} onChange={(_, checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />} label="เปิดใช้งานคูปอง" />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setDialogOpen(false)} startIcon={<CloseCircle size="16" color="currentColor" />} sx={{ fontWeight: 700 }}>ยกเลิก</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <TickCircle size="16" color="white" />} sx={{ fontWeight: 800, borderRadius: 2.5 }}>บันทึก</Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        message="คุณต้องการลบคูปองส่วนลดนี้ใช่หรือไม่?"
        loading={Boolean(deleteConfirm && deletingId === deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && void handleDelete(deleteConfirm)}
      />

      <ConfirmActionDialog
        open={!!toggleConfirm}
        title="ยืนยันการปิดใช้งานคูปอง"
        message={confirmedCoupon ? `คุณต้องการปิดใช้งานคูปอง ${confirmedCoupon.code} ใช่หรือไม่? เมื่่อปิดแล้วลูกค้าจะไม่สามารถใช้คูปองนี้ใน checkout ได้` : "คุณต้องการปิดใช้งานคูปองนี้ใช่หรือไม่?"}
        confirmText="ปิดใช้งาน"
        confirmColor="warning"
        loadingText="กำลังอัปเดตสถานะ..."
        loading={Boolean(toggleConfirm && updatingId === toggleConfirm.couponId)}
        onClose={() => setToggleConfirm(null)}
        onConfirm={() => confirmedCoupon && void handleToggleActive(confirmedCoupon)}
      />
    </Box>
  );
}