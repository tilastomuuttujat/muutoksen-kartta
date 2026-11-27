import { describe, expect, it } from "vitest";
import { SEULA, chaff, clean, funnel, grains, laneSummary, proposal } from "./seula";

describe("sieve output", () => {
  it("funnel never grows and grains beat chance in both designs", () => {
    for (const d of Object.values(SEULA.designs)) {
      const f = funnel(d).map((s) => s.n);
      for (let i = 1; i < f.length; i++) expect(f[i]).toBeLessThanOrEqual(f[i - 1]!);
      expect(d.counts.grains).toBeGreaterThan(d.chance.grains95);
      expect(grains(d)).toHaveLength(d.counts.grains);
    }
  });
  it("every grain passed every step", () => {
    for (const d of Object.values(SEULA.designs)) for (const r of grains(d)) {
      expect(r.q).toBeLessThan(SEULA.rules.q);
      expect(Math.sign(r.rC!)).toBe(Math.sign(r.rD));
      expect(r.pC!).toBeLessThan(SEULA.rules.alpha);
      expect(Math.abs(r.rRev ?? 0)).toBeLessThan(Math.abs(r.rC!));
    }
  });
  it("numbers quoted on the page", () => {
    const a = SEULA.designs.aika, m = SEULA.designs.maa;
    expect(a.counts.tested).toBe(26208);
    expect(a.counts.grains).toBe(34);
    expect(a.chance.grainsMean).toBeCloseTo(1.5, 1);
    expect(m.counts.tested).toBe(730);
    expect(m.counts.grains).toBe(6);
    expect(clean(grains(a)).length + clean(grains(m)).length).toBe(12);
    const tfr = grains(m).find((r) => r.y === "nordics.tfr_1950_2024")!;
    expect(m.meta[tfr.x]!.t).toContain("Työllisyysaste 30–34");
    expect(tfr.lag).toBe(2);
  });
  it("helpers", () => {
    const m = SEULA.designs.maa;
    expect(chaff(m).every((r) => r.status !== "jyva")).toBe(true);
    expect(laneSummary(grains(m), m.meta)[0]![1]).toBeGreaterThan(0);
    expect(proposal(grains(m)[0]!, m)).toContain("vuotta ennen");
  });
});
