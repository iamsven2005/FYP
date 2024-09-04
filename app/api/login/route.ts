import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db as prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log('Login request received');
    console.log('Received data:', { email, password });

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and Password are required' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Check if the password is correct
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Create JWT token with username
    const token = sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET as string, // Use a secret from your environment variables
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    return NextResponse.json({ message: 'Login successful', token }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
