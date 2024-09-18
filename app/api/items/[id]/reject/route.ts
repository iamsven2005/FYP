import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userFrom } = await req.json(); 
    if (!userFrom) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updatedItem = await db.images.update({
      where: { id: params.id },
      data: { status: "REJECTED" },
    });

    await db.notification.create({
      data: {
        user_from: userFrom,
        user_to: updatedItem.companyId, 
        body: `The item ${updatedItem.name} with id ${updatedItem.id} has been rejected.`,
        read: "Unread",
      },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error approving item:", error);
    return NextResponse.json({ error: "Failed to approve item" }, { status: 500 });
  }
}
