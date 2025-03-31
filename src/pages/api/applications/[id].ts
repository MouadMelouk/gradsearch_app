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
  res: NextApiResponse<ResponseData | { message?: string; error?: string }>
) {
  await connectToDatabase();

  const user = getUserFromToken(req);
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid application ID' });
  }

  // Fetch the application
  const rawApplication = await Application.findById(id);
  if (!rawApplication) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Only the owning student can read/update/delete their application
  if (user.role !== 'student' || rawApplication.userId.toString() !== user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // ================================
  // GET — Fetch application and job
  // ================================
  if (req.method === 'GET') {
    const rawJob = await Job.findById(rawApplication.jobId).lean();
    if (!rawJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = rawJob as unknown as IJob;    

    return res.status(200).json({
      application: rawApplication.toObject() as IApplication,
      job,
    });
  }

  // ================================
  // PATCH — Update cover letter and/or resume URL
  // ================================
  if (req.method === 'PATCH') {
    const { coverLetter, resumeUrl } = req.body;

    if (!coverLetter && !resumeUrl) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    if (coverLetter) rawApplication.coverLetter = coverLetter;
    if (resumeUrl) rawApplication.resumeUrl = resumeUrl;

    await rawApplication.save();

    return res.status(200).json({ message: 'Application updated successfully' });
  }

  // ================================
  // DELETE — Retract application
  // ================================
  if (req.method === 'DELETE') {
    await rawApplication.deleteOne();
    return res.status(200).json({ message: 'Application successfully retracted' });
  }

  // ================================
  // Unsupported method
  // ================================
  return res.status(405).json({ error: 'Method not allowed' });
}
