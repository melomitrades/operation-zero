'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <main className={styles.main}>
      {/* Animated grid background */}
      <div className={styles.grid} aria-hidden />

      {/* Corner decorations */}
      <div className={`${styles.corner} ${styles.cornerTL}`} />
      <div className={`${styles.corner} ${styles.cornerTR}`} />
      <div className={`${styles.corner} ${styles.cornerBL}`} />
      <div className={`${styles.corner} ${styles.cornerBR}`} />

      <div className={`${styles.content} ${mounted ? styles.visible : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>BRIGADE MATHÉMATIQUE — MISSION CLASSIFIÉE</p>
          <h1 className={styles.title}>
            <span className={styles.titleLine1}>OPÉRATION</span>
            <span className={styles.titleZero}>ZÉRO</span>
          </h1>
          <p className={styles.subtitle}>
            L&apos;IA <span className={styles.highlight}>ZÉRO</span> a pris le contrôle du système informatique du collège.<br />
            Résolvez 20 énigmes mathématiques pour la neutraliser.
          </p>
        </div>

        {/* Status bar */}
        <div className={styles.statusBar}>
          <span className={styles.statusItem}>
            <span className={styles.statusDot} />
            SYSTÈME EN ALERTE
          </span>
          <span className={styles.statusItem}>20 ÉNIGMES ACTIVES</span>
          <span className={styles.statusItem}>DURÉE : 60 MIN</span>
        </div>

        {/* Buttons */}
        <div className={styles.buttons}>
          <Link href="/eleve" className={styles.btnEleve}>
            <span className={styles.btnIcon}>▶</span>
            <span className={styles.btnText}>
              <span className={styles.btnLabel}>AGENT</span>
              <span className={styles.btnSub}>Je suis élève</span>
            </span>
          </Link>
          <Link href="/professeur" className={styles.btnProf}>
            <span className={styles.btnIcon}>⬡</span>
            <span className={styles.btnText}>
              <span className={styles.btnLabel}>COMMANDANT</span>
              <span className={styles.btnSub}>Je suis professeur</span>
            </span>
          </Link>
        </div>

        <p className={styles.footer}>
          PROGRAMME 4ÈME — MATHÉMATIQUES — 2025/2026
        </p>
      </div>
    </main>
  );
}
