// Sukupolvilinssi (/sukupolvet): saman ikäisten elämäntilanne kahtena vuonna rinnakkain.
import { AGES, STATES, type Sex, type State } from "@/lib/lifecourse";

export const PRESETS = [
  { key: "lama", label: "Laman pohjalta nousuun", a: 1993, b: 2000 },
  { key: "fin", label: "Ennen ja jälkeen finanssikriisin", a: 2008, b: 2014 },
  { key: "korona", label: "Ennen ja jälkeen koronan", a: 2019, b: 2022 },
  { key: "koko", label: "Koko jakso", a: 1992, b: 2024 },
];

export type Comparison = { a: (number | null)[]; b: (number | null)[]; biggest: { age: number; diff: number } | null };

export const rowOf = (s: State, sex: Sex, year: number) => {
  const i = s.years.indexOf(year);
  return i < 0 ? null : (s.shares[sex][i] ?? null);
};

/** Vertaa kahta vuotta: osuudet ikävuosittain ja suurin ero (prosenttiyksikköä, b − a). */
export function compare(s: State, sex: Sex, ya: number, yb: number, ages = AGES): Comparison | null {
  const a = rowOf(s, sex, ya), b = rowOf(s, sex, yb);
  if (!a || !b) return null;
  let biggest: Comparison["biggest"] = null;
  ages.forEach((age, i) => {
    const x = a[i], y = b[i];
    if (x == null || y == null) return;
    const diff = y - x;
    if (!biggest || Math.abs(diff) > Math.abs(biggest.diff)) biggest = { age, diff };
  });
  return { a, b, biggest };
}

export { STATES };
