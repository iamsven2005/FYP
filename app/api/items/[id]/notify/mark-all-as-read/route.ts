import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

// DELETE method to delete all notifications for a user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    // Extract the token from the Authorization header
    const token = req.headers.get("Authorization")?.split(" ")[1];

    // Verify the token and return 401 if it's missing or invalid
    if (!token) {
        return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
    }

    try {
        // Verify the JWT token
        verify(token, JWT_SECRET);

        // Delete all notifications for the user
        await db.notification.deleteMany({
            where: {
                user_to: params.id,
            },
        });

        return NextResponse.json({ message: "All notifications marked as read" }, { status: 200 });
    } catch (error: any) {
        if (error.name === "JsonWebTokenError") {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        console.log(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
