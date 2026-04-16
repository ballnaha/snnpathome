import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

// Max allowed base64 payload ~5 MB decoded → ~6.8 MB encoded
const MAX_BYTES = 7 * 1024 * 1024;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    // Validate order exists
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    // Only allow slip upload for PENDING orders
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "ไม่สามารถแนบสลิปได้ เนื่องจากคำสั่งซื้อนี้ถูกดำเนินการแล้ว" },
        { status: 400 }
      );
    }

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BYTES) {
      return NextResponse.json({ error: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5 MB)" }, { status: 413 });
    }

    const body = await req.json();
    const { slipUrl } = body as { slipUrl?: string };

    if (!slipUrl || typeof slipUrl !== "string") {
      return NextResponse.json({ error: "ข้อมูลสลิปไม่ถูกต้อง" }, { status: 400 });
    }

    // Validate it's a data URL image (jpeg/png/webp/gif)
    const match = slipUrl.match(/^data:image\/(jpeg|png|webp|gif);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "รูปแบบไฟล์ไม่รองรับ" }, { status: 400 });
    }

    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Save to public/uploads/{orderNumber}/slip.{ext}
    const uploadDir = path.join(process.cwd(), "public", "uploads", orderNumber);
    fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `slip.${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicPath = `/uploads/${orderNumber}/${filename}`;

    await prisma.order.update({
      where: { orderNumber },
      data: { slipUrl: publicPath },
    });

    return NextResponse.json({ success: true, slipUrl: publicPath });
  } catch (error) {
    console.error("[PATCH /api/orders/[orderNumber]/slip]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
