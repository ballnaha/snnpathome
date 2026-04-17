import React from "react";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export const metadata: Metadata = {
  title: "สั่งซื้อสำเร็จ",
  description: "คำสั่งซื้อของคุณเสร็จสมบูรณ์แล้ว ขอบคุณที่ใช้บริการ SNNP AT HOME",
};

export default async function CheckoutSuccessPage() {
  const siteSettings = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    select: { bankAccountInfo: true },
  });

  return <CheckoutSuccessClient bankAccountInfo={siteSettings?.bankAccountInfo ?? null} />;
}
