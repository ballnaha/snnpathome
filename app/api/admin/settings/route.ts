import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const DEFAULT_ID = "default";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

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

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.siteSetting.upsert({
    where: { id: DEFAULT_ID },
    update: {},
    create: { id: DEFAULT_ID },
  });

  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    },
  });

  return NextResponse.json(settings);
}