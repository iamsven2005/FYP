import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, rolename } = await req.json();

  try {
    // Create the role
    const role = await db.role.create({
      data: {
        userId,
        companyId: "default-company-id", // Assuming default company, adjust as needed
        rolename,
        position: rolename === "Admin" ? 1 : 2, // Admin has the highest position
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }
}
