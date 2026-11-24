// Elämänkaarinäkymän puhtaat laskentafunktiot. Aineisto: src/data/lifecourse.json
// (scripts/build-lifecourse.py, Tilastokeskus 12c6 ja 115c).
import raw from "@/data/lifecourse.json";

export type Sex = "kaikki" | "naiset" | "miehet";
export type Grid = (number | null)[][]; // [vuosi][ikä]
export type State = {
  key: string;
  label: string;
  group: "asuminen" | "toiminta";
  years: number[];
  shares: Record<Sex, Grid>;
  source: string;
  source_url: string;
  /** Miten siirtymä luetaan: ikä, jolloin osuus laskee alle 50 % / nousee yli 50 %, tai huippuikä. */
  marker: "falls" | "rises" | "peak" | "none";
  threshold: number;
};

const MARKERS: Record<string, [State["marker"], number]> = {
  kotona: ["falls", 50],
  tyossa: ["rises", 50],
  vanhempi: ["rises", 50],
  yksin: ["peak", 0],
  pari: ["peak", 0],
  opiskelee: ["falls", 20],
  tyoton: ["none", 0],
};

const data = raw as unknown as {
  meta: { generated_at: string; ages: number[]; note: string };
  states: Record<string, Omit<State, "key" | "marker" | "threshold">>;
};

export const AGES = data.meta.ages;
export const META = data.meta;
export const STATES: State[] = Object.entries(data.states).map(([key, s]) => ({
  ...s,
  key,
  marker: MARKERS[key]?.[0] ?? "peak",
  threshold: MARKERS[key]?.[1] ?? 0,
}));

/** Ikä (desimaalina), jolla osuus ylittää tai alittaa kynnyksen ensimmäisen kerran; lineaarinen interpolointi. */
export function crossingAge(row: (number | null)[], ages: number[], dir: "rises" | "falls", threshold = 50): number | null {
  for (let i = 1; i < row.length; i++) {
    const a = row[i - 1],
      b = row[i];
    if (a == null || b == null) continue;
    const crossed = dir === "rises" ? a < threshold && b >= threshold : a > threshold && b <= threshold;
    if (crossed) return ages[i - 1]! + (threshold - a) / (b - a);
  }
  return null;
}

/** Ikä, jolla osuus on suurimmillaan, ja osuus. */
export function peak(row: (number | null)[], ages: number[]): { age: number; share: number } | null {
  let best: { age: number; share: number } | null = null;
  row.forEach((v, i) => {
    if (v != null && (best == null || v > best.share)) best = { age: ages[i]!, share: v };
  });
  return best;
}

/** Siirtymäikä vuodelle: 50 %:n raja tai huippuikä tilan mukaan. */
export function markerAge(state: State, row: (number | null)[], ages = AGES): number | null {
  if (state.marker === "none") return null;
  if (state.marker === "peak") return peak(row, ages)?.age ?? null;
  return crossingAge(row, ages, state.marker, state.threshold);
}

/** Siirtymäiät kaikille vuosille. */
export function markerSeries(state: State, sex: Sex): { year: number; age: number | null }[] {
  return state.years.map((year, i) => ({ year, age: markerAge(state, state.shares[sex][i] ?? []) }));
}

export const markerLabel = (s: Pick<State, "marker" | "threshold">) =>
  s.marker === "none"
    ? ""
    : s.marker === "peak"
    ? "ikä, jolla osuus on suurimmillaan"
    : `ikä, jolla osuus ${s.marker === "falls" ? "laskee alle" : "nousee yli"} ${s.threshold === 50 ? "puolen" : `${s.threshold} prosentin`}`;
