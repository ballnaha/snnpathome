"use client";

import React from "react";
import { Box, Button, CircularProgress, Divider, InputAdornment, Paper, Stack, TextField, Typography, Switch, FormControlLabel, IconButton } from "@mui/material";
import { Facebook, Instagram, TickCircle, Video, CloseCircle, MessageQuestion, Notification, Gallery, Link1, Add, Trash } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import ImageUploader, { ImageUploaderRef } from "@/components/ImageUploader";

const SOCIAL_KEYS = ["facebookUrl", "instagramUrl", "youtubeUrl", "lineUrl"] as const;
type SocialKey = (typeof SOCIAL_KEYS)[number];

interface AdminSettingsClientProps {
  initialSettings: {
    facebookUrl: string | null;
    instagramUrl: string | null;
    youtubeUrl: string | null;
    lineUrl: string | null;
    callCenterPhone: string | null;
    lineOfficial: string | null;
    contactEmail: string | null;
    serviceHours: string | null;
    bankAccountInfo: string | null;
    companyAddress: string | null;
    announcementActive: boolean;
    announcementItems: { id: string; imageUrl: string; link: string }[];
  };
  updatedAt: string;
}

export default function AdminSettingsClient({ initialSettings, updatedAt }: AdminSettingsClientProps) {
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    facebookUrl: initialSettings.facebookUrl ?? "",
    instagramUrl: initialSettings.instagramUrl ?? "",
    youtubeUrl: initialSettings.youtubeUrl ?? "",
    lineUrl: initialSettings.lineUrl ?? "",
    callCenterPhone: initialSettings.callCenterPhone ?? "",
    lineOfficial: initialSettings.lineOfficial ?? "",
    contactEmail: initialSettings.contactEmail ?? "",
    serviceHours: initialSettings.serviceHours ?? "",
    bankAccountInfo: initialSettings.bankAccountInfo ?? "",
    companyAddress: initialSettings.companyAddress ?? "",
    announcementActive: initialSettings.announcementActive,
    announcementItems: initialSettings.announcementItems,
  });

  const uploaderRefs = React.useRef<Record<string, ImageUploaderRef | null>>({});

  const errors = React.useMemo(() => {
    const nextErrors: Record<SocialKey, string> = {
      facebookUrl: "",
      instagramUrl: "",
      youtubeUrl: "",
      lineUrl: "",
    };

    SOCIAL_KEYS.forEach((key) => {
      const value = form[key].trim();
      if (!value) return;

      try {
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol)) {
          nextErrors[key] = "URL ต้องขึ้นต้นด้วย http:// หรือ https://";
        }
      } catch {
        nextErrors[key] = "รูปแบบ URL ไม่ถูกต้อง";
      }
    });

    return nextErrors;
  }, [form]);

  const hasErrors = Object.values(errors).some(Boolean);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleAddItem = () => {
    setForm((curr) => ({
      ...curr,
      announcementItems: [
        ...curr.announcementItems,
        { id: `new-${Date.now()}`, imageUrl: "", link: "" },
      ],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setForm((curr) => ({
      ...curr,
      announcementItems: curr.announcementItems.filter((item) => item.id !== id),
    }));
  };

  const handleItemChange = (id: string, field: "imageUrl" | "link", value: string) => {
    setForm((curr) => ({
      ...curr,
      announcementItems: curr.announcementItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSave = async () => {
    if (hasErrors) {
      showSnackbar("กรุณาแก้ไข URL ที่ไม่ถูกต้องก่อนบันทึก", "error");
      return;
    }

    setSaving(true);
    try {
      // Handle Image Uploads for all items
      const updatedItems = await Promise.all(
        form.announcementItems.map(async (item) => {
          const ref = uploaderRefs.current[item.id];
          if (ref) {
            try {
              const uploadedUrl = await ref.upload();
              return { ...item, imageUrl: uploadedUrl };
            } catch (e) {
              throw e;
            }
          }
          return item;
        })
      );

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          announcementItems: updatedItems
        }),
      });

      if (!response.ok) {
        showSnackbar("บันทึกการตั้งค่าไม่สำเร็จ", "error");
        return;
      }

      showSnackbar("บันทึกการตั้งค่าเรียบร้อย", "success");
    } catch {
      showSnackbar("บันทึกการตั้งค่าไม่สำเร็จ", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3.5, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ px: 3, py: 2.2, borderBottom: "1px solid", borderColor: "grey.100", bgcolor: "grey.50" }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <MessageQuestion size="20" color="#d71414" variant="Bold" />
          <Box>
            <Typography fontWeight={900}>ตั้งค่าข้อมูลสำหรับแสดงบนเว็บไซต์</Typography>
            <Typography variant="caption" color="text.secondary">จัดการลิงก์โซเชียล ช่องทางติดต่อ บัญชีธนาคาร และที่อยู่</Typography>
          </Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          อัปเดตล่าสุด {new Date(updatedAt).toLocaleString("th-TH")}
        </Typography>
      </Stack>

      <Stack spacing={3} sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, p: 2.2 }}>
          <Typography variant="subtitle2" fontWeight={900} mb={2}>Social Media URLs</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Facebook URL"
              fullWidth
              value={form.facebookUrl}
              onChange={(event) => handleChange("facebookUrl", event.target.value)}
              placeholder="https://facebook.com/your-page"
              error={!!errors.facebookUrl}
              helperText={errors.facebookUrl || "ลิงก์เพจ Facebook ที่จะใช้บนหน้าเว็บ"}
              InputProps={{ startAdornment: <InputAdornment position="start"><Facebook size="18" color="#1877F2" /></InputAdornment> }}
            />
            <TextField
              label="Instagram URL"
              fullWidth
              value={form.instagramUrl}
              onChange={(event) => handleChange("instagramUrl", event.target.value)}
              placeholder="https://instagram.com/your-account"
              error={!!errors.instagramUrl}
              helperText={errors.instagramUrl || "ลิงก์บัญชี Instagram ที่จะใช้บนหน้าเว็บ"}
              InputProps={{ startAdornment: <InputAdornment position="start"><Instagram size="18" color="#E4405F" /></InputAdornment> }}
            />
            <TextField
              label="YouTube URL"
              fullWidth
              value={form.youtubeUrl}
              onChange={(event) => handleChange("youtubeUrl", event.target.value)}
              placeholder="https://youtube.com/@your-channel"
              error={!!errors.youtubeUrl}
              helperText={errors.youtubeUrl || "ลิงก์ช่อง YouTube ของแบรนด์หรือบริษัท"}
              InputProps={{ startAdornment: <InputAdornment position="start"><Video size="18" color="#FF0000" /></InputAdornment> }}
            />
            <TextField
              label="LINE URL"
              fullWidth
              value={form.lineUrl}
              onChange={(event) => handleChange("lineUrl", event.target.value)}
              placeholder="https://line.me/R/ti/p/@your-line"
              error={!!errors.lineUrl}
              helperText={errors.lineUrl || "ลิงก์ LINE OA หรือแชทที่ใช้ให้ลูกค้าติดต่อ"}
              InputProps={{ startAdornment: <InputAdornment position="start"><MessageQuestion size="18" color="#06C755" /></InputAdornment> }}
            />
          </Box>
        </Box>

        <Box sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, p: 2.2 }}>
          <Typography variant="subtitle2" fontWeight={900} mb={2}>ข้อมูลสอบถามเพิ่มเติม</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Call Center โทร."
              fullWidth
              value={form.callCenterPhone}
              onChange={(event) => handleChange("callCenterPhone", event.target.value)}
              placeholder="089-306-4444"
              helperText="เช่น 089-306-4444"
            />
            <TextField
              label="Line Official"
              fullWidth
              value={form.lineOfficial}
              onChange={(event) => handleChange("lineOfficial", event.target.value)}
              placeholder="@snnpathome"
              helperText="เช่น @snnpathome"
            />
            <TextField
              label="E-mail"
              fullWidth
              value={form.contactEmail}
              onChange={(event) => handleChange("contactEmail", event.target.value)}
              placeholder="Snnpathome@gmail.com"
              helperText="อีเมลสำหรับลูกค้าติดต่อสอบถาม"
            />
            <TextField
              label="เวลาเปิดบริการ"
              fullWidth
              value={form.serviceHours}
              onChange={(event) => handleChange("serviceHours", event.target.value)}
              placeholder="จันทร์-ศุกร์ เวลา 09.00 - 17.00 น."
              helperText="ระบุวันและช่วงเวลาให้บริการ"
            />
          </Box>
        </Box>

        <Box sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, p: 2.2 }}>
          <Typography variant="subtitle2" fontWeight={900} mb={2}>ข้อมูลธุรกิจ</Typography>
          <Stack spacing={2}>
            <TextField
              label="บัญชีธนาคาร"
              fullWidth
              multiline
              rows={4}
              value={form.bankAccountInfo}
              onChange={(event) => handleChange("bankAccountInfo", event.target.value)}
              placeholder="ชื่อบัญชี / ธนาคาร / เลขบัญชี"
            />
            <TextField
              label="ที่อยู่"
              fullWidth
              multiline
              rows={4}
              value={form.companyAddress}
              onChange={(event) => handleChange("companyAddress", event.target.value)}
              placeholder="ที่อยู่บริษัทหรือที่อยู่สำหรับติดต่อ"
            />
          </Stack>
        </Box>

        <Box sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, p: 2.2, bgcolor: form.announcementActive ? "rgba(215, 20, 20, 0.02)" : "transparent" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Notification size="20" color="#d71414" variant="Bold" />
              <Typography variant="subtitle2" fontWeight={900}>ป๊อปอัพแจ้งเตือน (Announcement Modal)</Typography>
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={form.announcementActive}
                  onChange={(e) => handleChange("announcementActive", e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2" fontWeight={700}>{form.announcementActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</Typography>}
            />
          </Stack>

          <Stack spacing={3}>
            {form.announcementItems.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                  position: "relative"
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="caption" fontWeight={900} color="primary.main">
                    รูปที่ {index + 1}
                  </Typography>
                  <IconButton size="small" onClick={() => handleRemoveItem(item.id)} sx={{ color: "error.main" }}>
                    <Trash size="16" color="#d71414" />
                  </IconButton>
                </Stack>

                <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <Box>
                    <ImageUploader
                      ref={(el) => { uploaderRefs.current[item.id] = el; }}
                      value={item.imageUrl}
                      onChange={(url) => handleItemChange(item.id, "imageUrl", url)}
                      size={120}
                    />
                  </Box>

                  <Stack spacing={2} sx={{ flexGrow: 1, minWidth: 250 }}>
                    <TextField
                      label="ลิงก์ปลายทาง (URL)"
                      fullWidth
                      size="small"
                      value={item.link}
                      onChange={(e) => handleItemChange(item.id, "link", e.target.value)}
                      placeholder="https://snnpathome.com/promotions"
                      disabled={!form.announcementActive}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Link1 size="16" color="#999" /></InputAdornment>
                      }}
                    />
                  </Stack>
                </Box>
              </Box>
            ))}

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Add size="18" />}
              onClick={handleAddItem}
              disabled={form.announcementItems.length >= 5}
              sx={{ borderRadius: 2.5, py: 1.5, borderStyle: "dashed" }}
            >
              เพิ่มรูปภาพ {form.announcementItems.length > 0 ? "เพิ่ม" : ""} ({form.announcementItems.length}/5)
            </Button>

            <Typography variant="caption" color="text.secondary">
              แนะนำขนาดรูปภาพ 800x800px หรือแนวตั้งเพื่อให้แสดงผลสวยงามบนมือถือ (เพิ่มได้สูงสุด 5 รูป)
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Divider />
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} sx={{ px: { xs: 2, md: 3 }, py: 2, bgcolor: "grey.50", position: "sticky", bottom: 0, zIndex: 5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          บันทึกการเปลี่ยนแปลงเพื่อให้อัปเดตบนหน้าเว็บไซต์ทันที
        </Typography>
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => setForm({
              facebookUrl: initialSettings.facebookUrl ?? "",
              instagramUrl: initialSettings.instagramUrl ?? "",
              youtubeUrl: initialSettings.youtubeUrl ?? "",
              lineUrl: initialSettings.lineUrl ?? "",
              callCenterPhone: initialSettings.callCenterPhone ?? "",
              lineOfficial: initialSettings.lineOfficial ?? "",
              contactEmail: initialSettings.contactEmail ?? "",
              serviceHours: initialSettings.serviceHours ?? "",
              bankAccountInfo: initialSettings.bankAccountInfo ?? "",
              companyAddress: initialSettings.companyAddress ?? "",
              announcementActive: initialSettings.announcementActive,
              announcementItems: initialSettings.announcementItems,
            })}
            startIcon={<CloseCircle size="16" color="currentColor" />}
            sx={{ fontWeight: 700 }}
          >
            รีเซ็ต
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || hasErrors}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <TickCircle size="16" color="white" />}
            sx={{ fontWeight: 800, borderRadius: 2.5 }}
          >
            บันทึก
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}