import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db as prisma } from "@/lib/db"; // Prisma client import
import { createJWT } from "@/lib/session";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Nodemailer setup for OTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Define accounts that bypass OTP
const bypassOtpAccounts = [
  { email: 'admin@ntuc.com', role: 'Admin', redirectTo: '/admin' },
  { email: 'staff@ntuc.com', role: 'Staff', redirectTo: '/Homepage' },
  { email: 'manager@ntuc.com', role: 'Manager', redirectTo: '/manager' },
  { email: 'client@ntuc.com', role: 'Client', redirectTo: '/Homepage' },
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and Password are required" }, { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Check if the password is valid
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Bypass OTP for default accounts (admin, staff, manager, client)
    const bypassAccount = bypassOtpAccounts.find(acc => acc.email === email);
    if (bypassAccount) {
      const token = createJWT(user.id, user.email, bypassAccount.role);

      // Send the token to the client to store it in localStorage
      return NextResponse.json({
        message: "Login successful",
        redirectTo: bypassAccount.redirectTo,
        token: token // Pass the token in the response body
      }, { status: 200 });
    }

    // For non-default users, generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP expires in 10 minutes

    // Save OTP and its expiration to the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpires,
      },
    });

    // Send OTP email using the same styling as forgot password
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <!-- Header -->
      <div style="text-align: center; padding: 10px; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        <h2 style="color: #fff; margin: 0; font-size: 24px;">NTUC - One-Time Password</h2>
      </div>

      <!-- OTP Box -->
      <div style="padding: 20px; text-align: center;">
        <p style="font-size: 16px; color: #333;">Please use the following OTP to complete your login. The OTP will expire in <strong>10 minutes</strong>.</p>
        <div style="font-size: 24px; background-color: #f7f7f7; border: 2px solid #007bff; border-radius: 8px; padding: 10px 20px;">
          ${otp}
        </div>
      </div>

      <!-- Footer Message -->
      <div style="padding: 20px; text-align: center;">
        <p style="font-size: 14px; color: #666;">If you didn't request this OTP, please ignore this email. For any assistance, please contact NTUC support.</p>
        <p style="font-size: 12px; color: #999;">© NTUC - All Rights Reserved</p>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your OTP Code - NTUC",
      html: htmlContent,
    });

    return NextResponse.json({ message: "OTP sent to your email", userId: user.id }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error); // Handle server-side error, no need for toast here
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
