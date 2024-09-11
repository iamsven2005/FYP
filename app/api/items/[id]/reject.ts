import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const updatedItem = await db.images.update({
      where: { id: params.id },
      data: { approved: "rejected" },
    });
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to reject item" }, { status: 500 });
  }
}
