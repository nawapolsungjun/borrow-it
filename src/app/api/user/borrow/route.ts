import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // ตรวจสอบว่ามี authToken หรือไม่
    const user = verifyToken(authToken);

    if (!user || user.role !== "USER") {
      return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 403 });
    }

    const { itemId } = await request.json();

    // ตรวจสอบว่ามี itemId หรือไม่
    if (!itemId) {
      return NextResponse.json(
        { message: "ไม่ได้ระบุรหัสอุปกรณ์" },
        { status: 400 }
      );
    }

    // ค้นหาอุปกรณ์ในฐานข้อมูลด้วย itemId
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    // หากไม่พบอุปกรณ์
    if (!item) {
      return NextResponse.json({ message: "ไม่พบอุปกรณ์" }, { status: 404 });
    }

    // ตรวจสอบสถานะของอุปกรณ์ว่าพร้อมให้ยืมหรือไม่
    if (item.status !== "AVAILABLE") {
      return NextResponse.json(
        { message: "อุปกรณ์นี้ไม่พร้อมให้ยืม" },
        { status: 400 }
      );
    }

    // อัปเดตสถานะอุปกรณ์และสร้างบันทึกการยืมพร้อมกัน
    await prisma.$transaction(async (prisma) => {
      // อัปเดตสถานะของอุปกรณ์เป็น "BORROWED"ห
      await prisma.item.update({
        where: { id: itemId },
        data: {
          status: "BORROWED",
        },
      });

      // สร้างบันทึกการยืมใหม่
      await prisma.borrowRecord.create({
        data: {
          userId: user.id,
          itemId: itemId,
          borrowedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ message: "ยืมอุปกรณ์สำเร็จ" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to borrow item:", error);
    const errorMessage =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
    return NextResponse.json(
      { message: errorMessage || "เกิดข้อผิดพลาดในการยืมอุปกรณ์" },
      { status: 500 }
    );
  }
}
