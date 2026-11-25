import type { ScanSeries } from "./scanner";

export type Window = { start: number; shock: number; end: number };
export const PERIODS = [
  { label: "Nälkävuodet", start: 1865, shock: 1868, end: 1875 },
  { label: "Itsenäistymisen murros", start: 1913, shock: 1918, end: 1925 },
  { label: "Sota ja jälleenrakennus", start: 1938, shock: 1945, end: 1955 },
  { label: "1990-luvun lama", start: 1989, shock: 1993, end: 2007 },
  {
    label: "Finanssikriisi ja sen perintö",
    start: 2007,
    shock: 2009,
    end: 2019,
  },
  { label: "Pandemia ja sen perintö", start: 2019, shock: 2020, end: 2025 },
];
export const valueAt = (s: ScanSeries, y: number): number | null => {
  const v = s.v[y - s.y0];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};
export type Kind = "continued" | "remaining" | "returned" | "crossed" | "small";
export const LABELS: Record<Kind, string> = {
  continued: "Etääntyi lisää",
  remaining: "Osa muutoksesta jäi",
  returned: "Lähellä lähtötasoa",
  crossed: "Ylitti lähtötason",
  small: "Pieni alkumuutos",
};
export type Legacy = {
  s: ScanSeries;
  a: number;
  b: number;
  c: number;
  scale: number;
  impulse: number;
  residual: number;
  ratio: number | null;
  kind: Kind;
  observations: number;
};
export function scanLegacy(s: ScanSeries, w: Window): Legacy | null {
  if (
    ![w.start, w.shock, w.end].every(
      (y) => Number.isInteger(y) && y >= 1850 && y <= 2025,
    ) ||
    !(w.start < w.shock && w.shock < w.end)
  )
    return null;
  const a = valueAt(s, w.start),
    b = valueAt(s, w.shock),
    c = valueAt(s, w.end);
  if (a === null || b === null || c === null) return null;
  const ds: number[] = [];
  let observations = 0;
  for (let y = w.start; y <= w.end; y++)
    if (valueAt(s, y) !== null) observations++;
  if (observations < Math.ceil((w.end - w.start + 1) * 0.7)) return null;
  // Compare the movement to the series' own typical annual absolute movement.
  for (let i = 1; i < s.v.length; i++) {
    const x = valueAt(s, s.y0 + i - 1),
      y = valueAt(s, s.y0 + i);
    if (x !== null && y !== null && s.y0 + i <= w.end) ds.push(Math.abs(y - x));
  }
  if (ds.length < 10) return null;
  ds.sort((x, y) => x - y);
  const scale = ds[Math.floor((ds.length - 1) * 0.75)]!;
  if (!(scale > 0)) return null;
  const impulse = (b - a) / scale,
    residual = (c - a) / scale;
  const ratio = Math.abs(impulse) >= 1 ? residual / impulse : null;
  const kind: Kind =
    ratio === null
      ? "small"
      : Math.abs(ratio) <= 0.2
        ? "returned"
        : ratio < 0
          ? "crossed"
          : ratio > 1.2
            ? "continued"
            : "remaining";
  return { s, a, b, c, scale, impulse, residual, ratio, kind, observations };
}
export function scanAll(all: ScanSeries[], w: Window): Legacy[] {
  return all
    .filter((s) => !s.dup)
    .flatMap((s) => {
      const r = scanLegacy(s, w);
      return r ? [r] : [];
    })
    .sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual));
}
export function opposing(target: Legacy, rows: Legacy[]): Legacy[] {
  return rows.filter(
    (r) =>
      r.s.k !== target.s.k &&
      r.s.lane !== target.s.lane &&
      Math.abs(r.residual) >= 1 &&
      Math.abs(target.residual) >= 1 &&
      r.residual * target.residual < 0,
  );
}
