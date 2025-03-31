import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { tags } = req.body;

  if (!Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid tags' });
  }

  try {
    await dbConnect();

    const jobs = await Job.find();

    const lowercaseInputTags = tags.map((t: string) => t.toLowerCase());

    const filteredJobs = jobs.filter((job) => {
      const jobTags = job.tags.map((t: string) => t.toLowerCase());
      return lowercaseInputTags.every((inputTag: string) =>
        jobTags.some((jobTag: string) => jobTag.includes(inputTag))
      );      
    });

    const indexedJobs = filteredJobs.map((job) => ({
      jobId: job._id.toString(),
      description: `${job.title} at ${job.company} (${job.location || 'N/A'}):\n${job.description}\n\nTags: ${job.tags.join(', ')}`,
      title: job.title
    }));

    res.status(200).json({ indexedJobs });
  } catch (err) {
    console.error('[Indexed Job Fetch Error]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
