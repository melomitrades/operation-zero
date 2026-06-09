import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyProfToken } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  if (!verifyProfToken(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId manquant.' }, { status: 400 });
  }
  try {
    const sql = getDb();
    // Delete child records first to respect foreign keys
    await sql`
      DELETE FROM tentatives
      WHERE groupe_id IN (
        SELECT id FROM groupes WHERE session_id = ${sessionId}
      )
    `;
    await sql`DELETE FROM groupes WHERE session_id = ${sessionId}`;
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
