import { describe, expect, it } from "vitest";
import {
  SCANNER,
  bh,
  binomUpper,
  byKey,
  compareEpisodes,
  crisisYears,
  eventsOf,
  leadLag,
  leadLagChanges,
  normalTwoSided,
  prewhiten,
  scanTarget,
  status,
  uniqueSeries,
  type ScanSeries,
} from "./scanner";

const mk = (k: string, y0: number, f: string, v?: (number | null)[]): ScanSeries => ({
  k, t: k, u: "", lane: "Muut", theme: "", y0, f, v: v ?? Array.from({ length: f.length }, (_, i) => 100 + i),
});

describe("statistics helpers", () => {
  it("binomial upper tail", () => {
    expect(binomUpper(0, 5)).toBe(1);
    expect(binomUpper(5, 5)).toBeCloseTo(1 / 32);
    expect(binomUpper(4, 5)).toBeCloseTo(6 / 32);
  });
  it("Benjamini–Hochberg keeps order and never lowers p", () => {
    const q = bh([0.01, 0.04, 0.03, 0.5]);
    expect(q[0]).toBeCloseTo(0.04);
    expect(q[2]).toBeCloseTo((0.04 * 4) / 3, 6); // p = 0,03 saa seuraavan rajan
    expect(q[3]).toBeCloseTo(0.5);
    q.forEach((v, i) => expect(v).toBeGreaterThanOrEqual([0.01, 0.04, 0.03, 0.5][i]!));
  });
  it("normal two-sided p", () => {
    expect(normalTwoSided(1.96)).toBeCloseTo(0.05, 3);
    expect(normalTwoSided(0)).toBeCloseTo(1, 6);
  });
  it("status labels", () => {
    expect(status(0.001, 0.05)).toBe("ehdokas");
    expect(status(0.01, 0.4)).toBe("heikko");
    expect(status(0.2, 0.9)).toBe("sattumaa");
  });
});

describe("event order test", () => {
  // Ehdokkaan tapahtuma on aina vuotta ennen kohteen tapahtumaa.
  const pattern = (shift: number) => Array.from({ length: 60 }, (_, i) => ((i + shift) % 7 === 0 ? "a" : "0")).join("");
  const target = mk("t", 1900, pattern(0));
  const cand = mk("c", 1900, pattern(1));
  it("finds that the candidate comes first", () => {
    const r = leadLag(target, cand, "a", 2)!;
    expect(r.before).toBe(r.n - 1); // ensimmäistä edeltävää vuotta ei ole
    expect(r.after).toBe(0);
    expect(r.pLead).toBeLessThan(0.01);
    expect(r.pLag).toBe(1);
  });
  it("same-year events (a common shock) do not count as order", () => {
    const r = leadLag(target, mk("s", 1900, pattern(0)), "a", 2)!;
    expect(r.same).toBe(r.n);
    expect(r.before).toBe(0);
    expect(r.after).toBe(0);
  });
  it("turning points are only defined five years from the ends", () => {
    const e = eventsOf(mk("x", 2000, "t".repeat(20)), "t");
    expect(Math.min(...e.keys())).toBe(2005);
    expect(Math.max(...e.keys())).toBe(2014);
  });
});

describe("change correlation", () => {
  it("detects a one-year lead and its sign", () => {
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
    const sh = Array.from({ length: 81 }, rnd); // ehdokkaan muutos vuonna 1900 + i
    const level = (ch: (i: number) => number) => { let v = 100; return sh.map((_, i) => (i ? (v *= 1 + ch(i)) : v)); };
    const cand = mk("c", 1900, "0".repeat(81), level((i) => sh[i]! * 0.1));
    // kohteen muutos = −(ehdokkaan muutos vuotta aiemmin) + kohinaa
    const target = mk("t", 1900, "0".repeat(81), level((i) => -sh[i - 1]! * 0.1 + rnd() * 0.03));
    const r = leadLagChanges(target, cand, 2)!;
    expect(r.lead.k).toBe(1);
    expect(r.lead.r).toBeLessThan(-0.6);
    expect(r.pLead).toBeLessThan(0.001);
    expect(Math.abs(r.lag.r)).toBeLessThan(0.35);
  });
  it("prewhitening removes a steady trend", () => {
    const m = new Map(Array.from({ length: 40 }, (_, i) => [2000 + i, 0.02] as [number, number]));
    expect([...prewhiten(m).values()].every((v) => Math.abs(v) < 1e-12)).toBe(true);
  });
});

describe("dataset", () => {
  it("excludes duplicates from the scan", () => {
    const u = uniqueSeries();
    expect(u.length).toBeLessThan(SCANNER.series.length);
    expect(u.every((s) => !s.dup)).toBe(true);
    const keys = new Set(SCANNER.series.map((s) => s.k));
    for (const s of SCANNER.series) if (s.dup) expect(keys.has(s.dup)).toBe(true);
  });
  it("crisis years include the wars and the 1990s depression", () => {
    const c = crisisYears("a");
    for (const y of [1918, 1945, 1991, 2009]) expect(c).toContain(y);
    expect(c).not.toContain(2015);
  });
  it("numbers quoted in docs/skanneri.md", () => {
    const tfr = byKey("gapminder.finland.children_per_woman_total_fertility.v20261026")!;
    const res = scanTarget(tfr, "m", 2, new Set(crisisYears("a")));
    const women = res.find((r) => r.s.k === "nordics.unemployment_rate_25_34_women_1990_2024")!;
    expect(women.r).toBeCloseTo(-0.58, 2);
    expect(women.k).toBe(2);
    expect(status(women.pLead, women.qLead)).toBe("heikko");
  });
  it("episode comparison only lists series that cover both periods", () => {
    const c = compareEpisodes("a", 1991, 2009);
    for (const s of [...c.onlyA, ...c.onlyB, ...c.both]) {
      expect(s.y0).toBeLessThanOrEqual(1990);
      expect(s.y0 + s.f.length - 1).toBeGreaterThanOrEqual(2008);
    }
  });
});
