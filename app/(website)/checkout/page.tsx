import React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPublicActiveCoupons } from "@/lib/public-coupons";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "ชำระเงิน",
  description: "ชำระเงินและยืนยันคำสั่งซื้อของคุณได้อย่างปลอดภัย",
};

export default async function CheckoutPage() {
  const [session, siteSettings, availableCoupons] = await Promise.all([
    getServerSession(authOptions),
    prisma.siteSetting.findUnique({ where: { id: "default" }, select: { bankAccountInfo: true } }),
    getPublicActiveCoupons(),
  ]);

  let profile = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    subdistrict: "",
    district: "",
    province: "",
    postcode: "",
  };

  if (session?.user) {
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        subdistrict: true,
        district: true,
        province: true,
        postcode: true,
      },
    });

    if (user) {
      const nameParts = (user.name ?? "").trim().split(/\s+/);
      profile = {
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" "),
        email: user.email ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        subdistrict: user.subdistrict ?? "",
        district: user.district ?? "",
        province: user.province ?? "",
        postcode: user.postcode ?? "",
      };
    }
  }

  return (
    <CheckoutClient
      profile={profile}
      bankAccountInfo={siteSettings?.bankAccountInfo ?? null}
      availableCoupons={availableCoupons}
    />
  );
}
