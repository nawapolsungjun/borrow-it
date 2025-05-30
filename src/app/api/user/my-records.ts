import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
      const records = await prisma.borrowRecord.findMany({
        where: {
          userId: parseInt(userId as string),
        },
        include: {
          item: {
            select: { name: true, serialNumber: true },
          },
        },
        orderBy: {
          borrowedAt: 'desc',
        },
      });
      res.status(200).json({ records });
    } catch (error) {
      console.error('Error fetching user borrow records:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}