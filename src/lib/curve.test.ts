import { describe, expect, it } from "vitest";
import { monotonePath, runs } from "./curve";

const nums = (d: string) => d.match(/-?\d+(\.\d+)?/g)!.map(Number);

describe("curve", () => {
  it("never overshoots the data between points", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 10 },
      { x: 30, y: 0 },
    ];
    const ys = nums(monotonePath(pts)).filter((_, i) => i % 2 === 1);
    expect(Math.max(...ys)).toBeLessThanOrEqual(10);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
  });
  it("starts and ends at the data", () => {
    const d = monotonePath([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
    expect(d.startsWith("M1,2")).toBe(true);
    expect(d.endsWith("3,4")).toBe(true);
  });
  it("breaks at missing years", () => {
    expect(runs([{ year: 1 }, { year: 2 }, { year: 4 }]).map((r) => r.length)).toEqual([2, 1]);
  });
});
