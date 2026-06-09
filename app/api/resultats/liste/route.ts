import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyProfToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!verifyProfToken(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const sql = getDb();

    // Get all sessions with their groups
    const sessions = await sql`
      SELECT
        s.id,
        s.code,
        s.created_at,
        s.is_active,
        COALESCE(
          json_agg(
            json_build_object(
              'id', g.id,
              'prenoms', g.prenoms,
              'classe', g.classe,
              'enigme_courante', g.enigme_courante,
              'score', g.score,
              'temps_penalite', g.temps_penalite,
              'started_at', g.started_at,
              'finished_at', g.finished_at,
              'fragments', g.fragments
            ) ORDER BY g.started_at
          ) FILTER (WHERE g.id IS NOT NULL),
          '[]'
        ) AS groupes
      FROM sessions s
      LEFT JOIN groupes g ON g.session_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ sessions });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
