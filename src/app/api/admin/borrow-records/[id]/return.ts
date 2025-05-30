'use client';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../lib/prisma'; // Adjust path based on your lib folder

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const recordId = parseInt(id as string);

  if (isNaN(recordId)) {
    return res.status(400).json({ message: 'Invalid record ID' });
  }

  if (req.method === 'PUT') {
    const { itemId } = req.body; // Expect itemId to be passed for item status update

    try {
      // Start a Prisma transaction to ensure both updates succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Update the BorrowRecord's returnedAt
        const updatedRecord = await tx.borrowRecord.update({
          where: { id: recordId },
          data: { returnedAt: new Date() },
        });

        // Update the associated Item's status to AVAILABLE
        await tx.item.update({
          where: { id: itemId },
          data: { status: 'AVAILABLE' },
        });

        res.status(200).json({ message: 'Item returned successfully', record: updatedRecord });
      });

    } catch (error) {
      console.error('Error returning item:', error);
      res.status(500).json({ message: 'Failed to record return or update item status.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}