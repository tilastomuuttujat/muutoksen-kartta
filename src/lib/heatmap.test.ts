import { describe, expect, it } from "vitest";
import { EARLY, heatGrid } from "./heatmap";
import type { MapNode } from "./system-map";

const n = (id: string, year: number): MapNode => ({
  id,
  title: id,
  year,
  type: "",
  domains: ["talous"],
  importance: 3,
  problem: "",
  effect: "",
});

describe("heatGrid", () => {
  it("counts recorded phenomena per decade cell", () => {
    const g = heatGrid([n("a", 1991), n("b", 1995), n("c", 2003)]);
    expect(g.decades.at(0)).toBe(1850);
    expect(g.decades.at(-1)).toBe(2000);
    expect(g.cells.get("0:1990")!.count).toBe(2);
    expect(g.cells.get("0:2000")!.count).toBe(1);
    expect(g.max).toBe(2);
    expect(g.decadeTotals.get(1990)).toBe(2);
  });
  it("puts approximate pre-1850 starts in one shared column", () => {
    const g = heatGrid([n("a", 1800), n("b", 1809), n("c", 1900)]);
    expect(g.decades[0]).toBe(EARLY);
    expect(g.cells.get(`0:${EARLY}`)!.count).toBe(2);
  });
});
