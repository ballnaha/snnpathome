import prisma from "@/lib/prisma";
import UsersClient from "./UsersClient";

export const metadata = {
  title: "จัดการผู้ใช้งาน | SNNP Admin"
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return <UsersClient users={users} />;
}
