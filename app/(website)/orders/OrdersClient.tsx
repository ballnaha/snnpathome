"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
  Paper,
  Collapse,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown2, ArrowUp2 } from "iconsax-react";

const STATUS_LABEL: Record<
  string,
  {
    label: string;
    color:
      | "default"
      | "warning"
      | "info"
      | "success"
      | "error"
      | "primary";
  }
> = {
  PENDING:    { label: "รอชำระเงิน",  color: "warning" },
  PAID:       { label: "ชำระแล้ว",    color: "info" },
  PROCESSING: { label: "กำลังเตรียม", color: "primary" },
  SHIPPED:    { label: "จัดส่งแล้ว",  color: "info" },
  DELIVERED:  { label: "ได้รับแล้ว",  color: "success" },
  CANCELLED:  { label: "ยกเลิก",      color: "error" },
};

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  createdAt: string;
  firstName: string;
  lastName: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
  items: OrderItem[];
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Stack spacing={2}>
      {orders.map((order) => {
        const status =
          STATUS_LABEL[order.status] ?? {
            label: order.status,
            color: "default" as const,
          };
        const isOpen = openIds.has(order.id);

        return (
          <Paper
            key={order.id}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              overflow: "hidden",
            }}
          >
            {/* Header — always visible, click to toggle */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={() => toggle(order.id)}
              sx={{
                px: 2.5,
                py: 1.5,
                bgcolor: "grey.50",
                cursor: "pointer",
                userSelect: "none",
                "&:hover": { bgcolor: "grey.100" },
                transition: "background 0.15s",
              }}
            >
              {/* Left: order number + date */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={900}
                  color="primary.main"
                  sx={{ letterSpacing: 0.5 }}
                >
                  {order.orderNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(order.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>

              {/* Right: status + total + chevron */}
              <Stack direction="row" alignItems="center" gap={1}>
                <Chip
                  label={status.label}
                  color={status.color}
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
                <Typography
                  variant="subtitle2"
                  fontWeight={900}
                  color="primary.main"
                  sx={{ minWidth: 72, textAlign: "right" }}
                >
                  ฿{Number(order.total).toLocaleString()}
                </Typography>
                <IconButton size="small" disableRipple tabIndex={-1}>
                  {isOpen ? (
                    <ArrowUp2 size="16" color="#666" />
                  ) : (
                    <ArrowDown2 size="16" color="#666" />
                  )}
                </IconButton>
              </Stack>
            </Stack>

            {/* Collapsible body */}
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              {/* Items */}
              <Stack divider={<Divider />} sx={{ px: 2.5, py: 0.5 }}>
                {order.items.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    alignItems="center"
                    gap={2}
                    py={1.5}
                  >
                    {item.productImage ? (
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={52}
                          height={52}
                          style={{
                            objectFit: "contain",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          bgcolor: "grey.100",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ฿{Number(item.price).toLocaleString()} × {item.quantity}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{ flexShrink: 0 }}
                    >
                      ฿{(Number(item.price) * item.quantity).toLocaleString()}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              {/* Footer */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={1}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "grey.50",
                  borderTop: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  จัดส่งที่: {order.firstName} {order.lastName},{" "}
                  {order.address} ต.{order.subdistrict} อ.{order.district} จ.
                  {order.province} {order.postcode}
                </Typography>
                {order.status === "PENDING" && (
                  <Link
                    href={`/payment-notification?order=${order.orderNumber}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Chip
                      label="แจ้งชำระเงิน"
                      color="primary"
                      size="small"
                      clickable
                      sx={{ fontWeight: 700 }}
                    />
                  </Link>
                )}
              </Stack>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
}
