import { describe, expect, it } from "vitest";
import { AGES, STATES, crossingAge, markerSeries, peak } from "./lifecourse";

describe("crossingAge", () => {
  const ages = [20, 21, 22, 23];
  it("interpolates a falling share through the threshold", () => {
    expect(crossingAge([80, 60, 40, 20], ages, "falls")).toBeCloseTo(21.5);
  });
  it("interpolates a rising share", () => {
    expect(crossingAge([10, 30, 70, 90], ages, "rises")).toBeCloseTo(21.5);
  });
  it("returns null when the share never crosses", () => {
    expect(crossingAge([10, 20, 30, 40], ages, "rises")).toBeNull();
  });
  it("skips missing values", () => {
    expect(crossingAge([60, null, 40, 30], ages, "falls")).toBeNull();
  });
});

describe("peak", () => {
  it("finds the age with the highest share", () => {
    expect(peak([5, 30, 20, null], [20, 21, 22, 23])).toEqual({ age: 21, share: 30 });
  });
});

describe("lifecourse data", () => {
  it("has a share for every year and age", () => {
    for (const s of STATES) {
      expect(s.shares.kaikki).toHaveLength(s.years.length);
      for (const row of s.shares.kaikki) expect(row).toHaveLength(AGES.length);
    }
  });
  it("shares stay between 0 and 100", () => {
    for (const s of STATES)
      for (const row of s.shares.kaikki) for (const v of row) if (v != null) expect(v).toBeGreaterThanOrEqual(0), expect(v).toBeLessThanOrEqual(100);
  });
  it("finds a leaving-home age for every year", () => {
    const home = STATES.find((s) => s.key === "kotona")!;
    for (const p of markerSeries(home, "kaikki")) expect(p.age).not.toBeNull();
  });
});
