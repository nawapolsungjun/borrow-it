import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { itemId, userId } = req.body;

    if (!itemId || !userId) {
      return res.status(400).json({ message: 'Item ID and User ID are required.' });
    }

    try {
      // Start a Prisma transaction
      await prisma.$transaction(async (tx) => {
        // Check if item is available
        const item = await tx.item.findUnique({
          where: { id: itemId },
        });

        if (!item || item.status !== 'AVAILABLE') {
          return res.status(400).json({ message: 'Item is not available for borrowing.' });
        }

        // Create borrow record
        await tx.borrowRecord.create({
          data: {
            itemId: itemId,
            userId: userId,
            borrowedAt: new Date(),
            returnedAt: new Date(0), // Placeholder for not yet returned, or null if schema allows
                                      // Note: Your schema has returnedAt as non-nullable.
                                      // If you want null, you need to change `returnedAt DateTime` to `returnedAt DateTime?` in schema.prisma
                                      // For now, setting to a default past date or future date as a placeholder.
                                      // Better to make it nullable.
          },
        });

        // Update item status to BORROWED
        await tx.item.update({
          where: { id: itemId },
          data: { status: 'BORROWED' },
        });

        res.status(200).json({ message: 'Item borrowed successfully.' });
      });

    } catch (error: unknown) {
      console.error('Error borrowing item:', error);
      res.status(500).json({ message: 'Failed to borrow item. Please try again.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}