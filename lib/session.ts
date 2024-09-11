import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

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
