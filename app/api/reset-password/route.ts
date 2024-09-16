import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db"; // Prisma client
import { verify } from "jsonwebtoken";

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


    // Check if the new password is the same as the old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return NextResponse.json({ message: "New password cannot be the same as the old password" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
