import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions).catch(() => null);

  if (!session?.user) {
    redirect("/login?redirect=/admin&reason=admin-auth");
  }

  if ((session.user as { role?: string }).role !== "ADMIN") {
    redirect("/");
  }

  const adminName = session.user.name?.trim() || session.user.email || "Admin User";

  return <AdminShell adminName={adminName}>{children}</AdminShell>;
}
