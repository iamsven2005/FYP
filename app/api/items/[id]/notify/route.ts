import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

// GET method to retrieve notifications
export async function GET(req: Request, { params }: { params: { id: string } }) {
    // Extract the token from the Authorization header
    const token = req.headers.get("Authorization")?.split(" ")[1];

    // Verify the token and return 401 if it's missing or invalid
    if (!token) {
        return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
    }

    try {
        // Verify the JWT token
        verify(token, JWT_SECRET);

        // Fetch notifications for the user
        const messages = await db.notification.findMany({
            where: {
                user_to: params.id,
            },
        });

        return NextResponse.json(messages, { status: 200 });
    } catch (error:any) {
        if (error.name === "JsonWebTokenError") {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        console.log(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST method to update the read status of a notification
export async function POST(req: Request, { params }: { params: { id: string } }) {
    // Extract the token from the Authorization header
    const token = req.headers.get("Authorization")?.split(" ")[1];

    // Verify the token and return 401 if it's missing or invalid
    if (!token) {
        return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
    }

    try {
        // Verify the JWT token
        verify(token, JWT_SECRET);

        // Update the read status of a specific notification
        const messages = await db.notification.update({
            where: {
                id: params.id,
            },
            data: {
                read: "Read",
            },
        });

        return NextResponse.json(messages, { status: 200 });
    } catch (error:any) {
        if (error.name === "JsonWebTokenError") {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        console.log(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
