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
  