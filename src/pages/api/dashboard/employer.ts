// /api/dashboard/employer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import Job from '@/models/Job';
import Application from '@/models/Application';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  try {
    await connectToDatabase();
    const user = getUserFromToken(req);

    if (user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can access this data' });
    }

    const jobs = await Job.find({ postedBy: user.id }).lean();
    const jobIds = jobs.map(job => job._id);

    const applicationCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);

    const jobsWithCounts = jobs.map(job => {
      const jobId = (job._id as mongoose.Types.ObjectId).toString();
      const match = applicationCounts.find(a => a._id.toString() === jobId);

      return {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        applicantCount: match?.count || 0,
        createdAt: job.createdAt,
      };
    });

    return res.status(200).json(jobsWithCounts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
