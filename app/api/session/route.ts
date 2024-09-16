import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Authorization token missing' }, { status: 400 });
    }

    // Verify the token and remove it (just by clearing the token from cookies or localStorage)
    const decoded = verify(token, JWT_SECRET);

    // Assuming token is stored in cookies, we can invalidate it by setting an expired token
    const response = NextResponse.json({ message: 'Session terminated successfully' });
    response.cookies.set('token', '', { maxAge: 0 }); // Clear token by setting its expiry to 0

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Failed to terminate session' }, { status: 500 });
  }
}
