// Erotusvertailu: kaksi sarjaa samalle asteikolle (z-pisteet yhteisiltä vuosilta), niiden erotus
// ja viivakoodirivit (shokkivuodet ja suuret erot). Puhtaita funktioita, jotta ne voidaan testata.
import { eventsOf, lastYear, type ScanSeries } from "@/lib/scanner";

export type Diff = {
  years: number[];
  a: number[]; // z-pisteet
  b: number[];
  diff: number[]; // b − a
  shocksA: boolean[];
  shocksB: boolean[];
  peak: { year: number; value: number };
  crossings: number[];
};

/** Raja, jonka ylittävä erotus (keskihajonnoissa) merkitään erotusviivakoodiin. */
export const BIG_GAP = 1;

const zs = (v: number[]) => {
  const m = v.reduce((s, x) => s + x, 0) / v.length;
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length) || 1;
  return v.map((x) => (x - m) / sd);
};

export function compareSeries(A: ScanSeries, B: ScanSeries): Diff | null {
  const from = Math.max(A.y0, B.y0), to = Math.min(lastYear(A), lastYear(B));
  const years: number[] = [], ra: number[] = [], rb: number[] = [];
  for (let y = from; y <= to; y++) {
    const va = A.v[y - A.y0], vb = B.v[y - B.y0];
    if (va == null || vb == null) continue;
    years.push(y); ra.push(va); rb.push(vb);
  }
  if (years.length < 5) return null;
  const a = zs(ra), b = zs(rb);
  const diff = a.map((x, i) => b[i]! - x);
  const ea = eventsOf(A, "a"), eb = eventsOf(B, "a");
  let pi = 0;
  diff.forEach((d, i) => { if (Math.abs(d) > Math.abs(diff[pi]!)) pi = i; });
  const crossings = years.filter((_, i) => i > 0 && Math.sign(diff[i]!) !== Math.sign(diff[i - 1]!) && diff[i] !== 0);
  return {
    years, a, b, diff,
    shocksA: years.map((y) => ea.get(y) === true),
    shocksB: years.map((y) => eb.get(y) === true),
    peak: { year: years[pi]!, value: diff[pi]! },
    crossings,
  };
}
