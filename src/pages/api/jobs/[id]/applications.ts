import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import Application from '@/models/Application';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  try {
    await connectToDatabase();
    const user = getUserFromToken(req);

    if (user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can view applications' });
    }

    const { id: jobId } = req.query;

    const applications = await Application.find({ jobId })
      .populate('userId', 'name email resumeUrl') // only basic info
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(applications);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch applications' });
  }
}
