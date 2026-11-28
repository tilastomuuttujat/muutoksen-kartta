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
  it("finland is the largest fertility decline among included countries", () => {
    const s = P.syntyvyys;
    expect([...s.rows].sort((a, b) => a.y - b.y)[0]!.geo).toBe("FI");
  });
  it("interpretation", () => {
    expect(predictive(-0.2)).toContain("huonommin kuin pelkkä keskiarvo");
    expect(predictive(0.16)).toContain("16 %");
  });
});
