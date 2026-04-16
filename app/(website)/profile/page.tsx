import React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "โปรไฟล์ของฉัน",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?redirect=/profile");
  }

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      address: true,
      subdistrict: true,
      district: true,
      province: true,
      postcode: true,
      password: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileClient
      initialName={user.name ?? ""}
      initialPhone={user.phone ?? ""}
      initialAddress={user.address ?? ""}
      initialSubdistrict={user.subdistrict ?? ""}
      initialDistrict={user.district ?? ""}
      initialProvince={user.province ?? ""}
      initialPostcode={user.postcode ?? ""}
      email={user.email ?? ""}
      role={user.role}
      hasPassword={!!user.password}
      memberSince={user.createdAt.toISOString()}
    />
  );
}
