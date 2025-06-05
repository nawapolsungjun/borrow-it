// src/app/api/user/borrow/route.ts
import { NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


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

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ message: 'ไม่ได้ระบุรหัสอุปกรณ์' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ message: 'ไม่พบอุปกรณ์' }, { status: 404 });
    }

    if (item.status !== "AVAILABLE") {
      return NextResponse.json({ message: 'อุปกรณ์นี้ไม่พร้อมให้ยืม' }, { status: 400 });
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.item.update({
        where: { id: itemId },
        data: {
          status: "BORROWED",
        },
      });

      await prisma.borrowRecord.create({
        data: {
          userId: user.id,
          itemId: itemId,
          borrowedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ message: 'ยืมอุปกรณ์สำเร็จ' }, { status: 200 });
  } catch (error: unknown) { // แก้ไข: เปลี่ยนเป็น unknown
    console.error("Failed to borrow item:", error);
    // เพิ่มการตรวจสอบ Type เพื่อเข้าถึง error.message
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    return NextResponse.json({ message: errorMessage || 'เกิดข้อผิดพลาดในการยืมอุปกรณ์' }, { status: 500 });
  }
}