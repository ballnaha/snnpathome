"use client";

import React, { useEffect, useState } from "react";
import { Dialog, Box, IconButton, Link, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { CloseCircle } from "iconsax-react";

// Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface AnnouncementItem {
  imageUrl: string;
  link: string | null;
}

interface AnnouncementModalProps {
  active: boolean;
  items: AnnouncementItem[];
}

export default function AnnouncementModal({ active, items }: AnnouncementModalProps) {
  const [open, setOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    if (active && items.length > 0) {
      const hideUntilDate = localStorage.getItem("announcement_hide_date");
      const todayString = new Date().toLocaleDateString("en-CA");

      if (hideUntilDate !== todayString) {
        setOpen(true);
      }
    }
  }, [active, items]);

  const handleClose = () => {
    setOpen(false);
    if (dontShowToday) {
      const todayString = new Date().toLocaleDateString("en-CA");
      localStorage.setItem("announcement_hide_date", todayString);
    }
  };

  const validItems = items.filter((item) => item.imageUrl && item.imageUrl.trim() !== "");

  if (!active || validItems.length === 0) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "transparent",
          boxShadow: "none",
          overflow: "visible",
          borderRadius: 4,
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: -45,
            right: 0,
            color: "white",
            bgcolor: "rgba(0,0,0,0.2)",
            "&:hover": { bgcolor: "primary.main", transform: "rotate(90deg)" },
            transition: "all 0.3s ease",
            zIndex: 10,
          }}
        >
          <CloseCircle size="36" color="white" variant="Bold" />
        </IconButton>

        <Box 
          sx={{ 
            overflow: "hidden", 
            borderRadius: 4, 
            bgcolor: "white", 
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            "& .swiper-pagination-bullet-active": {
              bgcolor: "primary.main"
            }
          }}
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            navigation={false}
            autoHeight={true}
            pagination={validItems.length > 1 ? { clickable: true } : false}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={validItems.length > 1}
            style={{ width: "100%" }}
          >
            {validItems.map((item, index) => (
              <SwiperSlide key={index}>
                {item.link ? (
                  <Link href={item.link} target="_blank" rel="noopener noreferrer">
                    <Box
                      component="img"
                      src={item.imageUrl}
                      sx={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </Link>
                ) : (
                  <Box
                    component="img"
                    src={item.imageUrl}
                    sx={{ width: "100%", height: "auto", display: "block" }}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          <Box 
            sx={{ 
              p: 1.5, 
              bgcolor: "white", 
              display: "flex", 
              justifyContent: "center",
              borderTop: "1px solid",
              borderColor: "grey.100"
            }}
          >
            <FormControlLabel 
              control={
                <Checkbox 
                  size="small" 
                  checked={dontShowToday} 
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary", userSelect: "none" }}>
                  ไม่ต้องแสดงป๊อปอัพนี้อีกในวันนี้
                </Typography>
              }
            />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
