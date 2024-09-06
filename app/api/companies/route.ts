import { db } from "@/lib/db";
import { NextResponse } from "next/server";


// Create a new company
export async function POST(req: Request) {
  const { imgurl, name } = await req.json();

  try {
    const newCompany = await db.company.create({
      data: { imgurl, name, archived: false },
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

// Archive a company
