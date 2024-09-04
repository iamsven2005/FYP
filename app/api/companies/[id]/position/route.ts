import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { position } = await req.json();

  const updatedRole = await db.role.update({
    where: { id: params.id },
    data: { position },
  });

  return NextResponse.json(updatedRole);
}
