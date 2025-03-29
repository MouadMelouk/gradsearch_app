import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !['student', 'employer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name, // ✅ add this line
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({ token });
}
