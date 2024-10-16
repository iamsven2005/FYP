import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken'; // Import JWT verification

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

// Helper function to check the Authorization header
async function checkAuthorization(req: Request) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    console.error("Authorization token is missing");
    return { error: true, response: NextResponse.json({ error: 'Authorization token is required' }, { status: 401 }) };
  }

  try {
    // Verify the JWT token
    const decoded = verify(token, JWT_SECRET);
    console.log('Token verified. Decoded token:', decoded);
    return { error: false, decoded };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return { error: true, response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
}

// Define the POST method
export async function POST(req: Request) {
  // Check for Authorization header
  const authCheck = await checkAuthorization(req);
  if (authCheck.error) return authCheck.response;

  try {
    const body = await req.json();
    const { imageurl, name, companyId, retrived, halal, healthy, AI, ingredients, grade, recommendation } = body;

    // Log the data received
    console.log('Received data for new image:', {
      imageurl,
      name,
      companyId,
      retrived,
      halal,
      healthy,
      AI,
      ingredients,
      grade,
      recommendation 
    });

    // Validate ingredients
    if (!Array.isArray(ingredients)) {
      console.error('Ingredients is not an array:', ingredients);
      return NextResponse.json({ success: false, message: 'Invalid ingredients format' }, { status: 400 });
    }

    // Optionally, validate each ingredient has name and status
    for (const ingredient of ingredients) {
      if (!ingredient.name || !ingredient.status) {
        console.error('Invalid ingredient format:', ingredient);
        return NextResponse.json({ success: false, message: 'Invalid ingredient format' }, { status: 400 });
      }
    }

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
        grade,
        ingredients, // Store the ingredients (with their status: Approved, Not Approved, Not Safe)
        recommendation,
      },
    });

    // Log the new image created
    console.log('New image created:', newImage);

    // Find the company associated with the image
    const company = await db.company.findFirst({
      where: {
        id: companyId
      }
    });

    if (company) {
      console.log(`Notifying manager (${company.manager}) about new image upload for company ${company.name}.`);
      // If the company exists, notify the manager about the new image upload
      await db.notification.create({
        data: {
          user_from: company.staff, // Notification from staff
          user_to: company.manager, // Notification to the manager
          body: `Uploaded new image for ${company.name}`,
          read: "Unread" 
        }
      });
      console.log('Notification sent to manager.');
    } else {
      console.warn(`Company with ID ${companyId} not found when trying to send notification.`);
    }

    return NextResponse.json({ success: true, data: newImage });
  } catch (error: any) {
    console.error('Error saving new image:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
