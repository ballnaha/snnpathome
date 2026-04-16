import React from "react";
import { Box, Typography, Paper, Stack, Grid, Chip } from "@mui/material";
import { BagHappy, User, ClipboardText, MoneyRecive, TrendUp, Clock } from "iconsax-react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "แดชบอร์ด | SNNP Admin" };

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    pendingOrders,
    recentOrders,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        orderNumber: true,
        firstName: true,
        lastName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);

  const stats = [
    { label: "ยอดขายรวม", value: `฿${totalRevenue.toLocaleString()}`, icon: <MoneyRecive size="28" variant="Bold" color="#d71414" />, color: "#d71414", bg: "#fff3f3" },
    { label: "คำสั่งซื้อทั้งหมด", value: totalOrders.toLocaleString(), icon: <ClipboardText size="28" variant="Bold" color="#1976d2" />, color: "#1976d2", bg: "#e3f2fd" },
    { label: "รอดำเนินการ", value: pendingOrders.toLocaleString(), icon: <Clock size="28" variant="Bold" color="#f57c00" />, color: "#f57c00", bg: "#fff3e0" },
    { label: "สมาชิก", value: totalUsers.toLocaleString(), icon: <User size="28" variant="Bold" color="#388e3c" />, color: "#388e3c", bg: "#e8f5e9" },
    { label: "สินค้าทั้งหมด", value: totalProducts.toLocaleString(), icon: <BagHappy size="28" variant="Bold" color="#7b1fa2" />, color: "#7b1fa2", bg: "#f3e5f5" },
  ];

  const statusColor: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
    PENDING: "warning",
    PAID: "info",
    PROCESSING: "info",
    SHIPPED: "info",
    DELIVERED: "success",
    CANCELLED: "error",
  };
  const statusLabel: Record<string, string> = {
    PENDING: "รอดำเนินการ",
    PAID: "ชำระแล้ว",
    PROCESSING: "กำลังเตรียม",
    SHIPPED: "จัดส่งแล้ว",
    DELIVERED: "ส่งสำเร็จ",
    CANCELLED: "ยกเลิก",
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack mb={4}>
        <Typography variant="h5" fontWeight={900}>แดชบอร์ด</Typography>
        <Typography variant="body2" color="text.secondary">ภาพรวมของระบบ</Typography>
      </Stack>

      {/* Stat Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" }, gap: 2, mb: 4 }}>
        {stats.map((s) => (
          <Paper key={s.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "grey.100" }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5, color: s.color }}>
              {s.icon}
            </Box>
            <Typography variant="h5" fontWeight={900} sx={{ color: s.color }}>{s.value}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Recent Orders */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.100", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "grey.100" }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <TrendUp size="20" color="#d71414" variant="Bold" />
            <Typography fontWeight={900}>คำสั่งซื้อล่าสุด</Typography>
          </Stack>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["เลขคำสั่งซื้อ", "ชื่อลูกค้า", "ยอดรวม", "สถานะ", "วันที่"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "0.8rem", fontWeight: 800, color: "#666" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.orderNumber} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: "0.85rem", color: "#d71414" }}>{o.orderNumber}</td>
                  <td style={{ padding: "12px 16px", fontSize: "0.85rem" }}>{o.firstName} {o.lastName}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: "0.85rem" }}>฿{Number(o.total).toLocaleString()}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Chip label={statusLabel[o.status] ?? o.status} color={statusColor[o.status] ?? "default"} size="small" sx={{ fontWeight: 800, fontSize: "0.7rem" }} />
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#999" }}>
                    {new Date(o.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#999" }}>ยังไม่มีคำสั่งซื้อ</td></tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}
