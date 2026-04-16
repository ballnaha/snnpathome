import React, { Suspense } from "react";
import type { Metadata } from "next";
import PaymentNotificationClient from "./PaymentNotificationClient";
import { Box, CircularProgress } from "@mui/material";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "แจ้งชำระเงิน",
  description: "อัปโหลดสลิปโอนเงินเพื่อแจ้งชำระเงินให้เราทราบ",
};

export default async function PaymentNotificationPage() {
  const siteSettings = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    select: { bankAccountInfo: true },
  });

  return (
    <Suspense 
      fallback={
        <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <PaymentNotificationClient bankAccountInfo={siteSettings?.bankAccountInfo ?? null} />
    </Suspense>
  );
}
