
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

// POST Request: สำหรับการออกจากระบบ
export async function POST() {
  try {
    const cookie = clearAuthCookie(); // เรียกใช้ฟังก์ชันเพื่อสร้าง cookie ที่จะล้าง/หมดอายุ token
    return new NextResponse(JSON.stringify({ message: "ออกจากระบบสำเร็จ" }), {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการออกจากระบบ" },
      { status: 500 }
    );
  }
}

// GET Request: สำหรับการออกจากระบบ
export async function GET() {
  try {
    const cookie = clearAuthCookie();
    return new NextResponse(
      JSON.stringify({ message: "ออกจากระบบสำเร็จ (GET)" }),
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Logout GET error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการออกจากระบบ (GET)" },
      { status: 500 }
    );
  }
}
