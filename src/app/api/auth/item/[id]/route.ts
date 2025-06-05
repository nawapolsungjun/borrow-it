// src/app/api/auth/item/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// --- GET Request: ดึงข้อมูลอุปกรณ์ตาม ID ---
export async function GET(request: Request, context: RouteContext) {
  // ประกาศตัวแปร paramId ที่นี่ เพื่อให้เข้าถึงได้ทั่วทั้งฟังก์ชัน
  let paramId: string | undefined;
  try {
    const { id: fetchedParamId } = await context.params;
    paramId = fetchedParamId; // กำหนดค่าให้กับ paramId ที่ประกาศไว้ด้านนอก
    const id = parseInt(paramId);

    if (isNaN(id)) {
      console.error(`[GET /api/auth/item/${paramId}] - Error: Invalid ID received. ID was '${paramId}'.`);
      return NextResponse.json(
        { message: "ID อุปกรณ์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: id },
    });

    if (!item) {
      console.warn(`[GET /api/auth/item/${id}] - Warning: Item with ID ${id} not found in DB.`);
      return NextResponse.json({ message: "ไม่พบอุปกรณ์" }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error(`[GET /api/auth/item/${paramId || 'unknown'}] - Error fetching item by ID:`, error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์" },
      { status: 500 }
    );
  }
}

// --- PUT Request: อัปเดตข้อมูลอุปกรณ์ตาม ID ---
export async function PUT(request: Request, context: RouteContext) {
  let paramId: string | undefined;
  try {
    const { id: fetchedParamId } = await context.params;
    paramId = fetchedParamId;
    const id = parseInt(paramId);
    const { name, serialNumber, status, description } = await request.json();

    if (isNaN(id)) {
      console.error(`[PUT /api/auth/item/${paramId}] - Error: Invalid ID received. ID was '${paramId}'.`);
      return NextResponse.json(
        { message: "ID อุปกรณ์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (serialNumber) {
      const existingItem = await prisma.item.findUnique({
        where: { serialNumber: serialNumber },
      });

      if (existingItem && existingItem.id !== id) {
        return NextResponse.json(
          { message: "Serial Number นี้มีอยู่ในระบบแล้ว" },
          { status: 409 }
        );
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id: id },
      data: {
        name,
        serialNumber,
        status,
        description,
      },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error(`[PUT /api/auth/item/${paramId || 'unknown'}] - Error updating item:`, error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการอัปเดตอุปกรณ์" },
      { status: 500 }
    );
  }
}

// --- DELETE Request: ลบอุปกรณ์ตาม ID ---
export async function DELETE(request: Request, context: RouteContext) {
  // **สำคัญ:** ประกาศ paramId ที่นี่ เพื่อให้เข้าถึงได้ใน catch block
  let paramId: string | undefined;

  try {
    const { id: fetchedParamId } = await context.params;
    paramId = fetchedParamId; // กำหนดค่าให้ paramId ที่ประกาศไว้ด้านนอก
    const id = parseInt(paramId); // แปลง ID จาก string เป็น number

    // --- เพิ่ม LOGGING ตรงนี้ ---
    console.log(
      `[DELETE /api/auth/item/${id}] - Received request to delete item.`
    );

    if (isNaN(id)) {
      console.error(
        `[DELETE /api/auth/item/${paramId}] - Error: Invalid ID received. ID was '${paramId}'.`
      );
      return NextResponse.json(
        { message: "ID อุปกรณ์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const existingItem = await prisma.item.findUnique({
      where: { id: id },
    });

    if (!existingItem) {
      console.warn(
        `[DELETE /api/auth/item/${id}] - Warning: Item with ID ${id} not found in DB.`
      );
      return NextResponse.json(
        { message: "ไม่พบอุปกรณ์ที่ต้องการลบ" },
        { status: 404 } // 404 Not Found
      );
    }

    await prisma.item.delete({
      where: { id: id },
    });

    console.log(
      `[DELETE /api/auth/item/${id}] - Successfully deleted item with ID ${id}.`
    );
    return NextResponse.json({ message: "ลบอุปกรณ์สำเร็จ" }, { status: 200 });
  } catch (error: unknown) {
    // ใช้ paramId ที่ประกาศไว้ด้านนอก ถ้า paramId ยังไม่มีค่า ให้ใช้ 'unknown' แทน
    console.error(
      `[DELETE /api/auth/item/${paramId || 'unknown'}] - Fatal Error during deletion:`,
      error
    );

    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; message?: string };

      if (prismaError.code === "P2025") {
        return NextResponse.json(
          { message: "ไม่พบอุปกรณ์ที่ต้องการลบ (Prisma Error P2025)" },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          {
            message: `เกิดข้อผิดพลาดจากฐานข้อมูล: ${prismaError.code} - ${
              prismaError.message || "Unknown Prisma error"
            }`,
          },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดที่ไม่คาดคิดในการลบอุปกรณ์" },
      { status: 500 }
    );
  }
}