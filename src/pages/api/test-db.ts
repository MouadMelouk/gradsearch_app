import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const users = await User.find().limit(5);
    return res.status(200).json(users);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
