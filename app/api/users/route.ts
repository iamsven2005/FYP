import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10); // Default to page 1
  const limit = parseInt(searchParams.get('limit') || '5', 10); // Default to 5 users per page

  try {
    const totalUsers = await db.user.count(); // Get the total number of users
    const users = await db.user.findMany({
      skip: (page - 1) * limit, // Skip to the correct page
      take: limit,              // Limit to the number of users per page
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
