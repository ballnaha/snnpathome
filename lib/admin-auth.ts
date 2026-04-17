import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return null;
  }

  return session;
}

export function adminUnauthorizedResponse(message = "Unauthorized", status = 401) {
  return NextResponse.json({ error: message }, { status });
}