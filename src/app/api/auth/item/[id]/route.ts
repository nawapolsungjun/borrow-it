import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// กำหนด Type ID ของอุปกรณ์ที่จะถูกส่งมาใน URL path
interface Params {
  id: string;
}

// GET Request: ดึงข้อมูลอุปกรณ์ตาม ID
export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const id = parseInt(params.id);

    // ตรวจสอบว่า ID ที่ได้มาเป็นตัวเลขที่ถูกต้องหรือไม่
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID อุปกรณ์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // ค้นหาอุปกรณ์ในฐานข้อมูลด้วย ID
    const item = await prisma.item.findUnique({
      where: { id: id },
    });

    // หากไม่พบอุปกรณ์
    if (!item) {
      return NextResponse.json({ message: "ไม่พบอุปกรณ์" }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์" },
      { status: 500 }
    );
  }
}

// PUT Request: อัปเดตข้อมูลอุปกรณ์ตาม ID
export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const id = parseInt(params.id); // แปลง ID จาก string เป็น number
    // ดึงข้อมูลที่ต้องการอัปเดตจาก body ของ request
    const { name, serialNumber, status, description } = await request.json();

    // ตรวจสอบว่า ID ที่ได้มาเป็นตัวเลขที่ถูกต้องหรือไม่
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID อุปกรณ์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // หากมีการส่ง serialNumber มาเพื่ออัปเดต
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

     // อัปเดตข้อมูลอุปกรณ์ในฐานข้อมูล
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
    console.error("Error updating item:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการอัปเดตอุปกรณ์" },
      { status: 500 }
    );
  }
}

// --- DELETE Request: ลบอุปกรณ์ตาม ID ---
export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const id = parseInt(params.id); // แปลง ID จาก string เป็น number

    console.log(
      `[DELETE /api/auth/item/${id}] - Received request to delete item.`
    );

    // ตรวจสอบว่า ID ที่ได้มาเป็นตัวเลขที่ถูกต้องหรือไม่
    if (isNaN(id)) {
      console.error(
        `[DELETE /api/auth/item/${id}] - Error: Invalid ID received. ID was '${params.id}'.`
      );
      return NextResponse.json(
        { message: "ID อุปกรณ์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // --- เพิ่มการตรวจสอบ Item ก่อนลบ เพื่อให้ได้ Response 404 ที่ชัดเจนขึ้น 
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

    // ลบอุปกรณ์ออกจากฐานข้อมูล
    await prisma.item.delete({
      where: { id: id },
    });

    console.log(
      `[DELETE /api/auth/item/${id}] - Successfully deleted item with ID ${id}.`
    );
    return NextResponse.json({ message: "ลบอุปกรณ์สำเร็จ" }, { status: 200 });
  } catch (error: unknown) {
    console.error(
      `[DELETE /api/auth/item/${params.id}] - Fatal Error during deletion:`,
      error
    );
    // ตรวจสอบว่า error เป็น object และมี property 'code'
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; message?: string };
      if (prismaError.code === "P2025") {
        return NextResponse.json(
          { message: "ไม่พบอุปกรณ์ที่ต้องการลบ (Prisma Error P2025)" },
          { status: 404 }
        );
      } else {
        // จัดการ Error อื่นๆ ที่มาจาก Prisma โดยดูจาก code ของ Error
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
    // Generic error for unexpected issues
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดที่ไม่คาดคิดในการลบอุปกรณ์" },
      { status: 500 }
    );
  }
}
