import { describe, expect, it } from "vitest";
import { layerShares, typical, wavePeak, type ScanSeries } from "./reflections";

const s = (k: string, lane: string, f: string, dup?: string): ScanSeries => ({ k, t: k, lane, y0: 2000, v: [], f, ...(dup ? { dup } : {}) });

describe("layerShares", () => {
  const all = [
    s("a", "X", ".a00"), s("b", "X", ".000"), s("c", "X", ".t00"), s("d", "X", ".0b0"), s("e", "X", ".000"),
    s("f", "X", ".aaa", "a"), s("g", "Y", ".aaa"),
  ];
  const rows = layerShares(all, ["X"], 2000, 2003);
  it("counts anomalies and turns, skipping duplicates and other lanes", () => {
    expect(rows[1]).toEqual({ year: 2001, n: 5, hits: 2, share: 0.4 });
    expect(rows[2]!.share).toBe(0.2);
  });
  it("ignores years without a change", () => expect(rows[0]!.n).toBe(0));
  it("finds the crisis peak and the typical level", () => {
    expect(wavePeak(rows, 2001, 2001, 2)!.year).toBe(2001);
    expect(typical(rows)).toBe(0.2);
  });
});
