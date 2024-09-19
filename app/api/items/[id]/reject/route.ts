import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    verify(token, JWT_SECRET);

    // Parse the request body to extract userFrom
    const { userFrom } = await req.json(); 
    if (!userFrom) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Update the image status to "REJECTED"
    const updatedItem = await db.images.update({
      where: { id: params.id },
      data: { status: "REJECTED" },
    });

    // Create a notification for the rejection
    await db.notification.create({
      data: {
        user_from: userFrom,
        user_to: updatedItem.companyId, 
        body: `The item ${updatedItem.name} with id ${updatedItem.id} has been rejected.`,
        read: "Unread",
      },
    });

    // Return the updated item in the response
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Handle other errors
    console.error("Error approving item:", error);
    return NextResponse.json({ error: "Failed to approve item" }, { status: 500 });
  }
}
