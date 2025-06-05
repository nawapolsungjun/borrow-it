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

    // ตรวจสอบสิทธิ์ เฉพาะ ADMIN 
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 403 });
    }

    // ดึงบันทึกการยืมทั้งหมด พร้อมข้อมูล User และ Item ที่เกี่ยวข้อง
    const borrowRecords = await prisma.borrowRecord.findMany({
      include: {
        user: {
         
          select: {
            username: true, 
          },
        },
        item: true,
      },
      orderBy: {
        borrowedAt: "desc", // เรียงลำดับตามวันที่ยืมล่าสุด
      },
    });

    // user ใน BorrowRecord เป็น object ที่รวมมา
    // ปรับโครงสร้างข้อมูลเพื่อการแสดงผลในตาราง Ant Design ได้ง่ายขึ้น
    const formattedRecords = borrowRecords.map((record) => ({
      ...record,
      username: record.user.username,
    }));

    return NextResponse.json(formattedRecords, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch all borrow records for admin:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการยืม";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
