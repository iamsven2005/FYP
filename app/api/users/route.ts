import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10); 
  const limit = parseInt(searchParams.get('limit') || '10', 10); 
  try {
    const totalUsers = await db.user.count(); 
    const users = await db.user.findMany({
      skip: (page - 1) * limit, 
      take: limit,            
    });

    return NextResponse.json({
      users,
      totalUsers,
      page,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
