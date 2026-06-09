'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './professeur.module.css';

export default function ProfesseurPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem('profToken', data.token);
        router.push('/professeur/dashboard');
      } else {
        setError('Mot de passe incorrect.');
      }
    } catch {
      setError('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.bg} />
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <p className={styles.eyebrow}>ACCÈS COMMANDANT</p>
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>⬡</span>
          </div>
          <h1 className={styles.title}>IDENTIFICATION<br />REQUISE</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className="label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && <p className={styles.error}>⚠ {error}</p>}
          <button type="submit" className={`btn-primary ${styles.submit}`} disabled={loading || !password}>
            {loading ? 'VÉRIFICATION...' : '▶ ACCÉDER AU QG'}
          </button>
        </form>

        <Link href="/" className={styles.back}>← Retour à l&apos;accueil</Link>
      </div>
    </main>
  );
}
