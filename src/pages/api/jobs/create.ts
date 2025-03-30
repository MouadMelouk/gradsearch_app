import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import Job from '@/models/Job';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    await connectToDatabase();
    const user = getUserFromToken(req);

    if (user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can post jobs' });
    }

    const { title, description, company, location, tags } = req.body;

    if (!title || !description || !company) {
      return res.status(400).json({ error: 'Title, description, and company are required' });
    }

    const job = await Job.create({
      title,
      description,
      company,
      location,
      tags: tags || [],
      postedBy: user.id,
    });

    return res.status(201).json({ message: 'Job posted successfully', job });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to post job' });
  }
}
