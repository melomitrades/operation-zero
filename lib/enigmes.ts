// ─── Types ────────────────────────────────────────────────────────────────────

export interface Enigme {
  id: number;
  acte: number;
  titre: string;
  narration: string;
  question: string;
  reponse: number;
  fragment: string;
  indices: string[];
  explication: string;
  typeReponse: 'entier' | 'decimal';
  unite?: string;
}

// Variante résolue (après application du seed)
export type EnigmeVariante = Enigme;

// ─── Utilitaires de génération ────────────────────────────────────────────────

// PGCD
function pgcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

// PPCM
function ppcm(a: number, b: number): number {
  return (a * b) / pgcd(a, b);
}

// Sélecteur déterministe : choisit l'élément d'index (seed % array.length)
function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

// ─── Générateurs de variantes (un par énigme) ─────────────────────────────────

type Generator = (seed: number) => Omit<Enigme, 'id' | 'acte' | 'titre' | 'narration'>;

const generators: Generator[] = [

  // ── Énigme 1 : Priorités opératoires ──────────────────────────────────────
  (seed) => {
    const combos = [
      { a: 3, b: 4, c: 5, p: 2 }, // 3 + 4×5 − 2² = 19
      { a: 2, b: 3, c: 6, p: 3 }, // 2 + 3×6 − 3² = 11
      { a: 5, b: 2, c: 7, p: 4 }, // 5 + 2×7 − 4² = 3
      { a: 1, b: 5, c: 4, p: 3 }, // 1 + 5×4 − 3² = 12
      { a: 4, b: 3, c: 8, p: 5 }, // 4 + 3×8 − 5² = 3
      { a: 6, b: 2, c: 9, p: 4 }, // 6 + 2×9 − 4² = 14
    ];
    const { a, b, c, p } = pick(combos, seed);
    const res = a + b * c - p * p;
    return {
      question: `Calculez : ${a} + ${b} × ${c} − ${p}²`,
      reponse: res,
      fragment: `OP-${Math.abs(res)}`,
      indices: [
        `Rappelez-vous : les puissances et les multiplications passent avant les additions.`,
        `Calculez d'abord ${p}², puis ${b} × ${c}, puis faites les additions et soustractions.`,
        `${p}² = ${p*p} et ${b} × ${c} = ${b*c}. Donc : ${a} + ${b*c} − ${p*p} = ?`,
      ],
      explication: `Priorités : ${p}² = ${p*p}, puis ${b} × ${c} = ${b*c}, puis ${a} + ${b*c} − ${p*p} = ${res}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 2 : Somme de nombres relatifs ──────────────────────────────────
  (seed) => {
    const combos = [
      { a: -7, b: 12, c: -3, d: -5 },  // 7
      { a: -9, b: 15, c: -4, d: -6 },  // 8  (−9+15−4+6=8)
      { a: -5, b: 8,  c: -2, d: -3 },  // 4
      { a: -11,b: 20, c: -6, d: -8 },  // 11
      { a: -4, b: 10, c: -7, d: -2 },  // 1  (−4+10−7+2=1)
      { a: -6, b: 13, c: -5, d: -4 },  // 6  (−6+13−5+4=6)
    ];
    const { a, b, c, d } = pick(combos, seed);
    const res = a + b + c - d; // c'est (a) + b + (c) − (d), d est négatif dans l'expression
    const actual = a + b + c + Math.abs(d); // −(d) donc +|d|
    return {
      question: `Calculez : (${a}) + ${b} + (${c}) − (${d})`,
      reponse: actual,
      fragment: `RG-0${actual}`,
      indices: [
        `Soustraire un nombre négatif revient à additionner son opposé.`,
        `−(${d}) = +${Math.abs(d)}. Regroupez les positifs et les négatifs séparément.`,
        `Positifs : ${b} + ${Math.abs(d)} = ${b + Math.abs(d)}. Négatifs : ${a} + (${c}) = ${a+c}. Résultat : ${b + Math.abs(d)} + (${a+c}) = ?`,
      ],
      explication: `(${a}) + ${b} + (${c}) − (${d}) = ${a} + ${b} + ${c} + ${Math.abs(d)} = ${actual}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 3 : Produit de relatifs ────────────────────────────────────────
  (seed) => {
    const combos = [
      { a: -4, b: -3, c: -2 }, // −24
      { a: -5, b: -2, c: -3 }, // −30
      { a: -2, b: -6, c: -1 }, // −12
      { a: -3, b: -4, c: -1 }, // −12
      { a: -2, b: -3, c: -5 }, // −30
      { a: -6, b: -2, c: -2 }, // −24
    ];
    const { a, b, c } = pick(combos, seed);
    const res = a * b * c;
    return {
      question: `Calculez : (${a}) × (${b}) × (${c})`,
      reponse: res,
      fragment: `NK-${Math.abs(res)}`,
      indices: [
        `Comptez le nombre de facteurs négatifs : si impair, le résultat est négatif.`,
        `Il y a 3 facteurs négatifs → résultat négatif.`,
        `${Math.abs(a)} × ${Math.abs(b)} × ${Math.abs(c)} = ${Math.abs(res)}. Le signe est négatif donc : ${res}.`,
      ],
      explication: `3 facteurs négatifs → signe −. ${Math.abs(a)} × ${Math.abs(b)} × ${Math.abs(c)} = ${Math.abs(res)} → résultat : ${res}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 4 : Quotient de relatifs ───────────────────────────────────────
  (seed) => {
    const combos = [
      { num: -36, den: 4 },  // −9
      { num: -45, den: 5 },  // −9
      { num: -48, den: 6 },  // −8
      { num: -56, den: 7 },  // −8
      { num: -42, den: 6 },  // −7
      { num: -72, den: 8 },  // −9
      { num: -35, den: 5 },  // −7
    ];
    const { num, den } = pick(combos, seed);
    const res = num / den;
    return {
      question: `Calculez : (${num}) ÷ ${den}`,
      reponse: res,
      fragment: `DV-0${Math.abs(res)}`,
      indices: [
        `Le quotient de deux nombres de signes différents est négatif.`,
        `${Math.abs(num)} ÷ ${den} = ${Math.abs(res)}. Les signes sont différents.`,
        `Résultat : ${res}`,
      ],
      explication: `Un négatif ÷ un positif = négatif. ${Math.abs(num)} ÷ ${den} = ${Math.abs(res)}, donc ${num} ÷ ${den} = ${res}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 5 : Calcul littéral — évaluation ───────────────────────────────
  (seed) => {
    const combos = [
      { x: -3, a: 2, b: -5, c: 1 },  // 2(9)+15+1=34
      { x: -2, a: 3, b: -4, c: 2 },  // 3(4)+8+2=22
      { x:  2, a: 2, b: -3, c: 5 },  // 2(4)−6+5=7
      { x: -1, a: 4, b: -2, c: 3 },  // 4(1)+2+3=9
      { x:  3, a: 1, b: -4, c: 2 },  // 9−12+2=−1
      { x: -4, a: 2, b: -1, c: 3 },  // 2(16)+4+3=39
    ];
    const { x, a, b, c } = pick(combos, seed);
    const res = a * x * x + b * x + c;
    const sign = (n: number) => n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`;
    const signCoef = (n: number) => n >= 0 ? `${n}` : `(${n})`;
    return {
      question: `Si x = ${x}, calculez : ${a}x² ${sign(b)}x ${sign(c)}`,
      reponse: res,
      fragment: `EX-${Math.abs(res)}`,
      indices: [
        `Remplacez x par ${x} dans chaque terme. Attention à x².`,
        `(${x})² = ${x*x}, pas ${-(x*x)}. Donc ${a} × ${x*x} = ${a*x*x}.`,
        `${a*x*x} ${sign(b*x)} ${sign(c)} = ?`,
      ],
      explication: `${a}×(${x})² ${sign(b)}×${signCoef(x)} ${sign(c)} = ${a*x*x} ${sign(b*x)} ${sign(c)} = ${res}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 6 : Addition de fractions ──────────────────────────────────────
  (seed) => {
    // Paires (p/q + r/s) avec résultat num/ppcm propre
    const combos = [
      { p:3,q:4, r:5,s:6 },  // 9/12 + 10/12 = 19/12
      { p:1,q:3, r:3,s:4 },  // 4/12 + 9/12  = 13/12
      { p:2,q:5, r:3,s:4 },  // 8/20 + 15/20 = 23/20
      { p:1,q:4, r:2,s:3 },  // 3/12 + 8/12  = 11/12
      { p:3,q:5, r:1,s:3 },  // 9/15 + 5/15  = 14/15
      { p:2,q:3, r:3,s:5 },  // 10/15+ 9/15  = 19/15
    ];
    const { p, q, r, s } = pick(combos, seed);
    const denom = ppcm(q, s);
    const num = (p * denom / q) + (r * denom / s);
    const g = pgcd(num, denom);
    const numS = num / g, denS = denom / g;
    // On demande le numérateur simplifié
    return {
      question: `Calculez : ${p}/${q} + ${r}/${s}. Entrez le numérateur de la fraction simplifiée.`,
      reponse: numS,
      fragment: `FF-${numS}`,
      indices: [
        `Cherchez le PPCM de ${q} et ${s}.`,
        `PPCM(${q},${s}) = ${denom}. Convertissez : ${p}/${q} = ${p*denom/q}/${denom} et ${r}/${s} = ${r*denom/s}/${denom}.`,
        `${p*denom/q}/${denom} + ${r*denom/s}/${denom} = ${num}/${denom}${g>1 ? ` = ${numS}/${denS}` : ''}. Entrez le numérateur : ${numS}.`,
      ],
      explication: `${p}/${q} = ${p*denom/q}/${denom} ; ${r}/${s} = ${r*denom/s}/${denom} → ${num}/${denom}${g>1?` = ${numS}/${denS}`:''}.`,
      typeReponse: 'entier',
      unite: `/${denS} (entrez uniquement le numérateur)`,
    };
  },

  // ── Énigme 7 : Comparaison de fractions ───────────────────────────────────
  (seed) => {
    // (frac1, frac2, réponse=1 si frac1>frac2 sinon 2)
    const combos = [
      { p:7,q:9, r:5,s:6, rep:2 },  // 14/18 < 15/18
      { p:3,q:4, r:5,s:7, rep:1 },  // 21/28 > 20/28
      { p:5,q:8, r:7,s:12,rep:2 },  // 15/24 < 14/24 — Non! 15>14 rep=1
      { p:2,q:3, r:3,s:5, rep:1 },  // 10/15 > 9/15
      { p:4,q:7, r:3,s:5, rep:2 },  // 20/35 < 21/35
      { p:5,q:9, r:4,s:7, rep:1 },  // 35/63 > 36/63 — non! 35<36 rep=2
    ];
    // Recalculate rep correctly
    const raw = [
      { p:7,q:9, r:5,s:6 },
      { p:3,q:4, r:5,s:7 },
      { p:5,q:8, r:7,s:12 },
      { p:2,q:3, r:3,s:5 },
      { p:4,q:7, r:3,s:5 },
      { p:5,q:9, r:4,s:7 },
    ];
    const { p, q, r, s } = pick(raw, seed);
    const d = ppcm(q, s);
    const v1 = p * d / q, v2 = r * d / s;
    const rep = v1 > v2 ? 1 : 2;
    const bigger = rep === 1 ? `${p}/${q}` : `${r}/${s}`;
    return {
      question: `Laquelle est la plus grande : ${p}/${q} ou ${r}/${s} ? (répondez 1 pour ${p}/${q}, 2 pour ${r}/${s})`,
      reponse: rep,
      fragment: `CS-0${rep}`,
      indices: [
        `Réduisez au même dénominateur pour comparer.`,
        `PPCM(${q},${s}) = ${d}. Convertissez : ${p}/${q} = ${v1}/${d} et ${r}/${s} = ${v2}/${d}.`,
        `${v1}/${d} ${v1>v2?'>':'<'} ${v2}/${d} donc ${bigger} est la plus grande. Répondez ${rep}.`,
      ],
      explication: `${p}/${q} = ${v1}/${d} ; ${r}/${s} = ${v2}/${d} → ${bigger} est plus grande → réponse : ${rep}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 8 : Multiplication de fractions ────────────────────────────────
  (seed) => {
    const combos = [
      { p:3,q:5, r:10,s:9 },  // 30/45 = 2/3
      { p:4,q:6, r:9,s:8  },  // 36/48 = 3/4
      { p:2,q:7, r:14,s:6 },  // 28/42 = 2/3
      { p:5,q:8, r:4,s:15 },  // 20/120= 1/6
      { p:3,q:4, r:8,s:9  },  // 24/36 = 2/3
      { p:6,q:10,r:5,s:9  },  // 30/90 = 1/3
    ];
    const { p, q, r, s } = pick(combos, seed);
    const num = p * r, den = q * s;
    const g = pgcd(num, den);
    const numS = num/g, denS = den/g;
    return {
      question: `Calculez : (${p}/${q}) × (${r}/${s}). Entrez le numérateur de la fraction simplifiée.`,
      reponse: numS,
      fragment: `MB-0${numS}`,
      indices: [
        `Multipliez numérateur par numérateur et dénominateur par dénominateur.`,
        `${p} × ${r} = ${num} et ${q} × ${s} = ${den}. Donc ${num}/${den}.`,
        `Simplifiez : ${num}/${den} = ${numS}/${denS}. Entrez le numérateur : ${numS}.`,
      ],
      explication: `${p}×${r} / ${q}×${s} = ${num}/${den} = ${numS}/${denS}.`,
      typeReponse: 'entier',
      unite: `/${denS} (entrez uniquement le numérateur)`,
    };
  },

  // ── Énigme 9 : Division de fractions ──────────────────────────────────────
  (seed) => {
    const combos = [
      { p:4,q:7, r:8,s:21  }, // ×21/8 = 84/56 = 3/2
      { p:3,q:5, r:9,s:10  }, // ×10/9 = 30/45 = 2/3
      { p:5,q:6, r:10,s:9  }, // ×9/10 = 45/60 = 3/4
      { p:2,q:3, r:4,s:9   }, // ×9/4  = 18/12 = 3/2
      { p:6,q:7, r:3,s:14  }, // ×14/3 = 84/21 = 4/1
      { p:3,q:8, r:9,s:16  }, // ×16/9 = 48/72 = 2/3
    ];
    const { p, q, r, s } = pick(combos, seed);
    // (p/q) ÷ (r/s) = (p/q) × (s/r) = ps/qr
    const num = p * s, den = q * r;
    const g = pgcd(num, den);
    const numS = num/g, denS = den/g;
    return {
      question: `Calculez : (${p}/${q}) ÷ (${r}/${s}). Entrez le numérateur de la fraction simplifiée.`,
      reponse: numS,
      fragment: `DF-0${numS}`,
      indices: [
        `Diviser par une fraction revient à multiplier par son inverse.`,
        `(${p}/${q}) ÷ (${r}/${s}) = (${p}/${q}) × (${s}/${r}).`,
        `${p}×${s} / ${q}×${r} = ${num}/${den} = ${numS}/${denS}. Entrez le numérateur : ${numS}.`,
      ],
      explication: `(${p}/${q})×(${s}/${r}) = ${num}/${den} = ${numS}/${denS}. Numérateur : ${numS}.`,
      typeReponse: 'entier',
      unite: `/${denS} (entrez le numérateur)`,
    };
  },

  // ── Énigme 10 : Développer/réduire puis évaluer ───────────────────────────
  (seed) => {
    // a(bx + c) + d(ex + f), évalué en x=0 → résultat = a*c + d*f
    const combos = [
      { a:3,b:2,c:-4, d:-2,e:1,f:-5 },  // 3(2x−4)−2(x−5) → 4x−2, x=0→−2
      { a:4,b:1,c:-3, d:-3,e:2,f: 1 },  // 4(x−3)−3(2x+1) → −2x−15, x=0→−15
      { a:2,b:3,c: 1, d:-1,e:4,f:-2 },  // 2(3x+1)−(4x−2) → 2x+4, x=0→4
      { a:5,b:1,c:-2, d:-2,e:3,f: 4 },  // 5(x−2)−2(3x+4) → −x−18, x=0→−18
      { a:3,b:2,c: 3, d:-4,e:1,f:-1 },  // 3(2x+3)−4(x−1) → 2x+13, x=0→13
      { a:2,b:4,c:-1, d:-3,e:2,f: 3 },  // 2(4x−1)−3(2x+3) → 2x−11, x=0→−11
    ];
    const { a, b, c, d, e, f } = pick(combos, seed);
    const res = a * c + d * f; // valeur en x=0
    const coefX = a*b + d*e;
    const constante = a*c + d*f;
    const fmt = (n: number) => n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`;
    const fmtCoef = (n: number, v: number) => n >= 0 ? `${n}x ${fmt(v)}` : `${n}x ${fmt(v)}`;
    const signC = (n: number) => n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`;
    return {
      question: `Développez et réduisez : ${a}(${b}x ${signC(c)}) ${d > 0 ? '+' : '−'} ${Math.abs(d)}(${e}x ${signC(f)}). Pour x = 0, quel est le résultat ?`,
      reponse: res,
      fragment: `ED-${Math.abs(res)}`,
      indices: [
        `Distribuez chaque facteur : ${a}×${b}x ${signC(a*c)} ${d>0?'+':'−'} ${Math.abs(d)}×${e}x ${signC(d*f)}.`,
        `${a*b}x ${signC(a*c)} ${d*e >= 0 ? '+' : '−'} ${Math.abs(d*e)}x ${signC(d*f)}. Regroupez les termes semblables.`,
        `${fmtCoef(coefX, constante)}. Pour x = 0 : ${constante}.`,
      ],
      explication: `= ${a*b}x ${signC(a*c)} + ${d*e}x ${signC(d*f)} = ${coefX}x ${signC(constante)}. Pour x=0 : ${res}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 11 : Pythagore — calculer l'hypoténuse ─────────────────────────
  (seed) => {
    // Triplets pythagoriciens classiques
    const triplets = [
      [3, 4, 5], [6, 8, 10], [5, 12, 13],
      [8, 15, 17], [9, 12, 15], [9, 40, 41],
    ];
    const [a, b, c] = pick(triplets, seed);
    return {
      question: `Dans un triangle rectangle, les deux côtés de l'angle droit mesurent ${a} cm et ${b} cm. Calculez l'hypoténuse (en cm).`,
      reponse: c,
      fragment: `TS-${c}`,
      indices: [
        `Utilisez le théorème de Pythagore : hyp² = a² + b².`,
        `${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a+b*b}.`,
        `√${a*a+b*b} = ${c} cm.`,
      ],
      explication: `${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a+b*b} = ${c}². Hypoténuse = ${c} cm.`,
      typeReponse: 'entier',
      unite: 'cm',
    };
  },

  // ── Énigme 12 : Pythagore réciproque ──────────────────────────────────────
  (seed) => {
    const vrais = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10]];
    const faux  = [[4,5,7],[3,5,6],[6,9,12],[5,8,10],[4,6,9]];
    const useVrai = Math.abs(seed) % 2 === 0;
    const [a, b, c] = useVrai ? pick(vrais, seed) : pick(faux, seed);
    const rep = useVrai ? 1 : 0;
    const grandC2 = c*c, somAB = a*a+b*b;
    return {
      question: `Un triangle a des côtés ${a} cm, ${b} cm et ${c} cm. Est-il rectangle ? (1 = oui, 0 = non)`,
      reponse: rep,
      fragment: `VT-0${rep}`,
      indices: [
        `Vérifiez si le carré du plus grand côté = somme des carrés des deux autres.`,
        `${c}² = ${grandC2}. ${a}² + ${b}² = ${a*a} + ${b*b} = ${somAB}.`,
        `${grandC2} ${grandC2===somAB?'=':'≠'} ${somAB} → ${grandC2===somAB?'oui':'non'}, ${grandC2===somAB?'c\'est':'ce n\'est pas'} un triangle rectangle. Répondez ${rep}.`,
      ],
      explication: `${c}² = ${grandC2} ${grandC2===somAB?'=':'≠'} ${a}² + ${b}² = ${somAB} → triangle ${grandC2===somAB?'rectangle':'non rectangle'}. Réponse : ${rep}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 13 : Translation — abscisse ────────────────────────────────────
  (seed) => {
    const combos = [
      { ax:-3, ay:5,  vx:4,  vy:-7 },
      { ax: 2, ay:-4, vx:-5, vy: 3 },
      { ax:-6, ay:1,  vx: 8, vy:-2 },
      { ax: 4, ay:-3, vx:-6, vy: 5 },
      { ax:-1, ay: 7, vx: 3, vy:-9 },
      { ax: 5, ay:-2, vx:-4, vy: 6 },
    ];
    const { ax, ay, vx, vy } = pick(combos, seed);
    const rx = ax + vx;
    return {
      question: `Le point A(${ax} ; ${ay}) subit la translation de vecteur (${vx} ; ${vy}). Quelle est l'abscisse de A' ?`,
      reponse: rx,
      fragment: `AT-${Math.abs(rx)}`,
      indices: [
        `Pour une translation de vecteur (a ; b), on ajoute a à l'abscisse et b à l'ordonnée.`,
        `Nouvelle abscisse : ${ax} + (${vx}).`,
        `${ax} + (${vx}) = ${rx}.`,
      ],
      explication: `Abscisse de A' : ${ax} + (${vx}) = ${rx}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 14 : Puissances négatives ──────────────────────────────────────
  (seed) => {
    const combos = [
      { base: 2, exp: 3 },  // 1/8
      { base: 3, exp: 2 },  // 1/9
      { base: 2, exp: 4 },  // 1/16
      { base: 5, exp: 2 },  // 1/25
      { base: 4, exp: 2 },  // 1/16
      { base: 2, exp: 5 },  // 1/32
      { base: 3, exp: 3 },  // 1/27
    ];
    const { base, exp } = pick(combos, seed);
    const den = Math.pow(base, exp);
    return {
      question: `Calculez : ${base}⁻${exp}. Donnez le dénominateur de la fraction obtenue.`,
      reponse: den,
      fragment: `PS-${den}`,
      indices: [
        `a⁻ⁿ = 1/aⁿ.`,
        `${base}⁻${exp} = 1/${base}${exp > 1 ? exp : ''}.`,
        `${base}${exp > 1 ? exp : ''}${exp > 1 ? ' = ' + den : ''} Donc ${base}⁻${exp} = 1/${den}. Le dénominateur est ${den}.`,
      ],
      explication: `${base}⁻${exp} = 1/${base}^${exp} = 1/${den}. Dénominateur : ${den}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 15 : Écriture scientifique ─────────────────────────────────────
  (seed) => {
    const combos = [
      { mantisse: '4,56', entier: 45600000,   exp: 7  },
      { mantisse: '3,72', entier: 37200000,   exp: 7  },
      { mantisse: '1,25', entier: 1250000,    exp: 6  },
      { mantisse: '6,04', entier: 60400000,   exp: 7  },
      { mantisse: '2,80', entier: 2800000000, exp: 9  },
      { mantisse: '9,12', entier: 912000000,  exp: 8  },
      { mantisse: '5,00', entier: 5000000,    exp: 6  },
    ];
    const { mantisse, entier, exp } = pick(combos, seed);
    const formatted = entier.toLocaleString('fr-FR');
    return {
      question: `Écrivez ${formatted} en notation scientifique : ${mantisse} × 10^?. Entrez l'exposant.`,
      reponse: exp,
      fragment: `ES-0${exp}`,
      indices: [
        `Comptez combien de fois vous déplacez la virgule pour obtenir ${mantisse}.`,
        `${formatted} → on déplace la virgule de ${exp} rangs vers la gauche.`,
        `${mantisse} × 10^${exp}. L'exposant est ${exp}.`,
      ],
      explication: `${formatted} = ${mantisse} × 10^${exp}. Exposant : ${exp}.`,
      typeReponse: 'entier',
    };
  },

  // ── Énigme 16 : Pourcentage / soldes ──────────────────────────────────────
  (seed) => {
    const combos = [
      { prix: 80,  taux: 35 }, // 52
      { prix: 120, taux: 25 }, // 90
      { prix: 60,  taux: 20 }, // 48
      { prix: 150, taux: 30 }, // 105
      { prix: 200, taux: 15 }, // 170
      { prix: 90,  taux: 40 }, // 54
      { prix: 50,  taux: 20 }, // 40
    ];
    const { prix, taux } = pick(combos, seed);
    const reduc = prix * taux / 100;
    const res = prix - reduc;
    return {
      question: `Un article coûte ${prix} €. Il est soldé à −${taux} %. Quel est le prix final (en €) ?`,
      reponse: res,
      fragment: `CP-${res}`,
      indices: [
        `Calculez d'abord la réduction : ${taux} % de ${prix}.`,
        `${taux}/100 × ${prix} = ${reduc} €.`,
        `Prix final : ${prix} − ${reduc} = ${res} €.`,
      ],
      explication: `${taux}% de ${prix} = ${reduc} €. Prix final = ${prix} − ${reduc} = ${res} €.`,
      typeReponse: 'entier',
      unite: '€',
    };
  },

  // ── Énigme 17 : Vitesse / Distance / Temps ───────────────────────────────
  (seed) => {
    // On donne vitesse (km/h) et temps (h), on cherche la distance (km)
    const combos = [
      { v: 80,  t: 2,   d: 160 },
      { v: 90,  t: 3,   d: 270 },
      { v: 60,  t: 4,   d: 240 },
      { v: 110, t: 2,   d: 220 },
      { v: 75,  t: 4,   d: 300 },
      { v: 120, t: 3,   d: 360 },
      { v: 50,  t: 6,   d: 300 },
    ];
    const { v, t, d } = pick(combos, seed);
    return {
      question: `Un drone de ZÉRO se déplace à ${v} km/h pendant ${t} heures. Quelle distance a-t-il parcourue (en km) ?`,
      reponse: d,
      fragment: `VT-${d}`,
      indices: [
        `La formule est : distance = vitesse × temps.`,
        `Distance = ${v} × ${t}.`,
        `${v} × ${t} = ${d} km.`,
      ],
      explication: `d = v × t = ${v} × ${t} = ${d} km.`,
      typeReponse: 'entier',
      unite: 'km',
    };
  },

  // ── Énigme 18 : Équation du 1er degré ─────────────────────────────────────
  (seed) => {
    // ax + b = cx + d  → x = (d−b)/(a−c)
    const combos = [
      { a:3, b: 7, c:2, d: -5  }, // x = −12
      { a:5, b: 2, c:3, d: -8  }, // x = −5
      { a:4, b:-3, c:1, d:  9  }, // x = 4
      { a:6, b: 1, c:2, d: -7  }, // x = −2
      { a:7, b:-4, c:3, d:  8  }, // x = 3
      { a:5, b: 3, c:2, d: -9  }, // x = −4
    ];
    const { a, b, c, d } = pick(combos, seed);
    const res = (d - b) / (a - c);
    const fmtB = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const fmtD = d >= 0 ? `+ ${d}` : `− ${Math.abs(d)}`;
    return {
      question: `Résolvez : ${a}x ${fmtB} = ${c}x ${fmtD}. Quelle est la valeur de x ?`,
      reponse: res,
      fragment: `EQ-${Math.abs(res)}`,
      indices: [
        `Regroupez les termes en x d'un côté et les constantes de l'autre.`,
        `${a}x − ${c}x = ${d} − (${b}) → ${a-c}x = ${d-b}.`,
        `x = ${d-b} ÷ ${a-c} = ${res}.`,
      ],
      explication: `${a-c}x = ${d-b} → x = ${res}.`,
      typeReponse: res === Math.floor(res) ? 'entier' : 'decimal',
    };
  },

  // ── Énigme 19 : Thalès — calcul de longueur ───────────────────────────────
  (seed) => {
    const combos = [
      { OA:6, OAp:9,  OB:8  }, // OB'=12
      { OA:4, OAp:6,  OB:10 }, // OB'=15
      { OA:3, OAp:5,  OB:9  }, // OB'=15
      { OA:5, OAp:8,  OB:10 }, // OB'=16
      { OA:6, OAp:10, OB:9  }, // OB'=15
      { OA:4, OAp:7,  OB:8  }, // OB'=14
    ];
    const { OA, OAp, OB } = pick(combos, seed);
    const OBp = OAp * OB / OA;
    return {
      question: `Dans une configuration de triangles emboîtés : OA = ${OA}, OA' = ${OAp}, OB = ${OB}. AB ∥ A'B'. Calculez OB' (en cm).`,
      reponse: OBp,
      fragment: `TH-${OBp}`,
      indices: [
        `Par Thalès : OA/OA' = OB/OB'.`,
        `${OA}/${OAp} = ${OB}/OB'. Faites le produit en croix.`,
        `OB' = ${OAp} × ${OB} / ${OA} = ${OAp*OB}/${OA} = ${OBp}.`,
      ],
      explication: `${OA}/${OAp} = ${OB}/OB' → OB' = ${OAp*OB}/${OA} = ${OBp} cm.`,
      typeReponse: OBp === Math.floor(OBp) ? 'entier' : 'decimal',
      unite: 'cm',
    };
  },

  // ── Énigme 20 : Moyenne ───────────────────────────────────────────────────
  (seed) => {
    const combos = [
      [12,15,8,14,11,16,10,14], // somme=100, moy=12.5
      [10,13,7,15,12,14,9,12],  // somme=92,  moy=11.5
      [14,16,9,11,13,15,8,10],  // somme=96,  moy=12
      [11,14,8,16,10,15,9,13],  // somme=96,  moy=12
      [13,16,9,14,11,15,10,12], // somme=100, moy=12.5
      [10,12,8,14,11,13,9,15],  // somme=92,  moy=11.5
    ];
    const notes = pick(combos, seed);
    const somme = notes.reduce((a, b) => a + b, 0);
    const moy = somme / notes.length;
    return {
      question: `Les notes de résistance de ZÉRO sont : ${notes.join(', ')}. Calculez la moyenne.`,
      reponse: moy,
      fragment: `FIN-${moy}`,
      indices: [
        `Additionner toutes les valeurs, puis diviser par le nombre de valeurs.`,
        `${notes.join(' + ')} = ?`,
        `Somme = ${somme}. Nombre de valeurs = ${notes.length}. ${somme} / ${notes.length} = ${moy}.`,
      ],
      explication: `Somme = ${somme}. Nombre de valeurs = ${notes.length}. Moyenne = ${somme}/${notes.length} = ${moy}.`,
      typeReponse: moy === Math.floor(moy) ? 'entier' : 'decimal',
    };
  },
];

// ─── Données fixes (titre, narration, acte) ───────────────────────────────────

const META = [
  { id:1,  acte:1, titre:"Accès au terminal",        narration:"La Brigade Mathématique vient d'intercepter un signal de ZÉRO. Pour accéder au terminal principal, il faut déchiffrer le premier verrou numérique. ZÉRO a laissé un calcul piégé : il compte sur vos erreurs de priorités." },
  { id:2,  acte:1, titre:"La grille de coordonnées", narration:"ZÉRO a chiffré les coordonnées de son serveur central sur un axe numérique. Les coordonnées sont données par une somme de nombres relatifs. Trouvez la position exacte." },
  { id:3,  acte:1, titre:"Décryptage du noyau",      narration:"Le noyau de ZÉRO est protégé par un produit de nombres relatifs. Une erreur de signe et c'est l'alarme. Calculez le code exact." },
  { id:4,  acte:1, titre:"Division sécurisée",       narration:"Un quotient de nombres relatifs protège la porte du datacenter. ZÉRO pense que vous allez vous tromper de signe. Prouvez-lui le contraire." },
  { id:5,  acte:1, titre:"Expression piégée",        narration:"ZÉRO a encodé un message dans une expression littérale. Pour déchiffrer sa signification, évaluez l'expression pour la valeur donnée." },
  { id:6,  acte:2, titre:"Fréquence fractionnaire",  narration:"ZÉRO transmet sur une fréquence fractionnaire. Pour la brouiller, vous devez calculer la somme exacte de deux fréquences." },
  { id:7,  acte:2, titre:"Comparaison de signaux",   narration:"Deux signaux suspects sont captés. Le plus fort est celui dont la valeur est la plus grande. Identifiez-le en comparant ces fractions." },
  { id:8,  acte:2, titre:"Multiplication de brouilleurs", narration:"Pour multiplier la puissance de brouillage, ZÉRO multiplie ses signaux fractionnaires. Calculez le résultat." },
  { id:9,  acte:2, titre:"Division des fréquences",  narration:"ZÉRO divise ses ressources entre ses antennes. Calculez la part de chaque antenne." },
  { id:10, acte:2, titre:"Expression développée",    narration:"ZÉRO a factorisé son code pour le cacher. Développez et réduisez l'expression pour le révéler." },
  { id:11, acte:3, titre:"Tour de surveillance",     narration:"Une tour de surveillance triangulaire abrite un émetteur de ZÉRO. Pour calculer la portée de l'émetteur, vous avez besoin de la longueur de l'hypoténuse." },
  { id:12, acte:3, titre:"Vérification du triangle", narration:"ZÉRO a prétendu construire un triangle rectangle parfait comme alibi. Vérifiez si ce triangle est vraiment rectangle. Répondez 1 (OUI) ou 0 (NON)." },
  { id:13, acte:3, titre:"Antenne translatée",       narration:"ZÉRO a déplacé une antenne par translation pour tromper les satellites. Calculez la nouvelle coordonnée." },
  { id:14, acte:3, titre:"Puissance du signal",      narration:"Le signal de ZÉRO est amplifié à une puissance négative — une technique pour le rendre microscopique et indétectable. Calculez sa valeur." },
  { id:15, acte:3, titre:"Écriture scientifique",    narration:"ZÉRO communique via un réseau de micro-capteurs. Exprimez ce nombre en notation scientifique. Quel est l'exposant de 10 ?" },
  { id:16, acte:4, titre:"Calcul de proportion",     narration:"Pour désactiver le premier réacteur de ZÉRO, vous devez calculer un pourcentage exact. Une erreur et le réacteur se surcharge." },
  { id:17, acte:4, titre:"Interception du drone",    narration:"Un drone espion de ZÉRO a été repéré. Pour calculer sa position exacte, la Brigade doit déterminer la distance qu'il a parcourue depuis sa base." },
  { id:18, acte:4, titre:"Équation finale",          narration:"Le code de désactivation de ZÉRO est caché dans une équation. Résolvez-la pour obtenir la valeur secrète." },
  { id:19, acte:4, titre:"Théorème de Thalès",       narration:"Pour tracer la trajectoire exacte vers le serveur de ZÉRO, vous devez utiliser le théorème de Thalès. Calculez la longueur manquante." },
  { id:20, acte:4, titre:"Code de désactivation",    narration:"Dernière étape. ZÉRO a calculé une moyenne pour évaluer sa propre résistance. Si vous trouvez la bonne valeur, vous pouvez entrer le code final de désactivation." },
];

// ─── Fonction principale : génère les 20 énigmes à partir d'un tableau de seeds ─

export function genererEnigmes(seeds: number[]): EnigmeVariante[] {
  return META.map((meta, i) => {
    const variante = generators[i](seeds[i]);
    return { ...meta, ...variante };
  });
}

// Seeds par défaut (si pas de seeds stockés — ne devrait pas arriver en prod)
export const DEFAULT_SEEDS = Array.from({ length: 20 }, (_, i) => i * 7 + 3);

export const ACTES = [
  { id: 1, nom: "Acte I — Infiltration",   couleur: "#00ff9f" },
  { id: 2, nom: "Acte II — Déchiffrement", couleur: "#00c8ff" },
  { id: 3, nom: "Acte III — Neutralisation",couleur: "#ff9f00" },
  { id: 4, nom: "Acte IV — Désactivation", couleur: "#ff003c" },
];
