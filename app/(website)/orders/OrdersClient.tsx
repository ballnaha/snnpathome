"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
  Paper,
  Collapse,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown2, ArrowUp2, ShoppingBag } from "iconsax-react";
import OrderStatusTimeline, { ORDER_STATUS_LABEL, getStatusChipSx } from "@/components/OrderStatusTimeline";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  productSku: string | null;
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
  const [activeTab, setActiveTab] = useState("ALL");

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

  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    const scroller = tabsRef.current?.querySelector(".MuiTabs-scroller");
    if (!scroller) return;

    setIsMouseDown(true);
    setDragged(false);
    setStartX(e.pageX - (scroller as HTMLElement).offsetLeft);
    setScrollLeft(scroller.scrollLeft);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const scroller = tabsRef.current?.querySelector(".MuiTabs-scroller");
    if (!scroller) return;

    e.preventDefault();
    const x = e.pageX - (scroller as HTMLElement).offsetLeft;
    const walk = (x - startX) * 2;

    if (Math.abs(x - startX) > 5) {
      setDragged(true);
    }

    scroller.scrollLeft = scrollLeft - walk;
  };

  const onMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const handleTabChange = (_: any, val: string) => {
    if (dragged) return;
    setActiveTab(val);
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    if (activeTab === "PROCESSING_GROUP") {
      return orders.filter(o => o.status === "PAID" || o.status === "PROCESSING");
    }
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const tabs = [
    { label: "ทั้งหมด", value: "ALL" },
    { label: "รอชำระเงิน", value: "PENDING" },
    { label: "เตรียมจัดส่ง", value: "PROCESSING_GROUP" },
    { label: "จัดส่งแล้ว", value: "SHIPPED" },
    { label: "สำเร็จแล้ว", value: "DELIVERED" },
    { label: "ยกเลิก", value: "CANCELLED" },
  ];

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'white',
          overflow: 'hidden'
        }}
        ref={tabsRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            cursor: isMouseDown ? 'grabbing' : 'grab',
            userSelect: 'none',
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: 'primary.main'
            },
            '& .MuiTab-root': {
              minWidth: 100,
              fontSize: '0.9rem',
              fontWeight: 700,
              py: 2,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 900
              }
            },
            '& .MuiTabs-scroller': {
              overflow: 'auto !important',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Paper>

      <Stack spacing={2}>
        {filteredOrders.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ py: 8, bgcolor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}
          >
            <ShoppingBag size="64" color="#ddd" variant="Bulk" />
            <Typography variant="body1" fontWeight={700} color="text.secondary" mt={2}>
              ไม่พบรายการสั่งซื้อในหมวดหมู่นี้
            </Typography>
          </Box>
        ) : (
          filteredOrders.map((order) => {
            const status =
              ORDER_STATUS_LABEL[order.status] ?? {
                label: order.status,
                color: "default" as const,
              };
            const isOpen = openIds.has(order.id);

            return (
              <Paper
                key={order.id}
                elevation={isOpen ? 2 : 0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: isOpen ? "primary.main" : "grey.200",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  bgcolor: "white",
                  mb: 2,
                  "&:hover": {
                    elevation: 3,
                    borderColor: "primary.main",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
                  },
                }}
              >
                {/* Header — always visible, click to toggle */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => toggle(order.id)}
                  sx={{
                    px: { xs: 2, md: 3 },
                    py: 2,
                    bgcolor: isOpen ? "rgba(215, 20, 20, 0.03)" : "grey.50",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "background 0.2s",
                  }}
                >
                  {/* Left: order number + date */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={900}
                      sx={{
                        color: "primary.main",
                        letterSpacing: 0.5,
                        fontSize: { xs: '0.85rem', md: '0.95rem' },
                        mb: 0.2
                      }}
                    >
                      {order.orderNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {new Date(order.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })} น.
                    </Typography>
                  </Box>

                  {/* Right: status + total + chevron */}
                  <Stack direction="row" alignItems="center" gap={{ xs: 1.5, md: 3 }}>
                    <Chip
                      label={status.label}
                      color="default"
                      size="small"
                      sx={{
                        ...getStatusChipSx(order.status),
                        display: { xs: 'none', sm: 'flex' },
                        px: 1,
                        height: 26
                      }}
                    />
                    <Stack alignItems="flex-end">
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                        ยอดรวมสุทธิ
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        fontWeight={950}
                        sx={{ color: "#2f6a43", lineHeight: 1 }}
                      >
                        ฿{Number(order.total).toLocaleString()}
                      </Typography>
                    </Stack>
                    <IconButton
                      size="small"
                      disableRipple
                      tabIndex={-1}
                      sx={{
                        bgcolor: isOpen ? "primary.main" : "transparent",
                        color: isOpen ? "white" : "grey.400",
                        "&:hover": { bgcolor: isOpen ? "primary.dark" : "grey.100" }
                      }}
                    >
                      {isOpen ? (
                        <ArrowUp2 size="18" variant="Bold" color="white" />
                      ) : (
                        <ArrowDown2 size="18" variant="Bold" color="currentColor" />
                      )}
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Mobile Status - visible only on mobile */}
                <Box sx={{
                  display: { xs: 'block', sm: 'none' },
                  px: 2,
                  pb: 2,
                  bgcolor: isOpen ? "rgba(215, 20, 20, 0.03)" : "grey.50",
                  borderTop: isOpen ? "none" : "1px solid rgba(0,0,0,0.04)"
                }}>
                  <Chip
                    label={status.label}
                    color="default"
                    size="small"
                    sx={{ ...getStatusChipSx(order.status), height: 24, px: 0.5 }}
                  />
                </Box>

                {/* Collapsible body */}
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Box sx={{ mx: { xs: 1.5, md: 2.5 }, mt: 2.25, mb: 1, display: { xs: 'none', sm: 'block' } }}>
                    <OrderStatusTimeline status={order.status} compact />
                  </Box>

                  {/* Items */}
                  <Stack divider={<Divider />} sx={{ px: { xs: 2, md: 2.5 }, py: 0.5 }}>
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
                          <Stack direction="row" spacing={1} alignItems="center" mt={0.25}>
                            {item.productSku && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: "grey.600", 
                                  bgcolor: "grey.100", 
                                  px: 0.6, 
                                  py: 0.1, 
                                  borderRadius: 0.8, 
                                  fontWeight: 700,
                                  fontSize: '0.65rem'
                                }}
                              >
                                {item.productSku}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              ฿{Number(item.price).toLocaleString()} × {item.quantity}
                            </Typography>
                          </Stack>
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
                    gap={1.5}
                    sx={{
                      px: { xs: 2, md: 2.5 },
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
                        style={{ textDecoration: "none", width: '100%', maxWidth: 120 }}
                      >
                        <Chip
                          label="แจ้งชำระเงิน"
                          color="warning"
                          size="small"
                          clickable
                          sx={{ fontWeight: 800, px: 2, py: 2, width: '100%' }}
                        />
                      </Link>
                    )}
                  </Stack>
                </Collapse>
              </Paper>
            );
          })
        )}
      </Stack>
    </Box>
  );
}
