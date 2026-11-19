import { describe, expect, it } from "vitest";
import { chainOf, isPressure, laneOf, type MapEdge } from "./system-map";

const e = (from: string, to: string, type = "enabled"): MapEdge => ({ from, to, type, rationale: "", pressure: false });

describe("system map", () => {
  it("clicking a node lights up its causes and effects but not side branches", () => {
    const edges = [e("a", "b"), e("b", "c"), e("c", "d"), e("x", "c"), e("b", "y")];
    const ch = chainOf("c", edges);
    expect([...ch.up].sort()).toEqual(["a", "b", "x"]);
    expect([...ch.down]).toEqual(["d"]);
    expect(ch.nodes.has("y")).toBe(false);
  });
  it("pressure links are recognised", () => {
    expect(isPressure(e("a", "b", "created_pressure_for"))).toBe(true);
    expect(isPressure(e("a", "b", "enabled"))).toBe(false);
  });
  it("unknown domains fall to the last lane", () => {
    expect(laneOf(["työ"])).toBe(1);
    expect(laneOf(["kulttuuri"])).toBe(4);
  });
});

import { layerOf, layout3d } from "./system-map";
describe("layered 2.5D view", () => {
  it("crises sit on the surface, reforms in the middle, structural change at the bottom", () => {
    expect(layerOf("kriisi")).toBe(0);
    expect(layerOf("uudistus")).toBe(1);
    expect(layerOf("rakennemuutos")).toBe(2);
  });
  it("deeper layers are drawn lower on screen", () => {
    const n = (id: string, type: string) => ({ id, title: id, year: 1950, type, domains: ["työ"], importance: 3, problem: "", effect: "" });
    const p = layout3d([n("a", "kriisi"), n("b", "rakennemuutos")]);
    expect(p.get("b")!.y).toBeGreaterThan(p.get("a")!.y);
  });
});

import { applyLens } from "./system-map";
describe("applyLens", () => {
  const mk = (id: string, type: string, role = "") => ({ id, title: id, year: 1900, type, domains: [], importance: 2, problem: "", effect: "", role });
  const ns = [mk("a", "kriisi"), mk("b", "uudistus"), mk("c", "kriisi", "toimeenpanolukko")];
  const es = [{ from: "a", to: "c", type: "x", rationale: "", pressure: false }, { from: "a", to: "b", type: "x", rationale: "", pressure: true }];
  it("crisis lens keeps only crises and edges between them", () => {
    const r = applyLens("kriisit", ns, es)!;
    expect([...r.nodes].sort()).toEqual(["a", "c"]);
    expect(r.edges.size).toBe(1);
  });
  it("lock lens uses role", () => expect(applyLens("lukot", ns, es)!.nodes.has("c")).toBe(true));
  it("pressure lens keeps pressure edges and their endpoints", () => expect([...applyLens("lukot", ns, es)!.nodes].sort()).toEqual(["a", "b", "c"]));
});
describe("hub lens", () => {
  it("picks the most connected nodes", () => {
    const es = Array.from({ length: 30 }, (_, i) => ({ from: "hub", to: `n${i}`, type: "x", rationale: "", pressure: false }));
    expect(applyLens("kantavat", [], es)!.nodes.has("hub")).toBe(true);
  });
});

import { layerModel } from "./system-map";
describe("layer models", () => {
  const n = (type: string, domains: string[], role = "") => ({ id: "x", title: "x", year: 1950, type, domains, importance: 1, problem: "", effect: "", role });
  it("everyday vs engine room puts schooling on top and exports at the bottom", () => {
    expect(layerModel("arki").of(n("uudistus", ["koulutus"]))).toBe(0);
    expect(layerModel("arki").of(n("uudistus", ["vienti"]))).toBe(2);
    expect(layerModel("arki").of(n("uudistus", ["oikeusvaltio"]))).toBe(1);
  });
  it("decision arc: crises are pressures, reforms solutions, lock-ins consequences", () => {
    expect(layerModel("kaari").of(n("kriisi", []))).toBe(0);
    expect(layerModel("kaari").of(n("uudistus", []))).toBe(1);
    expect(layerModel("kaari").of(n("uudistus", [], "toimeenpanolukko"))).toBe(2);
  });
});

import { searchNodes, pushTrail, edgeReason } from "./system-map";
describe("usability helpers", () => {
  const mk = (id: string, title: string, year: number, importance = 1) => ({ id, title, year, type: "kriisi", domains: [], importance, problem: "", effect: "" });
  const ns = [mk("a", "1990-luvun lama", 1991, 5), mk("b", "Peruskoulu-uudistus", 1968, 4), mk("c", "Suuri lama", 1930, 3)];
  it("search matches title start first", () => expect(searchNodes("lama", ns).map((n) => n.id)).toEqual(["a", "c"]));
  it("search by year finds nearby events", () => expect(searchNodes("1970", ns)[0]!.id).toBe("b"));
  it("trail cuts back when revisiting", () => expect(pushTrail(["a", "b", "c"], "b")).toEqual(["a", "b"]));
  it("edge reason works both directions", () => expect(edgeReason("y", "x", [{ from: "x", to: "y", type: "", rationale: "syy", pressure: false }])).toBe("syy"));
});
import { resolveStarts } from "./system-map";
it("1990s depression start skips the 1930s one", () => {
  const mk = (id: string, title: string, year: number) => ({ id, title, year, type: "", domains: [], importance: 5, problem: "", effect: "" });
  expect(resolveStarts([mk("a", "1930-luvun lama", 1930), mk("b", "Lama ja pankkikriisi", 1991)])[0]!.node!.id).toBe("b");
});

import { chainDepths, waveDelay } from "./system-map";
describe("impulse wave", () => {
  const E = [{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "z", to: "a" }] as any;
  it("effects light up in hop order after the focus", () => {
    const d = chainDepths("a", E);
    expect(d.down.get("c")).toBe(2);
    expect(waveDelay("a", d, 100)).toBe(50);
    expect(waveDelay("b", d, 100)).toBe(150);
    expect(waveDelay("c", d, 100)).toBe(250);
    expect(waveDelay("z", d, 100)).toBe(0);
  });
});

import { chainWeight as cw, chainDepths as cd } from "./system-map";
describe("chainWeight", () => {
  const edges = [{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "d" }].map((e) => ({ ...e, type: "", rationale: "", pressure: false }));
  const dp = cd("a", edges);
  it("focus is full, direct important effect is full", () => { expect(cw("a", dp, 1)).toBe(1); expect(cw("b", dp, 5)).toBe(1); });
  it("fades with distance and low importance", () => { expect(cw("c", dp, 5)).toBe(0.6); expect(cw("d", dp, 2)).toBe(0.15); expect(cw("b", dp, 2)).toBe(0.45); });
});

import { shouldLabel as sl } from "./system-map";
describe("shouldLabel", () => {
  const edges = [{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "d" }].map((e) => ({ ...e, type: "", rationale: "", pressure: false }));
  const dp = cd("a", edges);
  it("small chain labels every member, even distant low-importance ones", () => { expect(sl("d", dp, 1, 3)).toBe(true); });
  it("large chain keeps direct neighbours but drops distant minor ones", () => { expect(sl("b", dp, 1, 40)).toBe(true); expect(sl("d", dp, 1, 40)).toBe(false); });
});
