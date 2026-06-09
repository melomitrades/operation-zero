'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ACTES, ENIGMES } from '@/lib/enigmes';
import styles from './dashboard.module.css';

interface Groupe {
  id: number;
  prenoms: string;
  classe: string;
  enigme_courante: number;
  score: number;
  temps_penalite: number;
  started_at: string;
  finished_at: string | null;
  fragments: string;
}

interface Session {
  id: number;
  code: string;
  created_at: string;
  is_active: boolean;
  groupes: Groupe[];
}

export default function Dashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionSelecteeId, setSessionSelecteeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const getToken = useCallback(() => {
    const token = sessionStorage.getItem('profToken');
    if (!token) { router.push('/professeur'); return null; }
    return token;
  }, [router]);

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/resultats/liste', {
        headers: { 'x-prof-token': token },
      });
      if (res.status === 401) { router.push('/professeur'); return; }
      const data = await res.json();
      const fetched: Session[] = data.sessions || [];
      setSessions(fetched);
      // Auto-select first session only on first load
      setSessionSelecteeId(prev => {
        if (prev !== null) return prev;
        return fetched.length > 0 ? fetched[0].id : null;
      });
      setLastRefresh(new Date());
    } catch {
      setError('Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessionSelectee = sessions.find(s => s.id === sessionSelecteeId) ?? null;

  async function creerSession() {
    const token = getToken();
    if (!token) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/session/creer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-prof-token': token },
      });
      const data = await res.json();
      if (data.code) {
        await fetchData();
        setSessionSelecteeId(data.id);
        alert(`Session créée ! Code : ${data.code}\nPartagez ce code avec vos élèves.`);
      }
    } catch {
      setError('Erreur lors de la création.');
    } finally {
      setCreating(false);
    }
  }

  async function supprimerSession(sessionId: number, code: string) {
    if (!confirm(`Supprimer la session ${code} ?\nTous les groupes et résultats associés seront effacés.`)) return;
    const token = getToken();
    if (!token) return;
    setDeleting(sessionId);
    setError('');
    try {
      const res = await fetch('/api/session/supprimer', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-prof-token': token },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Erreur lors de la suppression.');
      } else {
        // If we deleted the selected session, deselect it
        setSessionSelecteeId(prev => prev === sessionId ? null : prev);
        await fetchData();
      }
    } catch {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleting(null);
    }
  }

  function logout() {
    sessionStorage.removeItem('profToken');
    router.push('/');
  }

  function formatDuree(started: string, finished: string | null) {
    const start = new Date(started);
    const end = finished ? new Date(finished) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m${String(s).padStart(2, '0')}s${finished ? '' : ' ⏱'}`;
  }

  function getProgression(g: Groupe) {
    return Math.min(g.enigme_courante - 1, 20);
  }

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>BRIGADE MATHÉMATIQUE — QG</p>
          <h1 className={styles.title}>TABLEAU DE COMMANDEMENT</h1>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.refreshInfo}>Actualisation : {lastRefresh.toLocaleTimeString('fr-FR')}</span>
          <button className={styles.btnNew} onClick={creerSession} disabled={creating}>
            {creating ? '...' : '+ NOUVELLE SESSION'}
          </button>
          <button className={styles.btnLogout} onClick={logout}>DÉCONNEXION</button>
        </div>
      </header>

      {error && <p className={styles.error}>⚠ {error}</p>}

      {loading ? (
        <div className={styles.loadingScreen}>
          <p className={styles.loadingText}>CHARGEMENT DES DONNÉES...</p>
        </div>
      ) : (
        <div className={styles.content}>
          {/* Sessions sidebar */}
          <aside className={styles.sidebar}>
            <p className={styles.sidebarTitle}>SESSIONS</p>
            {sessions.length === 0 ? (
              <p className={styles.noSessions}>Aucune session.<br />Créez-en une ci-dessus.</p>
            ) : (
              sessions.map(s => (
                <div
                  key={s.id}
                  className={`${styles.sessionItem} ${sessionSelecteeId === s.id ? styles.sessionItemActive : ''}`}
                >
                  <button
                    className={styles.sessionBtn}
                    onClick={() => setSessionSelecteeId(s.id)}
                  >
                    <span className={styles.sessionCode}>{s.code}</span>
                    <span className={styles.sessionMeta}>{s.groupes?.length || 0} groupe(s)</span>
                    <span className={`${styles.sessionStatus} ${s.is_active ? styles.statusActive : styles.statusClosed}`}>
                      {s.is_active ? '● ACTIVE' : '○ FERMÉE'}
                    </span>
                  </button>
                  <button
                    className={styles.sessionDeleteBtn}
                    onClick={() => supprimerSession(s.id, s.code)}
                    disabled={deleting === s.id}
                    title="Supprimer cette session"
                  >
                    {deleting === s.id ? '…' : '✕'}
                  </button>
                </div>
              ))
            )}
          </aside>

          {/* Main panel */}
          <div className={styles.panel}>
            {!sessionSelectee ? (
              <div className={styles.emptyPanel}>
                <p>Sélectionnez ou créez une session pour voir les résultats.</p>
              </div>
            ) : (
              <>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.panelEyebrow}>SESSION SÉLECTIONNÉE</p>
                    <h2 className={styles.panelCode}>{sessionSelectee.code}</h2>
                  </div>
                  <div className={styles.panelStats}>
                    <div className={styles.pStat}>
                      <span className={styles.pStatVal}>{sessionSelectee.groupes?.length || 0}</span>
                      <span className={styles.pStatLabel}>Groupes</span>
                    </div>
                    <div className={styles.pStat}>
                      <span className={styles.pStatVal} style={{ color: 'var(--green)' }}>
                        {sessionSelectee.groupes?.filter(g => g.finished_at).length || 0}
                      </span>
                      <span className={styles.pStatLabel}>Terminés</span>
                    </div>
                    <div className={styles.pStat}>
                      <span className={styles.pStatVal} style={{ color: 'var(--cyan)' }}>
                        {sessionSelectee.groupes?.filter(g => !g.finished_at && g.enigme_courante > 1).length || 0}
                      </span>
                      <span className={styles.pStatLabel}>En jeu</span>
                    </div>
                  </div>
                </div>

                {/* Groups table */}
                {(!sessionSelectee.groupes || sessionSelectee.groupes.length === 0) ? (
                  <div className={styles.waitingGroups}>
                    <p className={styles.waitingText}>En attente des groupes…</p>
                    <p className={styles.waitingCode}>Les élèves utilisent le code : <strong>{sessionSelectee.code}</strong></p>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>GROUPE</th>
                          <th>CLASSE</th>
                          <th>PROGRESSION</th>
                          <th>ÉNIGME</th>
                          <th>DURÉE</th>
                          <th>PÉNALITÉS</th>
                          <th>STATUT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionSelectee.groupes.map(g => {
                          const prog = getProgression(g);
                          const pct = (prog / 20) * 100;
                          const acteActuel = ACTES.find(a => {
                            const e = ENIGMES[Math.min(prog, 19)];
                            return e?.acte === a.id;
                          });
                          return (
                            <tr key={g.id} className={g.finished_at ? styles.rowTermine : ''}>
                              <td className={styles.tdPrenoms}>{g.prenoms}</td>
                              <td className={styles.tdClasse}>{g.classe}</td>
                              <td className={styles.tdProg}>
                                <div className={styles.progBarWrapper}>
                                  <div
                                    className={styles.progBarFill}
                                    style={{ width: `${pct}%`, background: acteActuel?.couleur || 'var(--cyan)' }}
                                  />
                                </div>
                                <span className={styles.progNum}>{prog}/20</span>
                              </td>
                              <td className={styles.tdEnigme}>
                                {g.finished_at ? '✓' : `E${Math.min(g.enigme_courante, 20)}`}
                              </td>
                              <td className={styles.tdDuree}>{formatDuree(g.started_at, g.finished_at)}</td>
                              <td className={styles.tdPenalite} style={{ color: g.temps_penalite > 0 ? 'var(--red)' : 'var(--text-muted)' }}>
                                {g.temps_penalite > 0 ? `−${Math.floor(g.temps_penalite / 60)}m` : '—'}
                              </td>
                              <td>
                                <span className={`${styles.badge} ${g.finished_at ? styles.badgeTermine : styles.badgeEnJeu}`}>
                                  {g.finished_at ? 'TERMINÉ' : 'EN JEU'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Per-enigme summary */}
                {sessionSelectee.groupes?.length > 0 && (
                  <div className={styles.enigmeSummary}>
                    <p className={styles.summaryTitle}>AVANCEMENT PAR ÉNIGME</p>
                    <div className={styles.enigmeGrid}>
                      {ENIGMES.map(en => {
                        const resolved = sessionSelectee.groupes?.filter(g => getProgression(g) >= en.id).length || 0;
                        const total = sessionSelectee.groupes?.length || 1;
                        const pct = Math.round((resolved / total) * 100);
                        const acte = ACTES.find(a => a.id === en.acte);
                        return (
                          <div key={en.id} className={styles.enigmeCell} title={en.titre}>
                            <div className={styles.enigmeCellBar}>
                              <div className={styles.enigmeCellFill} style={{ height: `${pct}%`, background: acte?.couleur }} />
                            </div>
                            <span className={styles.enigmeCellNum}>{en.id}</span>
                            <span className={styles.enigmeCellPct}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
