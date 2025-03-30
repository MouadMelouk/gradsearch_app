// /api/dashboard/student.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import Application from '@/models/Application';
import Job from '@/models/Job';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Only GET allowed' });
    }

    // 1) Decode token & verify role
    const user = getUserFromToken(req);
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Forbidden: Must be a student' });
    }

    // 2) Query all applications for this student
    const applications = await Application.find({ userId: user.id }).populate('jobId');

    // 3) Format your data
    const formatted = applications.map((app) => ({
      _id: app._id,
      jobTitle: app.jobId?.title || 'Unknown Job',
      status: app.status,
      appliedAt: app.createdAt || app._id.getTimestamp(),
    }));

    return res.status(200).json(formatted);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
