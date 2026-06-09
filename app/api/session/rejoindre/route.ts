import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { prenoms, classe, codeSession } = await req.json();

  if (!prenoms || !classe || !codeSession) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
  }

  try {
    const sql = getDb();

    // Find active session
    const sessions = await sql`
      SELECT id FROM sessions
      WHERE code = ${codeSession.toUpperCase()} AND is_active = true
    `;

    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Code de session invalide ou session fermée.' }, { status: 404 });
    }

    const sessionId = sessions[0].id;

    // Create group
    const groupes = await sql`
      INSERT INTO groupes (session_id, prenoms, classe, enigme_courante, score, temps_penalite)
      VALUES (${sessionId}, ${prenoms}, ${classe}, 1, 0, 0)
      RETURNING id
    `;

    return NextResponse.json({ groupeId: groupes[0].id, sessionId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
