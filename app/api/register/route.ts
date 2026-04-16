import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return new NextResponse("กรุณากรอกข้อมูลให้ครบถ้วน", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (existingUser) {
      return new NextResponse("อีเมลนี้ถูกใช้งานแล้ว", { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "USER"
      }
    });

    // Link any guest orders placed with this email
    await prisma.order.updateMany({
      where: { email, userId: null },
      data: { userId: user.id },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง", { status: 500 });
  }
}
