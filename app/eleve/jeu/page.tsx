'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { genererEnigmes, DEFAULT_SEEDS, ACTES, EnigmeVariante } from '@/lib/enigmes';
import styles from './jeu.module.css';

const DUREE_TOTALE = 60 * 60;
const PENALITE_INDICE = 2 * 60;
const PENALITE_ESSAI = 60;

type Phase = 'loading' | 'jeu' | 'victoire' | 'defaite';

export default function JeuPage() {
  const router = useRouter();
  const [groupeId, setGroupeId] = useState<number | null>(null);
  const [prenoms, setPrenoms] = useState('');
  const [enigmes, setEnigmes] = useState<EnigmeVariante[]>([]);
  const [enigmeIndex, setEnigmeIndex] = useState(0);
  const [reponse, setReponse] = useState('');
  const [essais, setEssais] = useState(0);
  const [indicesReveles, setIndicesReveles] = useState<number[]>([]);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);
  const [fragments, setFragments] = useState<string[]>([]);
  const [penaliteTotal, setPenaliteTotal] = useState(0);
  const [tempsRestant, setTempsRestant] = useState(DUREE_TOTALE);
  const [phase, setPhase] = useState<Phase>('loading');
  const [showDecoder, setShowDecoder] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const enigme = enigmes[enigmeIndex] as EnigmeVariante | undefined;
  const acteActuel = ACTES.find(a => a.id === enigme?.acte);

  // Load group + seeds
  useEffect(() => {
    const id = sessionStorage.getItem('groupeId');
    const p = sessionStorage.getItem('prenoms');
    if (!id || !p) { router.push('/eleve'); return; }
    const gid = Number(id);
    setGroupeId(gid);
    setPrenoms(p);

    fetch(`/api/session/seeds?groupeId=${gid}`)
      .then(r => r.json())
      .then(data => {
        const seeds: number[] = data.seeds || DEFAULT_SEEDS;
        setEnigmes(genererEnigmes(seeds));
        setPhase('jeu');
      })
      .catch(() => {
        setEnigmes(genererEnigmes(DEFAULT_SEEDS));
        setPhase('jeu');
      });
  }, [router]);

  // Timer
  useEffect(() => {
    if (phase !== 'jeu') return;
    timerRef.current = setInterval(() => {
      setTempsRestant(prev => {
        const next = prev - 1;
        if (next <= 0) { clearInterval(timerRef.current!); setPhase('defaite'); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function checkReponse(input: string): boolean {
    if (!enigme) return false;
    const val = parseFloat(input.replace(',', '.'));
    if (isNaN(val)) return false;
    return Math.abs(val - enigme.reponse) < 0.01;
  }

  const sauvegarderProgression = useCallback(async (
    nouvelleEnigme: number, nouveauxFragments: string[],
    nouvellePenalite: number, resolu: boolean
  ) => {
    if (!groupeId || !enigme) return;
    await fetch('/api/progression/sauvegarder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupeId, enigmeCourante: nouvelleEnigme,
        fragments: nouveauxFragments.join(','),
        tempsPenalite: nouvellePenalite,
        enigmeId: enigmeIndex + 1,
        nbEssais: essais + 1, nbIndices: indicesReveles.length,
        resolue: resolu, termine: nouvelleEnigme > 20,
        tempsRestant,
      }),
    }).catch(console.error);
  }, [groupeId, enigme, enigmeIndex, essais, indicesReveles.length, tempsRestant]);

  async function handleSoumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!reponse.trim() || loading || !enigme) return;
    setLoading(true);
    setErreur('');

    if (checkReponse(reponse)) {
      const nouveauxFragments = [...fragments, enigme.fragment];
      setFragments(nouveauxFragments);
      setSucces(true);
      const prochainIndex = enigmeIndex + 1;
      await sauvegarderProgression(prochainIndex + 1, nouveauxFragments, penaliteTotal, true);
      if (prochainIndex >= enigmes.length) {
        setTimeout(() => setPhase('victoire'), 1500);
      } else {
        setTimeout(() => {
          setEnigmeIndex(prochainIndex);
          setReponse(''); setEssais(0); setIndicesReveles([]); setSucces(false); setErreur('');
        }, 2000);
      }
    } else {
      const nouvelEssai = essais + 1;
      setEssais(nouvelEssai);
      const penalite = nouvelEssai > 1 ? penaliteTotal + PENALITE_ESSAI : penaliteTotal;
      if (nouvelEssai > 1) { setPenaliteTotal(penalite); setTempsRestant(prev => Math.max(0, prev - PENALITE_ESSAI)); }
      setErreur(`Réponse incorrecte.${nouvelEssai > 1 ? ' −1 minute.' : ' Réessayez.'}`);
      setReponse('');
      await sauvegarderProgression(enigmeIndex + 1, fragments, penalite, false);
    }
    setLoading(false);
  }

  function revelerIndice(idx: number) {
    if (indicesReveles.includes(idx)) return;
    setIndicesReveles([...indicesReveles, idx]);
    const nouvellePenalite = penaliteTotal + PENALITE_INDICE;
    setPenaliteTotal(nouvellePenalite);
    setTempsRestant(prev => Math.max(0, prev - PENALITE_INDICE));
  }

  const scoreTemps = Math.max(0, tempsRestant);
  const scoreFinal = scoreTemps + fragments.length * 100;

  if (phase === 'loading') {
    return (
      <main className={styles.main} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', letterSpacing: '0.2em', animation: 'blink 1s step-end infinite' }}>
          CHARGEMENT DE LA MISSION…
        </p>
      </main>
    );
  }
  if (phase === 'victoire') return <EcranVictoire fragments={fragments} scoreFinal={scoreFinal} tempsRestant={tempsRestant} prenoms={prenoms} />;
  if (phase === 'defaite') return <EcranDefaite enigmesResolues={fragments.length} prenoms={prenoms} />;
  if (!enigme) return null;

  const progressPct = (enigmeIndex / enigmes.length) * 100;

  return (
    <main className={styles.main}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.agentLabel}>AGENT</span>
          <span className={styles.agentName}>{prenoms.split(',')[0]?.trim()}</span>
        </div>
        <div className={`${styles.chrono} ${tempsRestant < 300 ? styles.chronoCritique : ''}`}>
          <span className={styles.chronoIcon}>⏱</span>
          <span className={styles.chronoTime}>{formatTime(tempsRestant)}</span>
        </div>
        <div className={styles.topRight}>
          <button className={styles.decoderBtn} onClick={() => setShowDecoder(!showDecoder)}>
            FRAGMENTS [{fragments.length}/20]
          </button>
        </div>
      </header>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
      </div>

      {showDecoder && (
        <div className={styles.decoderOverlay} onClick={() => setShowDecoder(false)}>
          <div className={styles.decoderPanel} onClick={e => e.stopPropagation()}>
            <p className={styles.decoderTitle}>DÉCODEUR DE FRAGMENTS</p>
            <div className={styles.decoderGrid}>
              {enigmes.map((_, i) => (
                <div key={i} className={`${styles.decoderCell} ${i < fragments.length ? styles.decoderCellActive : ''}`}>
                  {i < fragments.length ? fragments[i] : `E${i + 1}`}
                </div>
              ))}
            </div>
            <button className={styles.decoderClose} onClick={() => setShowDecoder(false)}>FERMER</button>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.acteBar} style={{ borderColor: acteActuel?.couleur + '44', color: acteActuel?.couleur }}>
          <span>{acteActuel?.nom}</span>
          <span className={styles.enigmeNum}>ÉNIGME {enigmeIndex + 1}/20</span>
        </div>

        <div className={styles.enigmeCard}>
          <div className={styles.enigmeCardTop} style={{ background: `linear-gradient(90deg, ${acteActuel?.couleur}22, transparent)` }}>
            <h2 className={styles.enigmeTitre}>{enigme.titre}</h2>
          </div>

          <div className={styles.narration}>
            <span className={styles.narrationIcon}>◈</span>
            <p>{enigme.narration}</p>
          </div>

          <div className={styles.question}>
            <p className={styles.questionLabel}>// MISSION</p>
            <p className={styles.questionText}>{enigme.question}</p>
            {enigme.unite && <p className={styles.questionUnite}>{enigme.unite}</p>}
          </div>

          <div className={styles.indicesSection}>
            <p className={styles.indicesTitle}>INDICES DISPONIBLES (−2 min chacun)</p>
            <div className={styles.indicesBtns}>
              {enigme.indices.map((indice, i) => (
                <div key={i} className={styles.indiceItem}>
                  {indicesReveles.includes(i) ? (
                    <div className={styles.indiceRevele}>
                      <span className={styles.indiceBadge}>INDICE {i + 1}</span>
                      <p>{indice}</p>
                    </div>
                  ) : (
                    <button
                      className={styles.indiceBtn}
                      onClick={() => revelerIndice(i)}
                      disabled={i > 0 && !indicesReveles.includes(i - 1)}
                    >
                      {i === 0 || indicesReveles.includes(i - 1)
                        ? `▶ Révéler l'indice ${i + 1}`
                        : `🔒 Indice ${i + 1} (débloquez le précédent d'abord)`}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSoumettre} className={styles.answerForm}>
            <div className={styles.answerRow}>
              <input
                type="text"
                value={reponse}
                onChange={e => setReponse(e.target.value)}
                placeholder={enigme.typeReponse === 'decimal' ? 'Ex: 12.5 ou 12,5' : 'Votre réponse…'}
                className={styles.answerInput}
                disabled={succes}
                autoFocus
                autoComplete="off"
              />
              <button
                type="submit"
                className={`${styles.answerBtn} ${succes ? styles.answerBtnSucces : ''}`}
                disabled={!reponse.trim() || succes || loading}
              >
                {succes ? '✓ CORRECT' : loading ? '...' : 'VALIDER'}
              </button>
            </div>
            {erreur && <p className={styles.erreur}>⚠ {erreur}</p>}
            {succes && (
              <div className={styles.succesBox}>
                <p className={styles.succesTitle}>✓ FRAGMENT OBTENU : <strong>{enigme.fragment}</strong></p>
                <p className={styles.succesExplication}>{enigme.explication}</p>
                <p className={styles.succesNext}>Chargement de l&apos;énigme suivante…</p>
              </div>
            )}
          </form>
        </div>

        {penaliteTotal > 0 && (
          <p className={styles.penaliteInfo}>Pénalités accumulées : −{Math.floor(penaliteTotal / 60)} min</p>
        )}
      </div>
    </main>
  );
}

function EcranVictoire({ fragments, scoreFinal, tempsRestant, prenoms }: {
  fragments: string[]; scoreFinal: number; tempsRestant: number; prenoms: string;
}) {
  return (
    <main className={styles.ecranFin}>
      <div className={styles.victoireContent}>
        <div className={styles.victoireGlow} />
        <p className={styles.victoireEyebrow}>MISSION ACCOMPLIE</p>
        <h1 className={styles.victoireTitre}>OPÉRATION ZÉRO<br /><span className={styles.victoireNeutralise}>NEUTRALISÉE</span></h1>
        <p className={styles.victoireTexte}>Félicitations, Brigade <strong>{prenoms}</strong> !<br />L&apos;IA ZÉRO a été désactivée. Le système du collège est restauré.</p>
        <div className={styles.victoireStats}>
          <div className={styles.victStat}><span className={styles.victStatVal}>{fragments.length}/20</span><span className={styles.victStatLabel}>Fragments obtenus</span></div>
          <div className={styles.victStat}><span className={styles.victStatVal}>{Math.floor(tempsRestant/60)}:{String(tempsRestant%60).padStart(2,'0')}</span><span className={styles.victStatLabel}>Temps restant</span></div>
          <div className={styles.victStat}><span className={styles.victStatVal} style={{color:'var(--green)'}}>{scoreFinal}</span><span className={styles.victStatLabel}>Score final</span></div>
        </div>
        <div className={styles.codeComplet}>
          <p className={styles.codeLabel}>CODE DE DÉSACTIVATION</p>
          <p className={styles.codeFragments}>{fragments.join(' — ')}</p>
        </div>
      </div>
    </main>
  );
}

function EcranDefaite({ enigmesResolues, prenoms }: { enigmesResolues: number; prenoms: string }) {
  return (
    <main className={styles.ecranFin}>
      <div className={styles.defaiteContent}>
        <p className={styles.defaiteEyebrow}>TEMPS ÉCOULÉ</p>
        <h1 className={styles.defaiteTitre}>ZÉRO A<br /><span className={styles.defaiteVaincre}>RÉSISTÉ</span></h1>
        <p className={styles.defaiteTexte}>Brigade <strong>{prenoms}</strong>, le temps imparti est écoulé.<br />ZÉRO est toujours actif. Votre commandant analysera vos résultats.</p>
        <div className={styles.victoireStats}>
          <div className={styles.victStat}><span className={styles.victStatVal} style={{color:'var(--red)'}}>{enigmesResolues}/20</span><span className={styles.victStatLabel}>Énigmes résolues</span></div>
        </div>
      </div>
    </main>
  );
}
