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
export type PuzzleKey = "syntyvyys" | "tyottomyys" | "velka";
type Data = { built: string; puzzles: Record<PuzzleKey, Puzzle> };

export const SELITTAMATON = raw as unknown as Data;
export const PUZZLE_KEYS: PuzzleKey[] = ["syntyvyys", "tyottomyys", "velka"];

/** Ilmiön yksikkö: syntyvyys on log-muutos (näytetään prosentteina), muut prosenttiyksikköinä. */
export const UNIT: Record<PuzzleKey, "log" | "pp"> = { syntyvyys: "log", tyottomyys: "pp", velka: "pp" };

export const fiNum = (v: number, d = 1) => {
  const t = Math.abs(v).toLocaleString("fi-FI", { minimumFractionDigits: d, maximumFractionDigits: d });
  return v < 0 ? `−${t}` : t;
};
export const signed = (v: number, d = 1) => (v > 0 ? `+${fiNum(v, d)}` : fiNum(v, d));

/** Arvo näyttöyksikössä: log-muutos prosentteina, muuten sellaisenaan. */
export const shown = (key: PuzzleKey, v: number) => (UNIT[key] === "log" ? (Math.exp(v) - 1) * 100 : v);
export const unitLabel = (key: PuzzleKey) => (UNIT[key] === "log" ? "%" : "%-yks.");

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
