import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  
    try {
      const updatedCompany = await db.company.update({
        where: { id: params.id },
        data: { archived: true },
      });
      return NextResponse.json(updatedCompany, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to archive company" }, { status: 500 });
    }
  }
  export async function GET(req: Request, { params }: { params: { id: string } }) {

  try {
    const companies = await db.company.findMany({
      where: {
        staff: params.id,
        archived: false,
      },
    });

    if (!companies.length) {
      return NextResponse.json({ error: "No companies found for this user" }, { status: 400 });
    }

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}