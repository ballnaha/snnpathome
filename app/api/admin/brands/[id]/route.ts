import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";
import path from "path";
import fs from "fs";

/** Safely delete a file or directory under public/uploads — prevents path traversal */
function safeDelete(relPath: string) {
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const target = path.resolve(uploadsRoot, relPath);
  if (!target.startsWith(uploadsRoot + path.sep)) return;
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

function safeDeleteLogoFile(logoUrl: string | null | undefined) {
  if (!logoUrl || !logoUrl.startsWith("/uploads/")) return;
  const relPath = logoUrl.replace(/^\/+/, "").replace(/^uploads\//, "");
  if (!relPath) return;

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const target = path.resolve(uploadsRoot, relPath);
  if (!target.startsWith(uploadsRoot + path.sep) && target !== uploadsRoot) return;

  try {
    if (fs.existsSync(target)) fs.unlinkSync(target);
  } catch (error) {
    console.error("[brands] could not delete logo:", target, error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();
  const { id } = await params;
  const { name, slug, logo, priority, isActive } = await req.json();

  const existingBrand = await prisma.brand.findUnique({
    where: { id },
    select: { logo: true },
  });

  if (!existingBrand) {
    return NextResponse.json({ error: "ไม่พบแบรนด์" }, { status: 404 });
  }

  let removedLogoUrl: string | null = null;
  if (logo !== undefined) {
    const nextLogo = logo || null;
    if (existingBrand.logo && existingBrand.logo !== nextLogo) {
      removedLogoUrl = existingBrand.logo;
    }
  }

  try {
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(logo !== undefined && { logo: logo || null }),
        ...(priority !== undefined && { priority: Number(priority) }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { _count: { select: { products: true } } },
    });
    if (removedLogoUrl) safeDeleteLogoFile(removedLogoUrl);
    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "ชื่อหรือ slug ซ้ำ" }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();
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
