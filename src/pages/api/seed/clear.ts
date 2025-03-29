import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import Application from '@/models/Application';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
  ]);

  res.status(200).json({ message: 'All collections cleared' });
}
