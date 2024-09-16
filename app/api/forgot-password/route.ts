import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { db } from "@/lib/db"; // Import the Prisma client

export async function POST(req: Request) {

  const { email } = await req.json();

  // Check if the email exists in the database
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }


  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date();
  otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP expires in 10 minutes

  // Save OTP and expiration in the database
  await db.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpires,
    },
  });


  // Send OTP via email with the same styling as login
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  // Email content with the same styling from login
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <!-- Header without NTUC Logo -->
    <div style="text-align: center; padding: 10px; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
      <h2 style="color: #fff; margin: 0; font-size: 24px;">NTUC - Password Reset OTP</h2>
    </div>

    <!-- OTP Box -->
    <div style="padding: 20px; text-align: center;">
      <p style="font-size: 16px; color: #333;">
        Hello,
      </p>
      <p style="font-size: 16px; color: #333;">
        Please use the following OTP to reset your password. The OTP will expire in <strong>10 minutes</strong>.
      </p>
      <div style="display: inline-block; padding: 10px 20px; font-size: 24px; background-color: #f7f7f7; border: 2px solid #007bff; border-radius: 8px; margin: 20px auto; font-weight: bold; color: #333;">
        ${otp}
      </div>
    </div>

    <!-- Footer Message -->
    <div style="padding: 20px; text-align: center;">
      <p style="font-size: 14px; color: #666;">
        If you didn't request a password reset, please ignore this email. For any assistance, please contact NTUC support.
      </p>
      <p style="font-size: 12px; color: #999;">
        © NTUC - All Rights Reserved
      </p>
    </div>
  </div>
`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your OTP Code - NTUC",
    html: htmlContent, // Send the styled HTML content
  };

  try {
    await transporter.sendMail(mailOptions);

    // Return the userId along with the success message
    return NextResponse.json({ message: "OTP sent successfully", userId: user.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
