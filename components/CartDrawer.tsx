"use client";

import React from "react";
import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import Link from "next/link";
import {
  CloseCircle,
  ShoppingCart,
  Trash,
  Add,
  Minus,
  Bag2,
  EmptyWallet,
} from "iconsax-react";
import { useCart } from "@/contexts/CartContext";

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isDrawerOpen,
    closeDrawer,
  } = useCart();

  return (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={closeDrawer}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ShoppingCart size="24" variant="Bold" color="#FFF" />
          <Typography variant="h6" fontWeight="900" sx={{ fontSize: "1.1rem" }}>
            ตะกร้าสินค้า
          </Typography>
          {totalItems > 0 && (
            <Box
              sx={{
                bgcolor: "white",
                color: "primary.main",
                borderRadius: 10,
                px: 1.5,
                py: 0.2,
                fontWeight: 900,
                fontSize: "0.75rem",
                minWidth: 24,
                textAlign: "center",
              }}
            >
              {totalItems}
            </Box>
          )}
        </Stack>
        <IconButton onClick={closeDrawer} sx={{ color: "white" }}>
          <CloseCircle size="24" variant="Bold" color="#FFF" />
        </IconButton>
      </Box>

      {/* Cart Items */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 2 }}>
        {items.length === 0 ? (
          <Stack
            spacing={3}
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%", py: 10 }}
          >
            <Box
              sx={{
                bgcolor: "grey.50",
                borderRadius: "50%",
                p: 4,
              }}
            >
              <Bag2 size="64" variant="Bulk" color="#ccc" />
            </Box>
            <Typography
              variant="h6"
              fontWeight="800"
              color="text.secondary"
              textAlign="center"
            >
              ตะกร้าว่างเปล่า
            </Typography>
            <Typography
              variant="body2"
              color="grey.400"
              textAlign="center"
              sx={{ maxWidth: 250 }}
            >
              เพิ่มสินค้าที่คุณชอบลงในตะกร้าเพื่อเริ่มต้นการสั่งซื้อ
            </Typography>
            <Button
              onClick={closeDrawer}
              variant="outlined"
              sx={{
                borderRadius: 10,
                px: 4,
                fontWeight: 800,
                borderColor: "primary.main",
                color: "primary.main",
                borderWidth: 2,
                "&:hover": { borderWidth: 2 },
              }}
            >
              เลือกซื้อสินค้า
            </Button>
          </Stack>
        ) : (
          <Stack spacing={0}>
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    py: 2,
                    px: 1,
                    transition: "0.2s",
                    borderRadius: 3,
                    "&:hover": { bgcolor: "grey.50" },
                  }}
                >
                  {/* Product Image */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      flexShrink: 0,
                      border: "1px solid",
                      borderColor: "grey.100",
                      borderRadius: 3,
                      overflow: "hidden",
                      bgcolor: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>

                  {/* Product Details */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight="700"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mb: 0.5,
                        fontSize: "0.85rem",
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="900"
                      color="primary.main"
                      sx={{ mb: 1 }}
                    >
                      ฿{item.price.toLocaleString()}
                    </Typography>

                    {/* Quantity Controls */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                          border: "1px solid",
                          borderColor: "grey.200",
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          sx={{
                            borderRadius: 0,
                            px: 1,
                            "&:hover": { bgcolor: "grey.50" },
                          }}
                        >
                          <Minus size="14" color="#999" />
                        </IconButton>
                        <Typography
                          sx={{
                            px: 2,
                            fontWeight: 900,
                            fontSize: "0.85rem",
                            minWidth: 30,
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          sx={{
                            borderRadius: 0,
                            px: 1,
                            "&:hover": { bgcolor: "grey.50" },
                          }}
                        >
                          <Add size="14" color="#d71414" />
                        </IconButton>
                      </Stack>

                      <IconButton
                        size="small"
                        onClick={() => removeItem(item.id)}
                        sx={{
                          color: "grey.400",
                          "&:hover": { color: "error.main" },
                        }}
                      >
                        <Trash size="18" variant="Bold" />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>
                {index < items.length - 1 && (
                  <Divider sx={{ borderColor: "grey.50" }} />
                )}
              </React.Fragment>
            ))}

            {/* Clear Cart */}
            {items.length > 1 && (
              <Box sx={{ textAlign: "center", pt: 1 }}>
                <Button
                  size="small"
                  onClick={clearCart}
                  startIcon={<Trash size="14" variant="Bold" />}
                  sx={{
                    color: "grey.400",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    "&:hover": { color: "error.main", bgcolor: "transparent" },
                  }}
                >
                  ล้างตะกร้า
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {/* Footer — Summary & Checkout */}
      {items.length > 0 && (
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "grey.100",
            px: 3,
            py: 3,
            bgcolor: "white",
          }}
        >
          <Stack spacing={2}>
            {/* Price Breakdown */}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                สินค้า ({totalItems} ชิ้น)
              </Typography>
              <Typography variant="body2" fontWeight="700">
                ฿{totalPrice.toLocaleString()}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                ค่าจัดส่ง
              </Typography>
              <Typography variant="body2" fontWeight="700" color="success.main">
                ฟรี
              </Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="900">
                ยอดรวมทั้งหมด
              </Typography>
              <Typography
                variant="h5"
                fontWeight="900"
                color="primary.main"
              >
                ฿{totalPrice.toLocaleString()}
              </Typography>
            </Stack>

            {/* Action Buttons */}
            <Link href="/checkout" style={{ textDecoration: 'none', width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={closeDrawer}
                startIcon={<EmptyWallet variant="Bold" color="#FFF" />}
                sx={{
                  py: 1.8,
                  borderRadius: 15,
                  fontWeight: 900,
                  fontSize: "1rem",
                  bgcolor: "primary.main",
                  boxShadow: "0 8px 25px rgba(215,20,20,0.3)",
                  "&:hover": {
                    bgcolor: "#cc0000",
                    boxShadow: "0 12px 30px rgba(215,20,20,0.4)",
                  },
                }}
              >
                ดำเนินการสั่งซื้อ
              </Button>
            </Link>
            <Button
              variant="text"
              fullWidth
              onClick={closeDrawer}
              sx={{
                color: "text.secondary",
                fontWeight: 700,
                fontSize: "0.85rem",
                "&:hover": { bgcolor: "transparent", color: "primary.main" },
              }}
            >
              เลือกซื้อสินค้าต่อ
            </Button>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
}
