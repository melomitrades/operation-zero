import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { verifyProfToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!verifyProfToken(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const sql = getDb();
    // Execute each statement individually
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (const stmt of statements) {
      await sql.unsafe(stmt);
    }
    return NextResponse.json({ ok: true, message: 'Base de données initialisée.' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
