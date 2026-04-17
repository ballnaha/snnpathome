"use client";

import React from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  message: string;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "secondary" | "success" | "error" | "info" | "warning" | "inherit";
  loadingText?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmActionDialog({
  open,
  title,
  message,
  loading = false,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  confirmColor = "primary",
  loadingText = "กำลังดำเนินการ...",
  maxWidth = "xs",
  onConfirm,
  onClose,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={onClose} disabled={loading} sx={{ fontWeight: 700 }}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ fontWeight: 800, borderRadius: 2.5 }}
        >
          {loading ? loadingText : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}