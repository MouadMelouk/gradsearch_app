import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import Application, { IApplication } from '@/models/Application';
import Job, { IJob } from '@/models/Job';

type ResponseData = {
  application: IApplication;
  job: IJob;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  try {
    await connectToDatabase();
    const user = getUserFromToken(req);
    const { id } = req.query;

    // ✅ Fix: cast via unknown first
    const rawApplication = await Application.findById(id).lean();
    if (!rawApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const application = rawApplication as unknown as IApplication;

    // ✅ Access control
    if (user.role !== 'student' || application.userId.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const rawJob = await Job.findById(application.jobId).lean();
    if (!rawJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = rawJob as unknown as IJob;

    return res.status(200).json({ application, job });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
