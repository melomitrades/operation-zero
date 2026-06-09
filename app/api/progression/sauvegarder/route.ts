import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const {
    groupeId,
    enigmeCourante,
    fragments,
    tempsPenalite,
    enigmeId,
    nbEssais,
    nbIndices,
    resolue,
    termine,
    tempsRestant,
  } = await req.json();

  if (!groupeId) {
    return NextResponse.json({ error: 'groupeId manquant.' }, { status: 400 });
  }

  try {
    const sql = getDb();
    const fragmentCount = fragments ? fragments.split(',').filter(Boolean).length : 0;
    const score = Math.max(0, tempsRestant || 0) + fragmentCount * 100;
    const finishedAt: string | null = termine ? new Date().toISOString() : null;
    const resolueAt: string | null = resolue ? new Date().toISOString() : null;

    await sql`
      UPDATE groupes
      SET
        enigme_courante = ${enigmeCourante},
        fragments = ${fragments || ''},
        temps_penalite = ${tempsPenalite || 0},
        score = ${score},
        finished_at = ${finishedAt}
      WHERE id = ${groupeId}
    `;

    const existing = await sql`
      SELECT id FROM tentatives
      WHERE groupe_id = ${groupeId} AND enigme_id = ${enigmeId}
    `;

    if (existing.length > 0) {
      await sql`
        UPDATE tentatives
        SET
          nb_essais = ${nbEssais},
          nb_indices = ${nbIndices},
          resolue = ${resolue},
          resolue_at = ${resolueAt}
        WHERE groupe_id = ${groupeId} AND enigme_id = ${enigmeId}
      `;
    } else {
      await sql`
        INSERT INTO tentatives (groupe_id, enigme_id, nb_essais, nb_indices, resolue, resolue_at)
        VALUES (${groupeId}, ${enigmeId}, ${nbEssais}, ${nbIndices}, ${resolue}, ${resolueAt})
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
