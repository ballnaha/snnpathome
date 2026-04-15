import React from "react";
import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "ชำระเงิน | SNNP AT HOME",
  description: "Checkout and complete your order securely.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
