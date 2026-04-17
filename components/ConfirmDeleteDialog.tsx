"use client";

import React from "react";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title?: string;
  message: string;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDeleteDialog({
  open,
  title = "ยืนยันการลบ",
  message,
  loading = false,
  confirmText = "ลบ",
  cancelText = "ยกเลิก",
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      title={title}
      message={message}
      loading={loading}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmColor="error"
      loadingText="กำลังลบ..."
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}