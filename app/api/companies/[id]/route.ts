import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Secret key for verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET as string;

// PATCH to archive the company (with header check)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    verify(token, JWT_SECRET);

    const { id } = await req.json();
    const company = await db.company.findFirst({
      where: {
        id: params.id,
      },
    });

    if (company) {
      // Create notification for staff and manager
      const notify = await db.notification.create({
        data: {
          user_from: params.id,
          user_to: company.staff,
          body: `Admin archived ${company.name} you can no longer access it.`,
          read: "Unread",
        },
      });
      const notify2 = await db.notification.create({
        data: {
          user_from: params.id,
          user_to: company.manager,
          body: `Admin archived ${company.name} you can no longer access it.`,
          read: "Unread",
        },
      });
    }

    // Update the company to set it as archived
    const updatedCompany = await db.company.update({
      where: { id: params.id },
      data: { archived: true },
    });

    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.log(error);
    return NextResponse.json({ error: "Failed to archive company" }, { status: 500 });
  }
}

// GET companies for a user (with header check)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Extract the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Verify the token and return 401 if it's missing or invalid
  if (!token) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    verify(token, JWT_SECRET);

    // Fetch companies where the user is either a staff or manager, and the company is not archived
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
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
