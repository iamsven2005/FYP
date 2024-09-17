import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const company = await db.company.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch company details" }, { status: 500 });
  }
}
