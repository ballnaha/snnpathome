"use client";

import React from "react";
import {
  Box, Typography, Paper, Stack, Chip, Select, MenuItem,
  FormControl, Tooltip, Pagination,
} from "@mui/material";
import { MoneyRecive, ClipboardText, Clock, Profile2User, BagHappy, TrendUp, User, ArrowRight, ArrowLeft } from "iconsax-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const MONTH_NAMES = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const STATUS_COLOR: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
  PENDING: "warning", PAID: "info", PROCESSING: "info",
  SHIPPED: "info", DELIVERED: "success", CANCELLED: "error",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "รอดำเนินการ", PAID: "ชำระแล้ว", PROCESSING: "กำลังเตรียมจัดส่ง",
  SHIPPED: "จัดส่งแล้ว", DELIVERED: "ส่งสำเร็จ", CANCELLED: "ยกเลิก",
};

interface MonthStats { month: number; revenue: number; orders: number; }
interface YearStats { year: number; revenue: number; orders: number; pendingOrders: number; newUsers: number; months: MonthStats[]; }
interface RecentOrder { orderNumber: string; firstName: string; lastName: string; total: number; status: string; createdAt: string; }

interface Props {
  yearStats: YearStats[];
  productsCount: number;
  totalUsers: number;
  recentOrders: RecentOrder[];
  initialYear: number;
  initialPage: number;
  totalPages: number;
  totalOrdersInYear: number;
}

function TrendBadge({ current, previous }: { current: number; previous?: number }) {
  if (!previous || previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const isUp = pct >= 0;
  return (
    <Typography variant="caption" fontWeight={800} sx={{ color: isUp ? "success.main" : "error.main" }}>
      {isUp ? "↑" : "↓"} {Math.abs(pct).toFixed(1)}% จากปีก่อน
    </Typography>
  );
}

export default function AdminDashboardClient({ 
  yearStats, productsCount, totalUsers, recentOrders, 
  initialYear, initialPage, totalPages, totalOrdersInYear 
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedYear = initialYear;

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("year", year.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const stats = yearStats.find((y) => y.year === selectedYear) ?? {
    year: selectedYear, revenue: 0, orders: 0, pendingOrders: 0, newUsers: 0,
    months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: 0, orders: 0 })),
  };
  const prevStats = yearStats.find((y) => y.year === selectedYear - 1);
  const maxRevenue = Math.max(...stats.months.map((m) => m.revenue), 1);

  const kpis = [
    {
      label: "ยอดขายรวม", value: `฿${stats.revenue.toLocaleString()}`,
      icon: <MoneyRecive size="24" variant="Bold" color="#d71414" />, color: "#d71414", bg: "#fff3f3",
      trend: <TrendBadge current={stats.revenue} previous={prevStats?.revenue} />,
    },
    {
      label: "คำสั่งซื้อ", value: stats.orders.toLocaleString(),
      icon: <ClipboardText size="24" variant="Bold" color="#1976d2" />, color: "#1976d2", bg: "#e3f2fd",
      trend: <TrendBadge current={stats.orders} previous={prevStats?.orders} />,
    },
    {
      label: "รอดำเนินการ", value: stats.pendingOrders.toLocaleString(),
      icon: <Clock size="24" variant="Bold" color="#f57c00" />, color: "#f57c00", bg: "#fff3e0",
      trend: null,
    },
    {
      label: "สมาชิกใหม่", value: stats.newUsers.toLocaleString(),
      icon: <Profile2User size="24" variant="Bold" color="#388e3c" />, color: "#388e3c", bg: "#e8f5e9",
      trend: <TrendBadge current={stats.newUsers} previous={prevStats?.newUsers} />,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
            <TrendUp size="28" color="#d71414" variant="Bold" />
            <Typography variant="h5" fontWeight={900}>แดชบอร์ด</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">ภาพรวมธุรกิจ · ข้อมูลตามปีที่เลือก</Typography>
        </Box>
        <FormControl size="small">
          <Select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            sx={{ borderRadius: 2.5, fontWeight: 800, minWidth: 100 }}
          >
            {yearStats.map((y) => (
              <MenuItem key={y.year} value={y.year} sx={{ fontWeight: 700 }}>{y.year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {kpis.map((k) => (
          <Paper key={k.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "grey.100" }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: k.bg, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
              {k.icon}
            </Box>
            <Typography variant="h5" fontWeight={900} sx={{ color: k.color, mb: 0.25 }}>{k.value}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">{k.label}</Typography>
            {k.trend && <Box mt={0.5}>{k.trend}</Box>}
          </Paper>
        ))}
      </Box>

      {/* Chart + Summary */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 260px" }, gap: 2, mb: 3 }}>
        {/* Monthly Revenue Chart */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.100" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography fontWeight={900}>ยอดขายรายเดือน {selectedYear}</Typography>
            <Chip label={`รวม ฿${stats.revenue.toLocaleString()}`} size="small" color="primary" sx={{ fontWeight: 800 }} />
          </Stack>
          <Stack direction="row" alignItems="flex-end" gap="3px" sx={{ height: 150, mb: 1 }}>
            {stats.months.map((m, i) => (
              <Tooltip
                key={i}
                title={
                  <Box>
                    <Typography variant="caption" fontWeight={800} display="block">{MONTH_NAMES[i]} {selectedYear}</Typography>
                    <Typography variant="caption" display="block">฿{m.revenue.toLocaleString()}</Typography>
                    <Typography variant="caption" display="block">{m.orders} คำสั่งซื้อ</Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    flex: 1,
                    height: maxRevenue > 0 ? `${Math.max((m.revenue / maxRevenue) * 100, m.orders > 0 ? 5 : 2)}%` : "2%",
                    bgcolor: m.orders > 0 ? "primary.main" : "grey.200",
                    borderRadius: "4px 4px 0 0",
                    cursor: "pointer",
                    transition: "opacity 0.15s, background-color 0.15s",
                    "&:hover": { opacity: 0.75 },
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
          <Stack direction="row" gap="3px">
            {MONTH_NAMES.map((mn) => (
              <Box key={mn} sx={{ flex: 1, textAlign: "center" }}>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>{mn}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* All-time Summary */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "grey.100", display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography fontWeight={900} variant="body2" color="text.secondary">สรุปรวมทั้งหมด</Typography>
          <Stack gap={2}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "#f3e5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BagHappy size="22" variant="Bold" color="#7b1fa2" />
              </Box>
              <Box>
                <Typography fontWeight={900} fontSize="1.3rem" color="#7b1fa2" lineHeight={1.2}>{productsCount.toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>สินค้าทั้งหมด</Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size="22" variant="Bold" color="#388e3c" />
              </Box>
              <Box>
                <Typography fontWeight={900} fontSize="1.3rem" color="#388e3c" lineHeight={1.2}>{totalUsers.toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>สมาชิกทั้งหมด</Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* Recent Orders */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.100", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "grey.100" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" gap={1}>
              <TrendUp size="20" color="#d71414" variant="Bold" />
              <Typography fontWeight={900}>คำสั่งซื้อในปี {selectedYear}</Typography>
              <Chip label={`${totalOrdersInYear} รายการ`} size="small" variant="outlined" sx={{ fontWeight: 800, ml: 1 }} />
            </Stack>
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
                  <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: "0.85rem" }}>฿{o.total.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Chip
                      label={STATUS_LABEL[o.status] ?? o.status}
                      color={STATUS_COLOR[o.status] ?? "default"}
                      size="small"
                      sx={{ fontWeight: 800, fontSize: "0.7rem" }}
                    />
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
        <Box sx={{ p: 2, display: "flex", justifyContent: "center", borderTop: "1px solid", borderColor: "grey.100" }}>
          <Pagination 
            count={totalPages} 
            page={initialPage} 
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size="medium"
            sx={{
              "& .MuiPaginationItem-root": { fontWeight: 800 },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
