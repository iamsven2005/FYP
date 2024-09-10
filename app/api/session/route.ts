// C:\Users\nasif\Documents\GitHub\FYP\app\api\session\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db'; // Assuming Prisma is used for database
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const { userId, token } = await req.json();

    // Store or update the session in the database (or memory)
    await prisma.session.create({
      data: {
        userId,
        token,
      },
    });

    return NextResponse.json({ message: 'Session created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Authorization token missing' }, { status: 400 });
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET);
    const userId = (decoded as any).userId;

    // Terminate the session
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });

    return NextResponse.json({ message: 'Session terminated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to terminate session:', error);
    return NextResponse.json({ message: 'Failed to terminate session' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Authorization token missing' }, { status: 400 });
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET);
    const userId = (decoded as any).userId;

    // Check if the session is active
    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
      },
    });

    if (activeSession) {
      return NextResponse.json({ message: 'Active session found', activeSession }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No active session' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to check session:', error);
    return NextResponse.json({ message: 'Failed to check session' }, { status: 500 });
  }
}
