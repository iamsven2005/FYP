import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Define the POST method
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageurl, name, companyId, approved, retrived, halal, healthy, AI } = body;

    // Save the image data to the database
    const newImage = await db.images.create({
      data: {
        imageurl,
        name,
        companyId,
        approved,
        retrived,
        halal,
        healthy,
        AI,
      },
    });

    // Return success response
    return NextResponse.json({ success: true, data: newImage });
  } catch (error) {
    console.error("Error saving image data", error);
    return NextResponse.json({ success: false, message: "Failed to save image data" }, { status: 500 });
  }
}
