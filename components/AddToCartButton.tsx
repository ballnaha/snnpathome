"use client";

import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { ShoppingCart } from "iconsax-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useSnackbar } from "@/components/SnackbarProvider";

interface AddToCartButtonProps extends Omit<ButtonProps, "onClick"> {
  product: Omit<CartItem, "quantity">;
  quantity?: number;
  showIcon?: boolean;
  label?: string;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  showIcon = true,
  label = "เพิ่มไปยังรถเข็น",
  ...buttonProps
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { showSnackbar } = useSnackbar();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if inside a Link
    e.stopPropagation();
    addItem(product, quantity);
    showSnackbar(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`, "success");
  };

  return (
    <Button
      onClick={handleAddToCart}
      startIcon={
        showIcon ? <ShoppingCart variant="Bold" color="currentColor" size="18" /> : undefined
      }
      {...buttonProps}
    >
      {label}
    </Button>
  );
}
