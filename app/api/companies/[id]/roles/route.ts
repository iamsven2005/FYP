import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const roles = await db.role.findMany({
    where: { companyId: params.id },
    orderBy: { position: 'asc' },
  });
  return NextResponse.json(roles);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId, rolename } = await req.json();
  const position = (await db.role.count({ where: { companyId: params.id } })) + 1;

  const newRole = await db.role.create({
    data: {
      companyId: params.id,
      userId,
      rolename,
      position,
    },
  });

  return NextResponse.json(newRole);
}
