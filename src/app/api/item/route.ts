// app/api/items/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, ItemStatus, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth"; // Import your authOptions

const prisma = new PrismaClient();

// Helper function to check admin role
async function checkAdmin(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== Role.ADMIN) {
    return NextResponse.json({ message: "ไม่อนุญาต" }, { status: 403 });
  }
  return null; // No error, user is admin
}

export async function GET(request: Request) {
  // Allow all authenticated users to view items, but admin might see more details/actions
  // For simplicity, let's allow everyone to fetch items for now.
  // A more robust app might filter items based on user role here.
  try {
    const items = await prisma.item.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const adminCheck = await checkAdmin(request);
  if (adminCheck) return adminCheck; // If not admin, return error

  try {
    const { name, serialNumber, description, status } = await request.json();

    if (!name || !serialNumber) {
      return NextResponse.json(
        { message: "ต้องระบุชื่ออุปกรณ์และหมายเลขซีเรียล" },
        { status: 400 },
      );
    }

    const newItem = await prisma.item.create({
      data: {
        name,
        serialNumber,
        description: description || "", // Ensure description is not null
        status: status || ItemStatus.AVAILABLE,
      },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Unique constraint violation (e.g., duplicate serialNumber)
      return NextResponse.json(
        { message: "หมายเลขซีเรียลนี้มีอยู่ในระบบแล้ว" },
        { status: 409 },
      );
    }
    console.error("Error creating item:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการสร้างอุปกรณ์" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const adminCheck = await checkAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ต้องระบุ ID อุปกรณ์" }, { status: 400 });
    }

    const { name, serialNumber, description, status } = await request.json();

    if (!name || !serialNumber) {
      return NextResponse.json(
        { message: "ต้องระบุชื่ออุปกรณ์และหมายเลขซีเรียล" },
        { status: 400 },
      );
    }

    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id) },
      data: {
        name,
        serialNumber,
        description: description || "",
        status,
      },
    });
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "ไม่พบอุปกรณ์ที่ต้องการแก้ไข" },
        { status: 404 },
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "หมายเลขซีเรียลนี้มีอยู่ในระบบแล้ว" },
        { status: 409 },
      );
    }
    console.error("Error updating item:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการอัปเดตอุปกรณ์" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const adminCheck = await checkAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ต้องระบุ ID อุปกรณ์" }, { status: 400 });
    }

    await prisma.item.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json(
      { message: "ลบอุปกรณ์สำเร็จ" },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "ไม่พบอุปกรณ์ที่ต้องการลบ" },
        { status: 404 },
      );
    }
    // Handle cases where item is part of a borrow record (foreign key constraint)
    if (error.code === "P2003") {
      return NextResponse.json(
        { message: "ไม่สามารถลบอุปกรณ์นี้ได้ เนื่องจากมีข้อมูลการยืมที่เกี่ยวข้อง" },
        { status: 409 },
      );
    }
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลบอุปกรณ์" },
      { status: 500 },
    );
  }
}