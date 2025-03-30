// src/lib/auth.ts
import type { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

type DecodedToken = {
  id: string;
  role: string;
  email: string;
};

export function getUserFromToken(req: NextApiRequest): DecodedToken {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new Error('Invalid Authorization format. Use "Bearer <token>".');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as DecodedToken;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}
