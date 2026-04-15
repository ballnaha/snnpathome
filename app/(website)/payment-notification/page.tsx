import React, { Suspense } from "react";
import type { Metadata } from "next";
import PaymentNotificationClient from "./PaymentNotificationClient";
import { Box, CircularProgress } from "@mui/material";

export const metadata: Metadata = {
  title: "แจ้งชำระเงิน | SNNP AT HOME",
  description: "Upload your transfer slip to notify us of your payment.",
};

export default function PaymentNotificationPage() {
  return (
    <Suspense 
      fallback={
        <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <PaymentNotificationClient />
    </Suspense>
  );
}
