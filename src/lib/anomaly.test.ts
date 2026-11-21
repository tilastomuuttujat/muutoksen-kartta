import { describe, expect, it } from "vitest";
import {
  assessed,
  episodes,
  explain,
  flag,
  quantile,
  referenceRange,
  type Indicator,
} from "./anomaly";
import type { MapNode } from "./system-map";

const ind = (values: [number, number][], over: Partial<Indicator> = {}): Indicator => ({
  key: "k",
  lane: "talous",
  name: "n",
  title: "t",
  unit: "",
  source: "",
  source_url: "",
  interpretation: "",
  transform: "level",
  reference: { kind: "history" },
  values,
  ...over,
});

describe("anomaly", () => {
  it("judges trending series by year-on-year change and skips gaps", () => {
    expect(
      assessed(
        ind(
          [
            [2000, 100],
            [2001, 110],
            [2003, 121],
          ],
          { transform: "pct" },
        ),
      ),
    ).toEqual([{ year: 2001, value: 10.000000000000009 }]);
    expect(
      assessed(
        ind(
          [
            [2000, 5],
            [2001, 7],
          ],
          { transform: "diff" },
        ),
      ),
    ).toEqual([{ year: 2001, value: 2 }]);
  });
  it("uses 5–95 % of own history unless an agreed limit or corridor is given", () => {
    expect(quantile([1, 2, 3, 4, 5], 0.5)).toBe(3);
    const values: [number, number][] = Array.from({ length: 21 }, (_, i) => [2000 + i, i]);
    const r = referenceRange(ind(values));
    expect(r.low).toBeCloseTo(1);
    expect(r.high).toBeCloseTo(19);
    const norm = referenceRange(
      ind(values, { reference: { kind: "norm", low: -3, high: null, label: "EU" } }),
    );
    expect(norm).toMatchObject({ low: -3, high: null, label: "Sovittu raja-arvo" });
    expect(flag(-4, norm)).toBe("low");
    expect(flag(100, norm)).toBe(null);
  });
  it("merges consecutive abnormal years into one episode", () => {
    const eps = episodes(
      [
        { year: 1990, value: 0 },
        { year: 1991, value: -6 },
        { year: 1992, value: -4 },
        { year: 1993, value: -2 },
        { year: 2009, value: -8 },
      ],
      { low: -3, high: 5, label: "", basis: "" },
    );
    expect(eps.map((e) => [e.start, e.end, e.dir, e.peak.year])).toEqual([
      [1991, 1992, "low", 1991],
      [2009, 2009, "low", 2009],
    ]);
  });
  it("separates confirmed, same-area candidates and coincident events", () => {
    const n = (
      id: string,
      year: number,
      domains: string[],
      type = "kriisi",
      importance = 5,
    ): MapNode => ({ id, title: id, year, type, domains, importance, problem: "", effect: "" });
    const nodes = [
      n("1990-luvun-lama", 1990, ["talous"]),
      n("vero", 1989, ["julkinen talous"], "uudistus", 4),
      n("eu", 1991, ["demokratia"], "tapahtuma"),
      n("kaari", 1900, ["talous"], "pitkä kaari"),
    ];
    const ex = explain(
      { start: 1991, end: 1993 },
      { key: "fi.statfin15ai.total.b1gmh.b60cef008d", lane: "talous" },
      nodes,
    );
    expect(ex.map((e) => [e.node.id, e.status])).toEqual([
      ["1990-luvun-lama", "confirmed"],
      ["vero", "candidate"],
      ["eu", "coincident"],
    ]);
  });
});
