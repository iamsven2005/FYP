import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Define the POST method
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageurl, name, companyId, retrived, halal, healthy, AI, ingredients } = body;
    
    // Create a new image entry with all the details, including the updated ingredients
    const newImage = await db.images.create({
      data: {
        imageurl,
        name,
        companyId,
        status: 'PENDING', // Set status to pending until approved/rejected
        retrived,
        halal,
        healthy,
        AI,
        ingredients, // Store the ingredients (with their status: Approved, Not Approved, Not Safe)
      },
    });

    // Find the company associated with the image
    const company = await db.company.findFirst({
      where: {
        id: companyId
      }
    });

    // If the company exists, notify the manager about the new image upload
    if (company) {
      await db.notification.create({
        data: {
          user_from: company.staff, // Notification from staff
          user_to: company.manager, // Notification to the manager
          body: `Uploaded new image for ${company.name}`,
          read: "Unread" // Notification status is unread initially
        }
      });
    }

    // Return the success response with the created image details
    return NextResponse.json({ success: true, data: newImage });
  } catch (error) {
    console.log(error);
    // Return a failure response in case of an error
    return NextResponse.json({ success: false, message: error }, { status: 500 });
  }
}
