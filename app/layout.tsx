import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Opération Zéro — Brigade Mathématique',
  description: 'Jeu de type Unlock pour réviser le programme de 4ème',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
