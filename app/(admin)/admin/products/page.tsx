"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, Paper, Stack, Button, IconButton, TextField,
  InputAdornment, Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, Avatar, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { Add, Edit2, Trash, SearchNormal1, Shop, TickCircle, CloseCircle, Gallery } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import MultiImageUploader, { MultiImageUploaderRef } from "@/components/MultiImageUploader";

interface Brand { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; description?: string | null; price: number; discount: number | null;
  image: string | null; stock: number; isActive: boolean; isBestSeller: boolean; brandId: string;
  brand: { name: string };
  unitsPerCase: number | null; unitLabel: string | null; caseLabel: string | null;
  images?: { id: string; url: string; sortOrder: number }[];
}

const EMPTY_FORM = { name: "", slug: "", description: "", price: 0, discount: "", image: "", images: [] as string[], stock: 0, isActive: true, isBestSeller: false, brandId: "", unitsPerCase: "", unitLabel: "", caseLabel: "" };

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminProductsPage() {
  const { showSnackbar } = useSnackbar();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>(""); // "" = all
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const uploaderRef = useRef<MultiImageUploaderRef>(null);

  // Build upload endpoint based on current form brand only (not slug — avoids broken paths on rename)
  const uploadEndpoint = React.useMemo(() => {
    const brandSlug = brands.find((b) => b.id === form.brandId)?.name
      .toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ?? "unknown";
    return `/api/admin/upload?folder=products/${brandSlug}`;
  }, [form.brandId, brands]);

  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, bRes] = await Promise.all([fetch("/api/admin/products"), fetch("/api/admin/brands")]);
    setProducts(await pRes.json());
    setBrands(await bRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.name.toLowerCase().includes(search.toLowerCase());
    const matchBrand = filterBrand === "" || p.brandId === filterBrand;
    return matchSearch && matchBrand;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    const galleryImages = p.images?.length
      ? p.images.map((image) => image.url)
      : p.image
        ? [p.image]
        : [];
    setForm({ name: p.name, slug: p.slug, description: p.description ?? "", price: p.price, discount: p.discount !== null ? String(p.discount) : "", image: p.image ?? "", images: galleryImages, stock: p.stock, isActive: p.isActive, isBestSeller: p.isBestSeller, brandId: p.brandId, unitsPerCase: p.unitsPerCase !== null ? String(p.unitsPerCase) : "", unitLabel: p.unitLabel ?? "", caseLabel: p.caseLabel ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.brandId) { showSnackbar("กรุณากรอกข้อมูลให้ครบ", "error"); return; }
    const salePrice = Number(form.price);
    const regularPrice = form.discount !== "" ? Number(form.discount) : null;
    if (regularPrice !== null && regularPrice <= salePrice) {
      showSnackbar("ราคาปกติต้องมากกว่าราคาขาย หากต้องการแสดงราคาขีดฆ่า", "error");
      return;
    }
    setSaving(true);
    try {
      const imageUrls = await uploaderRef.current?.upload() ?? form.images;
      const payload = { ...form, image: imageUrls[0] ?? "", images: imageUrls, price: salePrice, discount: regularPrice, stock: Number(form.stock), unitsPerCase: form.unitsPerCase !== "" ? Number(form.unitsPerCase) : null, unitLabel: form.unitLabel || null, caseLabel: form.caseLabel || null, isBestSeller: form.isBestSeller };
      const res = editingId
        ? await fetch(`/api/admin/products/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { showSnackbar("เกิดข้อผิดพลาด", "error"); return; }
      showSnackbar(editingId ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ", "success");
      setDialogOpen(false);
      load();
    } catch {
      showSnackbar("อัปโหลดรูปไม่สำเร็จ", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) { showSnackbar("ลบสำเร็จ", "success"); load(); }
    else showSnackbar("เกิดข้อผิดพลาด", "error");
    setDeleteConfirm(null);
  };

  const handleToggle = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) });
    load();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Shop size="28" color="#d71414" variant="Bold" />
          <Typography variant="h5" fontWeight={900}>จัดการสินค้า</Typography>
        </Stack>
        <Button variant="contained" startIcon={<Add size="18" color="white" />} onClick={openCreate} sx={{ borderRadius: 2.5, fontWeight: 800 }}>
          เพิ่มสินค้า
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.100" }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField
            size="small" placeholder="ค้นหาสินค้า..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: "100%", md: 300 }, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchNormal1 size="18" color="#999" /></InputAdornment> }}
          />
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip
              label="ทั้งหมด"
              clickable
              onClick={() => setFilterBrand("")}
              color={filterBrand === "" ? "primary" : "default"}
              variant={filterBrand === "" ? "filled" : "outlined"}
              sx={{ fontWeight: 700 }}
            />
            {brands.map((b) => (
              <Chip
                key={b.id}
                label={b.name}
                clickable
                onClick={() => setFilterBrand(filterBrand === b.id ? "" : b.id)}
                color={filterBrand === b.id ? "primary" : "default"}
                variant={filterBrand === b.id ? "filled" : "outlined"}
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.100", overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 800 }}>สินค้า</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>แบรนด์</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">ราคา</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">สต็อก</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>สถานะ</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar src={p.image ?? undefined} variant="rounded" sx={{ width: 44, height: 44, bgcolor: "grey.100" }}>
                          <Gallery size="20" color="#ccc" />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700} fontSize="0.9rem">{p.name}</Typography>
                          <Stack direction="row" gap={0.5} mt={0.3}>
                            {p.isBestSeller && <Chip label="ขายดี" size="small" color="warning" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800 }} />}
                          </Stack>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell><Chip label={p.brand.name} size="small" sx={{ fontWeight: 700, bgcolor: "grey.100" }} /></TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={800}>ราคาขาย ฿{p.price.toLocaleString()}</Typography>
                      {p.discount && <Typography variant="caption" display="block" color="text.secondary" sx={{ textDecoration: "line-through" }}>ราคาปกติ ฿{p.discount.toLocaleString()}</Typography>}
                      {p.unitsPerCase && <Typography variant="caption" display="block" color="text.secondary">1 {p.caseLabel || "ลัง"} = {p.unitsPerCase} {p.unitLabel || "ชิ้น"}</Typography>}
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={p.stock} size="small" color={p.stock > 10 ? "success" : p.stock > 0 ? "warning" : "error"} sx={{ fontWeight: 800 }} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={p.isActive} onChange={() => handleToggle(p)} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" gap={0.5} justifyContent="flex-end">
                        <Tooltip title="แก้ไข"><IconButton size="small" onClick={() => openEdit(p)}><Edit2 size="16" color="#666" /></IconButton></Tooltip>
                        <Tooltip title="ลบ"><IconButton size="small" onClick={() => setDeleteConfirm(p.id)}><Trash size="16" color="#d71414" /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>ไม่พบสินค้า</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>{editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <MultiImageUploader
                ref={uploaderRef}
                value={form.images}
                onChange={(urls) => setForm((p) => ({ ...p, images: urls, image: urls[0] ?? "" }))}
                endpoint={uploadEndpoint}
              />
            <TextField label="ชื่อสินค้า" fullWidth value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))} />
            <TextField label="Slug (URL)" fullWidth value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>แบรนด์</InputLabel>
              <Select value={form.brandId} label="แบรนด์" onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}>
                {brands.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
              <TextField label="ราคาขาย (ลูกค้าจ่ายจริง)" type="number" inputProps={{ min: 0 }} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} helperText="ราคาที่แสดงเป็นตัวหลักบนหน้าเว็บ" />
              <TextField label="ราคาปกติเดิม" type="number" inputProps={{ min: 0 }} value={form.discount} onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} placeholder="ไม่ระบุ" helperText="ใช้สำหรับราคาโดนขีดฆ่า ต้องมากกว่าราคาขาย" />
              <TextField label="สต็อก" type="number" inputProps={{ min: 0 }} value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
              <TextField label="จำนวนต่อลัง" type="number" inputProps={{ min: 1 }} value={form.unitsPerCase} onChange={(e) => setForm((p) => ({ ...p, unitsPerCase: e.target.value }))} placeholder="เช่น 24" />
              <TextField label="หน่วยย่อย" value={form.unitLabel} onChange={(e) => setForm((p) => ({ ...p, unitLabel: e.target.value }))} placeholder="เช่น ซอง" />
              <TextField label="หน่วยหลัก" value={form.caseLabel} onChange={(e) => setForm((p) => ({ ...p, caseLabel: e.target.value }))} placeholder="เช่น ลัง" />
            </Box>
            <TextField label="รายละเอียด" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <FormControlLabel control={<Switch checked={form.isBestSeller} onChange={(e) => setForm((p) => ({ ...p, isBestSeller: e.target.checked }))} color="warning" />} label="สินค้าขายดี (Best Seller)" />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />} label="เปิดขาย" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} startIcon={<CloseCircle size="16" color="currentColor" />} sx={{ fontWeight: 700 }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <TickCircle size="16" color="white" />} sx={{ fontWeight: 800, borderRadius: 2.5 }}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>ยืนยันการลบ</DialogTitle>
        <DialogContent><Typography>คุณต้องการลบสินค้านี้ใช่หรือไม่?</Typography></DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ fontWeight: 700 }}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} sx={{ fontWeight: 800, borderRadius: 2.5 }}>ลบ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
