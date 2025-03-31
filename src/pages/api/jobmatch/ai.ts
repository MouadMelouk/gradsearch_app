import type { NextApiRequest, NextApiResponse } from 'next';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_MODEL = 'mistralai/mixtral-8x7b-instruct';

const SYSTEM_INSTRUCTION = `
You are an expert AI recruiter.

You will receive:
- A student's resume (plain text)
- A list of job descriptions, each with a unique "jobId"

Your task:
- For each job, assess how well it matches the student’s resume and experience.
- For each job that matches, write one sentence that:
  - Is direct and enthusiastic
  - Refers to the student as "you"
  - Clearly references one or more specific phrases mentioned in the job description
  - Clearly ties those phrases to the student's relevant experiences or skills, fetched from their resume
  - Be critical about the fit, do not tie a marginal experience to a main responsibility

Use the following match score criteria:
- 3 = Excellent match
- 2 = Good match
- 1 = Possible fit
- 0 = Not a match

Only respond with structured JSON — no formatting, no explanations:
{
  "matches": [
    {
      "jobId": "abc123",
      "response": "You have strong experience with [THING] from [PROJECT], which aligns well with the job’s mention of [PHRASE].",
      "match": 3
    }
  ]
}

Every returned match must include a non-empty response string that makes a clear comparison.
Only return jobs with match >= 1. Only return valid JSON.
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { cvText, jobs } = req.body;

    if (!cvText || !Array.isArray(jobs)) {
      return res.status(400).json({ error: 'Missing cvText or jobs' });
    }

    const userPrompt = JSON.stringify({ studentCV: cvText, jobs });

    const chatPayload = {
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION.trim() },
        { role: 'user', content: userPrompt }
      ]
    };

    console.log('[Sending to OpenRouter]', JSON.stringify(chatPayload, null, 2));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'gradsearch-match'
      },
      body: JSON.stringify(chatPayload)
    });

    const data = await response.json();

    console.log('[OpenRouter Response]', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('[AI Error: No valid choices]', data);
      return res.status(502).json({ error: 'No response from OpenRouter' });
    }

    let parsed;
    try {
      parsed = JSON.parse(data.choices[0].message.content);
    } catch (err) {
      console.error('[AI Response Parse Error]', data.choices[0].message.content);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const matches = Array.isArray(parsed.matches)
      ? parsed.matches.filter((m: any) => m.match >= 1)
      : [];

    res.status(200).json({ matches });

  } catch (err: any) {
    console.error('[AI Match Error]', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
