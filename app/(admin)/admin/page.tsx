import prisma from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "แดชบอร์ด | SNNP Admin" };

interface MonthStats { month: number; revenue: number; orders: number; }
interface YearStats { year: number; revenue: number; orders: number; pendingOrders: number; newUsers: number; months: MonthStats[]; }

export default async function AdminDashboardPage(props: {
  searchParams: Promise<{ year?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const selectedYear = searchParams.year ? parseInt(searchParams.year) : currentYear;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = 10;

  const startOfYear = new Date(selectedYear, 0, 1);
  const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);

  const [ordersRaw, usersRaw, productsCount, yearOrders, totalYearOrders] = await Promise.all([
    prisma.order.findMany({ select: { createdAt: true, total: true, status: true } }),
    prisma.user.findMany({ select: { createdAt: true } }),
    prisma.product.count(),
    prisma.order.findMany({
      where: {
        createdAt: { gte: startOfYear, lte: endOfYear },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { orderNumber: true, firstName: true, lastName: true, total: true, status: true, createdAt: true },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startOfYear, lte: endOfYear },
      },
    }),
  ]);

  const totalUsers = usersRaw.length;

  // Aggregate orders by year/month
  type Bucket = { revenue: number; orders: number; pendingOrders: number; months: Map<number, { revenue: number; orders: number }> };
  const yearMap = new Map<number, Bucket>();

  for (const o of ordersRaw) {
    const yr = o.createdAt.getFullYear();
    const mo = o.createdAt.getMonth() + 1;
    if (!yearMap.has(yr)) yearMap.set(yr, { revenue: 0, orders: 0, pendingOrders: 0, months: new Map() });
    const yd = yearMap.get(yr)!;
    yd.revenue += Number(o.total);
    yd.orders += 1;
    if (o.status === "PENDING") yd.pendingOrders += 1;
    if (!yd.months.has(mo)) yd.months.set(mo, { revenue: 0, orders: 0 });
    const md = yd.months.get(mo)!;
    md.revenue += Number(o.total);
    md.orders += 1;
  }

  // Aggregate users joined by year
  const userYearMap = new Map<number, number>();
  for (const u of usersRaw) {
    const yr = u.createdAt.getFullYear();
    userYearMap.set(yr, (userYearMap.get(yr) ?? 0) + 1);
  }

  // Build sorted year list (always include current year)
  const allYears = [...new Set([...yearMap.keys(), new Date().getFullYear()])].sort((a, b) => b - a);

  const yearStats: YearStats[] = allYears.map((year) => {
    const yd = yearMap.get(year) ?? { revenue: 0, orders: 0, pendingOrders: 0, months: new Map() };
    return {
      year,
      revenue: yd.revenue,
      orders: yd.orders,
      pendingOrders: yd.pendingOrders,
      newUsers: userYearMap.get(year) ?? 0,
      months: Array.from({ length: 12 }, (_, i) => {
        const m = yd.months.get(i + 1) ?? { revenue: 0, orders: 0 };
        return { month: i + 1, revenue: m.revenue, orders: m.orders };
      }),
    };
  });

  return (
    <AdminDashboardClient
      yearStats={yearStats}
      productsCount={productsCount}
      totalUsers={totalUsers}
      initialYear={selectedYear}
      initialPage={page}
      totalPages={Math.ceil(totalYearOrders / pageSize)}
      totalOrdersInYear={totalYearOrders}
      recentOrders={yearOrders.map((o) => ({
        orderNumber: o.orderNumber,
        firstName: o.firstName,
        lastName: o.lastName,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  );
}

