import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET Request: ดึงข้อมูลอุปกรณ์ทั้งหมด
export async function GET() {
  try {
    const items = await prisma.item.findMany();
    return NextResponse.json(items, { status: 200 }); // ตอบกลับด้วยข้อมูลอุปกรณ์และสถานะ
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์" },
      { status: 500 }
    );
  }
}

// POST Request: เพิ่มอุปกรณ์ใหม่
export async function POST(request: Request) {
  try {
    // ดึงข้อมูล name, serialNumber, status, description จาก body ของ request
    const { name, serialNumber, status, description } = await request.json();

    // ตรวจสอบว่าข้อมูลที่จำเป็นครบถ้วนหรือไม่
    if (!name || !serialNumber || !status) {
      return NextResponse.json(
        {
          message:
            "กรุณากรอกข้อมูลชื่ออุปกรณ์, Serial Number และสถานะให้ครบถ้วน",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า Serial Number นี้มีอยู่ในระบบแล้วหรือยัง
    const existingItem = await prisma.item.findUnique({
      where: { serialNumber: serialNumber },
    });

    if (existingItem) {
      return NextResponse.json(
        { message: "Serial Number นี้มีอยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    const newItem = await prisma.item.create({
      data: {
        name,
        serialNumber,
        status,
        description,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์" },
      { status: 500 }
    );
  }
}
