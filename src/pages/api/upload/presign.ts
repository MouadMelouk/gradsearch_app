import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { generatePresignedUrl } from '@/lib/s3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const user = getUserFromToken(req);
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can upload resumes' });
    }

    const { fileType } = req.body;

    if (fileType !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files allowed' });
    }

    const { signedUrl, publicUrl } = await generatePresignedUrl(user.id, fileType);

    return res.status(200).json({ signedUrl, publicUrl });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
