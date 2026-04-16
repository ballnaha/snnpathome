import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json();
  const { type } = body;

  // --- Update profile info ---
  if (type === "info") {
    const { name, phone, address, subdistrict, district, province, postcode } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อ" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        subdistrict: subdistrict?.trim() || null,
        district: district?.trim() || null,
        province: province?.trim() || null,
        postcode: postcode?.trim() || null,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json(updated);
  }

  // --- Change password ---
  if (type === "password") {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });

    if (!user?.password) {
      return NextResponse.json({ error: "บัญชีนี้ไม่มีรหัสผ่าน (เข้าสู่ระบบผ่าน Google)" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "ประเภทการแก้ไขไม่ถูกต้อง" }, { status: 400 });
}
