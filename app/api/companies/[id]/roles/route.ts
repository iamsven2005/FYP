import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

// GET roles for a company (with header check)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    verify(token, JWT_SECRET);

    // Fetch the roles for the company
    const roles = await db.role.findMany({
      where: { companyId: params.id },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(roles);
  } catch (error:any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    // Handle any other errors
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

// POST a new role for a company (with header check)
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

    // Extract role details from the request body
    const { userId, rolename } = await req.json();

    // Determine the next position for the role
    const position = (await db.role.count({ where: { companyId: params.id } })) + 1;

    // Create the new role
    const newRole = await db.role.create({
      data: {
        companyId: params.id,
        userId,
        rolename,
        position,
      },
    });

    return NextResponse.json(newRole);
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    // Handle any other errors
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
