// /api/jobs/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import Job from '@/models/Job';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const { id } = req.query as { id: string };

  // 1. Require a valid token for ALL requests
  let user;
  try {
    user = getUserFromToken(req); // throws if missing or invalid
  } catch (err: any) {
    // e.g. "Authorization header missing"
    return res.status(401).json({ error: err.message || 'Unauthorized' });
  }

  // 2. Attempt to find the job
  let job;
  try {
    job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
  } catch (err: any) {
    return res.status(400).json({ error: 'Invalid job ID format' });
  }

  // 3. Switch based on method. Even GET is protected, so only logged in users can see job details.
  switch (req.method) {
    case 'GET': {
      // Example policy: any logged in user (student or employer) can fetch job details
      // If you only want the original poster or an admin to see it, you'd check that here
      return res.status(200).json(job);
    }

    case 'PUT': {
      // Editing is restricted to employers AND the user who posted the job
      if (user.role !== 'employer' || String(job.postedBy) !== String(user.id)) {
        return res.status(403).json({ error: 'Not authorized to edit this job' });
      }

      const { title, description, company, location, tags } = req.body;
      if (!title || !description || !company) {
        return res
          .status(400)
          .json({ error: 'Title, description, and company are required' });
      }

      try {
        job.title = title;
        job.description = description;
        job.company = company;
        job.location = location || '';
        job.tags = Array.isArray(tags) ? tags : [];
        await job.save();

        return res.status(200).json({ message: 'Job updated successfully', job });
      } catch (err: any) {
        return res
          .status(500)
          .json({ error: err.message || 'Failed to update job' });
      }
    }

    case 'DELETE': {
      // Deleting is restricted to employers AND the user who posted the job
      if (user.role !== 'employer' || String(job.postedBy) !== String(user.id)) {
        return res.status(403).json({ error: 'Not authorized to delete this job' });
      }

      try {
        await job.deleteOne();
        return res.status(200).json({ message: 'Job deleted successfully' });
      } catch (err: any) {
        return res
          .status(500)
          .json({ error: err.message || 'Failed to delete job' });
      }
    }

    default: {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  }
}
