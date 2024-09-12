import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  console.log(`Approving item with ID: ${params.id}`);  // Log received ID
  try {
    const updatedItem = await db.images.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
    });
    console.log('Item approved successfully:', updatedItem);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error approving item:', error);
    return NextResponse.json({ error: 'Failed to approve item' }, { status: 500 });
  }
}
