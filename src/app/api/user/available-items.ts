import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const availableItems = await prisma.item.findMany({
        where: { status: 'AVAILABLE' },
      });
      res.status(200).json({ items: availableItems });
    } catch (error) {
      console.error('Error fetching available items:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}