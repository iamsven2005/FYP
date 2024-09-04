import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db"; // Prisma client

export async function POST(req: Request) {
  const { email, otp, newPassword } = await req.json();

  try {
    // Find the user by email
    const user = await db.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 401 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpires: null,
      },
    });

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
