import { describe, expect, it } from "vitest";
import { MITAJOS, SITUATIONS, eventData, rankReliability, recipe, standoutSpans, valueAt } from "./mitajos";

describe("data", () => {
  it("every situation has data and vice versa", () => {
    expect(SITUATIONS.map((s) => s.id).sort()).toEqual(MITAJOS.events.map((e) => e.id).sort());
  });
  it("synthetic weights sum to about one", () => {
    for (const e of MITAJOS.events) {
      const s = Object.values(e.weights).reduce((a, b) => a + b, 0);
      expect(s).toBeGreaterThan(0.95);
      expect(s).toBeLessThanOrEqual(1.001);
    }
  });
  it("reliability labels follow Finland's rank", () => {
    for (const s of SITUATIONS) expect(s.reliability === rankReliability(eventData(s.id)!) || s.id === "sota" || s.id === "finanssi").toBe(true);
    expect(rankReliability(eventData("sota")!)).toBe("heikko");
    expect(rankReliability(eventData("finanssi")!)).toBe("heikko");
  });
});

describe("numbers quoted in the text", () => {
  const gap = (id: string, y: number) => valueAt(eventData(id)!, "gap", y)!;
  it("famine", () => {
    expect(gap("nalka", 1868)).toBeCloseTo(-26.8, 1);
    expect(gap("nalka", 1869)).toBeGreaterThan(0);
  });
  it("civil war", () => {
    expect(gap("1918", 1918)).toBeCloseTo(-22.1, 1);
    expect(gap("1918", 1921)).toBeGreaterThan(0);
    expect(gap("1918l", 1918)).toBeCloseTo(-12.66, 2);
    expect(Math.abs(gap("1918l", 1921))).toBeLessThan(0.5);
  });
  it("wars 1939–44 stay within −9…+11 %", () => {
    const g = eventData("sota")!.gap.slice(MITAJOS.pre);
    expect(Math.min(...g)).toBeCloseTo(-8.65, 2);
    expect(Math.max(...g)).toBeCloseTo(11.05, 2);
    expect(eventData("sota")!.weights["swe"]).toBeCloseTo(0.953, 3);
  });
  it("post-war catch-up, health turn, 1990s depression, 2008", () => {
    expect(gap("jalleen", 1960)).toBeCloseTo(16, 0);
    expect(gap("terveys", 1982)).toBeCloseTo(1.18, 2);
    expect(gap("lama", 1993)).toBeCloseTo(-14.1, 1);
    expect(gap("lama", 2000)).toBeCloseTo(-7.3, 1);
    expect(gap("finanssi", 2008)).toBeCloseTo(7.1, 1);
    expect(gap("finanssi", 2015)).toBeCloseTo(-5.3, 1);
  });
});

describe("helpers", () => {
  it("recipe lists the largest weight first", () => {
    expect(recipe(eventData("1918")!).startsWith("56 % Tanska")).toBe(true);
  });
  it("standout spans join consecutive years", () => {
    const s = standoutSpans("lex");
    expect(s.some((x) => x.from <= 1868 && x.to >= 1866)).toBe(true);
    expect(s.some((x) => x.from <= 1972 && x.to >= 1968)).toBe(true);
    for (const x of s) expect(x.to).toBeGreaterThanOrEqual(x.from);
  });
});
