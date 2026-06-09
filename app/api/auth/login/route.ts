import { NextRequest, NextResponse } from 'next/server';

const PROF_PASSWORD = 'Mr986925';
const TOKEN_SECRET = 'prof-token-opzero-2025';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === PROF_PASSWORD) {
    // Simple token (pour production, utilisez JWT ou une vraie session)
    const token = Buffer.from(`${TOKEN_SECRET}:${Date.now()}`).toString('base64');
    return NextResponse.json({ ok: true, token });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
