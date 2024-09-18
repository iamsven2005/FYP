import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request ) {
  try {
    const updatedItem = await db.images.findMany();
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reject item' }, { status: 500 });
  }
}
