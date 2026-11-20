import { describe, it, expect } from "vitest";
import { radarLayout, sensorHits, R, timeDepths, nextStep } from "./radar";
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
  it("time slider: consequences never step back in time, backgrounds never forward", () => {
    const ns = [n("w", 1914), n("old", 1860), n("new", 1995), n("mid", 1918)];
    const es: MapEdge[] = [
      { from: "w", to: "mid", type: "causes", rationale: "", pressure: false },
      { from: "mid", to: "old", type: "expanded_into", rationale: "", pressure: false },
      { from: "mid", to: "new", type: "causes", rationale: "", pressure: false },
    ];
    const down = timeDepths("w", ns, es, "down");
    expect(down.get("new")).toBe(2);
    expect(down.has("old")).toBe(false);
    const p = radarLayout(ns, es, "w", 10);
    expect(p.get("mid")!.hop).toBe(1);
    expect(p.get("new")!.hop).toBe(null);
  });
  it("year window: consequence 81 years later appears only when slider reaches +100 v", () => {
    const ns = [n("w", 1914), n("mid", 1918), n("new", 1995)];
    const es: MapEdge[] = [
      { from: "w", to: "mid", type: "causes", rationale: "", pressure: false },
      { from: "mid", to: "new", type: "causes", rationale: "", pressure: false },
    ];
    expect(radarLayout(ns, es, "w", 50).get("new")!.hop).toBe(null);
    expect(radarLayout(ns, es, "w", 100).get("new")!.hop).toBe(2);
  });
  it("playback loops from farthest consequences back to deepest backgrounds", () => {
    expect(nextStep(100)).toBe(-100);
    expect(nextStep(-5)).toBe(0);
  });
});

import { stepToAngle, angleToStep } from "./radar";
describe("360° time dial", () => {
  it("puts −100 v at the top and the phenomenon (0 v) at the bottom", () => {
    expect(Math.sin(stepToAngle(-100))).toBeCloseTo(-1);
    expect(Math.sin(stepToAngle(0))).toBeCloseTo(1);
    expect(Math.cos(stepToAngle(-50))).toBeCloseTo(-1); // left side = past
  });
  it("round-trips angle ↔ years", () => {
    for (const s of [-99, -37, 0, 20, 99]) expect(angleToStep(stepToAngle(s))).toBe(s);
  });
});
