import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return new NextResponse("ข้อมูลไม่ถูกต้อง", { status: 400 });
    }

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: token,
        expires: { gt: new Date() }
      }
    });

    if (!resetToken) {
      return new NextResponse("ลิงก์หมดอายุหรือได้รับข้อมูลไม่ถูกต้อง", { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    });

    if (!user) {
      return new NextResponse("ไม่พบผู้ใช้งาน", { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Delete used token
    await prisma.passwordResetToken.deleteMany({
      where: { email: resetToken.email }
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]", error);
    return new NextResponse("เกิดข้อผิดพลาดภายในระบบ", { status: 500 });
  }
}
