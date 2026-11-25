import { describe, expect, it } from "vitest";
import { scanLegacy, scanAll, opposing } from "./legacy-scan";
import { SCANNER } from "./scanner";
import type { ScanSeries } from "./scanner";
const w = { start: 2005, shock: 2008, end: 2012 };
const make = (tail: number, lane = "A"): ScanSeries => ({
  k: lane,
  t: lane,
  u: "x",
  lane,
  theme: "",
  y0: 1995,
  v: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 14, 13, 12, tail],
  f: "",
});
describe("legacy scanner", () => {
  it("distinguishes return, persistence and crossing", () => {
    expect(scanLegacy(make(10), w)?.kind).toBe("returned");
    expect(scanLegacy(make(17), w)?.kind).toBe("continued");
    expect(scanLegacy(make(8), w)?.kind).toBe("crossed");
    expect(scanLegacy(make(13), w)?.kind).toBe("remaining");
  });
  it("rejects missing anchors, duplicate rows and invalid windows", () => {
    const s = make(10);
    s.v[13] = null;
    expect(scanLegacy(s, w)).toBeNull();
    expect(scanAll([{ ...make(10), dup: "x" }], w)).toEqual([]);
    expect(scanLegacy(make(10), { ...w, end: 2007 })).toBeNull();
  });
  it("finds opposite net changes in different lanes", () => {
    const a = scanLegacy(make(17), w)!;
    const b = scanLegacy(make(7, "B"), w)!;
    expect(opposing(a, [a, b])).toEqual([b]);
  });
  it("works with real data", () => {
    const rows = scanAll(SCANNER.series, {
      start: 2007,
      shock: 2009,
      end: 2019,
    });
    expect(rows.length).toBeGreaterThan(30);
    expect(rows.every((r) => Number.isFinite(r.residual))).toBe(true);
  });
});
