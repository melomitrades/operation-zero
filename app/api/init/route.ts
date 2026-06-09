import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyProfToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!verifyProfToken(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS groupes (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id),
        prenoms TEXT NOT NULL,
        classe VARCHAR(50) NOT NULL,
        enigme_courante INTEGER DEFAULT 1,
        score INTEGER DEFAULT 0,
        temps_penalite INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT NOW(),
        finished_at TIMESTAMP,
        fragments TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tentatives (
        id SERIAL PRIMARY KEY,
        groupe_id INTEGER REFERENCES groupes(id),
        enigme_id INTEGER NOT NULL,
        nb_essais INTEGER DEFAULT 0,
        nb_indices INTEGER DEFAULT 0,
        resolue BOOLEAN DEFAULT false,
        resolue_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    return NextResponse.json({ ok: true, message: 'Base de données initialisée.' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
