import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { status } = await req.json();

  // Check if the status is valid (approve/reject)
  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  try {
    // Update the user's role based on approval or rejection
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: status === 'approved' ? 'ApprovedStaff' : 'Staff', // You can modify the role as per your needs
      },
    });

    return NextResponse.json({ message: `Request ${status} successfully`, updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update staff status' }, { status: 500 });
  }
}
