"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { Prompt } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { SnackbarProvider } from "@/components/SnackbarProvider";
import { CartProvider } from "@/contexts/CartContext";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#d71414", // Updated primary red
    },
    background: {
      default: "#F8F9FA",
    },
  },
  typography: {
    fontFamily: prompt.style.fontFamily,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
        },
      },
    },
  },
});

export default function Providers({ children, session }: { children: React.ReactNode; session: any }) {
  return (
    <SessionProvider session={session}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <CartProvider>
              <div className={prompt.className}>
                {children}
              </div>
            </CartProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </SessionProvider>
  );
}

