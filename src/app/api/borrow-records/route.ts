// app/api/borrow-records/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Role, ItemStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

const prisma = new PrismaClient();

// Helper function to check if user is authenticated
async function getSessionUser(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null; // No authenticated user
  }
  return session.user;
}

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  try {
    let records;
    if (user.role === Role.ADMIN) {
      // Admin can view all records
      records = await prisma.borrowRecord.findMany({
        include: {
          item: true,
          user: {
            select: { username: true }, // Select only username of user
          },
        },
        orderBy: { borrowedAt: "desc" },
      });
    } else {
      // Regular user can view only their own records
      records = await prisma.borrowRecord.findMany({
        where: { userId: parseInt(user.id) },
        include: {
          item: true,
          user: {
            select: { username: true },
          },
        },
        orderBy: { borrowedAt: "desc" },
      });
    }
    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("Error fetching borrow records:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกการยืม" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ message: "ต้องระบุ ID อุปกรณ์" }, { status: 400 });
    }

    // Check if item exists and is available
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ message: "ไม่พบอุปกรณ์นี้" }, { status: 404 });
    }

    if (item.status === ItemStatus.BORROWED) {
      return NextResponse.json(
        { message: "อุปกรณ์นี้ถูกยืมไปแล้ว" },
        { status: 409 },
      );
    }

    // Create borrow record
    const newRecord = await prisma.borrowRecord.create({
      data: {
        itemId: itemId,
        userId: parseInt(user.id), // Ensure userId is an integer
        borrowedAt: new Date(),
        // returnedAt will be null initially
      },
    });

    // Update item status to BORROWED
    await prisma.item.update({
      where: { id: itemId },
      data: { status: ItemStatus.BORROWED },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error borrowing item:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการบันทึกการยืม" },
      { status: 500 },
    );
  }
}

// For returning an item
export async function PUT(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json(
        { message: "ต้องระบุ ID บันทึกการยืม" },
        { status: 400 },
      );
    }

    const record = await prisma.borrowRecord.findUnique({
      where: { id: parseInt(recordId) },
      include: { item: true },
    });

    if (!record) {
      return NextResponse.json({ message: "ไม่พบบันทึกการยืมนี้" }, { status: 404 });
    }

    // Only the borrower or an admin can return an item
    if (user.role !== Role.ADMIN && record.userId !== parseInt(user.id)) {
      return NextResponse.json({ message: "ไม่อนุญาต" }, { status: 403 });
    }

    if (record.returnedAt !== null) {
      return NextResponse.json(
        { message: "อุปกรณ์นี้ถูกคืนไปแล้ว" },
        { status: 409 },
      );
    }

    // Update borrow record
    const updatedRecord = await prisma.borrowRecord.update({
      where: { id: parseInt(recordId) },
      data: {
        returnedAt: new Date(),
      },
    });

    // Update item status to AVAILABLE
    await prisma.item.update({
      where: { id: record.itemId },
      data: { status: ItemStatus.AVAILABLE },
    });

    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error) {
    console.error("Error returning item:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการบันทึกการคืน" },
      { status: 500 },
    );
  }
}