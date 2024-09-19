import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    const decoded = verify(token, JWT_SECRET);
    // Proceed if the token is valid
    const { imgurl, name, staffId, managerId, id } = await req.json();

    const newCompany = await db.company.create({
      data: {
        img: imgurl,
        name,
        archived: false,
        staff: staffId,
        manager: managerId,
      },
    });
    
    const notify = await db.notification.create({
      data: {
        user_from: id,
        user_to: staffId,
        body: `You have been assigned to work on ${name}`,
        read: "Unread",
      },
    });

    const notify2 = await db.notification.create({
      data: {
        user_from: id,
        user_to: managerId,
        body: `You have been assigned to manage ${name}`,
        read: "Unread",
      },
    });

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// Get all companies
export async function GET(req: Request) {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    verify(token, JWT_SECRET);

    const companies = await db.company.findMany();
    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// Update company information
export async function PATCH(req: Request) {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    verify(token, JWT_SECRET);

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('id');

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    const { name, img, staff, manager, id } = await req.json();

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
      data: {
        user_from: id,
        user_to: staff,
        body: `Admin has edited ${name}`,
        read: "Unread",
      },
    });

    const notify2 = await db.notification.create({
      data: {
        user_from: id,
        user_to: manager,
        body: `Admin has edited ${name}`,
        read: "Unread",
      },
    });

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
