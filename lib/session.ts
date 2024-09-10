import { db as prisma } from './db'; // Assuming the Prisma client is imported from your db setup
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Create a session
export async function createSession(userId: string, token: string) {
  try {
    await prisma.session.create({
      data: {
        userId,
        token,
      },
    });
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }
}

// Check if an active session exists for the user
export async function checkActiveSession(userId: string) {
  try {
    const session = await prisma.session.findFirst({
      where: { userId },
    });
    return session;
  } catch (error) {
    console.error('Failed to check session:', error);
    throw new Error('Failed to check session');
  }
}

// Terminate (delete) a session for the user
export async function terminateSession(userId: string) {
  try {
    await prisma.session.deleteMany({
      where: { userId },
    });
  } catch (error) {
    console.error('Failed to terminate session:', error);
    throw new Error('Failed to terminate session');
  }
}

// Invalidate a session (another term for terminating it)
export async function invalidateSession(userId: string) {
  try {
    await terminateSession(userId); // This uses the terminateSession function
  } catch (error) {
    console.error('Failed to invalidate session:', error);
    throw new Error('Failed to invalidate session');
  }
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Failed to verify token:', error);
    throw new Error('Failed to verify token');
  }
}

// Create a JWT token for a session
export function createJWT(userId: string, email: string, role: string) {
  try {
    return sign({ userId, email, role }, JWT_SECRET, { expiresIn: '1h' });
  } catch (error) {
    console.error('Failed to create JWT token:', error);
    throw new Error('Failed to create JWT token');
  }
}
