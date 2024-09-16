import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Ensure item id exists before rejecting
    if (!params.id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    const updatedItem = await db.images.update({
      where: { id: params.id },
      data: { status: 'REJECTED' },  // Update status to "REJECTED"
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reject item' }, { status: 500 });
  }
}
