import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    verify(token, JWT_SECRET);

    // Extract the `position` from the request body
    const { position } = await req.json();

    // Ensure position is provided
    if (!position) {
      return NextResponse.json({ error: "Position is required" }, { status: 400 });
    }

    // Update the role in the database
    const updatedRole = await db.role.update({
      where: { id: params.id },
      data: { position },
    });

    // Return the updated role
    return NextResponse.json(updatedRole);
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    // Return a 500 status for any other errors
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
