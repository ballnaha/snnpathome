"use client";

import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Box, Typography, CircularProgress, IconButton, Tooltip, Chip } from "@mui/material";
import { Gallery, Trash, ArrowUp } from "iconsax-react";

export interface ImageUploaderRef {
  /** Upload pending file (if any) and return the final URL. Returns existing value if no pending file. */
  upload: () => Promise<string>;
}

interface ImageUploaderProps {
  value: string;
  onChange?: (url: string) => void;
  /** Max display size in px, default 120 */
  size?: number;
  /** Upload endpoint, default /api/admin/upload */
  endpoint?: string;
  /** Accepted MIME types, default image/* */
  accept?: string;
}

const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(function ImageUploader(
  { value, onChange, size = 120, endpoint = "/api/admin/upload", accept = "image/*" },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = pendingFile ? previewUrl : value;

  useImperativeHandle(ref, () => ({
    upload: async () => {
      if (!pendingFile) return value;
      const oldUrl = value;
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", pendingFile);
        const res = await fetch(endpoint, { method: "POST", body: formData });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error ?? "อัปโหลดไม่สำเร็จ");
        }
        const { url } = await res.json();

        // If we successfully uploaded a new file and there was an old one on the server, delete the old one
        if (oldUrl && oldUrl.startsWith("/uploads/")) {
          fetch(endpoint, {
            method: "DELETE",
            body: JSON.stringify({ url: oldUrl }),
          }).catch((err) => console.error("Failed to delete old file during replacement:", err));
        }

        setPendingFile(null);
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
        onChange?.(url);
        return url as string;
      } catch (e: any) {
        setError(e.message ?? "เกิดข้อผิดพลาด");
        throw e;
      } finally {
        setUploading(false);
      }
    },
  }));

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setError("รองรับเฉพาะไฟล์รูปภาพ");
      return;
    }
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
  };

  const handleClear = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If it's an existing server image, delete it from the folder
    const urlToDelete = pendingFile ? null : value;
    
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl("");
    onChange?.("");
    setError(null);

    // If there was a value on the server, call the DELETE API
    if (urlToDelete && urlToDelete.startsWith("/uploads/")) {
      try {
        await fetch(endpoint, {
          method: "DELETE",
          body: JSON.stringify({ url: urlToDelete }),
        });
      } catch (err) {
        console.error("Failed to delete file from folder", err);
        // We don't necessarily want to block the UI if delete fails, 
        // as the user already "cleared" it in their mind.
      }
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <Box
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          border: "2px dashed",
          borderColor: dragging ? "primary.main" : error ? "error.main" : "grey.300",
          bgcolor: dragging ? "primary.50" : "grey.50",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: uploading ? "wait" : "pointer",
          overflow: "hidden",
          position: "relative",
          transition: "border-color 0.2s, background-color 0.2s",
          "&:hover": { borderColor: "primary.main", bgcolor: "primary.50" },
        }}
      >
        {uploading ? (
          <CircularProgress size={28} />
        ) : displayUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            {pendingFile && (
              <Box sx={{ position: "absolute", top: 4, left: 4 }}>
                <Chip label="รอบันทึก" size="small" color="warning"
                  sx={{ fontSize: "0.6rem", fontWeight: 800, height: 18 }} />
              </Box>
            )}
            <Box sx={{
              position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.2s", "&:hover": { opacity: 1 },
            }}>
              <ArrowUp size="28" color="white" variant="Bold" />
            </Box>
          </>
        ) : (
          <>
            <Gallery size="32" color="#bbb" variant="Bold" />
            <Typography variant="caption" color="text.disabled" mt={0.5} textAlign="center" px={1}>
              คลิกหรือลากไฟล์
            </Typography>
          </>
        )}
      </Box>

      {displayUrl && !uploading && (
        <Tooltip title="ลบรูป">
          <IconButton size="small" onClick={handleClear} sx={{ color: "error.main" }}>
            <Trash size="16" color="#d71414" />
          </IconButton>
        </Tooltip>
      )}

      {error && (
        <Typography variant="caption" color="error" textAlign="center">{error}</Typography>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
      />
    </Box>
  );
});

export default ImageUploader;
