import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  console.log('API Route hit');  // Debugging
  console.log(`Approving item with ID: ${params.id}`);  
  try {
    // Ensure item id exists before approving
    if (!params.id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    const updatedItem = await db.images.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },  // Update status to "APPROVED"
    });

    console.log('Item approved successfully:', updatedItem);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error approving item:', error);
    return NextResponse.json({ error: 'Failed to approve item' }, { status: 500 });
  }
}