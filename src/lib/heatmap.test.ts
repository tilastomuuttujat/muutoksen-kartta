import { describe, expect, it } from "vitest";
import { heatGrid } from "./heatmap";
import type { MapNode } from "./system-map";

const n = (id: string, year: number, importance: number): MapNode => ({ id, title: id, year, type: "", domains: ["talous"], importance, problem: "", effect: "" });

describe("heatGrid", () => {
  it("sums importance and pressure edges per decade cell", () => {
    const g = heatGrid([n("a", 1991, 5), n("b", 1995, 2), n("c", 2003, 1)], [{ from: "a", to: "c", type: "x", rationale: "", pressure: true }]);
    expect(g.decades).toEqual([1990, 2000]);
    expect(g.cells.get("0:1990")!.heat).toBe(8);
    expect(g.cells.get("0:2000")!.heat).toBe(2);
    expect(g.max).toBe(8);
  });
});
