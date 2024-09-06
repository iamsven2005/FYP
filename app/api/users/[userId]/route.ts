import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db"; // Assuming you have set up Prisma and db correctly in lib/db

export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  const { username } = await req.json();

  // Basic validation
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  try {
    // Update the username for the given userId
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username },
    });

    return NextResponse.json({ message: "Username updated successfully", updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Failed to update username:", error);
    return NextResponse.json({ error: "Failed to update username" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}