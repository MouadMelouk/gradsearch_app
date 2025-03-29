import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import Job from '@/models/Job';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const student = await User.findOne({ role: 'student' });
  const job = await Job.findOne({});
  if (!student || !job) return res.status(400).json({ error: 'Missing student or job' });

  await Application.deleteMany({}); // clear

  const applications = await Application.insertMany([
    {
      userId: student._id,
      jobId: job._id,
      resumeUrl: 'https://example.com/resume.pdf',
      coverLetter: 'I am excited to apply...',
      status: 'pending',
    },
  ]);

  res.status(200).json({ message: 'Applications seeded', applications });
}
