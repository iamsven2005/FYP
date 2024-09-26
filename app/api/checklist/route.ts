import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken'; // If you need JWT authentication

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
    verify(token, JWT_SECRET);
    return { error: false };
  } catch (error) {
    return { error: true, response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
}

// Define the GET method to fetch approved ingredients
export async function GET(req: Request) {
  // Optional: Check for Authorization header
  const authCheck = await checkAuthorization(req);
  if (authCheck.error) return authCheck.response;

  try {
    // Fetch all approved ingredients from the 'Checklist' table
    const approvedIngredients = await db.checklist.findMany({
      where: { body: 'Safe' },
      select: { name: true }, // Only select the name of the ingredients
    });

    return NextResponse.json({ success: true, data: approvedIngredients }, { status: 200 });
  } catch (error) {
    console.log('Error fetching approved ingredients:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch approved ingredients' }, { status: 500 });
  }
}
