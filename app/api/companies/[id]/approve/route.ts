import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from 'jsonwebtoken';
import { checkIngredients } from "@/lib/ingredientChecker";

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

    if (!images) {
      console.error(`No images found for company with ID ${params.id}`);
      return NextResponse.json({ error: "No images found for this company" }, { status: 404 });
    }

    // Check the ingredients for each image, handling potential nulls
    const imagesWithCheckedIngredients = await Promise.all(images.map(async (image) => {
      // Check if ingredients exist and are in array format before mapping
      if (Array.isArray(image.ingredients)) {
        const checkedIngredients = await checkIngredients(
          image.ingredients.filter((i): i is string => typeof i === 'string').map((i: string) => i)
        );
        return { ...image, ingredients: checkedIngredients }; // Add checked ingredients
      } else {
        // Handle case where ingredients is null or not an array
        return { ...image, ingredients: [] }; // Default to empty array if ingredients are null or not an array
      }
    }));

    return NextResponse.json({ company, items: imagesWithCheckedIngredients });
  } catch (error: any) {
    console.error("Error occurred while fetching company details:", error);

    // Provide a more specific error message if it's JWT related
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Failed to fetch company details" }, { status: 500 });
  }
}
