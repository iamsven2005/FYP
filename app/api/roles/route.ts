import { db as prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, rolename } = await req.json();

  // Validate that the role being assigned is one of the allowed roles
  const validRoles = ["Admin", "Staff", "Manager", "Client"];
  if (!validRoles.includes(rolename)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    // Update the user's role in the User table
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: rolename },
    });

    return NextResponse.json({ message: "Role updated successfully", updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Failed to update role:", error);
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }
}
