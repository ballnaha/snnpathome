import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://demo.snnpathome.com"),
  title: {
    default: "SNNP AT HOME - สั่งซื้อออนไลน์สินค้าเครือ SNNP ส่งตรงถึงบ้าน",
    template: "%s | SNNP AT HOME"
  },
  description: "SNNP AT HOME อีกหนึ่งบริการที่มอบความสะดวกสบาย พร้อมตอบสนองไลฟ์สไตล์ สั่งง่าย อิ่มอร่อย ได้ทุกที่ สั่งซื้อผลิตภัณฑ์ในเครือ SNNP ผ่านเว็บไซต์ พร้อมบริการจัดส่งฟรี เมื่อมียอดสั่งซื้อขั้นต่ำ 300 บาท",
  keywords: [
    "SNNP", "SNNP AT HOME", "เบนโตะ", "เจเล่", "โลตัส", "เบเกอรี่เฮ้าส์",
    "ขนมขบเคี้ยว", "สั่งขนมออนไลน์", "ขนมส่งตรงถึงบ้าน",
    "Bento", "Jele", "Lotus", "Bakery House",
    "ศรีนานาพร", "สินค้าเครือ SNNP", "ขนมราคาถูก", "ขนมยกลัง",
  ],
  authors: [{ name: "Srinanaporn Marketing Public Company Limited" }],
  creator: "SNNP AT HOME",
  publisher: "Srinanaporn Marketing Public Company Limited",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "SNNP AT HOME - สั่งซื้อออนไลน์สินค้าเครือ SNNP",
    description: "SNNP AT HOME อีกหนึ่งบริการที่มอบความสะดวกสบาย สั่งง่าย อิ่มอร่อย ได้ทุกที่ สั่งซื้อผลิตภัณฑ์ในเครือ SNNP พร้อมบริการจัดส่งฟรี เมื่อมียอดสั่งซื้อขั้นต่ำ 300 บาท",
    type: "website",
    locale: "th_TH",
    siteName: "SNNP AT HOME",
    images: [
      {
        url: "/images/banner.jpg",
        width: 1200,
        height: 630,
        alt: "SNNP AT HOME - สั่งซื้อออนไลน์สินค้าเครือ SNNP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SNNP AT HOME - สั่งซื้อออนไลน์สินค้าเครือ SNNP",
    description: "SNNP AT HOME สั่งซื้อผลิตภัณฑ์ในเครือ SNNP พร้อมบริการจัดส่งฟรี เมื่อมียอดสั่งซื้อขั้นต่ำ 300 บาท",
    images: ["/images/banner.jpg"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  verification: {
    // เพิ่ม verification code เมื่อมี
    // google: "your-google-verification-code",
  },
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
        <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID || ""} />
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
