// Selittämätön: kuinka paljon ilmiöstä jää selittämättä tunnettujen selitysten jälkeen (docs/selittamaton.md).
// Aineisto: src/data/selittamaton.json (scripts/selittamaton/build.py). Jäännökset ovat aineistoa uusille
// hypoteeseille; "jäljellä"-ehdokas ei ole syy vaan testattava hypoteesi.
import raw from "@/data/selittamaton.json";

export type Verdict = "jäljellä" | "väärä suunta" | "ei yhteyttä" | "ei aineistoa";
export type Candidate = {
  id: string; label: string; n: number; rho: number | null; p: number | null; q: number; predicted: number; verdict: Verdict;
  points?: { geo: string; x: number; res: number }[];
};
export type Row = { geo: string; name: string; y: number; pred: number; res: number };
export type Puzzle = {
  n: number; countries: string[]; dropped: string[]; looR2: number; fitR2: number; unexplained: number;
  known: { id: string; label: string; beta: number }[];
  rows: Row[]; candidates: Candidate[];
  commonGap?: { value: number; lo: number; hi: number; meanY: number };
  finland?: { y: number; pred: number; res: number; z: number; rankFromLowest?: number; rankFromHighest?: number; of: number };
  sensitivityNoK6?: {
    n: number; looR2: number; fitR2: number; unexplained: number; dropped: string[];
    finland: { res: number; z: number; rankFromLowest: number; of: number };
    candidates: { id: string; rho: number; p: number; q: number; verdict: Verdict; n: number }[];
  };
  series: Record<string, [number, number][]>;
};
export type PuzzleKey = "syntyvyys" | "tyottomyys" | "velka" | "ruoka" | "jonot" | "tuet" | "puolustus";
type Pt = [number, number];
export type FoodAidExternal = {
  fead: { note: string; rows: { year: number; persons: number; tonnes: number; points: number | null; share: number; partial: string | null; src: string }[] };
  survey: { note: string; rows: { year: number; respondents: number; grew: number; same: number | null; fell: number | null; encounters: number; encNote: string; src: string }[] };
  estimates: { year: number; text: string; src: string; url: string }[];
};
type QueueRow = { base: number; change: number; when: number | null; series: Pt[] };
export type Inside = {
  jonot: Record<"medical" | "dental", { rows: Record<"QU1" | "QU2" | "QU3" | "QU4" | "QU5" | "TOTAL", QueueRow>; class: string;
    no2008?: { class: string; rows: Record<"QU1" | "QU2" | "QU3" | "QU4" | "QU5" | "TOTAL", { base: number; change: number; when: number | null }> } }>;
  ruoka: { external: FoodAidExternal; u: number; uPct: number; u2000: number; u2008: number; u2010: number; unemployment: Pt[];
    series: { label: string; m: number; pct: number; class: string; crisisPct: number | null; series: Pt[] }[] };
  mieli: { countries: Record<"FI" | "SE" | "NO" | "DK", { g1: number; g2: number; g3: number; accel: boolean; series: Pt[] }>;
    othersAccelerating: number; class: string;
    youth: Record<string, { title: string; unit: string; last: number; g1019: number | null; g19last: number | null; series: Pt[] }> };
};
type Data = { built: string; puzzles: Record<PuzzleKey, Puzzle>; inside: Inside };

export const SELITTAMATON = raw as unknown as Data;
export const PUZZLE_KEYS: PuzzleKey[] = ["syntyvyys", "tyottomyys", "velka", "jonot", "ruoka", "tuet", "puolustus"];

/** Ilmiön yksikkö: syntyvyys on log-muutos (näytetään prosentteina), muut prosenttiyksikköinä. */
export const UNIT: Record<PuzzleKey, "log" | "pp" | "pc" | "gdp"> = { syntyvyys: "log", tyottomyys: "pp", velka: "pp", ruoka: "pc", jonot: "pp", tuet: "pc", puolustus: "gdp" };

export const fiNum = (v: number, d = 1) => {
  const t = Math.abs(v).toLocaleString("fi-FI", { minimumFractionDigits: d, maximumFractionDigits: d });
  return v < 0 ? `−${t}` : t;
};
export const signed = (v: number, d = 1) => (v > 0 ? `+${fiNum(v, d)}` : fiNum(v, d));

/** Arvo näyttöyksikössä: log-muutos prosentteina, muuten sellaisenaan. */
export const shown = (key: PuzzleKey, v: number) => (UNIT[key] === "log" ? (Math.exp(v) - 1) * 100 : v);
export const unitLabel = (key: PuzzleKey) => (UNIT[key] === "log" ? "%" : "%-yks.");
/** Tason yksikkö (havaittu ja ennuste): prosenttiosuus, BKT-osuus tai muutos. */
export const levelLabel = (key: PuzzleKey) => ({ log: "%", pp: "%-yks.", pc: "%", gdp: "% BKT:sta" })[UNIT[key]];

/** Suomen jäännöksen sija suurimmasta: 1 = suurin positiivinen jäännös. */
export function finlandRank(p: Puzzle): { fromTop: number; fromBottom: number; of: number } | null {
  if (!p.finland) return null;
  const sorted = [...p.rows].sort((a, b) => b.res - a.res);
  const i = sorted.findIndex((r) => r.geo === "FI" || r.geo === "FIN");
  return { fromTop: i + 1, fromBottom: sorted.length - i, of: sorted.length };
}

/** LOO-R²:n sanallinen tulkinta. */
export function predictive(looR2: number): string {
  if (looR2 < 0) return "ennustavat maiden eroja huonommin kuin pelkkä keskiarvo";
  if (looR2 < 0.3) return `ennustavat vain ${Math.round(looR2 * 100)} % maiden eroista`;
  if (looR2 < 0.6) return `ennustavat noin ${Math.round(looR2 * 100)} % maiden eroista`;
  return `ennustavat suurimman osan (${Math.round(looR2 * 100)} %) maiden eroista`;
}

/** Jäännökset suurimmasta negatiivisesta suurimpaan positiiviseen. */
export const sortedRows = (p: Puzzle) => [...p.rows].sort((a, b) => a.res - b.res);

export const remaining = (p: Puzzle) => p.candidates.filter((c) => c.verdict === "jäljellä");

export const VERDICT_INFO: Record<Verdict, string> = {
  "jäljellä": "selittää osan siitä, mitä tunnetut selitykset eivät selittäneet, ennustettuun suuntaan",
  "väärä suunta": "yhteys jäännökseen löytyi, mutta päinvastaiseen suuntaan kuin ehdokas ennustaa",
  "ei yhteyttä": "ei selitä jäännöstä",
  "ei aineistoa": "liian vähän maita",
};

/** Vuotuinen log-kasvu prosentteina (näyttöä varten). */
export const growthPct = (g: number) => (Math.exp(g) - 1) * 100;
