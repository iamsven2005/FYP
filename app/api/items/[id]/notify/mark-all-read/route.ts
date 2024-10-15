// Example path: C:\Users\nasif\Documents\GitHub\FYP\app\api\items\[userId]\notify\mark-all-read\route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

// POST method to mark all notifications as read
export async function POST(req: Request, { params }: { params: { userId: string } }) {
    // Extract the token from the Authorization header
    const token = req.headers.get("Authorization")?.split(" ")[1];

    // Verify the token and return 401 if it's missing or invalid
    if (!token) {
        return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
    }

    try {
        // Verify the JWT token
        verify(token, JWT_SECRET);

        // Update the read status of all notifications for the user
        await db.notification.updateMany({
            where: {
                user_to: params.userId,
                read: "Unread",
            },
            data: {
                read: "Read",
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
