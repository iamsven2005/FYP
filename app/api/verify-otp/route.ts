import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { userId, otp } = await req.json();

    console.log("Received UserID:", userId, "and OTP:", otp); // Log the received data

    if (!userId || !otp) {
      console.log("Missing UserID or OTP");
      return NextResponse.json({ message: 'User ID and OTP are required' }, { status: 400 });
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      console.log("User not found with ID:", userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.otp !== otp) {
      console.log("OTP does not match for user:", userId);
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 401 });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      console.log("OTP has expired for user:", userId);
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

    console.log("OTP verified successfully for user:", userId);

    // Create JWT token
    const token = sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ message: 'OTP verified', token }, { status: 200 });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
