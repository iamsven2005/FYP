import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db"; // Prisma client
import { verify } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    console.log("Reset password API called");
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    console.log("Authorization token:", token);

    if (!token) {
      console.log("No authorization token, returning 401");
      return NextResponse.json({ message: "Authorization required" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET as string);
    console.log("Decoded JWT:", decoded);

    const { newPassword } = await req.json();
    console.log("New password received:", newPassword);

    // Find the user by the decoded token data
    const user = await db.user.findUnique({ where: { id: (decoded as any).userId } });

    if (!user) {
      console.log("User not found");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("User found:", user);

    // Check if the new password is the same as the old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    console.log("Is same password:", isSamePassword);

    if (isSamePassword) {
      console.log("New password cannot be the same as the old password");
      return NextResponse.json({ message: "New password cannot be the same as the old password" }, { status: 400 });
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
