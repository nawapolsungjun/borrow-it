// app/api/auth/register/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. ตรวจสอบว่ามี username และ password ส่งมาหรือไม่
    if (!username || !password) {
      return NextResponse.json(
        { message: "กรุณาป้อนชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    // 2. ตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    // 3. บันทึกรหัสผ่านแบบ Plain Text โดยตรง
    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: password, // บันทึกรหัสผ่านแบบ Plain Text
        role: "USER", // กำหนดบทบาทเริ่มต้นเป็น "USER"
      },
    });

    // 4. ตอบกลับเมื่อสมัครสมาชิกสำเร็จ
    return NextResponse.json(
      {
        message: "สมัครสมาชิกสำเร็จ",
        user: { id: newUser.id, username: newUser.username, role: newUser.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  }
}