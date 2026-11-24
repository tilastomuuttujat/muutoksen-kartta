import { describe, expect, it } from "vitest";
import { NORDIC, PHENOMENA, byVerdict, currentBeat, decompose, pointsUntil, revealedExplanations, series, valueAt } from "./selitykset";

describe("decompose", () => {
  it("splits a change into shares that sum to one", () => {
    const d = decompose([
      { label: "a", from: 1, to: 0.5 },
      { label: "b", from: 1, to: 0.75 },
    ]);
    expect(d.total).toBeCloseTo(-0.75);
    expect(d.parts.reduce((s, p) => s + p.share, 0)).toBeCloseTo(1);
    expect(d.parts[0]!.share).toBeCloseTo(2 / 3);
  });
});

describe("byVerdict", () => {
  it("puts supported explanations first and untested last", () => {
    const order = byVerdict(PHENOMENA[0]!.explanations).map((e) => e.verdict);
    expect(order[0]).toBe("sopii");
    expect(order.at(-1)).toBe("ei-testattu");
  });
});

describe("numbers quoted in the text match the data", () => {
  const tfr = series("Hedelmällisyysluku");
  const emp = series("Työllisyysaste 15–64");
  it("fertility 2010, 2015, 2019, 2024", () => {
    expect(valueAt(tfr, 2010)).toBeCloseTo(1.87, 2);
    expect(valueAt(tfr, 2015)).toBeCloseTo(1.65, 2);
    expect(valueAt(tfr, 2019)).toBeCloseTo(1.35, 2);
    expect(valueAt(tfr, 2024)).toBeCloseTo(1.25, 2);
  });
  it("employment rate 2015 and 2019", () => {
    expect(valueAt(emp, 2015)).toBeCloseTo(67.1, 1);
    expect(valueAt(emp, 2019)).toBeCloseTo(71.6, 1);
  });
  it("Nordic fertility 2010 and 2024", () => {
    const v = (geo: string, y: number) => valueAt(NORDIC.countries.find((c) => c.geo === geo)!.values, y);
    expect(v("SE", 2010)).toBeCloseTo(1.98, 2);
    expect(v("SE", 2024)).toBeCloseTo(1.43, 2);
    expect(v("NO", 2024)).toBeCloseTo(1.45, 2);
    expect(v("DK", 2024)).toBeCloseTo(1.47, 2);
    expect(v("IS", 2010)).toBeCloseTo(2.2, 2);
    expect(v("IS", 2024)).toBeCloseTo(1.56, 2);
  });
  it("mother's age at first birth", () => {
    const age = series("statfin.synt.mother_age_first");
    expect(valueAt(age, 2010)).toBeCloseTo(28.3, 1);
    expect(valueAt(age, 2025)).toBeCloseTo(30.5, 1);
  });
});

describe("timeline", () => {
  const ph = PHENOMENA[0]!;
  it("every beat points to an existing explanation and every explanation gets a beat", () => {
    const ids = new Set(ph.explanations.map((e) => e.id));
    const beatIds = ph.beats.flatMap((b) => (b.explanation ? [b.explanation] : []));
    for (const id of beatIds) expect(ids.has(id)).toBe(true);
    for (const id of ids) expect(beatIds).toContain(id);
  });
  it("beats are in time order", () => {
    const ats = ph.beats.map((b) => b.at);
    expect([...ats].sort((a, b) => a - b)).toEqual(ats);
  });
  it("reveals explanations as time passes", () => {
    expect(revealedExplanations(ph.beats, 2009)).toHaveLength(0);
    expect(revealedExplanations(ph.beats, 2010.5).map((r) => r.id)).toEqual(["pohjoismaat"]);
    expect(revealedExplanations(ph.beats, 2025)).toHaveLength(ph.explanations.length);
  });
  it("current beat is the latest one started", () => {
    expect(currentBeat(ph.beats, 2017.4)?.at).toBe(2016);
    expect(currentBeat(ph.beats, 1999)).toBeNull();
  });
  it("interpolates the tip of a growing line", () => {
    expect(pointsUntil([[2000, 1], [2001, 2], [2002, 4]], 2001.5)).toEqual([[2000, 1], [2001, 2], [2001.5, 3]]);
    expect(pointsUntil([[2000, 1], [2001, 2]], 2001)).toEqual([[2000, 1], [2001, 2]]);
  });
});
