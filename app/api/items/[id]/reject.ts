import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  console.log(`Rejecting item with ID: ${params.id}`);  // Log received ID
  try {
    const updatedItem = await db.images.update({
      where: { id: params.id },
      data: { status: 'REJECTED' },
    });
    console.log('Item rejected successfully:', updatedItem);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error rejecting item:', error);
    return NextResponse.json({ error: 'Failed to reject item' }, { status: 500 });
  }
}
