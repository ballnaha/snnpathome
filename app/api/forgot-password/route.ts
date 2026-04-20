import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("กรุณากรอกอีเมล", { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      // But in this specific case, it's often better to just say success
      return new NextResponse("OK", { status: 200 });
    }

    // Check if there's already a token and delete it
    await prisma.passwordResetToken.deleteMany({
      where: { email }
    });

    // Create new token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires
      }
    });

    // Send email
    await sendPasswordResetEmail(email, token, user.name || "Customer");

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return new NextResponse("เกิดข้อผิดพลาดภายในระบบ", { status: 500 });
  }
}
