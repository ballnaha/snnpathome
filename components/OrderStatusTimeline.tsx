"use client";

import React from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

const ORDER_PALETTE = {
  green: {
    main: "#5f9f72",
    text: "#2f6a43",
    soft: "#edf7ef",
    border: "#bad8c2",
  },
  yellow: {
    main: "#d8b75a",
    text: "#8a6a18",
    soft: "#fff7df",
    border: "#f0dda0",
  },
  red: {
    main: "#d98282",
    text: "#9f4b4b",
    soft: "#fdeeee",
    border: "#efc0c0",
  },
};

export const ORDER_STATUS_LABEL: Record<
  string,
  {
    label: string;
    color: "default" | "warning" | "info" | "success" | "error" | "primary";
  }
> = {
  PENDING: { label: "รอชำระเงิน", color: "warning" },
  PAID: { label: "ชำระแล้ว", color: "info" },
  PROCESSING: { label: "กำลังเตรียมจัดส่ง", color: "info" },
  SHIPPED: { label: "จัดส่งแล้ว", color: "info" },
  DELIVERED: { label: "ได้รับแล้ว", color: "success" },
  CANCELLED: { label: "ยกเลิก", color: "error" },
};

const ORDER_TIMELINE_STEPS = [
  { key: "PENDING", label: "รอชำระเงิน", description: "รอการแจ้งชำระหรือยืนยันยอด" },
  { key: "PAID", label: "ยืนยันการชำระเงิน", description: "ทีมงานตรวจสอบยอดและสลิปแล้ว" },
  { key: "PROCESSING", label: "กำลังเตรียมจัดส่ง", description: "กำลังจัดสินค้าและเตรียมแพ็ก" },
  { key: "SHIPPED", label: "จัดส่งแล้ว", description: "พัสดุถูกส่งออกจากคลังแล้ว" },
  { key: "DELIVERED", label: "ได้รับสินค้าแล้ว", description: "คำสั่งซื้อเสร็จสมบูรณ์" },
] as const;

const ORDER_STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
};

export function getStatusTone(status: string) {
  if (status === "DELIVERED") return ORDER_PALETTE.green;
  if (status === "CANCELLED") return ORDER_PALETTE.red;
  return ORDER_PALETTE.yellow;
}

export function getStatusChipSx(status: string) {
  const tone = getStatusTone(status);

  return {
    fontWeight: 800,
    bgcolor: tone.soft,
    color: tone.text,
    border: "1px solid",
    borderColor: tone.border,
  };
}

export default function OrderStatusTimeline({ status, compact = false }: { status: string; compact?: boolean }) {
  const isCancelled = status === "CANCELLED";
  const activeIndex = ORDER_STATUS_INDEX[status] ?? 0;
  const statusTone = getStatusTone(status);
  const currentStep = ORDER_TIMELINE_STEPS[activeIndex] ?? ORDER_TIMELINE_STEPS[0];

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? { xs: 1.25, md: 1.5 } : { xs: 1.5, md: 1.75 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: statusTone.border,
        background: isCancelled
          ? `linear-gradient(180deg, ${ORDER_PALETTE.red.soft}, rgba(255,255,255,1))`
          : `linear-gradient(180deg, ${ORDER_PALETTE.yellow.soft} 0%, rgba(255,255,255,1) 100%)`,
      }}
    >
      <Stack spacing={compact ? 1.25 : 1.5}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={1}>
          <Box>
            <Typography variant="subtitle2" fontWeight={900}>
              สถานะคำสั่งซื้อ
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isCancelled
                ? "คำสั่งซื้อนี้ถูกยกเลิกและจะไม่มีการดำเนินการต่อ"
                : `ขณะนี้คำสั่งซื้ออยู่ที่ขั้น ${currentStep.label}`}
            </Typography>
          </Box>
          <Chip
            label={isCancelled ? "คำสั่งซื้อถูกยกเลิก" : `อัปเดตล่าสุด: ${ORDER_STATUS_LABEL[status]?.label ?? status}`}
            color="default"
            size="small"
            sx={{ ...getStatusChipSx(status), px: 0.5, height: 24 }}
          />
        </Stack>

        <Paper
          elevation={0}
          sx={{
            display: { xs: "block", sm: "none" },
            p: 1,
            borderRadius: 2,
            border: "1px solid",
            borderColor: statusTone.border,
            bgcolor: isCancelled ? ORDER_PALETTE.red.soft : "white",
          }}
        >
          <Stack spacing={0.75}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <Typography variant="caption" fontWeight={900} sx={{ color: isCancelled ? ORDER_PALETTE.red.text : ORDER_PALETTE.yellow.text }}>
                {isCancelled ? "คำสั่งซื้อถูกยกเลิก" : currentStep.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ขั้น {Math.min(activeIndex + 1, ORDER_TIMELINE_STEPS.length)}/{ORDER_TIMELINE_STEPS.length}
              </Typography>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              {isCancelled ? "รายการนี้ไม่ดำเนินการต่อแล้ว" : currentStep.description}
            </Typography>

            <Stack direction="row" spacing={0.5} alignItems="center">
              {ORDER_TIMELINE_STEPS.map((step, index) => {
                const isCompleted = !isCancelled && index < activeIndex;
                const isCurrent = !isCancelled && index === activeIndex;

                return (
                  <Box
                    key={step.key}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 999,
                      bgcolor: isCancelled
                        ? ORDER_PALETTE.red.border
                        : isCompleted || isCurrent
                          ? isCurrent
                            ? ORDER_PALETTE.yellow.main
                            : ORDER_PALETTE.green.main
                          : "grey.200",
                      opacity: isCurrent ? 1 : 0.9,
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: { xs: "none", sm: "grid" },
            gridTemplateColumns: { sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" },
            gap: 1,
          }}
        >
          {ORDER_TIMELINE_STEPS.map((step, index) => {
            const isCompleted = !isCancelled && index < activeIndex;
            const isCurrent = !isCancelled && index === activeIndex;
            const isUpcoming = !isCancelled && index > activeIndex;

            return (
              <Paper
                key={step.key}
                elevation={0}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: isCancelled
                    ? ORDER_PALETTE.red.border
                    : isCurrent
                      ? ORDER_PALETTE.yellow.border
                      : isCompleted
                        ? ORDER_PALETTE.green.border
                        : "grey.200",
                  bgcolor: isCancelled
                    ? ORDER_PALETTE.red.soft
                    : isCurrent
                      ? ORDER_PALETTE.yellow.soft
                      : isCompleted
                        ? ORDER_PALETTE.green.soft
                        : "white",
                  boxShadow: isCurrent ? "0 8px 18px rgba(216,183,90,0.18)" : "none",
                }}
              >
                <Stack spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: 900,
                        border: "1.5px solid",
                        borderColor: isCancelled
                          ? ORDER_PALETTE.red.main
                          : isCurrent || isCompleted
                            ? isCurrent
                              ? ORDER_PALETTE.yellow.main
                              : ORDER_PALETTE.green.main
                            : "grey.300",
                        color: isCancelled
                          ? ORDER_PALETTE.red.text
                          : isCurrent || isCompleted
                            ? isCurrent
                              ? ORDER_PALETTE.yellow.text
                              : ORDER_PALETTE.green.text
                            : "text.secondary",
                        bgcolor: isCancelled
                          ? ORDER_PALETTE.red.soft
                          : isCompleted
                            ? ORDER_PALETTE.green.soft
                            : isCurrent
                              ? "#fffdfa"
                              : "grey.50",
                      }}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </Box>
                    <Chip
                      label={
                        isCancelled
                          ? "ยุติ"
                          : isCurrent
                            ? "ล่าสุด"
                            : isCompleted
                              ? "เสร็จแล้ว"
                              : "ถัดไป"
                      }
                      size="small"
                      color={
                        isCancelled
                          ? "error"
                          : isCurrent
                            ? "warning"
                            : isCompleted
                              ? "success"
                              : "default"
                      }
                      sx={{ fontWeight: 800, height: 20, "& .MuiChip-label": { px: 0.75 } }}
                    />
                  </Stack>

                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={900}
                      sx={{ color: isCancelled ? ORDER_PALETTE.red.text : isUpcoming ? "text.secondary" : "text.primary" }}
                    >
                      {step.label}
                    </Typography>
                    {(isCurrent || isCancelled) && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                        {isCancelled ? "รายการนี้ไม่ดำเนินการต่อแล้ว" : step.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      </Stack>
    </Paper>
  );
}