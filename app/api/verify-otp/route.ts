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
    const user = await prisma.user.findUnique({ where: { id: userId } }) as { id: string; username: string; email: string; password: string; otp: string | null; otpExpires: Date | null; createdAt: Date; updatedAt: Date; role: string };
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 401 });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      return NextResponse.json({ message: 'Expired OTP' }, { status: 401 });
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
      { userId: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Redirect based on role
    let redirectTo = '/Homepage'; // Default redirect
    if (user.role === 'Admin') {
      redirectTo = '/admin';
    } else if (user.role === 'Manager') {
      redirectTo = '/manager';
    }

    return NextResponse.json({ message: 'OTP verified', token, role: user.role, redirectTo }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
