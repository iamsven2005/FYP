import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

// Helper function to check the Authorization header
async function checkAuthorization(req: Request) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return { error: true, response: NextResponse.json({ error: 'Authorization token is required' }, { status: 401 }) };
  }

  try {
    // Verify the JWT token
    const decoded = verify(token, JWT_SECRET);
    return { error: false, decoded };
  } catch (error) {
    return { error: true, response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
}

export async function GET(req: Request) {
  // Check for Authorization header
  const authCheck = await checkAuthorization(req);
  if (authCheck.error) return authCheck.response;

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
