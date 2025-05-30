// pages/api/admin/items/[id].ts (ตัวอย่าง)
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // เพิ่มการนำเข้า Prisma Error

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const itemId = parseInt(id as string);

  if (isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid Item ID' });
  }

  if (req.method === 'PUT') {
    const { name, serialNumber, status, description } = req.body;
    try {
      const updatedItem = await prisma.item.update({
        where: { id: itemId },
        data: { name, serialNumber, status, description },
      });
      res.status(200).json({ item: updatedItem });
    } catch (error: unknown) { // <--- เปลี่ยนจาก 'any' เป็น 'unknown'
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002' && error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('serialNumber')) {
          return res.status(409).json({ message: 'Serial number already exists.' });
        }
        if (error.code === 'P2025') { // Record to update not found
          return res.status(404).json({ message: 'Item not found.' });
        }
      }
      console.error('Error updating item:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.item.delete({
        where: { id: itemId },
      });
      res.status(204).end(); // No Content
    } catch (error: unknown) { // <--- เปลี่ยนจาก 'any' เป็น 'unknown'
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record to delete not found
          return res.status(404).json({ message: 'Item not found.' });
        }
      }
      console.error('Error deleting item:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}