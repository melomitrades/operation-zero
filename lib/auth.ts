import { NextRequest } from 'next/server';

const TOKEN_SECRET = 'prof-token-opzero-2025';

export function verifyProfToken(req: NextRequest): boolean {
  const token = req.headers.get('x-prof-token');
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith(TOKEN_SECRET);
  } catch {
    return false;
  }
}
