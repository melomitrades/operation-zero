import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { prenoms, classe, codeSession, niveau } = await req.json();

  if (!prenoms || !classe || !codeSession || !niveau) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
  }

  try {
    const sql = getDb();

    const sessions = await sql`
      SELECT id FROM sessions
      WHERE code = ${codeSession.toUpperCase()} AND is_active = true
    `;
    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Code de session invalide ou session fermée.' }, { status: 404 });
    }

    const sessionId = sessions[0].id;

    // Migration douce : ajouter la colonne niveau si elle n'existe pas
    await sql`ALTER TABLE groupes ADD COLUMN IF NOT EXISTS niveau INTEGER DEFAULT 1`;

    const niveauNum = Math.min(3, Math.max(1, parseInt(String(niveau), 10) || 1));

    const groupes = await sql`
      INSERT INTO groupes (session_id, prenoms, classe, enigme_courante, score, temps_penalite, niveau)
      VALUES (${sessionId}, ${prenoms}, ${classe}, 1, 0, 0, ${niveauNum})
      RETURNING id
    `;

    return NextResponse.json({ groupeId: groupes[0].id, sessionId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
