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
    console.error("Authorization token is missing");
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the token
    verify(token, JWT_SECRET);
    console.log("JWT token verified successfully.");

    // Fetch the company by ID
    const company = await db.company.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!company) {
      console.error(`Company with ID ${params.id} not found`);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    console.log(`Company fetched:`, company);

    // Fetch the associated images
    const images = await db.images.findMany({
      where: { companyId: params.id },
      select: {
        id: true,
        name: true,
        imageurl: true,
        AI: true, // Keep for raw data (if needed)
        halal: true,
        healthy: true,
        retrived: true,
        status: true,
        ingredients: true, // Fetch post-processed ingredients
      },
    });

    if (!images || images.length === 0) {
      console.error(`No images found for company with ID ${params.id}`);
      return NextResponse.json({ error: "No images found for this company" }, { status: 404 });
    }

    console.log(`Fetched ${images.length} images for company ID ${params.id}:`, images);

    // Directly return the ingredients as stored without reprocessing
    return NextResponse.json({ company, items: images });
  } catch (error: any) {
    console.error("Error occurred while fetching company details:", error);

    // Provide a more specific error message if it's JWT related
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    return NextResponse.json({ error: "Failed to fetch company details" }, { status: 500 });
  }
}
