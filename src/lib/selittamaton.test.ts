import { describe, expect, it } from "vitest";
import { PUZZLE_KEYS, SELITTAMATON, finlandRank, predictive, remaining, shown, sortedRows } from "./selittamaton";

const P = SELITTAMATON.puzzles;

describe("selittämätön", () => {
  it("residuals are observed minus leave-one-out prediction", () => {
    for (const k of PUZZLE_KEYS) for (const r of P[k].rows) expect(r.res).toBeCloseTo(r.y - r.pred, 3);
  });
  it("unexplained share is 1 − LOO R²", () => {
    for (const k of PUZZLE_KEYS) expect(P[k].unexplained).toBeCloseTo(1 - P[k].looR2, 3);
  });
  it("numbers quoted in docs/selittamaton.md", () => {
    const s = P.syntyvyys;
    expect([s.n, s.dropped.length, s.looR2, s.fitR2]).toEqual([16, 14, -1.15, 0.538]);
    expect(Math.round(shown("syntyvyys", s.finland!.y))).toBe(-33);
    expect([s.finland!.res, s.finland!.rankFromLowest, s.finland!.z]).toEqual([-0.199, 4, -0.85]);
    expect(Math.round(shown("syntyvyys", s.commonGap!.value))).toBe(-13);
    expect(s.candidates.map((c) => c.verdict)).toEqual(["ei yhteyttä", "ei yhteyttä", "ei yhteyttä"]);
    const k6 = s.sensitivityNoK6!;
    expect([k6.n, k6.looR2]).toEqual([24, -0.093]);
    expect([k6.finland.rankFromLowest, k6.finland.z]).toEqual([3, -1.37]);
    expect(k6.candidates[1]).toMatchObject({ id: "C2", verdict: "väärä suunta", rho: 0.477, q: 0.0561 });

    const u = P.tyottomyys;
    expect([u.n, u.looR2, u.fitR2]).toEqual([36, -0.179, 0.18]);
    expect(u.finland!.z).toBe(0.02);
    expect(remaining(u)).toHaveLength(0);

    const v = P.velka;
    expect([v.n, v.dropped.length, v.looR2]).toEqual([19, 9, 0.16]);
    expect([v.finland!.y, v.finland!.pred, v.finland!.res]).toEqual([15.93, -20.875, 36.805]);
    expect(sortedRows(v).slice(-3).map((r) => r.geo)).toEqual(["FI", "LU", "MT"]);
    expect(remaining(v).map((c) => c.id)).toEqual(["C2"]);
    expect(remaining(v)[0]).toMatchObject({ rho: 0.523, p: 0.024, q: 0.072, n: 19 });
  });
  it("second batch numbers quoted in docs/selittamaton.md", () => {
    const r = P.ruoka, j = P.jonot, t = P.tuet, d = P.puolustus;
    expect([r.n, r.looR2]).toEqual([28, 0.491]);
    expect([Math.round(r.finland!.y * 10) / 10, Math.round(r.finland!.pred * 10) / 10, r.finland!.z]).toEqual([8, 6, 0.24]);
    expect(finlandRank(r)!.fromBottom).toBe(18);
    expect([j.n, j.dropped.length, j.looR2]).toEqual([18, 9, -1]);
    expect([j.finland!.y, Math.round(j.finland!.pred * 10) / 10, j.finland!.z]).toEqual([2.36, 0.6, 0.77]);
    expect(finlandRank(j)!.fromTop).toBe(3);
    expect([...j.rows].sort((a, b) => b.y - a.y).slice(0, 2).map((x) => x.geo)).toEqual(["EE", "FI"]);
    expect([t.n, t.looR2, t.finland!.y, t.finland!.z]).toEqual([27, 0.438, 9.78, 0.64]);
    expect(t.candidates[1]).toMatchObject({ id: "C2", rho: 0.382, verdict: "ei yhteyttä" });
    expect([d.n, d.looR2, d.finland!.z]).toEqual([29, 0.619, -0.8]);
    expect([Math.round(d.finland!.y * 100) / 100, Math.round(d.finland!.pred * 100) / 100]).toEqual([1.27, 1.54]);
    expect(finlandRank(d)!.fromBottom).toBe(4);
    for (const k of ["ruoka", "jonot", "tuet", "puolustus"] as const) expect(remaining(P[k])).toHaveLength(0);
  });
  it("third batch (inside Finland) numbers quoted in docs/selittamaton.md", () => {
    const I = SELITTAMATON.inside;
    const m = I.jonot.medical, d = I.jonot.dental;
    expect([m.class, d.class]).toEqual(["pienituloisten jonot", "pienituloisten jonot"]);
    expect((["QU1", "QU2", "QU3", "QU4", "QU5"] as const).map((q) => [m.rows[q].change, m.rows[q].when])).toEqual([[3, 2012], [3.5, 2016], [2.8, 2016], [1.18, 2012], [1.4, 2022]]);
    expect((["QU1", "QU2", "QU3", "QU4", "QU5"] as const).map((q) => d.rows[q].when)).toEqual([2011, 2017, 2016, 2019, 2023]);
    expect(m.rows.QU1.change).toBeGreaterThanOrEqual(2 * m.rows.QU5.change);
    const n = m.no2008!;
    expect(n.class).toBe("pienituloisten jonot");
    expect((["QU1", "QU2", "QU3", "QU4", "QU5"] as const).map((q) => [n.rows[q].change, n.rows[q].when])).toEqual([[1.98, 2022], [2.65, 2020], [2.12, 2019], [0.48, 2024], [0.97, 2023]]);
    expect([d.no2008!.rows.QU1.change, d.no2008!.rows.QU5.change]).toEqual([1.93, 0.15]);
    const r = I.ruoka;
    expect([r.u2000, r.u2008, r.u2010, r.uPct]).toEqual([9.8, 6.4, 8.4, -34.7]);
    expect(r.series.map((x) => [x.class, x.pct, x.crisisPct])).toEqual([["pysyvä", 135, 35.5], ["välimuoto", -18.9, 46.4]]);
    expect(r.series[1]!.m).toBeGreaterThan(r.u / 2);
    const mi = I.mieli;
    expect([mi.class, mi.othersAccelerating]).toEqual(["ei kiihtymistä Suomessa", 0]);
    expect([mi.countries.FI.g1, mi.countries.FI.g2, mi.countries.FI.g3]).toEqual([0.0667, 0.0137, 0.0419]);
    for (const c of ["FI", "SE", "NO", "DK"] as const) expect(mi.countries[c].g3).toBeGreaterThan(mi.countries[c].g2);
    const gp = (g: number) => Math.round((Math.exp(g) - 1) * 1000) / 10;
    expect([gp(mi.countries.FI.g1), gp(mi.countries.FI.g2), gp(mi.countries.FI.g3), gp(mi.countries.DK.g1)]).toEqual([6.9, 1.4, 4.3, 9.1]);
    expect([gp(mi.youth["youth.mh_rehab_total_0_24"]!.g1019!), gp(mi.youth["youth.psychotherapy_18_24"]!.g1019!), gp(mi.youth["youth.psychiatric_wait_u23"]!.g19last!)]).toEqual([11.6, 11, 13.5]);
    expect([mi.youth["youth.mh_rehab_total_0_24"]!.g1019, mi.youth["youth.psychotherapy_18_24"]!.g1019, mi.youth["youth.psychiatric_wait_u23"]!.g19last]).toEqual([0.11, 0.1043, 0.1262]);
  });
  it("finland is the largest fertility decline among included countries", () => {
    const s = P.syntyvyys;
    expect([...s.rows].sort((a, b) => a.y - b.y)[0]!.geo).toBe("FI");
  });
  it("interpretation", () => {
    expect(predictive(-0.2)).toContain("huonommin kuin pelkkä keskiarvo");
    expect(predictive(0.16)).toContain("16 %");
  });
});
