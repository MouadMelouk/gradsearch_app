import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import Application from '@/models/Application';
import Job from '@/models/Job';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const user = getUserFromToken(req);
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply to jobs' });
    }

    const { jobId, coverLetter, resumeUrl } = req.body;

    if (!jobId || !coverLetter || !resumeUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const existing = await Application.findOne({ userId: user.id, jobId });
    if (existing) {
      return res.status(409).json({ error: 'You already applied to this job' });
    }

    const application = await Application.create({
      userId: user.id,
      jobId,
      resumeUrl,
      coverLetter,
      status: 'pending',
    });

    return res.status(201).json({ message: 'Application submitted', application });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
