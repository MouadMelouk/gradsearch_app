import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/Job';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const employer = await User.findOne({ role: 'employer' });
  if (!employer) return res.status(400).json({ error: 'No employer found' });

  await Job.deleteMany({}); // clear

  const jobs = await Job.insertMany([
    {
      title: 'Frontend Developer Intern',
      description: 'Build UI with React and Tailwind',
      company: 'TechCorp',
      location: 'Remote',
      tags: ['react', 'internship', 'frontend'],
      postedBy: employer._id,
    },
    {
      title: 'Backend Developer',
      description: 'Work with Node and MongoDB',
      company: 'CodeBase',
      location: 'Berlin',
      tags: ['nodejs', 'mongoose'],
      postedBy: employer._id,
    },
  ]);

  res.status(200).json({ message: 'Jobs seeded', jobs });
}
