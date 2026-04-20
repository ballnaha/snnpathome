import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

/** Content-type map for common image formats */
const MIME_MAP: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

/**
 * Serve uploaded files from public/uploads/...
 * 
 * In production, Next.js does NOT serve files added to `public/` after build.
 * This API route solves that by reading the file from disk and streaming it
 * with proper caching headers.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;
  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Reconstruct file path and prevent directory traversal
  const relativePath = segments.join("/").replace(/\.\./g, "");
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadsRoot, relativePath);

  // Security: must stay inside uploads root
  if (!filePath.startsWith(uploadsRoot + path.sep) && filePath !== uploadsRoot) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_MAP[ext] || "application/octet-stream";
  const buffer = fs.readFileSync(filePath);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
