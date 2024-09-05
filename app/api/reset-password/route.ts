import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db"; // Prisma client
import { verify } from "jsonwebtoken"; // Use JWT to authenticate

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Authorization required" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET as string);
    const { newPassword } = await req.json();
    
    // Find the user by the decoded token data
    const user = await db.user.findUnique({ where: { id: (decoded as any).userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("New password hashed successfully");

    // Update password and clear OTP
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    console.log("Password updated successfully for user:", user.id);
    return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
