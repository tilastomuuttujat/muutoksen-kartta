import { describe, it, expect } from "vitest";
import { radarLayout, sensorHits, R } from "./radar";
import type { MapNode, MapEdge } from "./system-map";

const n = (id: string, year: number): MapNode => ({ id, title: id, year, type: "kriisi", domains: ["talous"], importance: 3, problem: "", effect: "" });
const nodes = [n("a", 2020), n("b", 1900), n("c", 1990), n("d", 1950)];
const edges: MapEdge[] = [
  { from: "a", to: "c", type: "causes", rationale: "", pressure: true },
  { from: "c", to: "d", type: "enables", rationale: "", pressure: false },
];

describe("radar", () => {
  it("rest: older phenomena sit farther from the present-day center", () => {
    const p = radarLayout(nodes, edges);
    expect(p.get("b")!.r).toBeGreaterThan(p.get("a")!.r);
  });
  it("scan: focus at center, direct links on the inner ring, unreachable on the rim", () => {
    const p = radarLayout(nodes, edges, "c");
    expect(p.get("c")!.r).toBe(0);
    expect(p.get("a")!.hop).toBe(1);
    expect(p.get("b")!.hop).toBeNull();
    expect(p.get("b")!.r).toBeGreaterThan(p.get("a")!.r);
    expect(p.get("b")!.r).toBeGreaterThan(R * 0.9);
  });
  it("heat sensor detects only nodes touching pressure links", () => {
    expect([...sensorHits("lampo", nodes, edges)].sort()).toEqual(["a", "c"]);
  });
});

import { isMainline as _ml } from "./radar";
import { test as _t, expect as _e } from "vitest";
_t("main line keeps direct links and only major farther ones", () => {
  _e(_ml(1, 1)).toBe(true);
  _e(_ml(2, 3)).toBe(false);
  _e(_ml(2, 4)).toBe(true);
  _e(_ml(3, 4)).toBe(false);
  _e(_ml(3, 5)).toBe(true);
  _e(_ml(null, 5)).toBe(false);
});

import { placeLabels } from "./radar";
describe("placeLabels", () => {
  it("never overlaps and keeps the more important label", () => {
    const out = placeLabels(Array.from({ length: 8 }, (_, i) => ({ id: "n" + i, x: 10, y: 0, text: "Pitkä nimike", importance: i === 3 ? 5 : 1 })));
    expect(out[0]?.id).toBe("n3");
    expect(out.length).toBe(5);
    const ys = out.map((o) => o.y);
    expect(new Set(ys).size).toBe(ys.length);
  });
});
