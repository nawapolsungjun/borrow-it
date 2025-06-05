// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { generateToken, setAuthCookie } from "@/lib/auth"; // นำเข้าฟังก์ชัน JWT
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "กรุณาป้อนชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // เปรียบเทียบรหัสผ่านแบบ Plain Text (ตามที่คุณต้องการ)
    if (password !== user.password) {
      return NextResponse.json(
        { message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // ล็อกอินสำเร็จ: สร้าง JWT
    const token = generateToken({ id: user.id, username: user.username, role: user.role });

    // ตั้งค่า Cookie
    const cookie = setAuthCookie(token);

    // ส่งการตอบกลับพร้อม Set-Cookie Header
    return new NextResponse(
      JSON.stringify({
        message: "เข้าสู่ระบบสำเร็จ",
        user: { id: user.id, username: user.username, role: user.role },
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 }
    );
  }
}