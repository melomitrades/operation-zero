# 🎮 Opération Zéro — Jeu de type Unlock — Mathématiques 4ème

Jeu de révision mathématique pour la 4ème, inspiré du jeu Unlock.  
L'IA **ZÉRO** a pris le contrôle du collège — 20 énigmes pour la neutraliser !

---

## 🚀 Déploiement en 5 étapes

### Étape 1 — Créer la base de données Neon

1. Allez sur [neon.tech](https://neon.tech) et créez un compte gratuit.
2. Créez un nouveau **Project** (ex: `operation-zero`).
3. Dans l'onglet **Dashboard**, copiez la **Connection string** (format `postgresql://...`).
4. Exécutez ce SQL dans l'onglet **SQL Editor** de Neon :

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

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
);

CREATE TABLE IF NOT EXISTS tentatives (
  id SERIAL PRIMARY KEY,
  groupe_id INTEGER REFERENCES groupes(id),
  enigme_id INTEGER NOT NULL,
  nb_essais INTEGER DEFAULT 0,
  nb_indices INTEGER DEFAULT 0,
  resolue BOOLEAN DEFAULT false,
  resolue_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Étape 2 — Créer le repository GitHub

1. Allez sur [github.com](https://github.com) et créez un **nouveau repository** (ex: `operation-zero`).
2. Dans le terminal de votre ordinateur :

```bash
cd operation-zero
git init
git add .
git commit -m "Initial commit - Opération Zéro"
git branch -M main
git remote add origin https://github.com/VOTRE_USER/operation-zero.git
git push -u origin main
```

---

### Étape 3 — Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous avec GitHub.
2. Cliquez **New Project** → importez votre repo `operation-zero`.
3. Dans **Environment Variables**, ajoutez :

| Nom | Valeur |
|-----|--------|
| `DATABASE_URL` | La connection string copiée depuis Neon |

4. Cliquez **Deploy**. Vercel construira et déploiera automatiquement.

---

### Étape 4 — Vérifier le déploiement

Une fois déployé, votre URL sera du type `https://operation-zero-xyz.vercel.app`.

Vérifiez que tout fonctionne :
- Accueil : boutons **Agent** et **Commandant** visibles
- Connexion professeur : mot de passe `Mr986925`
- Créez une session → notez le code → testez l'enrôlement d'un groupe

---

### Étape 5 — Utilisation en classe

#### Côté professeur :
1. Ouvrez le jeu → **Je suis professeur** → mot de passe `Mr986925`
2. Cliquez **+ NOUVELLE SESSION** → notez le code généré (ex: `XKCD4928`)
3. Écrivez ce code au tableau
4. Restez sur le dashboard : il se rafraîchit toutes les **10 secondes**

#### Côté élèves :
1. Ouvrez le jeu sur un écran par groupe → **Je suis élève**
2. Entrez les prénoms, la classe, et le code de session
3. Cliquez **Rejoindre la mission** → le jeu commence !

---

## 🧩 Structure des 20 énigmes

| Acte | Thème | Énigmes |
|------|-------|---------|
| I — Infiltration | Priorités opératoires, Nombres relatifs, Calcul littéral | 1 à 5 |
| II — Déchiffrement | Fractions (comparaison, +/−, ×, ÷), Développement | 6 à 10 |
| III — Neutralisation | Pythagore, Translations, Puissances, Écriture scientifique | 11 à 15 |
| IV — Désactivation | Pourcentages, Proportionnalité, Équations, Thalès, Statistiques | 16 à 20 |

---

## ⏱️ Règles de pénalités

- **Essai incorrect (2ème et +)** : −1 minute sur le chrono
- **Indice révélé** : −2 minutes sur le chrono
- **Score final** = temps restant (en secondes) + 100 points × nombre d'énigmes résolues

---

## 🔧 Développement local

```bash
npm install
cp .env.example .env.local
# Remplissez DATABASE_URL dans .env.local
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## 📁 Structure du projet

```
app/
├── page.tsx                    # Écran d'accueil
├── eleve/
│   ├── page.tsx                # Formulaire d'enrôlement
│   └── jeu/page.tsx            # Jeu principal
├── professeur/
│   ├── page.tsx                # Login professeur
│   └── dashboard/page.tsx      # Dashboard temps réel
└── api/
    ├── auth/login/             # Authentification professeur
    ├── session/creer/          # Créer une session
    ├── session/rejoindre/      # Rejoindre une session
    ├── progression/sauvegarder/ # Sauvegarder la progression
    └── resultats/liste/        # Résultats pour le dashboard
lib/
├── db.ts                       # Connexion Neon
├── enigmes.ts                  # Les 20 énigmes
└── auth.ts                     # Vérification du token prof
```

---

## 🔐 Sécurité

- Le mot de passe professeur est `Mr986925` — changez-le dans `app/api/auth/login/route.ts`
- Pour une utilisation publique, envisagez de stocker le mot de passe dans les variables d'environnement Vercel

---

*Bonne mission, Brigade Mathématique !* 🎯
