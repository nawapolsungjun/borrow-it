import { NextResponse } from "next/server";
import { generateToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST สำหรับจัดการคำขอเข้าสู่ระบบ
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "กรุณาป้อนชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    // ค้นหาผู้ใช้ในฐานข้อมูลด้วย username
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    if (password !== user.password) {
      return NextResponse.json(
        { message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const cookie = setAuthCookie(token);

    return new NextResponse(
      JSON.stringify({
        message: "เข้าสู่ระบบสำเร็จ",
        user: { id: user.id, username: user.username, role: user.role },
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
          "Content-Type": "application/json",
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
