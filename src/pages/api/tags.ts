// src/pages/api/tags.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();
    const jobs = await Job.find({}, 'tags');
    const tagSet = new Set<string>();

    for (const job of jobs) {
      job.tags.forEach((tag: string) => {
        if (typeof tag === 'string') {
          tagSet.add(tag.trim());
        }
      });
    }
    

    const uniqueTags = Array.from(tagSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    res.status(200).json({ tags: uniqueTags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
