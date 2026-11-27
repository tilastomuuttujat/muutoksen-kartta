import { describe, expect, it } from "vitest";
import { compareSeries } from "./difference";
import type { ScanSeries } from "./scanner";

const s = (y0: number, v: number[]): ScanSeries => ({ k: String(y0), t: "", u: "", lane: "", theme: "", y0, v, f: "0".repeat(v.length) });

describe("compareSeries", () => {
  it("uses only shared years", () => {
    const d = compareSeries(s(2000, [1, 2, 3, 4, 5, 6, 7]), s(2002, [1, 2, 3, 4, 5, 6, 7]))!;
    expect(d.years).toEqual([2002, 2003, 2004, 2005, 2006]);
  });
  it("finds the year of the largest gap and the crossing", () => {
    const d = compareSeries(s(2000, [0, 0, 0, 0, 0, 10]), s(2000, [0, 0, 0, 0, 0, 0]))!;
    expect(d.peak.year).toBe(2005);
    expect(d.peak.value).toBeLessThan(0);
    expect(d.crossings).toEqual([2005]);
  });
  it("returns null when too few shared years", () => {
    expect(compareSeries(s(2000, [1, 2, 3]), s(2000, [1, 2, 3]))).toBeNull();
  });
});
