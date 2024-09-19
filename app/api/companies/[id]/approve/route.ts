import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from 'jsonwebtoken';

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the token
    verify(token, JWT_SECRET);

    // Fetch the company by ID
    const company = await db.company.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Fetch the associated images
    const images = await db.images.findMany({
      where: {
        companyId: params.id,
      },
      select: {
        id: true,
        name: true,
        imageurl: true,
        halal: true,
        healthy: true,
        retrived: true,
        AI: true,
        status: true,
        ingredients: true, // Include the ingredients field
      },
    });

    return NextResponse.json({ company, items: images });
  } catch (error:any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch company details" }, { status: 500 });
  }
}
