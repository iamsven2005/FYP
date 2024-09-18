import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if the item ID is provided
    if (!params.id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    // Parse the request body to get the user ID (user_from)
    const {userFrom } = await req.json();

    // Find the image by its ID
    const image = await db.images.findUnique({
      where: { id: params.id },
      select: {
        companyId: true, // We need the companyId from the image
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Find the company by its ID and check for the staff
    const company = await db.company.findUnique({
      where: { id: image.companyId },
    });

    if (!company || !company.staff) {
      return NextResponse.json({ error: 'Company or staff not found' }, { status: 404 });
    }

    // Update the image status to 'REJECTED'
    const updatedItem = await db.images.update({
      where: { id: params.id },
      data: { status: 'REJECTED' },
    });

    // Create a notification for the staff member
    const notification = await db.notification.create({
      data: {
        user_from: userFrom,       
        user_to: company.staff,  
        body: `The ${updatedItem.name} with id ${updatedItem.id} has been rejected.`,
        read: "Unread"
      },
    });

    // Return the updated item and notification
    return NextResponse.json({ updatedItem, notification });
  } catch (error) {
    console.error('Error rejecting item:', error);
    return NextResponse.json({ error: 'Failed to reject item' }, { status: 500 });
  }
}
