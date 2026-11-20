import { describe, it, expect } from "vitest";
import { buildConstellations, clusterIndex, eraOf, linkStrength, railOf } from "./constellations";
import type { MapNode, MapEdge } from "./system-map";

const n = (id: string, year: number, importance: number, domains: string[]): MapNode => ({ id, title: id, year, type: "", domains, importance, problem: "", effect: "" });
const nodes = [n("a", 1866, 3, ["talous"]), n("b", 1880, 5, ["talous"]), n("c", 1960, 4, ["talous"]), n("d", 1970, 4, ["talous"])];
const e = (from: string, to: string): MapEdge => ({ from, to, type: "causes", rationale: "", pressure: false });
const edges = [e("a", "b"), e("b", "c"), e("a", "d"), e("c", "d")];

describe("constellations", () => {
  it("eras split at 1900, 1945 and 1990", () => {
    expect([1899, 1900, 1944, 1945, 1990].map(eraOf)).toEqual([0, 1, 1, 2, 3]);
  });
  it("every phenomenon belongs to exactly one constellation", () => {
    const cs = buildConstellations(nodes, edges);
    expect(cs.flatMap((c) => c.members).sort()).toEqual(["a", "b", "c", "d"]);
    expect(cs).toHaveLength(2);
  });
  it("key star is the most important member and lines stay inside", () => {
    const c = buildConstellations(nodes, edges)[0]!;
    expect(c.key).toBe("b");
    expect(c.lines).toEqual([["a", "b"]]);
  });
  it("link strength counts effects between constellations", () => {
    const cs = buildConstellations(nodes, edges), cl = clusterIndex(cs);
    expect(linkStrength(cs[0]!.id, cs[1]!.id, edges, cl)).toBe(2);
  });
  it("rail visits constellations in time order and merges repeats", () => {
    const cs = buildConstellations(nodes, edges), cl = clusterIndex(cs);
    const r = railOf("r", "teema", "t", "", ["d", "a", "b", "x"], nodes, edges, cl);
    expect(r.stops).toEqual([cs[0]!.id, cs[1]!.id]);
    expect(r.links).toEqual([2]);
  });
});
