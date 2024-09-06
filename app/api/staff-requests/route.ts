import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// Fetch all pending staff requests
export async function GET() {
  try {
    const staffRequests = await prisma.user.findMany({
      where: { role: 'Staff' }, // Assuming only staff members need approval
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    // Assuming you only want to return pending requests, and "role" can change once approved.
    const pendingRequests = staffRequests.filter((staff) => staff.role === 'Staff');

    return NextResponse.json(pendingRequests, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch staff requests:', error);
    return NextResponse.json({ message: 'Failed to fetch staff requests' }, { status: 500 });
  }
}
