import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET method to retrieve notifications
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const messages = await db.notification.findMany({
            where: {
                user_to: params.id
            }
        });
        return NextResponse.json(messages, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST method to update the read status of a notification
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const messages = await db.notification.update({
            where: {
                id: params.id
            },
            data: {
                read: "Read"
            }
        });
        return NextResponse.json(messages, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
