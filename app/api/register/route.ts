import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db as prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    console.log('Received data:', { username, email, password });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    console.log('User created successfully:', user);

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
