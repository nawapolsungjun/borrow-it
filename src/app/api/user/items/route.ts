import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const user = verifyToken(authToken);

    if (!user || user.role !== "USER") {
      return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 403 });
    }

    // ดึงข้อมูลอุปกรณ์ทั้งหมดที่มีสถานะ "AVAILABLE" (พร้อมใช้งาน)
    const items = await prisma.item.findMany({
      where: {
        status: "AVAILABLE",
      },
    });

    return NextResponse.json(items, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch available items for user:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
