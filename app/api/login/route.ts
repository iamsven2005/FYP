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

// Define the default accounts that should bypass OTP
const bypassOtpAccounts = [
  { email: 'admin@ntuc.com', role: 'Admin', redirectTo: '/admin' },
  { email: 'staff@ntuc.com', role: 'Staff', redirectTo: '/Homepage' },
  { email: 'manager@ntuc.com', role: 'Manager', redirectTo: '/Homepage' },
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and Password are required' }, { status: 400 });
    }

    // Check if the user is found
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Check if the password is correct
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // If valid, proceed with login
    console.log('User found and password is valid');

    // Bypass OTP for default admin, staff, and manager accounts
    const bypassAccount = bypassOtpAccounts.find(acc => acc.email === email);
    if (bypassAccount) {
      console.log(`${bypassAccount.role} login detected, bypassing OTP`);

      // Generate JWT token for the bypassed account
      const token = sign(
        { userId: user.id, email: user.email, username: user.username, role: bypassAccount.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

      // Send response with the token and redirection URL
      return NextResponse.json({ message: `Login successful (${bypassAccount.role})`, token, redirectTo: bypassAccount.redirectTo }, { status: 200 });
    }

    // For non-default users, generate OTP
    console.log('Generating OTP for non-default user');
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
        <div style="text-align: center; padding: 10px; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="color: #fff; margin: 0; font-size: 24px;">NTUC - One-Time Password</h2>
        </div>
        <div style="padding: 20px; text-align: center;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Please use the following OTP to complete your login. The OTP will expire in <strong>10 minutes</strong>.</p>
          <div style="display: inline-block; padding: 10px 20px; font-size: 24px; background-color: #f7f7f7; border: 2px solid #007bff; border-radius: 8px; margin: 20px auto; font-weight: bold; color: #333;">
            ${otp}
          </div>
        </div>
        <div style="padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #666;">If you didn't request this OTP, please ignore this email. For any assistance, please contact NTUC support.</p>
          <p style="font-size: 12px; color: #999;">© NTUC - All Rights Reserved</p>
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
