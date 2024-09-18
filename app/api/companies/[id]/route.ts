import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await req.json();
    const company = await db.company.findFirst({
      where:{
        id: params.id
      }
    })
    if(company){
      const notify = await db.notification.create({
        data:{
          user_from: params.id,
          user_to: company.staff,
          body: `Admin archived ${company.name} you can no longer access it.`,
          read: "Unread"
        }
        
      })
      const notify2 = await db.notification.create({
        data:{
          user_from: params.id,
          user_to: company.manager,
          body: `Admin archived ${company.name} you can no longer access it.`,
          read: "Unread"
        }
        
      })
    }

    const updatedCompany = await db.company.update({
      where: { id: params.id },
      data: { archived: true },
    });
    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to archive company" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const companies = await db.company.findMany({
      where: {
        OR: [{ staff: params.id }, { manager: params.id }],
        archived: false,
      },
    });

    if (!companies.length) {
      return NextResponse.json({ error: "No companies found for this user" }, { status: 400 });
    }
    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
