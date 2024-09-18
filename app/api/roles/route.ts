import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse the incoming JSON
    const { userId, rolename, id } = await req.json();
    
    // Validate the presence of required fields
    if (!userId || !rolename || !id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validRoles = ["Admin", "Staff", "Manager", "Client"];
    if (!validRoles.includes(rolename)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update the user's role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: rolename },
    });

    // Create a notification for the role change
    await db.notification.create({
      data: {
        user_from: id,
        user_to: userId,
        body: `Changed role to ${rolename}`,
        read: "Unread",
      },
    });

    return NextResponse.json({ message: "Role updated successfully", updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }
}
