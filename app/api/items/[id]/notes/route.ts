import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Parse the request body to get the note
    const { note } = await req.json();

    // Update the item in the checklist (assuming there's a "checklist" model with a "body" field)
    const updatedItem = await db.checklist.create({
      data: {
        name: params.id,
        body: note, // Update the body field with the note
      },
    });

    // Return the updated item in the response
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item with the note' }, { status: 500 });
  }
}
