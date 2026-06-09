export interface Enigme {
  id: number;
  acte: number;
  titre: string;
  narration: string;
  question: string;
  reponse: number | string;
  reponseAffichee?: string; // pour les fractions, ex "3/4"
  fragment: string;
  indices: string[];
  explication: string;
  typeReponse: 'entier' | 'decimal' | 'fraction';
  unite?: string;
}

export const ENIGMES: Enigme[] = [
  // ─── ACTE 1 : INFILTRATION ─────────────────────────────────────────────────
  {
    id: 1,
    acte: 1,
    titre: "Accès au terminal",
    narration:
      "La Brigade Mathématique vient d'intercepter un signal de ZÉRO. Pour accéder au terminal principal, il faut déchiffrer le premier verrou numérique. ZÉRO a laissé un calcul piégé : il compte sur vos erreurs de priorités.",
    question:
      "Calculez : 3 + 4 × 5 − 2²",
    reponse: 19,
    fragment: "OP-19",
    indices: [
      "Rappelez-vous : les puissances et les multiplications passent avant les additions.",
      "Calculez d'abord 2², puis 4 × 5, puis faites les additions et soustractions de gauche à droite.",
      "2² = 4 et 4 × 5 = 20. Donc : 3 + 20 − 4 = ?",
    ],
    explication: "Priorités : 2² = 4, puis 4 × 5 = 20, puis 3 + 20 − 4 = 19.",
    typeReponse: 'entier',
  },
  {
    id: 2,
    acte: 1,
    titre: "La grille de coordonnées",
    narration:
      "ZÉRO a chiffré les coordonnées de son serveur central sur un axe numérique. Les coordonnées sont données par une somme de nombres relatifs. Trouvez la position exacte.",
    question:
      "Calculez : (−7) + 12 + (−3) − (−5)",
    reponse: 7,
    fragment: "RG-07",
    indices: [
      "Soustraire un nombre négatif revient à additionner son opposé.",
      "−(−5) = +5. Regroupez les positifs et les négatifs séparément.",
      "Positifs : 12 + 5 = 17. Négatifs : −7 + (−3) = −10. Résultat : 17 − 10 = ?",
    ],
    explication: "(−7) + 12 + (−3) − (−5) = −7 + 12 − 3 + 5 = 7.",
    typeReponse: 'entier',
  },
  {
    id: 3,
    acte: 1,
    titre: "Décryptage du noyau",
    narration:
      "Le noyau de ZÉRO est protégé par un produit de nombres relatifs. Une erreur de signe et c'est l'alarme. Calculez le code exact.",
    question:
      "Calculez : (−4) × (−3) × (−2)",
    reponse: -24,
    fragment: "NK-24",
    indices: [
      "Comptez le nombre de facteurs négatifs : si impair, le résultat est négatif.",
      "Il y a 3 facteurs négatifs → résultat négatif.",
      "4 × 3 × 2 = 24. Le signe est négatif donc : −24.",
    ],
    explication: "3 facteurs négatifs → signe −. 4 × 3 × 2 = 24 → résultat : −24.",
    typeReponse: 'entier',
  },
  {
    id: 4,
    acte: 1,
    titre: "Division sécurisée",
    narration:
      "Un quotient de nombres relatifs protège la porte du datacenter. ZÉRO pense que vous allez vous tromper de signe. Prouvez-lui le contraire.",
    question:
      "Calculez : (−36) ÷ 4",
    reponse: -9,
    fragment: "DV-09",
    indices: [
      "Le quotient de deux nombres de signes différents est négatif.",
      "36 ÷ 4 = 9. Les signes sont différents.",
      "Résultat : −9",
    ],
    explication: "Un négatif ÷ un positif = négatif. 36 ÷ 4 = 9, donc −36 ÷ 4 = −9.",
    typeReponse: 'entier',
  },
  {
    id: 5,
    acte: 1,
    titre: "Expression piégée",
    narration:
      "ZÉRO a encodé un message dans une expression littérale. Pour déchiffrer sa signification, évaluez l'expression pour la valeur donnée.",
    question:
      "Si x = −3, calculez : 2x² − 5x + 1",
    reponse: 34,
    fragment: "EX-34",
    indices: [
      "Remplacez x par −3 dans chaque terme. Attention à x².",
      "(−3)² = 9, pas −9. Donc 2 × 9 = 18.",
      "18 − 5 × (−3) + 1 = 18 + 15 + 1 = ?",
    ],
    explication:
      "2×(−3)² − 5×(−3) + 1 = 2×9 + 15 + 1 = 18 + 15 + 1 = 34.",
    typeReponse: 'entier',
  },

  // ─── ACTE 2 : DÉCHIFFREMENT ─────────────────────────────────────────────────
  {
    id: 6,
    acte: 2,
    titre: "Fréquence fractionnaire",
    narration:
      "ZÉRO transmet sur une fréquence fractionnaire. Pour la brouiller, vous devez calculer la somme exacte de deux fréquences.",
    question:
      "Calculez : 3/4 + 5/6",
    reponse: 19,
    reponseAffichee: "19/12",
    fragment: "FF-19",
    indices: [
      "Cherchez le PPCM de 4 et 6.",
      "PPCM(4,6) = 12. Convertissez : 3/4 = 9/12 et 5/6 = 10/12.",
      "9/12 + 10/12 = 19/12. Entrez le numérateur : 19.",
    ],
    explication: "3/4 = 9/12 ; 5/6 = 10/12 → 9/12 + 10/12 = 19/12.",
    typeReponse: 'entier',
    unite: '/12 (entrez uniquement le numérateur)',
  },
  {
    id: 7,
    acte: 2,
    titre: "Comparaison de signaux",
    narration:
      "Deux signaux suspects sont captés. Le plus fort est celui dont la valeur est la plus grande. Identifiez-le en comparant ces fractions. Entrez 1 si la première est plus grande, 2 sinon.",
    question:
      "Laquelle est la plus grande : 7/9 ou 5/6 ? (répondez 1 ou 2)",
    reponse: 2,
    fragment: "CS-06",
    indices: [
      "Réduisez au même dénominateur pour comparer.",
      "PPCM(9,6) = 18. Convertissez : 7/9 = 14/18 et 5/6 = 15/18.",
      "14/18 < 15/18 donc 5/6 est la plus grande. Répondez 2.",
    ],
    explication: "7/9 = 14/18 ; 5/6 = 15/18 → 5/6 > 7/9 → réponse : 2.",
    typeReponse: 'entier',
  },
  {
    id: 8,
    acte: 2,
    titre: "Multiplication de brouilleurs",
    narration:
      "Pour multiplier la puissance de brouillage, ZÉRO multiplie ses signaux fractionnaires. Calculez le résultat.",
    question:
      "Calculez : (3/5) × (10/9). Entrez le numérateur de la fraction simplifiée.",
    reponse: 2,
    reponseAffichee: "2/3",
    fragment: "MB-02",
    indices: [
      "Multipliez numérateur par numérateur et dénominateur par dénominateur.",
      "3 × 10 = 30 et 5 × 9 = 45. Donc 30/45.",
      "Simplifiez : 30/45 = 2/3. Entrez le numérateur : 2.",
    ],
    explication: "3×10 / 5×9 = 30/45 = 2/3.",
    typeReponse: 'entier',
    unite: '/3 (entrez uniquement le numérateur)',
  },
  {
    id: 9,
    acte: 2,
    titre: "Division des fréquences",
    narration:
      "ZÉRO divise ses ressources entre ses antennes. Calculez la part de chaque antenne.",
    question:
      "Calculez : (4/7) ÷ (8/21). Entrez le résultat entier simplifié.",
    reponse: 3,
    fragment: "DF-03",
    indices: [
      "Diviser par une fraction revient à multiplier par son inverse.",
      "(4/7) ÷ (8/21) = (4/7) × (21/8).",
      "4 × 21 / 7 × 8 = 84/56 = 3/2... Attendez, simplifiez avant : 4/7 × 21/8 = (4×21)/(7×8) = 84/56 = 3/2. Hmm — le résultat est 3/2. Entrez le numérateur : 3.",
    ],
    explication: "(4/7)×(21/8) = 84/56 = 3/2. Entrez le numérateur : 3.",
    typeReponse: 'entier',
    unite: '/2 (entrez le numérateur)',
  },
  {
    id: 10,
    acte: 2,
    titre: "Expression développée",
    narration:
      "ZÉRO a factorisé son code pour le cacher. Développez et réduisez l'expression pour le révéler.",
    question:
      "Développez et réduisez : 3(2x − 4) − 2(x − 5). Pour x = 0, quel est le résultat ?",
    reponse: -2,
    fragment: "ED-02",
    indices: [
      "Distribuez chaque facteur : 3×2x − 3×4 − 2×x − 2×(−5).",
      "6x − 12 − 2x + 10. Regroupez les termes semblables.",
      "4x − 2. Pour x = 0 : 4×0 − 2 = −2.",
    ],
    explication:
      "3(2x−4)−2(x−5) = 6x−12−2x+10 = 4x−2. Pour x=0 : −2.",
    typeReponse: 'entier',
  },

  // ─── ACTE 3 : NEUTRALISATION ────────────────────────────────────────────────
  {
    id: 11,
    acte: 3,
    titre: "Tour de surveillance",
    narration:
      "Une tour de surveillance triangulaire abrite un émetteur de ZÉRO. Pour calculer la portée de l'émetteur, vous avez besoin de la longueur de l'hypoténuse.",
    question:
      "Dans un triangle rectangle, les deux côtés de l'angle droit mesurent 9 cm et 12 cm. Calculez l'hypoténuse (en cm).",
    reponse: 15,
    fragment: "TS-15",
    indices: [
      "Utilisez le théorème de Pythagore : hyp² = a² + b².",
      "9² + 12² = 81 + 144 = 225.",
      "√225 = 15 cm.",
    ],
    explication: "9² + 12² = 81 + 144 = 225 = 15². Hypoténuse = 15 cm.",
    typeReponse: 'entier',
    unite: 'cm',
  },
  {
    id: 12,
    acte: 3,
    titre: "Vérification du triangle",
    narration:
      "ZÉRO a prétendu construire un triangle rectangle parfait comme alibi. Vérifiez si ce triangle est vraiment rectangle. Répondez 1 (OUI) ou 0 (NON).",
    question:
      "Un triangle a des côtés 5 cm, 12 cm et 13 cm. Est-il rectangle ? (1 = oui, 0 = non)",
    reponse: 1,
    fragment: "VT-01",
    indices: [
      "Vérifiez si le carré du plus grand côté = somme des carrés des deux autres.",
      "13² = 169. 5² + 12² = 25 + 144 = 169.",
      "169 = 169 → oui, c'est un triangle rectangle. Répondez 1.",
    ],
    explication: "13² = 169 = 5² + 12² → triangle rectangle. Réponse : 1.",
    typeReponse: 'entier',
  },
  {
    id: 13,
    acte: 3,
    titre: "Antenne translatée",
    narration:
      "ZÉRO a déplacé une antenne par translation pour tromper les satellites. Calculez la nouvelle coordonnée.",
    question:
      "Le point A(−3 ; 5) subit la translation de vecteur (4 ; −7). Quelle est l'abscisse de A' ?",
    reponse: 1,
    fragment: "AT-01",
    indices: [
      "Pour une translation de vecteur (a ; b), on ajoute a à l'abscisse et b à l'ordonnée.",
      "Nouvelle abscisse : −3 + 4.",
      "−3 + 4 = 1.",
    ],
    explication: "Abscisse de A' : −3 + 4 = 1.",
    typeReponse: 'entier',
  },
  {
    id: 14,
    acte: 3,
    titre: "Puissance du signal",
    narration:
      "Le signal de ZÉRO est amplifié à une puissance négative — une technique pour le rendre microscopique et indétectable. Calculez sa valeur.",
    question:
      "Calculez : 2⁻³. Donnez le dénominateur de la fraction obtenue.",
    reponse: 8,
    fragment: "PS-08",
    indices: [
      "a⁻ⁿ = 1/aⁿ.",
      "2⁻³ = 1/2³.",
      "2³ = 8. Donc 2⁻³ = 1/8. Le dénominateur est 8.",
    ],
    explication: "2⁻³ = 1/2³ = 1/8. Dénominateur : 8.",
    typeReponse: 'entier',
  },
  {
    id: 15,
    acte: 3,
    titre: "Écriture scientifique",
    narration:
      "ZÉRO communique via un réseau de 45 600 000 micro-capteurs. Exprimez ce nombre en notation scientifique. Quel est l'exposant de 10 ?",
    question:
      "Écrivez 45 600 000 en notation scientifique : 4,56 × 10^?. Entrez l'exposant.",
    reponse: 7,
    fragment: "ES-07",
    indices: [
      "Comptez combien de fois vous déplacez la virgule pour obtenir 4,56.",
      "45 600 000 → on déplace la virgule de 7 rangs vers la gauche.",
      "4,56 × 10⁷. L'exposant est 7.",
    ],
    explication: "45 600 000 = 4,56 × 10⁷. Exposant : 7.",
    typeReponse: 'entier',
  },

  // ─── ACTE 4 : DÉSACTIVATION ─────────────────────────────────────────────────
  {
    id: 16,
    acte: 4,
    titre: "Calcul de proportion",
    narration:
      "Pour désactiver le premier réacteur de ZÉRO, vous devez calculer un pourcentage exact. Une erreur et le réacteur se surcharge.",
    question:
      "Un article coûte 80 €. Il est soldé à −35 %. Quel est le prix final (en €) ?",
    reponse: 52,
    fragment: "CP-52",
    indices: [
      "Calculez d'abord la réduction : 35 % de 80.",
      "35/100 × 80 = 28 €.",
      "Prix final : 80 − 28 = 52 €.",
    ],
    explication: "35% de 80 = 28 €. Prix final = 80 − 28 = 52 €.",
    typeReponse: 'entier',
    unite: '€',
  },
  {
    id: 17,
    acte: 4,
    titre: "Quatrième proportionnelle",
    narration:
      "ZÉRO a construit une maquette de son QG à l'échelle 1:500. Sur la maquette, la hauteur du QG est 6 cm. Quelle est la hauteur réelle en mètres ?",
    question:
      "Échelle 1/500. Hauteur maquette = 6 cm. Hauteur réelle en mètres ?",
    reponse: 30,
    fragment: "QP-30",
    indices: [
      "Hauteur réelle (cm) = hauteur maquette × 500.",
      "6 × 500 = 3000 cm.",
      "3000 cm = 30 m.",
    ],
    explication: "6 × 500 = 3000 cm = 30 m.",
    typeReponse: 'entier',
    unite: 'm',
  },
  {
    id: 18,
    acte: 4,
    titre: "Équation finale",
    narration:
      "Le code de désactivation de ZÉRO est caché dans une équation. Résolvez-la pour obtenir la valeur secrète.",
    question:
      "Résolvez : 3x + 7 = 2x − 5. Quelle est la valeur de x ?",
    reponse: -12,
    fragment: "EQ-12",
    indices: [
      "Regroupez les termes en x d'un côté et les constantes de l'autre.",
      "3x − 2x = −5 − 7.",
      "x = −12.",
    ],
    explication: "3x − 2x = −5 − 7 → x = −12.",
    typeReponse: 'entier',
  },
  {
    id: 19,
    acte: 4,
    titre: "Théorème de Thalès",
    narration:
      "Pour tracer la trajectoire exacte vers le serveur de ZÉRO, vous devez utiliser le théorème de Thalès. Calculez la longueur manquante.",
    question:
      "Dans une configuration de triangles emboîtés : OA = 6, OA' = 9, OB = 8. AB ∥ A'B'. Calculez OB' (en cm).",
    reponse: 12,
    fragment: "TH-12",
    indices: [
      "Par Thalès : OA/OA' = OB/OB'.",
      "6/9 = 8/OB'. Faites le produit en croix.",
      "OB' = 9 × 8 / 6 = 72/6 = 12.",
    ],
    explication: "6/9 = 8/OB' → OB' = 72/6 = 12 cm.",
    typeReponse: 'entier',
    unite: 'cm',
  },
  {
    id: 20,
    acte: 4,
    titre: "Code de désactivation",
    narration:
      "Dernière étape. ZÉRO a calculé une moyenne pour évaluer sa propre résistance. Si vous trouvez la bonne valeur, vous pouvez entrer le code final de désactivation.",
    question:
      "Les notes de résistance de ZÉRO sont : 12, 15, 8, 14, 11, 16, 10, 14. Calculez la moyenne.",
    reponse: 12.5,
    fragment: "FIN-00",
    indices: [
      "Additionner toutes les valeurs, puis diviser par le nombre de valeurs.",
      "12 + 15 + 8 + 14 + 11 + 16 + 10 + 14 = ?",
      "Somme = 100. Nombre de valeurs = 8. 100 / 8 = 12.5.",
    ],
    explication: "Somme = 100. Nombre de valeurs = 8. Moyenne = 100/8 = 12,5.",
    typeReponse: 'decimal',
  },
];

export const ACTES = [
  { id: 1, nom: "Acte I — Infiltration", couleur: "#00ff9f" },
  { id: 2, nom: "Acte II — Déchiffrement", couleur: "#00c8ff" },
  { id: 3, nom: "Acte III — Neutralisation", couleur: "#ff9f00" },
  { id: 4, nom: "Acte IV — Désactivation", couleur: "#ff003c" },
];
