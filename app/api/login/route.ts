import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { db as prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { email, password } = req.body;
  
      console.log('Login request received');
      console.log('Received data:', { email, password });
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and Password are required' });
      }
  
      // Find the user by email
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Check if the password is correct
      const isValid = await bcrypt.compare(password, user.password);
  
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Create JWT token
      const token = sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );
  
      return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
}
  