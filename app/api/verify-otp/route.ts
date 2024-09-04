import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { userId, otp } = await req.json();

    if (!userId || !otp) {
      return NextResponse.json({ message: 'User ID and OTP are required' }, { status: 400 });
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Clear the OTP after successful verification
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpires: null,
      },
    });

    // Create JWT token
    const token = sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ message: 'Login successful', token }, { status: 200 });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
