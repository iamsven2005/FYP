import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Define the POST method
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageurl, name, companyId, retrived, halal, healthy, AI, ingredients } = body;

    // Save the image data to the database with status "PENDING"
    const newImage = await db.images.create({
      data: {
        imageurl,
        name,
        companyId,
        status: 'PENDING',
        retrived,
        halal,
        healthy,
        AI,
        ingredients, // Include the ingredients data
      },
    });

    return NextResponse.json({ success: true, data: newImage });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false, message: error }, { status: 500 });
  }
}
