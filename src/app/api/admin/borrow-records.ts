import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const records = await prisma.borrowRecord.findMany({
        include: {
          item: {
            select: { name: true, serialNumber: true },
          },
          user: {
            select: { username: true },
          },
        },
        orderBy: {
          borrowedAt: 'desc',
        },
      });
      res.status(200).json({ records });
    } catch (error) {
      console.error('Error fetching borrow records:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}