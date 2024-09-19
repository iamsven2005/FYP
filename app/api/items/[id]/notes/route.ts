import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    verify(token, JWT_SECRET);

    // Parse the request body to get the note
    const { note } = await req.json();

    // Create a new item in the checklist
    const updatedItem = await db.checklist.create({
      data: {
        name: params.id,
        body: note, // Save the note in the body field
      },
    });

    // Return the updated item in the response
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Handle other errors
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item with the note' }, { status: 500 });
  }
}
