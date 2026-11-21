// Smooth curve through data points without inventing values: monotone cubic interpolation
// (Fritsch–Carlson). Between two points the curve never goes above or below both of them,
// so it cannot show a spike or dip that is not in the data. Gaps in the years break the curve.

export type XY = { x: number; y: number };

/** SVG path for one run of points (sorted by x). */
export function monotonePath(p: XY[]): string {
  const n = p.length;
  if (n === 0) return "";
  if (n === 1) return `M${f(p[0]!.x)},${f(p[0]!.y)}`;
  const dx: number[] = [],
    m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(p[i + 1]!.x - p[i]!.x);
    m.push((p[i + 1]!.y - p[i]!.y) / dx[i]!);
  }
  const t: number[] = [m[0]!];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1]! * m[i]! <= 0 ? 0 : (m[i - 1]! + m[i]!) / 2);
  t.push(m[n - 2]!);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i]! / m[i]!,
      b = t[i + 1]! / m[i]!,
      s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      t[i] = k * a * m[i]!;
      t[i + 1] = k * b * m[i]!;
    }
  }
  let d = `M${f(p[0]!.x)},${f(p[0]!.y)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i]! / 3;
    d += ` C${f(p[i]!.x + h)},${f(p[i]!.y + t[i]! * h)} ${f(p[i + 1]!.x - h)},${f(p[i + 1]!.y - t[i + 1]! * h)} ${f(p[i + 1]!.x)},${f(p[i + 1]!.y)}`;
  }
  return d;
}

/** Split points into runs of consecutive years so missing years are not bridged. */
export function runs<T extends { year: number }>(pts: T[]): T[][] {
  const out: T[][] = [];
  for (const p of pts) {
    const last = out.at(-1);
    if (last && p.year - last.at(-1)!.year === 1) last.push(p);
    else out.push([p]);
  }
  return out;
}

const f = (v: number) => (Math.round(v * 10) / 10).toString();
