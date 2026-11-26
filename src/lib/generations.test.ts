import { describe, expect, it } from "vitest";
import { compare } from "./generations";
import type { State } from "./lifecourse";

const st: State = {
  key: "x", label: "x", group: "toiminta", years: [2000, 2010], source: "", source_url: "", marker: "rises", threshold: 50,
  shares: { kaikki: [[10, 50, 80], [5, 30, 85]], naiset: [[], []], miehet: [[], []] },
};

describe("compare", () => {
  it("returns the age with the largest change in percentage points", () => {
    expect(compare(st, "kaikki", 2000, 2010, [20, 25, 30])!.biggest).toEqual({ age: 25, diff: -20 });
  });
  it("returns null for a missing year", () => expect(compare(st, "kaikki", 2000, 2024)).toBeNull());
});
