import { describe, it, expect } from "vitest";
import { globePos, project, lerpAngle } from "./globe";
import type { MapNode } from "./system-map";
const n = (id: string, year: number): MapNode => ({ id, title: id, year, type: "x", domains: ["työ"], importance: 3, problem: "", effect: "" });

describe("globe", () => {
  it("rotating to a point brings it to the exact center front", () => {
    const g = globePos(n("a", 1914));
    const p = project(g.lat, g.lon, g.lat, g.lon);
    expect(p.x).toBeCloseTo(0); expect(p.y).toBeCloseTo(0); expect(p.z).toBeCloseTo(1);
  });
  it("older phenomena sit further south", () => {
    expect(globePos(n("a", 1860)).lat).toBeLessThan(globePos(n("a", 2020)).lat);
  });
  it("spins the short way around", () => {
    expect(lerpAngle(3, -3, 1)).toBeCloseTo(3 + (2 * Math.PI - 6));
  });
});
