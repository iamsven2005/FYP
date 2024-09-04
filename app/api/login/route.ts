import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db as prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

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

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP expires in 10 minutes

    // Save OTP and expiration in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpires,
      },
    });

    // Send OTP email with HTML formatting and logo
    const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <!-- Header without NTUC Logo -->
    <div style="text-align: center; padding: 10px; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
      <h2 style="color: #fff; margin: 0; font-size: 24px;">NTUC - One-Time Password</h2>
    </div>

    <!-- OTP Box -->
    <div style="padding: 20px; text-align: center;">
      <p style="font-size: 16px; color: #333;">
        Hello,
      </p>
      <p style="font-size: 16px; color: #333;">
        Please use the following OTP to complete your login. The OTP will expire in <strong>10 minutes</strong>.
      </p>
      <div style="display: inline-block; padding: 10px 20px; font-size: 24px; background-color: #f7f7f7; border: 2px solid #007bff; border-radius: 8px; margin: 20px auto; font-weight: bold; color: #333;">
        ${otp}
      </div>
    </div>

    <!-- Footer Message -->
    <div style="padding: 20px; text-align: center;">
      <p style="font-size: 14px; color: #666;">
        If you didn't request this OTP, please ignore this email. For any assistance, please contact NTUC support.
      </p>
      <p style="font-size: 12px; color: #999;">
        © NTUC - All Rights Reserved
      </p>
    </div>
  </div>
`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Your OTP Code - NTUC',
      html: htmlContent,
    });

    return NextResponse.json({ message: 'OTP sent to your email', userId: user.id }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
