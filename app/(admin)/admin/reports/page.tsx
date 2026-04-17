import React from "react";
import { Box, Typography, Paper, Stack, Chip } from "@mui/material";
import { Chart, TrendUp, ShoppingCart } from "iconsax-react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "รายงานการขาย | SNNP Admin" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "รอดำเนินการ", PAID: "ชำระแล้ว", PROCESSING: "กำลังเตรียมจัดส่ง",
  SHIPPED: "จัดส่งแล้ว", DELIVERED: "ส่งสำเร็จ", CANCELLED: "ยกเลิก",
};
const STATUS_COLOR: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
  PENDING: "warning", PAID: "info", PROCESSING: "info",
  SHIPPED: "info", DELIVERED: "success", CANCELLED: "error",
};

export default async function AdminReportsPage() {
  const [allOrders, topProducts, statusCounts] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { orderNumber: true, firstName: true, lastName: true, total: true, shippingCost: true, discount: true, status: true, createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.order.groupBy({ by: ["status"], _count: { id: true }, _sum: { total: true } }),
  ]);

  const totalRevenue = allOrders.reduce((s, o) => s + Number(o.total), 0);
  const paidRevenue = allOrders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + Number(o.total), 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" gap={1.5} mb={4}>
        <Chart size="28" color="#d71414" variant="Bold" />
        <Typography variant="h5" fontWeight={900}>รายงานการขาย</Typography>
      </Stack>

      {/* Summary Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 4 }}>
        {[
          { label: "ยอดขายรวม (ทุกสถานะ)", value: `฿${totalRevenue.toLocaleString()}`, color: "#d71414", bg: "#fff3f3" },
          { label: "ยอดขายสุทธิ (ไม่รวมยกเลิก)", value: `฿${paidRevenue.toLocaleString()}`, color: "#388e3c", bg: "#e8f5e9" },
          { label: "จำนวนออเดอร์", value: allOrders.length.toLocaleString(), color: "#1976d2", bg: "#e3f2fd" },
          { label: "สินค้าขายดีอันดับ 1", value: topProducts[0]?.productName ?? "-", color: "#7b1fa2", bg: "#f3e5f5" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "grey.100" }}>
            <Typography variant="h6" fontWeight={900} sx={{ color: s.color, fontSize: "1.1rem", wordBreak: "break-word" }}>{s.value}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
        {/* Status Breakdown */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.100", overflow: "hidden" }}>
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "grey.100" }}>
            <Typography fontWeight={900}>สรุปตามสถานะ</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Stack spacing={1}>
              {statusCounts.map((s) => (
                <Stack key={s.status} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                  <Chip label={STATUS_LABEL[s.status] ?? s.status} color={STATUS_COLOR[s.status] ?? "default"} size="small" sx={{ fontWeight: 800 }} />
                  <Stack direction="row" gap={2} alignItems="center">
                    <Typography variant="body2" fontWeight={700}>{s._count.id} รายการ</Typography>
                    <Typography variant="body2" fontWeight={800} color="primary.main">฿{Number(s._sum.total ?? 0).toLocaleString()}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Paper>

        {/* Top Products */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.100", overflow: "hidden" }}>
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "grey.100" }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <TrendUp size="18" color="#d71414" variant="Bold" />
              <Typography fontWeight={900}>สินค้าขายดี (Top 10)</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2 }}>
            <Stack spacing={1}>
              {topProducts.map((p, i) => (
                <Stack key={p.productName} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: i === 0 ? "#fff3f3" : "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography variant="caption" fontWeight={900} color={i === 0 ? "primary.main" : "text.secondary"}>#{i + 1}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.productName}</Typography>
                  </Stack>
                  <Chip label={`${p._sum.quantity ?? 0} ชิ้น`} size="small" sx={{ fontWeight: 800, bgcolor: "primary.50", color: "primary.main" }} />
                </Stack>
              ))}
              {topProducts.length === 0 && <Typography variant="body2" color="text.disabled" textAlign="center" py={4}>ยังไม่มีข้อมูล</Typography>}
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* Recent Orders Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.100", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "grey.100" }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <ShoppingCart size="18" color="#d71414" variant="Bold" />
            <Typography fontWeight={900}>รายการออเดอร์ล่าสุด (50 รายการ)</Typography>
          </Stack>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["เลขออเดอร์", "ลูกค้า", "ค่าส่ง", "ส่วนลด", "ยอดรวม", "สถานะ", "วันที่"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "0.8rem", fontWeight: 800, color: "#666" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allOrders.map((o) => (
                <tr key={o.orderNumber} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 800, fontSize: "0.82rem", color: "#d71414" }}>{o.orderNumber}</td>
                  <td style={{ padding: "10px 16px", fontSize: "0.85rem" }}>{o.firstName} {o.lastName}</td>
                  <td style={{ padding: "10px 16px", fontSize: "0.85rem" }}>฿{Number(o.shippingCost).toLocaleString()}</td>
                  <td style={{ padding: "10px 16px", fontSize: "0.85rem", color: "#d32f2f" }}>-฿{Number(o.discount).toLocaleString()}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 800, fontSize: "0.85rem" }}>฿{Number(o.total).toLocaleString()}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <Chip label={STATUS_LABEL[o.status] ?? o.status} color={STATUS_COLOR[o.status] ?? "default"} size="small" sx={{ fontWeight: 800, fontSize: "0.7rem" }} />
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: "0.78rem", color: "#999" }}>
                    {new Date(o.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {allOrders.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#999" }}>ยังไม่มีข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}
