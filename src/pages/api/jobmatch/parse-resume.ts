import type { NextApiRequest, NextApiResponse } from 'next';
import pdf from 'pdf-parse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { resumeUrl } = req.body;

  if (!resumeUrl || typeof resumeUrl !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid resumeUrl' });
  }

  try {
    const response = await fetch(resumeUrl);
    if (!response.ok) {
      throw new Error('Failed to download resume PDF');
    }

    const buffer = await response.arrayBuffer();
    const parsed = await pdf(Buffer.from(buffer));
    res.status(200).json({ text: parsed.text });
  } catch (err) {
    console.error('[PDF Parse Error]', err);
    res.status(500).json({ error: 'Failed to parse resume PDF' });
  }
}
