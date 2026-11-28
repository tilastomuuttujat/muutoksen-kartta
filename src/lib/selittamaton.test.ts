import { describe, expect, it } from "vitest";
import { PUZZLE_KEYS, SELITTAMATON, predictive, remaining, shown, sortedRows } from "./selittamaton";

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
  it("finland is the largest fertility decline among included countries", () => {
    const s = P.syntyvyys;
    expect([...s.rows].sort((a, b) => a.y - b.y)[0]!.geo).toBe("FI");
  });
  it("interpretation", () => {
    expect(predictive(-0.2)).toContain("huonommin kuin pelkkä keskiarvo");
    expect(predictive(0.16)).toContain("16 %");
  });
});
