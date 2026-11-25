import { describe, expect, it } from "vitest";
import {
  EPISODES,
  binomTail,
  classify,
  distribution,
  placeboSummary,
  placeboWindows,
  rareSummary,
  scanEpisode,
  traceAt,
} from "./crisis-trace";
import { SCANNER, type ScanSeries } from "./scanner";

const mk = (v: number[], y0 = 1900): ScanSeries => ({ k: "x", t: "x", u: "", lane: "Muut", theme: "", y0, f: "", v });
// Tasainen 2 %:n kasvu ja pieni vuorotteleva vaihtelu, jotta tavallinen vuosimuutos ei ole nolla.
const grow = (n: number) => Array.from({ length: n }, (_, i) => 100 * 1.02 ** i * (i % 2 ? 1.005 : 1));

describe("trace of a single series", () => {
  it("measures the shock against the pre-crisis trend, not the starting level", () => {
    const v = grow(40);
    for (let y = 20; y <= 22; y++) v[y]! *= 0.8; // isku 1920–1922, palaa trendiin
    const t = traceAt(mk(v), 1920, 1922, 5)!;
    expect(t.log).toBe(true);
    expect(t.peakYear).toBeGreaterThanOrEqual(1920);
    expect(t.shock).toBeLessThan(0);
    expect(t.kind).toBe("palasi");
  });
  it("a permanent level drop is a lasting trace", () => {
    const v = grow(40).map((x, i) => (i >= 20 ? x * 0.8 : x));
    expect(traceAt(mk(v), 1920, 1922, 5)!.kind).toBe("jalki");
  });
  it("plain trend growth is not a shock", () => {
    expect(traceAt(mk(grow(40)), 1920, 1922, 5)).toBeNull();
  });
  it("classes", () => {
    expect(classify(0.1)).toBe("palasi");
    expect(classify(0.8)).toBe("jalki");
    expect(classify(1.5)).toBe("syveni");
    expect(classify(-0.5)).toBe("ylitti");
  });
});

describe("ordinary years", () => {
  it("placebo windows never touch a crisis, its pre-trend or its follow-up", () => {
    for (const [a, b] of placeboWindows(4, 5)) {
      for (const e of EPISODES) expect(e.to < a - 12 || e.from > b + 5).toBe(true);
    }
  });
  it("binomial tail", () => {
    expect(binomTail(0, 10, 0.05)).toBe(1);
    expect(binomTail(1, 10, 0.05)).toBeCloseTo(1 - 0.95 ** 10, 10);
  });
});

describe("numbers in the headline (5-year follow-up)", () => {
  const run = (id: string) => {
    const e = EPISODES.find((x) => x.id === id)!;
    const rows = scanEpisode(SCANNER.series, e, 5);
    return { d: distribution(rows), n: placeboSummary(SCANNER.series, e.to - e.from + 1, 5), r: rareSummary(rows) };
  };
  it("wars and famine returned to trend more often than ordinary years", () => {
    for (const id of ["nalka", "1918", "sota"]) {
      const { d, n } = run(id);
      expect(d.share.palasi).toBeGreaterThan(n.hi.palasi);
    }
  });
  it("economic crises left more rare traces than chance", () => {
    for (const id of ["1930", "lama", "2009"]) {
      const { r } = run(id);
      expect(r.rare).toBeGreaterThanOrEqual(2 * r.expected);
    }
  });
  it("the 1990s depression's class mix stays within ordinary years", () => {
    const { d, n } = run("lama");
    for (const k of ["palasi", "jalki", "syveni", "ylitti"] as const) {
      expect(d.share[k]).toBeGreaterThanOrEqual(n.lo[k]);
      expect(d.share[k]).toBeLessThanOrEqual(n.hi[k]);
    }
  });
});
