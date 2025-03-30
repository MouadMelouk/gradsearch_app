import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    await connectToDatabase();

    const user = getUserFromToken(req);
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can upload resumes' });
    }

    const { resumeUrl } = req.body;
    if (!resumeUrl) {
      return res.status(400).json({ error: 'Missing resumeUrl' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { resumeUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Add this log to verify what's saved
    console.log('[CV UPLOAD] Saved resume URL:', updatedUser.resumeUrl);

    return res.status(200).json({ message: 'Resume saved successfully', resumeUrl });
  } catch (err: any) {
    console.error('[CV UPLOAD ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
}
