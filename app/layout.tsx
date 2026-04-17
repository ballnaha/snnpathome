import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "SNNP AT HOME - สั่งซื้อออนไลน์สินค้าเครือ SNNP",
    template: "%s | SNNP AT HOME"
  },
  description: "แหล่งรวมสินค้าคุณภาพจาก SNNP - Bento, Jele, Lotus, Squidy และอีกมากมาย ส่งตรงถึงบ้านคุณในราคาพิเศษ พร้อมโปรโมชั่นดีๆ ทุกวัน",
  keywords: ["SNNP", "เบนโตะ", "เจเล่", "โลตัส", "ขนมขบเคี้ยว", "สั่งขนมออนไลน์", "Bento", "Jele"],
  authors: [{ name: "Srinanaporn Marketing Public Company Limited" }],
  openGraph: {
    title: "SNNP AT HOME",
    description: "สั่งซื้อออนไลน์สินค้าเครือ SNNP ส่งตรงถึงบ้านคุณ",
    type: "website",
    locale: "th_TH",
    siteName: "SNNP AT HOME",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // Stale or invalid JWT cookie (e.g. secret rotation) — treat as unauthenticated
  }

  return (
    <html lang="th" className="antialiased">
      <body className="flex flex-col min-h-[100dvh]">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
