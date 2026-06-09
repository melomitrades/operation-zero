'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './eleve.module.css';

export default function ElevePage() {
  const router = useRouter();
  const [prenoms, setPrenoms] = useState('');
  const [classe, setClasse] = useState('');
  const [codeSession, setCodeSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!prenoms.trim() || !classe.trim() || !codeSession.trim()) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/session/rejoindre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenoms: prenoms.trim(), classe: classe.trim(), codeSession: codeSession.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur inconnue.');
      } else {
        // Store group id in sessionStorage
        sessionStorage.setItem('groupeId', String(data.groupeId));
        sessionStorage.setItem('prenoms', prenoms.trim());
        sessionStorage.setItem('classe', classe.trim());
        router.push('/eleve/jeu');
      }
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.corner} />
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.eyebrow}>BRIGADE MATHÉMATIQUE — ENRÔLEMENT</p>
          <h1 className={styles.title}>IDENTIFICATION<br />DE L&apos;AGENT</h1>
          <p className={styles.subtitle}>
            Votre commandant a créé une session de mission.<br />
            Entrez le code de session pour rejoindre l&apos;opération.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className="label" htmlFor="prenoms">Prénoms du groupe</label>
            <input
              id="prenoms"
              type="text"
              value={prenoms}
              onChange={e => setPrenoms(e.target.value)}
              placeholder="ex: Alice, Bob, Charlie"
              maxLength={120}
              autoComplete="off"
            />
            <span className={styles.hint}>Séparez les prénoms par des virgules</span>
          </div>

          <div className={styles.field}>
            <label className="label" htmlFor="classe">Classe</label>
            <input
              id="classe"
              type="text"
              value={classe}
              onChange={e => setClasse(e.target.value)}
              placeholder="ex: 4ème A"
              maxLength={30}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className="label" htmlFor="code">Code de session</label>
            <input
              id="code"
              type="text"
              value={codeSession}
              onChange={e => setCodeSession(e.target.value.toUpperCase())}
              placeholder="ex: XKCD4928"
              maxLength={8}
              autoComplete="off"
              className={styles.codeInput}
            />
            <span className={styles.hint}>Fourni par votre professeur</span>
          </div>

          {error && <p className={styles.error}>⚠ {error}</p>}

          <button type="submit" className={`btn-primary ${styles.submit}`} disabled={loading}>
            {loading ? 'CONNEXION...' : '▶ REJOINDRE LA MISSION'}
          </button>
        </form>

        <Link href="/" className={styles.back}>← Retour à l&apos;accueil</Link>
      </div>
    </main>
  );
}
