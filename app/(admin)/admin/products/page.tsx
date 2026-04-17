"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Grid, Typography, Paper, Stack, Button, IconButton, TextField,
  InputAdornment, Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, Avatar, Tooltip,
  ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
} from "@mui/material";
import { Add, Edit2, Trash, SearchNormal1, Shop, TickCircle, CloseCircle, Gallery } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import MultiImageUploader, { MultiImageUploaderRef } from "@/components/MultiImageUploader";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface Brand { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; description?: string | null; price: number; discount: number | null;
  image: string | null; stock: number; isActive: boolean; isBestSeller: boolean; brandId: string;
  brand: { name: string };
  unitsPerCase: number | null; unitLabel: string | null; caseLabel: string | null;
  sellMode: string; unitPrice: number | null;
  images?: { id: string; url: string; sortOrder: number }[];
}

const EMPTY_FORM = { name: "", slug: "", description: "", price: 0, discount: "", image: "", images: [] as string[], stock: 999, isActive: true, isBestSeller: false, brandId: "", unitsPerCase: "", unitLabel: "", caseLabel: "", sellMode: "CASE_ONLY", unitPrice: "" };

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<{ productId: string; nextActive: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
    setForm({ name: p.name, slug: p.slug, description: p.description ?? "", price: p.price, discount: p.discount !== null ? String(p.discount) : "", image: p.image ?? "", images: galleryImages, stock: p.stock, isActive: p.isActive, isBestSeller: p.isBestSeller, brandId: p.brandId, unitsPerCase: p.unitsPerCase !== null ? String(p.unitsPerCase) : "", unitLabel: p.unitLabel ?? "", caseLabel: p.caseLabel ?? "", sellMode: p.sellMode, unitPrice: p.unitPrice !== null ? String(p.unitPrice) : "" });
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
      const payload = { ...form, image: imageUrls[0] ?? "", images: imageUrls, price: salePrice, discount: regularPrice, stock: Number(form.stock), unitsPerCase: form.unitsPerCase !== "" ? Number(form.unitsPerCase) : null, unitLabel: form.unitLabel || null, caseLabel: form.caseLabel || null, sellMode: form.sellMode, unitPrice: form.sellMode === "BOTH" && form.unitPrice !== "" ? Number(form.unitPrice) : null, isBestSeller: form.isBestSeller };
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
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
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

  const handleToggle = async (p: Product) => {
    setUpdatingId(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) });
      if (res.ok) {
        setToggleConfirm(null);
        load();
        return;
      }

      showSnackbar("เปลี่ยนสถานะสินค้าไม่สำเร็จ", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const requestToggle = (product: Product) => {
    if (product.isActive) {
      setToggleConfirm({ productId: product.id, nextActive: false });
      return;
    }

    void handleToggle(product);
  };

  const confirmedProduct = toggleConfirm
    ? products.find((product) => product.id === toggleConfirm.productId) ?? null
    : null;

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
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ width: { xs: "100%", md: 300 }, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchNormal1 size="18" color="#999" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 240 } }}>
            <InputLabel id="brand-filter-label">กรองตามแบรนด์</InputLabel>
            <Select
              labelId="brand-filter-label"
              value={filterBrand}
              label="กรองตามแบรนด์"
              onChange={(e) => { setFilterBrand(e.target.value); setPage(0); }}
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              {brands.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
                {paginated.map((p) => (
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
                      <Typography fontWeight={800}>
                        ฿{p.price.toLocaleString()}
                        <Typography component="span" variant="caption" color="text.secondary"> / {p.sellMode === "UNIT_ONLY" ? (p.unitLabel || "ชิ้น") : (p.caseLabel || "ลัง")}</Typography>
                      </Typography>
                      {p.discount && <Typography variant="caption" display="block" color="text.secondary" sx={{ textDecoration: "line-through" }}>฿{p.discount.toLocaleString()}</Typography>}
                      {p.unitsPerCase && <Typography variant="caption" display="block" color="text.disabled">1 {p.caseLabel || "ลัง"} = {p.unitsPerCase} {p.unitLabel || "ชิ้น"}</Typography>}
                      {p.sellMode === "BOTH" && p.unitPrice != null && <Typography variant="caption" display="block" color="primary.main" fontWeight={700}>฿{p.unitPrice.toLocaleString()} / {p.unitLabel || "ชิ้น"}</Typography>}
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={p.stock} size="small" color={p.stock > 10 ? "success" : p.stock > 0 ? "warning" : "error"} sx={{ fontWeight: 800 }} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={p.isActive} disabled={updatingId === p.id} onChange={() => requestToggle(p)} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" gap={0.5} justifyContent="flex-end">
                        <Tooltip title="แก้ไข"><IconButton size="small" onClick={() => openEdit(p)}><Edit2 size="16" color="#475569" /></IconButton></Tooltip>
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
        {!loading && filtered.length > 0 && (
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="แสดง:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count}`}
            sx={{ borderTop: "1px solid", borderColor: "grey.100" }}
          />
        )}
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900, py: 2, px: 3, borderBottom: "1px solid", borderColor: "grey.100" }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Shop size="22" color="#d71414" variant="Bold" />
            {editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Grid container>
            {/* Left: Images + Basic info */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ p: 3, borderRight: { md: "1px solid" }, borderColor: { md: "grey.100" } }}>
              <Stack spacing={2}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" lineHeight={1}>ข้อมูลพื้นฐาน</Typography>
                <MultiImageUploader
                  ref={uploaderRef}
                  value={form.images}
                  onChange={(urls) => setForm((p) => ({ ...p, images: urls, image: urls[0] ?? "" }))}
                  endpoint={uploadEndpoint}
                />
                <TextField
                  label="ชื่อสินค้า" fullWidth size="small"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))}
                />
                <TextField
                  label="Slug (URL)" fullWidth size="small"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>แบรนด์</InputLabel>
                  <Select value={form.brandId} label="แบรนด์" onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}>
                    {brands.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  label="รายละเอียดสินค้า" fullWidth multiline rows={4} size="small"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </Stack>
            </Grid>

            {/* Right: Packaging + Sell mode + Pricing */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ p: 3 }}>
              <Stack spacing={3}>

                {/* Section: บรรจุภัณฑ์ */}
                <Box>
                  <Typography variant="overline" fontWeight={800} color="text.secondary" display="block" lineHeight={1} mb={2}>
                    บรรจุภัณฑ์
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
                      <TextField
                        label="หน่วยหลัก" size="small"
                        placeholder="ลัง"
                        value={form.caseLabel}
                        onChange={(e) => setForm((p) => ({ ...p, caseLabel: e.target.value }))}
                        helperText='เช่น "ลัง", "กล่อง"'
                      />
                      <TextField
                        label="หน่วยย่อย" size="small"
                        placeholder="ซอง"
                        value={form.unitLabel}
                        onChange={(e) => setForm((p) => ({ ...p, unitLabel: e.target.value }))}
                        helperText='เช่น "ซอง", "ชิ้น"'
                      />
                      <TextField
                        label="จำนวน / หน่วยหลัก" size="small" type="number"
                        inputProps={{ min: 1 }}
                        placeholder="24"
                        value={form.unitsPerCase}
                        onChange={(e) => setForm((p) => ({ ...p, unitsPerCase: e.target.value }))}
                        helperText="เช่น 1 ลัง = 24 ซอง"
                      />
                    </Box>
                    {form.caseLabel && form.unitLabel && form.unitsPerCase && (
                      <Box sx={{ px: 2, py: 1, bgcolor: "#f0f9ff", borderRadius: 2, border: "1px solid #bae6fd" }}>
                        <Typography variant="body2" color="#0369a1" fontWeight={700}>
                          1 {form.caseLabel} = {form.unitsPerCase} {form.unitLabel}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* Section: รูปแบบการขาย */}
                <Box>
                  <Typography variant="overline" fontWeight={800} color="text.secondary" display="block" lineHeight={1} mb={2}>
                    รูปแบบการขาย
                  </Typography>
                  <ToggleButtonGroup
                    value={form.sellMode}
                    exclusive
                    onChange={(_, v) => v && setForm((p) => ({ ...p, sellMode: v, unitPrice: v !== "BOTH" ? "" : p.unitPrice }))}
                    fullWidth
                    sx={{
                      gap: 1,
                      "& .MuiToggleButtonGroup-grouped": { border: "1px solid !important", borderRadius: "10px !important", mx: 0 },
                      "& .MuiToggleButton-root": {
                        py: 1.5, flex: 1, fontWeight: 700, fontSize: "0.82rem",
                        color: "text.secondary", borderColor: "grey.300 !important",
                        "&.Mui-selected": { bgcolor: "primary.main", color: "white", borderColor: "primary.main !important" },
                      },
                    }}
                  >
                    <ToggleButton value="CASE_ONLY">ขายเป็น{form.caseLabel || "ลัง"}</ToggleButton>
                    <ToggleButton value="UNIT_ONLY">ขายเป็น{form.unitLabel || "ซอง"}</ToggleButton>
                    <ToggleButton value="BOTH">ขายได้ทั้งคู่</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Section: ราคาและสต็อก */}
                <Box>
                  <Typography variant="overline" fontWeight={800} color="text.secondary" display="block" lineHeight={1} mb={2}>
                    ราคาและสต็อก
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                      <TextField
                        label={`ราคาขาย / ${form.sellMode === "UNIT_ONLY" ? (form.unitLabel || "ซอง") : (form.caseLabel || "ลัง")}`}
                        size="small" type="number" inputProps={{ min: 0 }}
                        value={form.price}
                        onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                        InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
                        helperText="ราคาแสดงหลักบนเว็บ"
                      />
                      {form.sellMode === "BOTH" ? (
                        <TextField
                          label={`ราคาขาย / ${form.unitLabel || "ซอง"}`}
                          size="small" type="number" inputProps={{ min: 0, step: "0.01" }}
                          value={form.unitPrice}
                          onChange={(e) => setForm((p) => ({ ...p, unitPrice: e.target.value }))}
                          InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
                          helperText={`ซื้อทีละ${form.unitLabel || "ซอง"}`}
                        />
                      ) : (
                        <TextField
                          label="ราคาปกติ (ขีดฆ่า)"
                          size="small" type="number" inputProps={{ min: 0 }}
                          value={form.discount}
                          onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
                          placeholder="ไม่ระบุ"
                          InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
                          helperText="ต้องมากกว่าราคาขาย"
                        />
                      )}
                    </Box>
                    {form.sellMode === "BOTH" && (
                      <TextField
                        label="ราคาปกติ (ขีดฆ่า)"
                        size="small" type="number" inputProps={{ min: 0 }}
                        value={form.discount}
                        onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
                        placeholder="ไม่ระบุ"
                        fullWidth
                        InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
                        helperText="ราคาโดนขีดฆ่า ต้องมากกว่าราคาขาย"
                      />
                    )}
                    <TextField
                      label="สต็อก" size="small" type="number" inputProps={{ min: 0 }}
                      value={form.stock}
                      onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                      helperText="ใส่ 0 = หมดสต็อก"
                      fullWidth
                    />
                  </Stack>
                </Box>

                {/* Settings */}
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <FormControlLabel
                    control={<Switch checked={form.isBestSeller} onChange={(e) => setForm((p) => ({ ...p, isBestSeller: e.target.checked }))} color="warning" size="small" />}
                    label={<Typography variant="body2" fontWeight={700}>สินค้าขายดี</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} size="small" />}
                    label={<Typography variant="body2" fontWeight={700}>เปิดขาย</Typography>}
                  />
                </Box>

              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "grey.100" }}>
          <Button onClick={() => setDialogOpen(false)} startIcon={<CloseCircle size="16" color="#64748b" />} sx={{ fontWeight: 700 }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <TickCircle size="16" color="white" />} sx={{ fontWeight: 800, borderRadius: 2.5, px: 3 }}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        message="คุณต้องการลบสินค้านี้ใช่หรือไม่?"
        loading={Boolean(deleteConfirm && deletingId === deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && void handleDelete(deleteConfirm)}
      />

      <ConfirmActionDialog
        open={!!toggleConfirm}
        title="ยืนยันการปิดขายสินค้า"
        message={confirmedProduct ? `คุณต้องการปิดขายสินค้า ${confirmedProduct.name} ใช่หรือไม่? เมื่่อปิดแล้วสินค้านี้จะไม่แสดงให้ลูกค้าสั่งซื้อ` : "คุณต้องการปิดขายสินค้านี้ใช่หรือไม่?"}
        confirmText="ปิดขาย"
        confirmColor="warning"
        loadingText="กำลังอัปเดตสถานะ..."
        loading={Boolean(toggleConfirm && updatingId === toggleConfirm.productId)}
        onClose={() => setToggleConfirm(null)}
        onConfirm={() => confirmedProduct && void handleToggle(confirmedProduct)}
      />
    </Box>
  );
}
