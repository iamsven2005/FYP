import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken'; // Import JWT verification

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

// Helper function to check the Authorization header
async function checkAuthorization(req: Request) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return { error: true, response: NextResponse.json({ error: 'Authorization token is required' }, { status: 401 }) };
  }

  try {
    // Verify the JWT token
    const decoded = verify(token, JWT_SECRET);
    return { error: false, decoded };
  } catch (error) {
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
    const { imageurl, name, companyId, retrived, halal, healthy, AI, ingredients, grade } = body;
    
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
          read: "Unread" 
        }
      });
    }

    return NextResponse.json({ success: true, data: newImage });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: error }, { status: 500 });
  }
}
