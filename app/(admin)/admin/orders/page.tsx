"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { Eye, ReceiptText, SearchNormal1, ShoppingCart, CloseCircle, Trash } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";

type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface AdminOrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  productSku: string | null;
  price: number;
  quantity: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  shippingCost: number;
  shippingMethodName: string | null;
  firstName: string;
  lastName: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
  phone: string;
  email: string | null;
  slipUrl: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

const STATUS_OPTIONS: Array<{ value: OrderStatus | "ALL"; label: string; color?: "warning" | "info" | "success" | "error" | "default" }> = [
  { value: "ALL", label: "ทุกสถานะ", color: "default" },
  { value: "PENDING", label: "รอชำระเงิน", color: "warning" },
  { value: "PAID", label: "ชำระแล้ว", color: "info" },
  { value: "PROCESSING", label: "กำลังเตรียมจัดส่ง", color: "info" },
  { value: "SHIPPED", label: "จัดส่งแล้ว", color: "info" },
  { value: "DELIVERED", label: "จัดส่งสำเร็จ", color: "success" },
  { value: "CANCELLED", label: "ยกเลิก", color: "error" },
];

const STATUS_META: Record<OrderStatus, { label: string; color: "warning" | "info" | "success" | "error" | "default" }> = {
  PENDING: { label: "รอชำระเงิน", color: "warning" },
  PAID: { label: "ชำระแล้ว", color: "info" },
  PROCESSING: { label: "กำลังเตรียมจัดส่ง", color: "info" },
  SHIPPED: { label: "จัดส่งแล้ว", color: "info" },
  DELIVERED: { label: "จัดส่งสำเร็จ", color: "success" },
  CANCELLED: { label: "ยกเลิก", color: "error" },
};

function formatMoney(value: number) {
  return `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminOrdersPage() {
  const { showSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ orderId: string; nextStatus: OrderStatus } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setOrders([]);
        showSnackbar(typeof data?.error === "string" ? data.error : "ไม่สามารถโหลดคำสั่งซื้อได้", "error");
        return;
      }

      setOrders(Array.isArray(data) ? (data as AdminOrder[]) : []);
    } catch {
      setOrders([]);
      showSnackbar("ไม่สามารถโหลดคำสั่งซื้อได้", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleteOrder = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ไม่สามารถลบคำสั่งซื้อได้");
      setOrders((prev) => prev.filter((o) => o.id !== id));
      showSnackbar("ลบคำสั่งซื้อเรียบร้อยแล้ว", "success");
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const parsedMinTotal = minTotal ? Number(minTotal) : null;
    const parsedMaxTotal = maxTotal ? Number(maxTotal) : null;
    const fromDate = dateFrom?.startOf("day").toDate() ?? null;
    const toDate = dateTo?.endOf("day").toDate() ?? null;

    return orders.filter((order) => {
      const matchedStatus = statusFilter === "ALL" || order.status === statusFilter;
      if (!matchedStatus) return false;

      const createdAt = new Date(order.createdAt);
      if (fromDate && createdAt < fromDate) return false;
      if (toDate && createdAt > toDate) return false;
      if (parsedMinTotal !== null && Number.isFinite(parsedMinTotal) && order.total < parsedMinTotal) return false;
      if (parsedMaxTotal !== null && Number.isFinite(parsedMaxTotal) && order.total > parsedMaxTotal) return false;

      if (!normalizedSearch) return true;

      const searchableFields = [
        order.orderNumber,
        `${order.firstName} ${order.lastName}`,
        order.phone,
        order.email ?? "",
      ].join(" ").toLowerCase();

      return searchableFields.includes(normalizedSearch);
    });
  }, [dateFrom, dateTo, maxTotal, minTotal, orders, searchTerm, statusFilter]);

  // Handle page change when filter changes
  useEffect(() => {
    setPage(0);
  }, [statusFilter, searchTerm, dateFrom, dateTo, minTotal, maxTotal]);

  const pagedOrders = useMemo(() => {
    return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  const summaryCards = useMemo(() => {
    return [
      { label: "ทั้งหมด", value: orders.length, color: "default" as const, status: "ALL" as const },
      { label: "รอชำระเงิน", value: orders.filter((order) => order.status === "PENDING").length, color: "warning" as const, status: "PENDING" as const },
      { label: "ชำระแล้ว", value: orders.filter((order) => order.status === "PAID").length, color: "info" as const, status: "PAID" as const },
      { label: "กำลังเตรียมจัดส่ง", value: orders.filter((order) => order.status === "PROCESSING").length, color: "info" as const, status: "PROCESSING" as const },
      { label: "จัดส่งแล้ว", value: orders.filter((order) => order.status === "SHIPPED").length, color: "info" as const, status: "SHIPPED" as const },
      { label: "จัดส่งสำเร็จ", value: orders.filter((order) => order.status === "DELIVERED").length, color: "success" as const, status: "DELIVERED" as const },
      { label: "ยกเลิก", value: orders.filter((order) => order.status === "CANCELLED").length, color: "error" as const, status: "CANCELLED" as const },
    ];
  }, [orders]);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showSnackbar(typeof data?.error === "string" ? data.error : "ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้", "error");
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? (data as AdminOrder) : order))
      );
      setSelectedOrder((currentOrder) => (currentOrder?.id === orderId ? (data as AdminOrder) : currentOrder));
      showSnackbar("อัปเดตสถานะคำสั่งซื้อแล้ว", "success");
    } catch {
      showSnackbar("ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const requestStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    if (nextStatus === "CANCELLED") {
      setStatusConfirm({ orderId, nextStatus });
      return;
    }

    void handleStatusChange(orderId, nextStatus);
  };

  const confirmedOrder = statusConfirm
    ? orders.find((order) => order.id === statusConfirm.orderId) ?? null
    : null;

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setDateFrom(null);
    setDateTo(null);
    setMinTotal("");
    setMaxTotal("");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} mb={3}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <ShoppingCart size="28" color="#d71414" variant="Bold" />
          <Box>
            <Typography variant="h5" fontWeight={900}>จัดการคำสั่งซื้อ</Typography>
            <Typography variant="body2" color="text.secondary">
              ตรวจสอบรายการสั่งซื้อ ดูสลิป และอัปเดตสถานะการดำเนินงานจากหน้าเดียว
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" onClick={load} sx={{ borderRadius: 2.5, fontWeight: 800 }}>
          รีเฟรชข้อมูล
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(7, 1fr)" }, gap: 2, mb: 3 }}>
        {summaryCards.map((card) => (
          <Paper 
            key={card.label} 
            elevation={0} 
            onClick={() => setStatusFilter(card.status)}
            sx={{ 
              p: 2.25, 
              borderRadius: 3, 
              border: "1px solid", 
              borderColor: statusFilter === card.status ? "primary.main" : "grey.200",
              bgcolor: statusFilter === card.status ? "rgba(215, 20, 20, 0.04)" : "white",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
              }
            }}
          >
            <Stack spacing={1}>
              <Chip label={card.label} color={card.color} size="small" sx={{ width: "fit-content", fontWeight: 800 }} />
              <Typography variant="h5" fontWeight={900}>{card.value.toLocaleString()}</Typography>
            </Stack>
          </Paper>
        ))}
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
        <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ค้นหาด้วยเลขออเดอร์ ชื่อลูกค้า เบอร์โทร หรืออีเมล"
                InputProps={{
                  startAdornment: <SearchNormal1 size="18" color="#999" style={{ marginRight: 8 }} />,
                }}
              />
              <TextField
                select
                label="สถานะ"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "ALL")}
                sx={{ minWidth: { xs: "100%", md: 220 } }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
              <DatePicker
                label="วันที่เริ่มต้น"
                value={dateFrom}
                onChange={(value) => setDateFrom(value)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { minWidth: { xs: "100%", md: 180 } },
                  },
                }}
              />
              <DatePicker
                label="วันที่สิ้นสุด"
                value={dateTo}
                onChange={(value) => setDateTo(value)}
                format="DD/MM/YYYY"
                minDate={dateFrom ?? undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { minWidth: { xs: "100%", md: 180 } },
                  },
                }}
              />
              <TextField
                label="ยอดขั้นต่ำ"
                type="number"
                value={minTotal}
                onChange={(event) => setMinTotal(event.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
                placeholder="เช่น 500"
                sx={{ minWidth: { xs: "100%", md: 160 } }}
              />
              <TextField
                label="ยอดสูงสุด"
                type="number"
                value={maxTotal}
                onChange={(event) => setMaxTotal(event.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
                placeholder="เช่น 3000"
                sx={{ minWidth: { xs: "100%", md: 160 } }}
              />
              <Button variant="text" onClick={resetFilters} sx={{ borderRadius: 2.5, fontWeight: 800, alignSelf: { xs: "flex-start", md: "center" } }}>
                ล้าง filter
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                แสดงผล {filteredOrders.length.toLocaleString()} จาก {orders.length.toLocaleString()} คำสั่งซื้อ
              </Typography>
              {(dateFrom || dateTo) && (
                <Typography variant="caption" color="text.secondary">
                  ช่วงวันที่ {dateFrom?.format("DD/MM/YYYY") || "-"} - {dateTo?.format("DD/MM/YYYY") || dayjs().format("DD/MM/YYYY")}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Paper>
      </LocalizationProvider>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : filteredOrders.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
            <ReceiptText size="48" color="#ccc" variant="Bulk" />
            <Typography color="text.secondary" mt={2}>ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข</Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 800 }}>เลขออเดอร์</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>ลูกค้า</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>ยอดชำระ</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>สลิป</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>สถานะ</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>วันที่สั่งซื้อ</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedOrders.map((order) => {
                    const status = STATUS_META[order.status];

                    return (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography fontWeight={900} color="primary.main">{order.orderNumber}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.items.length} รายการ
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={700}>{order.firstName} {order.lastName}</Typography>
                          <Typography variant="body2" color="text.secondary">{order.phone}</Typography>
                          {order.email && <Typography variant="caption" color="text.secondary">{order.email}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={800}>{formatMoney(order.total)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.shippingMethodName || "ไม่ระบุรูปแบบการจัดส่ง"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.slipUrl ? "มีสลิป" : "ยังไม่มีสลิป"}
                            color={order.slipUrl ? "success" : "default"}
                            size="small"
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <Stack spacing={1}>
                            <Chip label={status.label} color={status.color} size="small" sx={{ width: "fit-content", fontWeight: 800 }} />
                            <TextField
                              select
                              size="small"
                              value={order.status}
                              disabled={updatingId === order.id}
                              onChange={(event) => requestStatusChange(order.id, event.target.value as OrderStatus)}
                            >
                              {STATUS_OPTIONS.filter((option) => option.value !== "ALL").map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                              ))}
                            </TextField>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDateTime(order.createdAt)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {order.slipUrl && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setViewingSlipUrl(order.slipUrl)}
                                sx={{ borderRadius: 2.5, fontWeight: 700 }}
                              >
                                ดูสลิป
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<Eye size="16" color="white" />}
                              onClick={() => setSelectedOrder(order)}
                              sx={{ borderRadius: 2.5, fontWeight: 800 }}
                            >
                              รายละเอียด
                            </Button>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => setDeleteConfirmId(order.id)}
                            >
                              <Trash size="18" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="จำนวนแถวต่อหน้า:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`}
            />
          </Box>
        )}
      </Paper>

      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>
          {selectedOrder ? `คำสั่งซื้อ #${selectedOrder.orderNumber}` : "รายละเอียดคำสั่งซื้อ"}
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Stack spacing={3}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">ลูกค้า</Typography>
                  <Typography fontWeight={800}>{selectedOrder.firstName} {selectedOrder.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedOrder.phone}</Typography>
                  {selectedOrder.email && <Typography variant="body2" color="text.secondary">{selectedOrder.email}</Typography>}
                </Box>
                <Stack spacing={1} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                  <Chip label={STATUS_META[selectedOrder.status].label} color={STATUS_META[selectedOrder.status].color} sx={{ fontWeight: 800 }} />
                  {selectedOrder.slipUrl && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setViewingSlipUrl(selectedOrder.slipUrl)}
                      sx={{ borderRadius: 2.5, fontWeight: 700 }}
                    >
                      ดูสลิปหลักฐานการโอน
                    </Button>
                  )}
                  <Typography variant="body2" color="text.secondary">สร้างเมื่อ {formatDateTime(selectedOrder.createdAt)}</Typography>
                  <Typography variant="body2" color="text.secondary">อัปเดตล่าสุด {formatDateTime(selectedOrder.updatedAt)}</Typography>
                </Stack>
              </Stack>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight={900} mb={1}>ที่อยู่จัดส่ง</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrder.address}
                  <br />
                  ต.{selectedOrder.subdistrict} อ.{selectedOrder.district} จ.{selectedOrder.province} {selectedOrder.postcode}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight={900} mb={1}>รายการสินค้า</Typography>
                <Stack divider={<Divider flexItem />}>
                  {selectedOrder.items.map((item) => (
                    <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center" py={1.25} spacing={2}>
                      <Box>
                        <Typography fontWeight={700}>{item.productName}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                          {item.productSku && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                bgcolor: "primary.main", 
                                color: "white", 
                                px: 0.8, 
                                py: 0.2, 
                                borderRadius: 1, 
                                fontWeight: 800,
                                fontSize: '0.65rem'
                              }}
                            >
                              {item.productSku}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {formatMoney(item.price)} x {item.quantity}
                          </Typography>
                        </Stack>
                      </Box>
                      <Typography fontWeight={800}>{formatMoney(item.price * item.quantity)}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight={900} mb={1}>สรุปการชำระเงิน</Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">ค่าสินค้า</Typography><Typography>{formatMoney(selectedOrder.subtotal)}</Typography></Stack>
                  <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">ค่าจัดส่ง</Typography><Typography>{formatMoney(selectedOrder.shippingCost)}</Typography></Stack>
                  <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">ส่วนลด</Typography><Typography color={selectedOrder.discount > 0 ? "error.main" : "text.primary"}>-{formatMoney(selectedOrder.discount)}</Typography></Stack>
                  <Divider flexItem />
                  <Stack direction="row" justifyContent="space-between"><Typography fontWeight={900}>ยอดรวม</Typography><Typography fontWeight={900}>{formatMoney(selectedOrder.total)}</Typography></Stack>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button 
            color="error" 
            startIcon={<Trash size="18" />}
            onClick={() => setDeleteConfirmId(selectedOrder?.id || null)}
            sx={{ fontWeight: 700 }}
          >
            ลบออเดอร์
          </Button>
          <Button onClick={() => setSelectedOrder(null)} sx={{ fontWeight: 700 }}>ปิด</Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog
        open={!!statusConfirm}
        title="ยืนยันการยกเลิกคำสั่งซื้อ"
        message={confirmedOrder ? `คุณต้องการเปลี่ยนคำสั่งซื้อ ${confirmedOrder.orderNumber} เป็นสถานะยกเลิกใช่หรือไม่?` : "คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?"}
        confirmText="ยืนยันการยกเลิก"
        confirmColor="warning"
        loadingText="กำลังอัปเดตสถานะ..."
        loading={Boolean(statusConfirm && updatingId === statusConfirm.orderId)}
        onClose={() => setStatusConfirm(null)}
        onConfirm={() => {
          if (!statusConfirm) return;

          void handleStatusChange(statusConfirm.orderId, statusConfirm.nextStatus).finally(() => {
            setStatusConfirm(null);
          });
        }}
      />

      <ConfirmActionDialog
        open={!!deleteConfirmId}
        title="ลบคำสั่งซื้อถาวร"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อนี้? การกระทำนี้ไม่สามารถย้อนกลับได้และข้อมูลจะหายไปจากฐานข้อมูลทันที"
        confirmText="ยืนยันการลบถาวร"
        confirmColor="error"
        loadingText="กำลังลบ..."
        loading={!!deletingId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeleteOrder(deleteConfirmId)}
      />

      <Dialog
        open={!!viewingSlipUrl}
        onClose={() => setViewingSlipUrl(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, overflow: "hidden" }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 900 }}>
          หลักฐานการชำระเงิน
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              component="a"
              href={viewingSlipUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontWeight: 700, fontSize: "0.8rem" }}
            >
              เปิดในแท็บใหม่
            </Button>
            <Button
              onClick={() => setViewingSlipUrl(null)}
              sx={{ minWidth: 0, p: 0.5, color: "text.secondary" }}
            >
              <CloseCircle size="24" color="currentColor" />
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: "grey.50", display: "flex", justifyContent: "center" }}>
          {viewingSlipUrl && (
            <Box
              component="img"
              src={viewingSlipUrl}
              alt="Slip"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
                display: "block"
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}