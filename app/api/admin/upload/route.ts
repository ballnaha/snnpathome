import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";

/** Max upload size: 10 MB */
const MAX_SIZE = 10 * 1024 * 1024;

/** Resize longest edge to this px */
const MAX_DIM = 400;

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse("ไม่มีสิทธิ์", 403);

  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_SIZE) {
      return NextResponse.json({ error: "ไฟล์ใหญ่เกินไป (สูงสุด 10 MB)" }, { status: 413 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize with sharp — fit inside MAX_DIM×MAX_DIM, convert to webp
    const processed = await sharp(buffer)
      .resize(MAX_DIM, MAX_DIM, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Save to public/uploads/<folder> — folder comes from ?folder= query param, default "misc"
    const rawFolder = new URL(req.url).searchParams.get("folder") ?? "misc";
    // Sanitize: allow only letters, numbers, hyphens, slashes (no dots or ..) 
    const safeFolder = rawFolder.replace(/[^a-zA-Z0-9\-\/]/g, "").replace(/\.\./g, "").replace(/^\/+|\/+$/g, "");
    const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
    fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `${randomUUID()}.webp`;
    fs.writeFileSync(path.join(uploadDir, filename), processed);

    return NextResponse.json({ url: `/uploads/${safeFolder}/${filename}` });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปโหลด" }, { status: 500 });
  }
}
