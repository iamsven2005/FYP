import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    verify(token, JWT_SECRET);

    // Extract `userFrom` from the request body
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    // Create a notification for the approval
    const newid = await db.checklist.create({
      data: {
        body: "Safe",
        name,
      },
    });

    return NextResponse.json(newid, { status: 201 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Handle any other errors
    console.error("Error approving item:", error);
    return NextResponse.json({ error: "Failed to approve item" }, { status: 500 });
  }
}
