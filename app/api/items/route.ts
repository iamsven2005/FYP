import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: Request) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    verify(token, JWT_SECRET);

    // Fetch all items from the 'images' table
    const updatedItem = await db.images.findMany();
    
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Handle other errors
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}
