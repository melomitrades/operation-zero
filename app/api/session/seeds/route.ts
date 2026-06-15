import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DEFAULT_SEEDS } from '@/lib/enigmes';

export async function GET(req: NextRequest) {
  const groupeId = req.nextUrl.searchParams.get('groupeId');
  if (!groupeId) {
    return NextResponse.json({ error: 'groupeId manquant.' }, { status: 400 });
  }
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT s.seeds, g.niveau
      FROM sessions s
      JOIN groupes g ON g.session_id = s.id
      WHERE g.id = ${Number(groupeId)}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ seeds: DEFAULT_SEEDS, niveau: 1 });
    }
    const seeds = rows[0].seeds ? JSON.parse(rows[0].seeds) : DEFAULT_SEEDS;
    const niveau = rows[0].niveau || 1;
    return NextResponse.json({ seeds, niveau });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
