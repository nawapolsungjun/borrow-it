// src/app/api/user/return/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json({ message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const user = verifyToken(authToken);

    if (!user || user.role !== 'USER') {
      return NextResponse.json({ message: 'ไม่ได้รับอนุญาต' }, { status: 403 });
    }

    const { borrowRecordId } = await request.json(); // รับ ID ของ BorrowRecord ที่ต้องการคืน

    if (!borrowRecordId) {
      return NextResponse.json({ message: 'ไม่ได้ระบุรหัสบันทึกการยืม' }, { status: 400 });
    }

    // ค้นหา BorrowRecord
    const borrowRecord = await prisma.borrowRecord.findUnique({
      where: { id: borrowRecordId },
      include: { item: true }, // ต้องรวมข้อมูล item เพื่ออัปเดตสถานะ
    });

    if (!borrowRecord) {
      return NextResponse.json({ message: 'ไม่พบบันทึกการยืม' }, { status: 404 });
    }

    // ตรวจสอบว่าเป็นบันทึกการยืมของผู้ใช้คนปัจจุบันและยังไม่ถูกคืน
    if (borrowRecord.userId !== user.id || borrowRecord.returnedAt !== null) {
      return NextResponse.json({ message: 'ไม่สามารถดำเนินการคืนอุปกรณ์ได้' }, { status: 400 });
    }

    // เริ่ม Transaction เพื่อให้แน่ใจว่าการอัปเดต BorrowRecord และ Item เป็นไปพร้อมกัน
    await prisma.$transaction(async (prisma) => {
      // อัปเดต returnedAt ใน BorrowRecord
      await prisma.borrowRecord.update({
        where: { id: borrowRecordId },
        data: {
          returnedAt: new Date(), // ตั้งค่าเวลาที่คืน
        },
      });

      // อัปเดตสถานะอุปกรณ์กลับเป็น "AVAILABLE"
      await prisma.item.update({
        where: { id: borrowRecord.itemId },
        data: {
          status: "AVAILABLE",
        },
      });
    });

    return NextResponse.json({ message: 'คืนอุปกรณ์สำเร็จ' }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to return item:", error);
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการคืนอุปกรณ์';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}