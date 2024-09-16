import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Define the POST method
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageurl, name, companyId, retrived, halal, healthy, AI } = body;

    // Save the image data to the database with status "PENDING"
    const newImage = await db.images.create({
      data: {
        imageurl,
        name,
        companyId,
        status: 'PENDING', // Set status to "PENDING" when posting the image
        retrived,
        halal,
        healthy,
        AI,
      },
    });

    return NextResponse.json({ success: true, data: newImage });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to save image data" }, { status: 500 });
  }
}
