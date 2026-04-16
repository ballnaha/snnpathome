import React from "react";
import type { Metadata } from "next";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export const metadata: Metadata = {
  title: "สั่งซื้อสำเร็จ",
  description: "คำสั่งซื้อของคุณเสร็จสมบูรณ์แล้ว ขอบคุณที่ใช้บริการ SNNP AT HOME",
};

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessClient />;
}
