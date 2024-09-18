import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Define the POST method
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageurl, name, companyId, retrived, halal, healthy, AI, ingredients } = body;
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
        ingredients,
      },
    });
    const company = await db.company.findFirst({
      where:{
        id: companyId
      }
    })
    if(company){
      const notify = await db.notification.create({
        data:{
          user_from: company.staff,
          user_to: company.manager,
          body: `Uploaded new image for ${company.name}`,
          read: "Unread"
        }
      })
    }

    return NextResponse.json({ success: true, data: newImage });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false, message: error }, { status: 500 });
  }
}
