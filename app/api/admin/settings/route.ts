import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminUnauthorizedResponse, requireAdminSession } from "@/lib/admin-auth";

const DEFAULT_ID = "default";

function normalizeUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeBoolean(value: unknown) {
  return value === true;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const settings = await prisma.siteSetting.upsert({
    where: { id: DEFAULT_ID },
    update: {},
    create: { id: DEFAULT_ID },
    include: {
      announcementItems: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminUnauthorizedResponse();

  const body = await req.json();
  const settings = await prisma.siteSetting.upsert({
    where: { id: DEFAULT_ID },
    update: {
      facebookUrl: normalizeUrl(body.facebookUrl),
      instagramUrl: normalizeUrl(body.instagramUrl),
      youtubeUrl: normalizeUrl(body.youtubeUrl),
      lineUrl: normalizeUrl(body.lineUrl),
      callCenterPhone: normalizeText(body.callCenterPhone),
      lineOfficial: normalizeText(body.lineOfficial),
      contactEmail: normalizeText(body.contactEmail),
      serviceHours: normalizeText(body.serviceHours),
      bankAccountInfo: normalizeText(body.bankAccountInfo),
      companyAddress: normalizeText(body.companyAddress),
      announcementActive: normalizeBoolean(body.announcementActive),
      // Update announcement items
      announcementItems: {
        deleteMany: {},
        create: (body.announcementItems || []).map((item: any, index: number) => ({
          imageUrl: item.imageUrl,
          link: normalizeUrl(item.link),
          sortOrder: index,
        })),
      },
    },
    create: {
      id: DEFAULT_ID,
      facebookUrl: normalizeUrl(body.facebookUrl),
      instagramUrl: normalizeUrl(body.instagramUrl),
      youtubeUrl: normalizeUrl(body.youtubeUrl),
      lineUrl: normalizeUrl(body.lineUrl),
      callCenterPhone: normalizeText(body.callCenterPhone),
      lineOfficial: normalizeText(body.lineOfficial),
      contactEmail: normalizeText(body.contactEmail),
      serviceHours: normalizeText(body.serviceHours),
      bankAccountInfo: normalizeText(body.bankAccountInfo),
      companyAddress: normalizeText(body.companyAddress),
      announcementActive: normalizeBoolean(body.announcementActive),
      announcementItems: {
        create: (body.announcementItems || []).map((item: any, index: number) => ({
          imageUrl: item.imageUrl,
          link: normalizeUrl(item.link),
          sortOrder: index,
        })),
      },
    },
    include: {
      announcementItems: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(settings);
}