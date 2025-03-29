import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  await User.deleteMany({}); // clear existing users

  const users = await User.insertMany([
    {
      name: 'Alice Student',
      email: 'alice@student.com',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
    },
    {
      name: 'Bob Employer',
      email: 'bob@company.com',
      password: await bcrypt.hash('password123', 10),
      role: 'employer',
    },
  ]);  

  res.status(200).json({ message: 'Users seeded', users });
}
