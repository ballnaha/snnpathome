import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

/** Safely delete a file or directory under public/uploads — prevents path traversal */
function safeDelete(relPath: string) {
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const target = path.resolve(uploadsRoot, relPath);
  if (!target.startsWith(uploadsRoot + path.sep)) return;
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, slug, logo, priority } = await req.json();

  try {
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(logo !== undefined && { logo: logo || null }),
        ...(priority !== undefined && { priority: Number(priority) }),
      },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "ชื่อหรือ slug ซ้ำ" }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  // Fetch brand info before deletion for cleanup
  const brand = await prisma.brand.findUnique({
    where: { id },
    select: { slug: true, logo: true },
  });

  await prisma.brand.delete({ where: { id } });

  if (brand) {
    // Delete brand logo file (e.g. /uploads/brands/uuid.webp)
    if (brand.logo) {
      const logoRel = brand.logo.replace(/^\/uploads\//, "");
      safeDelete(logoRel);
    }
    // Delete all product image folders: public/uploads/products/[brandSlug]
    const brandSlug = brand.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    safeDelete(path.join("products", brandSlug));
  }

  return NextResponse.json({ ok: true });
}
