import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const totalItems = await prisma.item.count();
    const availableItems = await prisma.item.count({ where: { status: 'AVAILABLE' } });
    const borrowedItems = await prisma.item.count({ where: { status: 'BORROWED' } });
    const totalUsers = await prisma.user.count(); // Assuming you want to count all users

    res.status(200).json({
      totalItems,
      availableItems,
      borrowedItems,
      totalUsers,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}