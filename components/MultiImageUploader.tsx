"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Box, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Add, Gallery, Trash } from "iconsax-react";

export interface MultiImageUploaderRef {
  upload: () => Promise<string[]>;
}

interface MultiImageUploaderProps {
  value: string[];
  onChange?: (urls: string[]) => void;
  endpoint?: string;
  size?: number;
  maxFiles?: number;
}

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

const MultiImageUploader = forwardRef<MultiImageUploaderRef, MultiImageUploaderProps>(function MultiImageUploader(
  { value, onChange, endpoint = "/api/admin/upload", size = 112, maxFiles = 8 },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [pendingImages]);

  useImperativeHandle(ref, () => ({
    upload: async () => {
      if (pendingImages.length === 0) return value;

      setUploading(true);
      try {
        const uploadedUrls: string[] = [];

        for (const pendingImage of pendingImages) {
          const formData = new FormData();
          formData.append("file", pendingImage.file);

          const response = await fetch(endpoint, { method: "POST", body: formData });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error ?? "อัปโหลดรูปไม่สำเร็จ");
          }

          const data = await response.json();
          uploadedUrls.push(data.url as string);
        }

        pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        setPendingImages([]);

        const nextUrls = [...value, ...uploadedUrls];
        onChange?.(nextUrls);
        return nextUrls;
      } finally {
        setUploading(false);
      }
    },
  }));

  const totalImages = value.length + pendingImages.length;
  const remainingSlots = Math.max(maxFiles - totalImages, 0);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || remainingSlots === 0) return;

    const nextPendingImages = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots)
      .map((file) => ({
        id: `${file.lastModified}-${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    setPendingImages((current) => [...current, ...nextPendingImages]);
  };

  const removeExistingImage = (indexToRemove: number) => {
    onChange?.(value.filter((_, index) => index !== indexToRemove));
  };

  const removePendingImage = (id: string) => {
    setPendingImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  };

  return (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" fontWeight={800}>
          รูปสินค้า
        </Typography>
        <Typography variant="caption" color="text.secondary">
          รูปแรกจะถูกใช้เป็นรูปหลักของสินค้า
        </Typography>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))`, gap: 1.5 }}>
        {value.map((url, index) => (
          <Box
            key={`${url}-${index}`}
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 2,
              border: "1px solid",
              borderColor: index === 0 ? "primary.main" : "grey.200",
              bgcolor: "grey.50",
              overflow: "hidden",
            }}
          >
            <Box component="img" src={url} alt={`Product image ${index + 1}`} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
            <Stack direction="row" spacing={0.5} sx={{ position: "absolute", top: 6, left: 6 }}>
              {index === 0 && <Chip label="รูปหลัก" size="small" color="primary" sx={{ height: 20, fontWeight: 700 }} />}
            </Stack>
            <Tooltip title="ลบรูป">
              <IconButton size="small" onClick={() => removeExistingImage(index)} sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(255,255,255,0.9)" }}>
                <Trash size="14" color="#d71414" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}

        {pendingImages.map((image) => (
          <Box
            key={image.id}
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "warning.main",
              bgcolor: "warning.50",
              overflow: "hidden",
            }}
          >
            <Box component="img" src={image.previewUrl} alt={image.file.name} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
            <Chip label="รอบันทึก" size="small" color="warning" sx={{ position: "absolute", top: 6, left: 6, height: 20, fontWeight: 700 }} />
            <Tooltip title="ลบรูป">
              <IconButton size="small" onClick={() => removePendingImage(image.id)} sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(255,255,255,0.9)" }}>
                <Trash size="14" color="#d71414" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}

        {remainingSlots > 0 && (
          <Box
            onClick={() => !uploading && inputRef.current?.click()}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "grey.300",
              bgcolor: "grey.50",
              cursor: uploading ? "wait" : "pointer",
              transition: "border-color 0.2s, background-color 0.2s",
              "&:hover": { borderColor: "primary.main", bgcolor: "primary.50" },
            }}
          >
            {uploading ? (
              <CircularProgress size={28} />
            ) : (
              <>
                <Add size="28" color="#d71414" />
                <Gallery size="22" color="#999" variant="Bold" />
                <Typography variant="caption" color="text.secondary" textAlign="center" px={1}>
                  เพิ่มรูปหลายรูป
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary">
        รองรับสูงสุด {maxFiles} รูป
      </Typography>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </Stack>
  );
});

export default MultiImageUploader;