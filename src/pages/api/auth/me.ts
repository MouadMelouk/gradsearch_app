import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });

  try {
    await connectToDatabase();
    const user = getUserFromToken(req);

    const fullUser = await User.findById(user.id).select('-password');
    if (!fullUser) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({ user: fullUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
