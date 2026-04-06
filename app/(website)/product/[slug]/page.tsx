import React from "react";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const productName = decodeURIComponent(slug).replace(/-/g, ' ');

  return {
    title: productName,
    description: `ซื้อ ${productName} ออนไลน์ได้ที่ SNNP AT HOME พร้อมโปรโมชั่นพิเศษและจัดส่งตรงถึงบ้านคุณ ผลิตภัณฑ์คุณภาพจากเครือ SNNP`,
    openGraph: {
      title: `${productName} | SNNP AT HOME`,
      description: `สั่งซื้อ ${productName} วันนี้ รับส่วนลดพิเศษ ส่งไว ถึงบ้านคุณ`,
      type: "website",
    }
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
