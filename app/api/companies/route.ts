
// /api/companies
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { imgurl, name, staffId, managerId, id } = await req.json();

  try {
    const newCompany = await db.company.create({
      data: {
        img: imgurl,
        name,
        archived: false,
        staff:staffId,
        manager:managerId,
      },
    });
    const notify = await db.notification.create({
      data:{
        user_from: id,
        user_to: staffId,
        body: `You have been assigned to work on ${name}`,
        read: "Unread"
      }
    })
    const notify2 = await db.notification.create({
      data:{
        user_from: id,
        user_to: managerId,
        body: `You have been assigned to manage ${name}`,
        read: "Unread"
      }
    })
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}


// Get all companies
export async function GET() {
  try {
    const companies = await db.company.findMany();
    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('id');
    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    const { name, img, staff, manager, id } = await req.json();
    console.log(req.json())
    if (!name && !img && !staff && !manager) {
      return NextResponse.json({ error: "No data provided for update" }, { status: 400 });
    }

    // Update the company information
    const updatedCompany = await db.company.update({
      where: { id: companyId },
      data: {
        ...(name && { name }),
        ...(img && { img }),    
        ...(staff && { staff }),
        ...(manager && { manager }), 
      },
    });
    const notify = await db.notification.create({
      data:{
        user_from: id,
        user_to: staff,
        body: `Admin as edited ${name}`,
        read: "Unread"
      }
    })
    const notify2 = await db.notification.create({
      data:{
        user_from: id,
        user_to: manager,
        body: `Admin as edited ${name}`,
        read: "Unread"
      }
    })
    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
