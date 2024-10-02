import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all approved ingredients from the 'checklist' table
    const approvedIngredients = await db.checklist.findMany({
      where: { body: 'Safe' },
      select: { name: true },
    });

    return NextResponse.json({ success: true, data: approvedIngredients }, { status: 200 });
  } catch (error) {
    console.log('Error fetching approved ingredients:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch approved ingredients' }, { status: 500 });
  }
}
