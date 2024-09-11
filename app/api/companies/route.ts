
// /api/companies
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { imgurl, name, staffId, managerId } = await req.json();

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
    // Extract company ID from the request URL
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('id');

    // If no company ID is provided, return 400 Bad Request
    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Extract the data to be updated from the request body
    const { name, imgurl, staff, manager } = await req.json();

    // Check if at least one field to update is provided
    if (!name && !imgurl && !staff && !manager) {
      return NextResponse.json({ error: "No data provided for update" }, { status: 400 });
    }

    // Update the company information
    const updatedCompany = await db.company.update({
      where: { id: companyId },
      data: {
        ...(name && { name }),
        ...(imgurl && { imgurl }),    
        ...(staff && { staff }),
        ...(manager && { manager }), 
      },
    });

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
