import { describe, it, expect } from "vitest";
import { spineOf, constellationOf, dockOf, junctions, activeSegment, synthesis } from "./star-path";
import type { MapNode, MapEdge } from "./system-map";

const n = (id: string, year: number, importance: number): MapNode => ({ id, title: id, year, type: "", domains: [], importance, problem: "", effect: "" });
const nodes = [n("s1", 1900, 5), n("s2", 1950, 5), n("s3", 2000, 5), n("a", 1945, 3), n("b", 1948, 4), n("c", 1990, 3)];
const e = (from: string, to: string): MapEdge => ({ from, to, type: "causes", rationale: "", pressure: false });
const edges = [e("a", "b"), e("b", "c"), e("s2", "c"), e("c", "s3")];

describe("star path", () => {
  it("spine holds only the most significant phenomena in time order", () => {
    expect(spineOf(nodes).map((x) => x.id)).toEqual(["s1", "s2", "s3"]);
  });
  it("constellation = phenomenon plus direct causes and effects", () => {
    expect([...constellationOf("b", edges)].sort()).toEqual(["a", "b", "c"]);
  });
  it("off-spine constellation docks via its most important star to the nearest spine star", () => {
    expect(dockOf("a", constellationOf("a", edges), nodes, spineOf(nodes))).toEqual({ key: "b", spine: "s2", direct: false });
  });
  it("constellation containing a spine star docks directly", () => {
    expect(dockOf("c", constellationOf("c", edges), nodes, spineOf(nodes))?.direct).toBe(true);
  });
  it("junctions are stars shared by two constellations", () => {
    expect([...junctions([constellationOf("a", edges), constellationOf("c", edges)])]).toEqual(["b"]);
  });
  it("active segment spans between docks", () => {
    expect(activeSegment(spineOf(nodes), ["s3", "s1"])).toEqual(["s1", "s2", "s3"]);
  });
  it("synthesis needs support from at least two constellations", () => {
    const r = synthesis([new Set(["a"]), new Set(["c"])], { a: ["k1", "k2"], c: ["k1"] });
    expect(r).toEqual([{ id: "k1", count: 2 }]);
  });
});
