import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken"; // Import JWT verification

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

async function checkAuthorization(req: Request) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return { error: true, response: NextResponse.json({ error: 'Authorization token is required' }, { status: 401 }) };
  }

  try {
    // Optionally, verify the JWT token
    const decoded = verify(token, JWT_SECRET);
    return { error: false, decoded };
  } catch (error) {
    return { error: true, response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
}

export async function POST(req: Request) {
  // Check for Authorization header
  const authCheck = await checkAuthorization(req);
  if (authCheck.error) return authCheck.response;

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
