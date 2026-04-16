"use client";

import React from "react";
import { Box } from "@mui/material";

export default function Hero() {
  return (
    <Box 
      sx={{ 
        width: "100%", 
        height: { xs: "45vw", sm: "calc(100vh - 110px)" },
        minHeight: { xs: 200, sm: 300 },
        bgcolor: "#f0f0f0", 
        overflow: "hidden", 
        position: "relative",
      }}
    >
      {/* Replacement: Full Screen Background Image */}
      <Box 
        sx={{ 
          width: "100%", 
          height: "100%", 
          backgroundImage: "url('/images/banner.jpg')", 
          backgroundSize: "cover", // Ensures it fills wide and high
          backgroundPosition: "center",
          zIndex: 0
        }} 
      />
    </Box>
  );
}
