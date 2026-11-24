import { describe, expect, it } from "vitest";
import { NORDIC, PHENOMENA, byVerdict, decompose, series, valueAt } from "./selitykset";

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
