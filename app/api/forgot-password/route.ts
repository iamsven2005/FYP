import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { db } from "@/lib/db"; // Import the Prisma client

export async function POST(req: Request) {
  console.log("Forgot password request received");

  const { email } = await req.json();
  console.log(`Received email: ${email}`);

  // Check if the email exists in the database
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`User not found: ${email}`);
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  console.log(`User found: ${email}`);

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

  console.log(`Generated OTP: ${otp}`);

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to email: ${email}`);

    // Return the userId along with the success message
    return NextResponse.json({ message: "OTP sent successfully", userId: user.id }, { status: 200 });
  } catch (error) {
    console.error(`Failed to send OTP to email: ${email}`, error);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
