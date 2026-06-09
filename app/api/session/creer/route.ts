import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyProfToken } from '@/lib/auth';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateSeeds(): number[] {
  return Array.from({ length: 20 }, () => Math.floor(Math.random() * 100000));
}

export async function POST(req: NextRequest) {
  if (!verifyProfToken(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const sql = getDb();

    // Ensure seeds column exists (migration douce)
    await sql`
      ALTER TABLE sessions ADD COLUMN IF NOT EXISTS seeds TEXT DEFAULT ''
    `;

    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await sql`SELECT id FROM sessions WHERE code = ${code}`;
      if (existing.length === 0) break;
      code = generateCode();
      attempts++;
    }

    const seeds = generateSeeds();
    const seedsJson = JSON.stringify(seeds);

    const result = await sql`
      INSERT INTO sessions (code, started_at, seeds)
      VALUES (${code}, NOW(), ${seedsJson})
      RETURNING id, code
    `;

    return NextResponse.json({ id: result[0].id, code: result[0].code });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
