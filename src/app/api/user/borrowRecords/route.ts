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

    // ดึงบันทึกการยืมทั้งหมดของผู้ใช้คนปัจจุบัน พร้อมข้อมูล Item ที่เกี่ยวข้อง
    const borrowRecords = await prisma.borrowRecord.findMany({
      where: {
        userId: user.id,
      },
      include: {
        item: true,
      },
      orderBy: {
        borrowedAt: "desc", // เรียงลำดับตามวันที่ยืมล่าสุด
      },
    });

    return NextResponse.json(borrowRecords, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch user borrow records:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการยืม";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
