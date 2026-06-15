// ─── Types ────────────────────────────────────────────────────────────────────

export type Niveau = 1 | 2 | 3;

export interface NiveauInfo {
  id: Niveau;
  nom: string;
  label: string;
  couleur: string;
  multiplicateur: number;
  description: string;
}

export const NIVEAUX: NiveauInfo[] = [
  { id: 1, nom: 'Débutant',  label: 'DÉBUTANT',  couleur: '#00ff9f', multiplicateur: 1,   description: 'Calculs accessibles, valeurs simples' },
  { id: 2, nom: 'Confirmé',  label: 'CONFIRMÉ',  couleur: '#ff9f00', multiplicateur: 1.5, description: 'Valeurs plus lourdes, calculs plus exigeants' },
  { id: 3, nom: 'Expert',    label: 'EXPERT',    couleur: '#ff003c', multiplicateur: 2,   description: 'Notions avancées, énigmes inédites' },
];

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

export type EnigmeVariante = Enigme;

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function pgcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function ppcm(a: number, b: number): number {
  return (a * b) / pgcd(a, b);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

// ─── Générateurs (seed, niveau) ───────────────────────────────────────────────

type Generator = (seed: number, niveau: Niveau) => Omit<Enigme, 'id' | 'acte' | 'titre' | 'narration'>;

const generators: Generator[] = [

  // ── E1 : Priorités opératoires ────────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {a:3,b:4,c:5,p:2}, {a:2,b:3,c:6,p:3}, {a:1,b:5,c:4,p:3}, {a:4,b:2,c:6,p:2} ],
      2: [ {a:5,b:4,c:7,p:4}, {a:6,b:3,c:8,p:5}, {a:7,b:2,c:9,p:4}, {a:3,b:5,c:8,p:6} ],
      3: [ {a:8,b:5,c:9,p:6}, {a:7,b:6,c:8,p:7}, {a:9,b:4,c:11,p:8},{a:6,b:7,c:9,p:8} ],
    };
    const {a,b,c,p} = pick(pool[niveau], seed);
    const res = a + b*c - p*p;
    return {
      question: `Calculez : ${a} + ${b} × ${c} − ${p}²`,
      reponse: res,
      fragment: `OP-${Math.abs(res)}`,
      indices: [
        `Rappelez-vous : les puissances et les multiplications passent avant les additions.`,
        `Calculez d'abord ${p}², puis ${b} × ${c}, puis faites les additions et soustractions.`,
        `${p}² = ${p*p} et ${b} × ${c} = ${b*c}. Donc : ${a} + ${b*c} − ${p*p} = ?`,
      ],
      explication: `Priorités : ${p}² = ${p*p}, puis ${b}×${c} = ${b*c}, puis ${a}+${b*c}−${p*p} = ${res}.`,
      typeReponse: 'entier',
    };
  },

  // ── E2 : Relatifs — somme (N1/N2) ou priorités+relatifs (N3) ─────────────
  (seed, niveau) => {
    if (niveau === 3) {
      // N3 : priorités AVEC relatifs : a×b + c×d (produits + somme)
      const pool = [
        {a:-3,b:4,c:-2,d:5},  // −12+−10=−22 ... non: -12 + (-10)=-22
        {a:-5,b:3,c:4,d:-2},  // −15 + (−8) = −23
        {a:2,b:-6,c:-3,d:4},  // −12 + (−12) = −24
        {a:-4,b:3,c:5,d:-2},  // −12 + (−10) = −22
        {a:3,b:-5,c:-2,d:6},  // −15 + (−12) = −27
        {a:-2,b:7,c:3,d:-4},  // −14 + (−12) = −26
      ];
      const {a,b,c,d} = pick(pool, seed);
      const res = a*b + c*d;
      const s = (n:number) => n>=0?`+ ${n}`:`− ${Math.abs(n)}`;
      return {
        question: `Calculez avec les priorités opératoires : (${a}) × ${Math.abs(b)} ${s(c)} × ${Math.abs(d)}`,
        reponse: res,
        fragment: `RG-${Math.abs(res)}`,
        indices: [
          `Appliquez les priorités : les multiplications s'effectuent avant les additions.`,
          `(${a}) × ${Math.abs(b)} = ${a*b} et (${c}) × ${Math.abs(d)} = ${c*d}.`,
          `Vous avez deux produits. Additionnez-les maintenant.`,
        ],
        explication: `(${a})×${Math.abs(b)} = ${a*b} ; (${c})×${Math.abs(d)} = ${c*d} → ${a*b} + (${c*d}) = ${res}.`,
        typeReponse: 'entier',
      };
    }
    const pool = {
      1: [ {a:-7,b:12,c:-3,d:-5}, {a:-5,b:8,c:-2,d:-3}, {a:-4,b:10,c:-7,d:-2} ],
      2: [ {a:-12,b:25,c:-8,d:-9}, {a:-15,b:30,c:-7,d:-11}, {a:-9,b:18,c:-5,d:-7} ],
    };
    const {a,b,c,d} = pick(pool[niveau as 1|2], seed);
    const actual = a + b + c + Math.abs(d);
    return {
      question: `Calculez : (${a}) + ${b} + (${c}) − (${d})`,
      reponse: actual,
      fragment: `RG-0${Math.abs(actual)}`,
      indices: [
        `Soustraire un nombre négatif revient à additionner son opposé.`,
        `−(${d}) = +${Math.abs(d)}. Regroupez les positifs et les négatifs séparément.`,
        `Positifs : ${b}+${Math.abs(d)} = ${b+Math.abs(d)}. Négatifs : ${a}+(${c}) = ${a+c}. Résultat : ${b+Math.abs(d)}+(${a+c}) = ?`,
      ],
      explication: `= ${a}+${b}+${c}+${Math.abs(d)} = ${actual}.`,
      typeReponse: 'entier',
    };
  },

  // ── E3 : Produit de relatifs ───────────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {a:-4,b:-3,c:-2}, {a:-2,b:-6,c:-1}, {a:-3,b:-4,c:-1} ],
      2: [ {a:-5,b:-4,c:-3}, {a:-6,b:-3,c:-4}, {a:-7,b:-2,c:-4} ],
      3: [ {a:-8,b:-5,c:-3}, {a:-9,b:-4,c:-3}, {a:-6,b:-5,c:-4} ],
    };
    const {a,b,c} = pick(pool[niveau], seed);
    const res = a*b*c;
    return {
      question: `Calculez : (${a}) × (${b}) × (${c})`,
      reponse: res,
      fragment: `NK-${Math.abs(res)}`,
      indices: [
        `Comptez le nombre de facteurs négatifs : si impair, le résultat est négatif.`,
        `Il y a 3 facteurs négatifs → résultat négatif.`,
        `${Math.abs(a)} × ${Math.abs(b)} × ${Math.abs(c)} = ${Math.abs(res)}. Le résultat est négatif — à vous de conclure !`,
      ],
      explication: `3 facteurs négatifs → signe −. ${Math.abs(a)}×${Math.abs(b)}×${Math.abs(c)} = ${Math.abs(res)} → résultat : ${res}.`,
      typeReponse: 'entier',
    };
  },

  // ── E4 : Quotient de relatifs ──────────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {num:-36,den:4}, {num:-45,den:5}, {num:-42,den:6} ],
      2: [ {num:-72,den:8}, {num:-96,den:12},{num:-84,den:7} ],
      3: [ {num:-120,den:8},{num:-132,den:12},{num:-150,den:15} ],
    };
    const {num,den} = pick(pool[niveau], seed);
    const res = num/den;
    return {
      question: `Calculez : (${num}) ÷ ${den}`,
      reponse: res,
      fragment: `DV-${Math.abs(res)}`,
      indices: [
        `Le quotient de deux nombres de signes différents est négatif.`,
        `${Math.abs(num)} ÷ ${den} = ${Math.abs(res)}. Les signes sont différents.`,
        `Vérifiez le signe : numérateur et dénominateur sont-ils de même signe ou de signes différents ?`,
      ],
      explication: `Négatif ÷ positif = négatif. ${Math.abs(num)}÷${den} = ${Math.abs(res)}, donc résultat : ${res}.`,
      typeReponse: 'entier',
    };
  },

  // ── E5 : Calcul littéral — éval (N1/N2) ou identités remarquables (N3) ────
  (seed, niveau) => {
    if (niveau === 3) {
      // N3 : (a+b)² ou (a−b)² ou (a+b)(a−b)
      const pool = [
        {a:3,b:2,type:'plus2'},   // (3+2)²=25
        {a:5,b:3,type:'moins2'},  // (5−3)²=4
        {a:4,b:2,type:'diff'},    // (4+2)(4−2)=12
        {a:6,b:3,type:'plus2'},   // (6+3)²=81
        {a:7,b:4,type:'moins2'},  // (7−4)²=9
        {a:5,b:3,type:'diff'},    // (5+3)(5−3)=16
      ];
      const {a,b,type} = pick(pool, seed);
      let question='', res=0, expl='';
      if (type==='plus2')  { question=`Développez : (${a}+${b})²`; res=(a+b)*(a+b); expl=`(${a}+${b})² = ${a}²+2×${a}×${b}+${b}² = ${a*a}+${2*a*b}+${b*b} = ${res}.`; }
      if (type==='moins2') { question=`Développez : (${a}−${b})²`; res=(a-b)*(a-b); expl=`(${a}−${b})² = ${a}²−2×${a}×${b}+${b}² = ${a*a}−${2*a*b}+${b*b} = ${res}.`; }
      if (type==='diff')   { question=`Développez : (${a}+${b})(${a}−${b})`; res=a*a-b*b; expl=`(${a}+${b})(${a}−${b}) = ${a}²−${b}² = ${a*a}−${b*b} = ${res}.`; }
      return {
        question: `${question}. Donnez le résultat.`,
        reponse: res,
        fragment: `EX-${res}`,
        indices: [
          `Reconnaissez l'identité remarquable : (a+b)²=a²+2ab+b², (a−b)²=a²−2ab+b², (a+b)(a−b)=a²−b².`,
          `Identifiez a et b dans l'expression.`,
          `Appliquez la formule avec les valeurs a=${a} et b=${b}, puis calculez.`,
        ],
        explication: expl,
        typeReponse: 'entier',
      };
    }
    const pool = {
      1: [ {x:-3,a:2,b:-5,c:1}, {x:-2,a:3,b:-4,c:2}, {x:-1,a:4,b:-2,c:3} ],
      2: [ {x:-4,a:3,b:-6,c:5}, {x: 3,a:4,b:-7,c:2}, {x:-5,a:2,b:-3,c:8} ],
    };
    const {x,a,b,c} = pick(pool[niveau as 1|2], seed);
    const res = a*x*x + b*x + c;
    const sign = (n:number) => n>=0 ? `+ ${n}` : `− ${Math.abs(n)}`;
    return {
      question: `Si x = ${x}, calculez : ${a}x² ${sign(b)}x ${sign(c)}`,
      reponse: res,
      fragment: `EX-${Math.abs(res)}`,
      indices: [
        `Remplacez x par ${x} dans chaque terme. Attention à x².`,
        `(${x})² = ${x*x}. Donc ${a} × ${x*x} = ${a*x*x}.`,
        `${a*x*x} ${sign(b*x)} ${sign(c)} = ?`,
      ],
      explication: `${a}×(${x})²${sign(b)}×(${x})${sign(c)} = ${a*x*x}${sign(b*x)}${sign(c)} = ${res}.`,
      typeReponse: 'entier',
    };
  },

  // ── E6 : Addition fractions (N1/N2) ou avec négatifs (N3) ─────────────────
  (seed, niveau) => {
    if (niveau === 3) {
      // N3 : soustraction avec numérateurs négatifs
      const pool = [
        {p:-3,q:4,r:5,s:6},   // −3/4 + 5/6 = −9/12+10/12 = 1/12
        {p:5,q:6,r:-3,s:4},   // 5/6 − 3/4 = 10/12−9/12 = 1/12
        {p:-2,q:3,r:5,s:4},   // −8/12+15/12 = 7/12
        {p:3,q:5,r:-2,s:3},   // 9/15−10/15 = −1/15
        {p:-1,q:2,r:3,s:4},   // −2/4+3/4 = 1/4
        {p:5,q:8,r:-3,s:4},   // 5/8−6/8 = −1/8
      ];
      const {p,q,r,s} = pick(pool, seed);
      const denom = ppcm(q,s);
      const num = (p*denom/q) + (r*denom/s);
      const g = pgcd(Math.abs(num), denom);
      const numS = num/g, denS = denom/g;
      const op = r >= 0 ? '+' : '−';
      return {
        question: `Calculez : ${p}/${q} ${op} ${Math.abs(r)}/${s}. Entrez le numérateur de la fraction simplifiée (peut être négatif).`,
        reponse: numS,
        fragment: `FF-${Math.abs(numS)}`,
        indices: [
          `Réduisez au même dénominateur. Attention aux signes des numérateurs.`,
          `PPCM(${q},${s}) = ${denom}. Convertissez : ${p}/${q} = ${p*denom/q}/${denom} et ${r}/${s} = ${r*denom/s}/${denom}.`,
          `${p*denom/q}/${denom} + (${r*denom/s})/${denom} = ${num}/${denom}. Simplifiez puis donnez le numérateur.`,
        ],
        explication: `${p*denom/q}/${denom} + (${r*denom/s})/${denom} = ${num}/${denom} = ${numS}/${denS}.`,
        typeReponse: 'entier',
        unite: `/${denS} (entrez le numérateur, peut être négatif)`,
      };
    }
    const pool = {
      1: [ {p:3,q:4,r:5,s:6}, {p:1,q:3,r:3,s:4}, {p:1,q:4,r:2,s:3} ],
      2: [ {p:5,q:6,r:7,s:8}, {p:4,q:9,r:5,s:6}, {p:7,q:10,r:5,s:6} ],
    };
    const {p,q,r,s} = pick(pool[niveau as 1|2], seed);
    const denom = ppcm(q,s);
    const num = (p*denom/q) + (r*denom/s);
    const g = pgcd(num,denom);
    const numS = num/g, denS = denom/g;
    return {
      question: `Calculez : ${p}/${q} + ${r}/${s}. Entrez le numérateur de la fraction simplifiée.`,
      reponse: numS,
      fragment: `FF-${numS}`,
      indices: [
        `Cherchez le PPCM de ${q} et ${s}.`,
        `PPCM(${q},${s}) = ${denom}. Convertissez : ${p}/${q} = ${p*denom/q}/${denom} et ${r}/${s} = ${r*denom/s}/${denom}.`,
        `${p*denom/q}/${denom} + ${r*denom/s}/${denom} = ${num}/${denom}. Simplifiez si possible, puis entrez le numérateur.`,
      ],
      explication: `${p}/${q} = ${p*denom/q}/${denom} ; ${r}/${s} = ${r*denom/s}/${denom} → ${num}/${denom}${g>1?` = ${numS}/${denS}`:''}.`,
      typeReponse: 'entier',
      unite: `/${denS} (entrez uniquement le numérateur)`,
    };
  },

  // ── E7 : Comparaison de fractions ─────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {p:7,q:9,r:5,s:6}, {p:3,q:4,r:5,s:7}, {p:2,q:3,r:3,s:5} ],
      2: [ {p:8,q:11,r:7,s:9}, {p:5,q:7,r:8,s:11}, {p:9,q:13,r:7,s:10} ],
      3: [ {p:11,q:15,r:7,s:10}, {p:9,q:14,r:11,s:16}, {p:13,q:18,r:7,s:10} ],
    };
    const {p,q,r,s} = pick(pool[niveau], seed);
    const d = ppcm(q,s);
    const v1 = p*d/q, v2 = r*d/s;
    const rep = v1>v2 ? 1 : 2;
    const bigger = rep===1 ? `${p}/${q}` : `${r}/${s}`;
    return {
      question: `Laquelle est la plus grande : ${p}/${q} ou ${r}/${s} ? (répondez 1 pour ${p}/${q}, 2 pour ${r}/${s})`,
      reponse: rep,
      fragment: `CS-0${rep}`,
      indices: [
        `Réduisez au même dénominateur pour comparer.`,
        `PPCM(${q},${s}) = ${d}. Convertissez : ${p}/${q} = ${v1}/${d} et ${r}/${s} = ${v2}/${d}.`,
        `${v1}/${d} et ${v2}/${d} — comparez ces deux fractions et répondez 1 ou 2.`,
      ],
      explication: `${p}/${q}=${v1}/${d} ; ${r}/${s}=${v2}/${d} → ${bigger} est plus grande → réponse : ${rep}.`,
      typeReponse: 'entier',
    };
  },

  // ── E8 : Multiplication de fractions ──────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {p:3,q:5,r:10,s:9}, {p:4,q:6,r:9,s:8}, {p:3,q:4,r:8,s:9} ],
      2: [ {p:7,q:8,r:4,s:21}, {p:5,q:9,r:12,s:25},{p:8,q:15,r:5,s:16} ],
      3: [ {p:9,q:14,r:7,s:18},{p:11,q:15,r:5,s:22},{p:13,q:20,r:8,s:26} ],
    };
    const {p,q,r,s} = pick(pool[niveau], seed);
    const num=p*r, den=q*s;
    const g=pgcd(num,den);
    const numS=num/g, denS=den/g;
    return {
      question: `Calculez : (${p}/${q}) × (${r}/${s}). Entrez le numérateur de la fraction simplifiée.`,
      reponse: numS,
      fragment: `MB-0${numS}`,
      indices: [
        `Multipliez numérateur par numérateur et dénominateur par dénominateur.`,
        `${p}×${r} = ${num} et ${q}×${s} = ${den}. Donc ${num}/${den}.`,
        `Simplifiez ${num}/${den} en cherchant le PGCD de ${num} et ${den}, puis entrez le numérateur.`,
      ],
      explication: `${p}×${r}/${q}×${s} = ${num}/${den} = ${numS}/${denS}.`,
      typeReponse: 'entier',
      unite: `/${denS} (entrez uniquement le numérateur)`,
    };
  },

  // ── E9 : Division de fractions ─────────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {p:4,q:7,r:8,s:21}, {p:3,q:5,r:9,s:10}, {p:5,q:6,r:10,s:9} ],
      2: [ {p:7,q:8,r:14,s:24},{p:9,q:10,r:27,s:20},{p:5,q:12,r:15,s:16} ],
      3: [ {p:11,q:12,r:22,s:36},{p:13,q:15,r:26,s:45},{p:9,q:16,r:27,s:32} ],
    };
    const {p,q,r,s} = pick(pool[niveau], seed);
    const num=p*s, den=q*r;
    const g=pgcd(num,den);
    const numS=num/g, denS=den/g;
    return {
      question: `Calculez : (${p}/${q}) ÷ (${r}/${s}). Entrez le numérateur de la fraction simplifiée.`,
      reponse: numS,
      fragment: `DF-0${numS}`,
      indices: [
        `Diviser par une fraction revient à multiplier par son inverse.`,
        `(${p}/${q}) ÷ (${r}/${s}) = (${p}/${q}) × (${s}/${r}).`,
        `${p}×${s} = ${num} et ${q}×${r} = ${den}. Simplifiez ${num}/${den} puis entrez le numérateur.`,
      ],
      explication: `(${p}/${q})×(${s}/${r}) = ${num}/${den} = ${numS}/${denS}. Numérateur : ${numS}.`,
      typeReponse: 'entier',
      unite: `/${denS} (entrez le numérateur)`,
    };
  },

  // ── E10 : Développer/réduire (N1/N2) ou équation associée (N3) ────────────
  (seed, niveau) => {
    const sign = (n:number) => n>=0?`+ ${n}`:`− ${Math.abs(n)}`;
    if (niveau === 3) {
      // N3 : développer, puis résoudre l'équation = 0
      const pool = [
        {a:3,b:2,c:-4,d:-2,e:1,f:-5},
        {a:2,b:3,c: 1,d:-1,e:4,f:-2},
        {a:4,b:1,c:-3,d:-3,e:2,f: 1},
        {a:5,b:1,c:-2,d:-2,e:3,f: 4},
      ];
      const {a,b,c,d,e,f} = pick(pool, seed);
      const coefX = a*b + d*e;
      const cst   = a*c + d*f;
      // coefX * x + cst = 0 → x = -cst/coefX
      const res = -cst / coefX;
      return {
        question: `Développez et réduisez ${a}(${b}x ${sign(c)}) ${d>0?'+':'−'} ${Math.abs(d)}(${e}x ${sign(f)}), puis résolvez l'équation = 0. Donnez x.`,
        reponse: res,
        fragment: `ED-${Math.abs(Math.round(res*10))}`,
        indices: [
          `Développez d'abord : ${a}×${b}x ${sign(a*c)} ${d>0?'+':'−'} ${Math.abs(d)}×${e}x ${sign(d*f)}.`,
          `Après réduction : ${coefX}x ${sign(cst)}. Posez maintenant ${coefX}x ${sign(cst)} = 0.`,
          `${coefX}x = ${-cst}. Isolez x en divisant par ${coefX}.`,
        ],
        explication: `= ${coefX}x ${sign(cst)} = 0 → ${coefX}x = ${-cst} → x = ${res}.`,
        typeReponse: res===Math.floor(res)?'entier':'decimal',
      };
    }
    const pool = {
      1: [ {a:3,b:2,c:-4,d:-2,e:1,f:-5}, {a:2,b:3,c:1,d:-1,e:4,f:-2} ],
      2: [ {a:5,b:3,c:-6,d:-4,e:2,f:-3}, {a:6,b:2,c:-5,d:-3,e:3,f: 4} ],
    };
    const {a,b,c,d,e,f} = pick(pool[niveau as 1|2], seed);
    const coefX = a*b + d*e;
    const cst   = a*c + d*f;
    return {
      question: `Développez et réduisez : ${a}(${b}x ${sign(c)}) ${d>0?'+':'−'} ${Math.abs(d)}(${e}x ${sign(f)}). Pour x = 0, quel est le résultat ?`,
      reponse: cst,
      fragment: `ED-${Math.abs(cst)}`,
      indices: [
        `Distribuez : ${a}×${b}x ${sign(a*c)} ${d>0?'+':'−'} ${Math.abs(d)}×${e}x ${sign(d*f)}.`,
        `${a*b}x ${sign(a*c)} + ${d*e}x ${sign(d*f)}. Regroupez les termes semblables.`,
        `Après réduction : ${coefX}x ${sign(cst)}. Substituez maintenant x = 0.`,
      ],
      explication: `= ${a*b}x ${sign(a*c)} + ${d*e}x ${sign(d*f)} = ${coefX}x ${sign(cst)}. Pour x=0 : ${cst}.`,
      typeReponse: 'entier',
    };
  },

  // ── E11 : Pythagore — hypoténuse ──────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ [3,4,5],[6,8,10],[5,12,13] ],
      2: [ [8,15,17],[9,12,15],[7,24,25] ],
      3: [ [9,40,41],[12,16,20],[20,21,29] ],
    };
    const [a,b,c] = pick(pool[niveau], seed);
    return {
      question: `Dans un triangle rectangle, les deux côtés de l'angle droit mesurent ${a} cm et ${b} cm. Calculez l'hypoténuse (en cm).`,
      reponse: c,
      fragment: `TS-${c}`,
      indices: [
        `Utilisez le théorème de Pythagore : hyp² = a² + b².`,
        `${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a+b*b}.`,
        `Cherchez quel entier, élevé au carré, donne ${a*a+b*b}.`,
      ],
      explication: `${a}²+${b}² = ${a*a}+${b*b} = ${a*a+b*b} = ${c}². Hypoténuse = ${c} cm.`,
      typeReponse: 'entier',
      unite: 'cm',
    };
  },

  // ── E12 : Pythagore réciproque ─────────────────────────────────────────────
  (seed, niveau) => {
    const vrais = {
      1: [[3,4,5],[5,12,13],[6,8,10]],
      2: [[8,15,17],[7,24,25],[9,12,15]],
      3: [[9,40,41],[12,16,20],[20,21,29]],
    };
    const faux = {
      1: [[4,5,7],[3,5,6],[6,9,12]],
      2: [[7,9,12],[8,11,14],[10,13,16]],
      3: [[9,12,16],[11,15,20],[13,17,22]],
    };
    const useVrai = Math.abs(seed)%2===0;
    const [a,b,c] = useVrai ? pick(vrais[niveau], seed) : pick(faux[niveau], seed);
    const rep = useVrai ? 1 : 0;
    const c2=c*c, ab2=a*a+b*b;
    return {
      question: `Un triangle a des côtés ${a} cm, ${b} cm et ${c} cm. Est-il rectangle ? (1 = oui, 0 = non)`,
      reponse: rep,
      fragment: `VT-0${rep}`,
      indices: [
        `Vérifiez si le carré du plus grand côté = somme des carrés des deux autres.`,
        `${c}² = ${c2}. ${a}² + ${b}² = ${a*a} + ${b*b} = ${ab2}.`,
        `${c2} et ${ab2} — ces deux valeurs sont-elles égales ? Répondez 1 ou 0.`,
      ],
      explication: `${c}²=${c2} ${c2===ab2?'=':'≠'} ${a}²+${b}²=${ab2} → triangle ${c2===ab2?'rectangle':'non rectangle'}. Réponse : ${rep}.`,
      typeReponse: 'entier',
    };
  },

  // ── E13 : Tableau de proportionnalité ─────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {k:3,x1:4,x2:7,x3:10,xq:6}, {k:4,x1:3,x2:5,x3:8,xq:7}, {k:5,x1:2,x2:6,x3:9,xq:4} ],
      2: [ {k:7,x1:4,x2:9,x3:13,xq:11},{k:9,x1:3,x2:7,x3:11,xq:8},{k:8,x1:5,x2:9,x3:12,xq:7} ],
      3: [ {k:12,x1:5,x2:9,x3:14,xq:11},{k:15,x1:4,x2:7,x3:13,xq:9},{k:11,x1:6,x2:10,x3:15,xq:13} ],
    };
    const {k,x1,x2,x3,xq} = pick(pool[niveau], seed);
    const y1=k*x1, y2=k*x2, y3=k*x3, res=k*xq;
    return {
      question: `Tableau de commandes de ZÉRO :\nQuantité : ${x1} | ${x2} | ${x3} | ${xq}\nPrix (€)  : ${y1} | ${y2} | ${y3} | ?\nQuel est le prix manquant (en €) ?`,
      reponse: res,
      fragment: `PT-${res}`,
      indices: [
        `Ce tableau est-il proportionnel ? Vérifiez que prix ÷ quantité est constant.`,
        `${y1} ÷ ${x1} = ${k}. C'est le coefficient de proportionnalité.`,
        `Le coefficient est ${k}. Appliquez-le à la quantité ${xq} pour trouver le prix.`,
      ],
      explication: `Coefficient : ${y1}/${x1} = ${k}. Prix pour ${xq} : ${xq}×${k} = ${res} €.`,
      typeReponse: 'entier',
      unite: '€',
    };
  },

  // ── E14 : Puissances négatives ─────────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {base:2,exp:3}, {base:3,exp:2}, {base:5,exp:2} ],
      2: [ {base:2,exp:4}, {base:4,exp:2}, {base:3,exp:3} ],
      3: [ {base:2,exp:5}, {base:6,exp:2}, {base:2,exp:6} ],
    };
    const {base,exp} = pick(pool[niveau], seed);
    const den = Math.pow(base, exp);
    return {
      question: `Calculez : ${base}⁻${exp}. Donnez le dénominateur de la fraction obtenue.`,
      reponse: den,
      fragment: `PS-${den}`,
      indices: [
        `a⁻ⁿ = 1/aⁿ.`,
        `${base}⁻${exp} = 1/${base}^${exp}.`,
        `${base}^${exp} = ${den}. Donc ${base}⁻${exp} = 1/${den}. Quel est le dénominateur de cette fraction ?`,
      ],
      explication: `${base}⁻${exp} = 1/${base}^${exp} = 1/${den}. Dénominateur : ${den}.`,
      typeReponse: 'entier',
    };
  },

  // ── E15 : Écriture scientifique — grand (N1/N2) ou petit exposant négatif (N3)
  (seed, niveau) => {
    if (niveau === 3) {
      const pool = [
        {mantisse:'3,5', entier:0.0035,   exp:-3},
        {mantisse:'2,1', entier:0.0021,   exp:-3},
        {mantisse:'4,8', entier:0.00048,  exp:-4},
        {mantisse:'1,2', entier:0.00012,  exp:-4},
        {mantisse:'6,0', entier:0.000006, exp:-6},
        {mantisse:'9,3', entier:0.00093,  exp:-4},
      ];
      const {mantisse, entier, exp} = pick(pool, seed);
      return {
        question: `Écrivez ${entier} en notation scientifique : ${mantisse} × 10^?. Entrez l'exposant (négatif).`,
        reponse: exp,
        fragment: `ES-${Math.abs(exp)}`,
        indices: [
          `Pour un nombre inférieur à 1, la virgule se déplace vers la droite : l'exposant est négatif.`,
          `Comptez combien de rangs il faut déplacer la virgule pour obtenir ${mantisse}.`,
          `On déplace la virgule de ${Math.abs(exp)} rangs vers la droite. L'exposant est donc négatif.`,
        ],
        explication: `${entier} = ${mantisse} × 10^${exp}. Exposant : ${exp}.`,
        typeReponse: 'entier',
      };
    }
    const pool = {
      1: [ {mantisse:'4,56',entier:45600000,exp:7}, {mantisse:'1,25',entier:1250000,exp:6}, {mantisse:'3,72',entier:37200000,exp:7} ],
      2: [ {mantisse:'6,04',entier:60400000,exp:7}, {mantisse:'9,12',entier:912000000,exp:8},{mantisse:'2,80',entier:2800000000,exp:9} ],
    };
    const {mantisse,entier,exp} = pick(pool[niveau as 1|2], seed);
    const formatted = entier.toLocaleString('fr-FR');
    return {
      question: `Écrivez ${formatted} en notation scientifique : ${mantisse} × 10^?. Entrez l'exposant.`,
      reponse: exp,
      fragment: `ES-0${exp}`,
      indices: [
        `Comptez combien de fois vous déplacez la virgule pour obtenir ${mantisse}.`,
        `${formatted} → on déplace la virgule de ${exp} rangs vers la gauche.`,
        `On déplace la virgule de ${exp} rangs. Écrivez l'exposant de la puissance de 10.`,
      ],
      explication: `${formatted} = ${mantisse} × 10^${exp}. Exposant : ${exp}.`,
      typeReponse: 'entier',
    };
  },

  // ── E16 : Pourcentage ─────────────────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {prix:80,taux:25}, {prix:60,taux:20}, {prix:50,taux:20} ],
      2: [ {prix:120,taux:35},{prix:150,taux:30},{prix:200,taux:15} ],
      3: [ {prix:240,taux:35},{prix:180,taux:45},{prix:320,taux:25} ],
    };
    const {prix,taux} = pick(pool[niveau], seed);
    const reduc=prix*taux/100, res=prix-reduc;
    return {
      question: `Un article coûte ${prix} €. Il est soldé à −${taux} %. Quel est le prix final (en €) ?`,
      reponse: res,
      fragment: `CP-${res}`,
      indices: [
        `Calculez d'abord la réduction : ${taux} % de ${prix}.`,
        `${taux}/100 × ${prix} = ${reduc} €.`,
        `La réduction est de ${reduc} €. Soustrayez-la du prix initial ${prix} €.`,
      ],
      explication: `${taux}% de ${prix} = ${reduc} €. Prix final = ${prix}−${reduc} = ${res} €.`,
      typeReponse: 'entier',
      unite: '€',
    };
  },

  // ── E17 : Vitesse/Distance/Temps ──────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {v:60,t:2,d:120}, {v:80,t:2,d:160}, {v:50,t:3,d:150} ],
      2: [ {v:90,t:3,d:270}, {v:75,t:4,d:300}, {v:110,t:2,d:220} ],
      3: [ {v:130,t:3,d:390},{v:115,t:4,d:460},{v:95,t:6,d:570} ],
    };
    const {v,t,d} = pick(pool[niveau], seed);
    return {
      question: `Un drone de ZÉRO se déplace à ${v} km/h pendant ${t} heures. Quelle distance a-t-il parcourue (en km) ?`,
      reponse: d,
      fragment: `VT-${d}`,
      indices: [
        `La formule est : distance = vitesse × temps.`,
        `Distance = ${v} × ${t}.`,
        `Posez la multiplication ${v} × ${t} et calculez la distance en km.`,
      ],
      explication: `d = v × t = ${v} × ${t} = ${d} km.`,
      typeReponse: 'entier',
      unite: 'km',
    };
  },

  // ── E18 : Équation simple (N1/N2) ou avec fractions (N3) ──────────────────
  (seed, niveau) => {
    if (niveau === 3) {
      // N3 : x/a + b = c  →  x = (c−b)×a
      const pool = [
        {a:3,b:2,c:5},   // x/3+2=5 → x=9
        {a:4,b:3,c:7},   // x/4+3=7 → x=16
        {a:5,b:1,c:4},   // x/5+1=4 → x=15
        {a:2,b:5,c:9},   // x/2+5=9 → x=8
        {a:6,b:2,c:5},   // x/6+2=5 → x=18
        {a:3,b:4,c:8},   // x/3+4=8 → x=12
      ];
      const {a,b,c} = pick(pool, seed);
      const res = (c-b)*a;
      return {
        question: `Résolvez : x/${a} + ${b} = ${c}. Quelle est la valeur de x ?`,
        reponse: res,
        fragment: `EQ-${res}`,
        indices: [
          `Isolez d'abord x/${a} en soustrayant ${b} des deux membres.`,
          `x/${a} = ${c} − ${b} = ${c-b}.`,
          `x/${a} = ${c-b}. Multipliez les deux membres par ${a} pour isoler x.`,
        ],
        explication: `x/${a} = ${c-b} → x = ${c-b} × ${a} = ${res}.`,
        typeReponse: 'entier',
      };
    }
    const pool = {
      1: [ {a:3,b:7,c:2,d:-5}, {a:4,b:-3,c:1,d:9}, {a:5,b:3,c:2,d:-9} ],
      2: [ {a:6,b:1,c:2,d:-7}, {a:7,b:-4,c:3,d:8}, {a:8,b:-5,c:3,d:7} ],
    };
    const {a,b,c,d} = pick(pool[niveau as 1|2], seed);
    const res = (d-b)/(a-c);
    const fmtB = b>=0?`+ ${b}`:`− ${Math.abs(b)}`;
    const fmtD = d>=0?`+ ${d}`:`− ${Math.abs(d)}`;
    return {
      question: `Résolvez : ${a}x ${fmtB} = ${c}x ${fmtD}. Quelle est la valeur de x ?`,
      reponse: res,
      fragment: `EQ-${Math.abs(res)}`,
      indices: [
        `Regroupez les termes en x d'un côté et les constantes de l'autre.`,
        `${a}x − ${c}x = ${d} − (${b}) → ${a-c}x = ${d-b}.`,
        `${a-c}x = ${d-b}. Divisez les deux membres par ${a-c} pour isoler x.`,
      ],
      explication: `${a-c}x = ${d-b} → x = ${res}.`,
      typeReponse: res===Math.floor(res)?'entier':'decimal',
    };
  },

  // ── E19 : Thalès ──────────────────────────────────────────────────────────
  (seed, niveau) => {
    const pool = {
      1: [ {OA:6,OAp:9,OB:8},  {OA:4,OAp:6,OB:10}, {OA:3,OAp:5,OB:9} ],
      2: [ {OA:5,OAp:8,OB:10}, {OA:6,OAp:10,OB:9}, {OA:8,OAp:12,OB:10} ],
      3: [ {OA:7,OAp:11,OB:14},{OA:9,OAp:15,OB:12},{OA:8,OAp:14,OB:12} ],
    };
    const {OA,OAp,OB} = pick(pool[niveau], seed);
    const OBp = OAp*OB/OA;
    return {
      question: `Dans une configuration de triangles emboîtés : OA = ${OA}, OA' = ${OAp}, OB = ${OB}. AB ∥ A'B'. Calculez OB' (en cm).`,
      reponse: OBp,
      fragment: `TH-${OBp}`,
      indices: [
        `Par Thalès : OA/OA' = OB/OB'.`,
        `${OA}/${OAp} = ${OB}/OB'. Faites le produit en croix.`,
        `OB' = ${OAp} × ${OB} / ${OA} = ${OAp*OB}/${OA}. Effectuez la division pour trouver OB'.`,
      ],
      explication: `${OA}/${OAp} = ${OB}/OB' → OB' = ${OAp*OB}/${OA} = ${OBp} cm.`,
      typeReponse: OBp===Math.floor(OBp)?'entier':'decimal',
      unite: 'cm',
    };
  },

  // ── E20 : Moyenne simple (N1/N2) ou pondérée (N3) ─────────────────────────
  (seed, niveau) => {
    if (niveau === 3) {
      // N3 : moyenne pondérée avec coefficients
      const pool = [
        {notes:[12,15,8,14], coefs:[2,3,1,2]},
        {notes:[10,14,9,16], coefs:[1,3,2,2]},
        {notes:[13,11,15,8], coefs:[3,2,1,2]},
        {notes:[9,14,12,16], coefs:[2,1,3,2]},
        {notes:[11,15,10,13],coefs:[2,2,3,1]},
        {notes:[14,8,16,12], coefs:[3,1,2,2]},
      ];
      const {notes, coefs} = pick(pool, seed);
      const somme = notes.reduce((acc,n,i)=>acc+n*coefs[i], 0);
      const totalCoef = coefs.reduce((a,b)=>a+b, 0);
      const moy = somme / totalCoef;
      const table = notes.map((n,i)=>`${n} (×${coefs[i]})`).join(', ');
      return {
        question: `Notes de résistance de ZÉRO (avec coefficients) : ${table}. Calculez la moyenne pondérée.`,
        reponse: moy,
        fragment: `FIN-${moy}`,
        indices: [
          `Moyenne pondérée = somme(note × coef) ÷ somme(coefs).`,
          `Calculez : ${notes.map((n,i)=>`${n}×${coefs[i]}`).join(' + ')} = ${somme}. Somme des coefs = ${totalCoef}.`,
          `Somme pondérée = ${somme}. Total coefficients = ${totalCoef}. Divisez maintenant.`,
        ],
        explication: `Somme pondérée = ${somme}. Total coefs = ${totalCoef}. Moyenne = ${somme}/${totalCoef} = ${moy}.`,
        typeReponse: moy===Math.floor(moy)?'entier':'decimal',
      };
    }
    const pool = {
      1: [ [12,15,8,14,11,16,10,14], [10,13,7,15,12,14,9,12] ],
      2: [ [14,16,9,11,13,15,8,10,12,14], [11,14,8,16,10,15,9,13,12,11] ],
    };
    const notes = pick(pool[niveau as 1|2], seed);
    const somme = notes.reduce((acc,n)=>acc+n, 0);
    const moy = somme/notes.length;
    return {
      question: `Les notes de résistance de ZÉRO sont : ${notes.join(', ')}. Calculez la moyenne.`,
      reponse: moy,
      fragment: `FIN-${moy}`,
      indices: [
        `Additionner toutes les valeurs, puis diviser par le nombre de valeurs.`,
        `${notes.join(' + ')} = ?`,
        `Somme = ${somme}. Nombre de valeurs = ${notes.length}. Divisez maintenant pour obtenir la moyenne.`,
      ],
      explication: `Somme = ${somme}. Nombre de valeurs = ${notes.length}. Moyenne = ${somme}/${notes.length} = ${moy}.`,
      typeReponse: moy===Math.floor(moy)?'entier':'decimal',
    };
  },
];

// ─── Données fixes ────────────────────────────────────────────────────────────

const META = [
  { id:1,  acte:1, titre:"Accès au terminal",          narration:"La Brigade Mathématique vient d'intercepter un signal de ZÉRO. Pour accéder au terminal principal, il faut déchiffrer le premier verrou numérique. ZÉRO a laissé un calcul piégé : il compte sur vos erreurs de priorités." },
  { id:2,  acte:1, titre:"La grille de coordonnées",   narration:"ZÉRO a chiffré les coordonnées de son serveur central sur un axe numérique. Les coordonnées sont données par une expression avec des nombres relatifs. Trouvez la position exacte." },
  { id:3,  acte:1, titre:"Décryptage du noyau",        narration:"Le noyau de ZÉRO est protégé par un produit de nombres relatifs. Une erreur de signe et c'est l'alarme. Calculez le code exact." },
  { id:4,  acte:1, titre:"Division sécurisée",         narration:"Un quotient de nombres relatifs protège la porte du datacenter. ZÉRO pense que vous allez vous tromper de signe. Prouvez-lui le contraire." },
  { id:5,  acte:1, titre:"Expression piégée",          narration:"ZÉRO a encodé un message dans une expression algébrique. Pour déchiffrer sa signification, utilisez vos connaissances en calcul littéral." },
  { id:6,  acte:2, titre:"Fréquence fractionnaire",    narration:"ZÉRO transmet sur une fréquence fractionnaire. Pour la brouiller, vous devez calculer le résultat exact de l'opération sur ces fractions." },
  { id:7,  acte:2, titre:"Comparaison de signaux",     narration:"Deux signaux suspects sont captés. Le plus fort est celui dont la valeur est la plus grande. Identifiez-le en comparant ces fractions." },
  { id:8,  acte:2, titre:"Multiplication de brouilleurs", narration:"Pour multiplier la puissance de brouillage, ZÉRO multiplie ses signaux fractionnaires. Calculez le résultat." },
  { id:9,  acte:2, titre:"Division des fréquences",    narration:"ZÉRO divise ses ressources entre ses antennes. Calculez la part de chaque antenne." },
  { id:10, acte:2, titre:"Expression développée",      narration:"ZÉRO a factorisé son code pour le cacher. Travaillez l'expression pour le révéler." },
  { id:11, acte:3, titre:"Tour de surveillance",       narration:"Une tour de surveillance triangulaire abrite un émetteur de ZÉRO. Pour calculer la portée de l'émetteur, vous avez besoin d'une longueur inconnue." },
  { id:12, acte:3, titre:"Vérification du triangle",   narration:"ZÉRO a prétendu construire un triangle rectangle parfait comme alibi. Vérifiez si ce triangle est vraiment rectangle. Répondez 1 (OUI) ou 0 (NON)." },
  { id:13, acte:3, titre:"Le marché noir de ZÉRO",     narration:"ZÉRO se réapprovisionne en composants électroniques sur le marché noir. La Brigade a intercepté son tableau de commandes. Déchiffrez le prix manquant." },
  { id:14, acte:3, titre:"Puissance du signal",        narration:"Le signal de ZÉRO est amplifié à une puissance négative — une technique pour le rendre indétectable. Calculez sa valeur." },
  { id:15, acte:3, titre:"Écriture scientifique",      narration:"ZÉRO communique via un réseau de micro-capteurs. Exprimez ce nombre en notation scientifique. Quel est l'exposant de 10 ?" },
  { id:16, acte:4, titre:"Calcul de proportion",       narration:"Pour désactiver le premier réacteur de ZÉRO, vous devez calculer un pourcentage exact. Une erreur et le réacteur se surcharge." },
  { id:17, acte:4, titre:"Interception du drone",      narration:"Un drone espion de ZÉRO a été repéré. Pour calculer sa position exacte, la Brigade doit déterminer la distance qu'il a parcourue depuis sa base." },
  { id:18, acte:4, titre:"Équation finale",            narration:"Le code de désactivation de ZÉRO est caché dans une équation. Résolvez-la pour obtenir la valeur secrète." },
  { id:19, acte:4, titre:"Théorème de Thalès",         narration:"Pour tracer la trajectoire exacte vers le serveur de ZÉRO, vous devez utiliser le théorème de Thalès. Calculez la longueur manquante." },
  { id:20, acte:4, titre:"Code de désactivation",      narration:"Dernière étape. ZÉRO a évalué sa propre résistance. Calculez cette valeur statistique pour entrer le code final de désactivation." },
];

// ─── Exports ──────────────────────────────────────────────────────────────────

export function genererEnigmes(seeds: number[], niveau: Niveau = 1): EnigmeVariante[] {
  return META.map((meta, i) => ({ ...meta, ...generators[i](seeds[i], niveau) }));
}

export const ENIGMES: EnigmeVariante[] = genererEnigmes(
  Array.from({ length: 20 }, (_, i) => i * 7 + 3), 1
);

export const DEFAULT_SEEDS = Array.from({ length: 20 }, (_, i) => i * 7 + 3);

export const ACTES = [
  { id:1, nom:"Acte I — Infiltration",    couleur:"#00ff9f" },
  { id:2, nom:"Acte II — Déchiffrement",  couleur:"#00c8ff" },
  { id:3, nom:"Acte III — Neutralisation",couleur:"#ff9f00" },
  { id:4, nom:"Acte IV — Désactivation",  couleur:"#ff003c" },
];
