import { describe, expect, it } from "vitest";
import { COUNTRIES, ERK, divergences, domainMedians } from "./erkaantuminen";

describe("erkaantumiskartta", () => {
  it("every divergence is a significant break moving away from the peers", () => {
    for (const c of COUNTRIES) for (const s of divergences(c)) {
      const r = s.countries[c]!;
      expect(r.p).toBeLessThan(0.05);
      expect(Math.sign(r.post)).toBe(Math.sign(r.gapEnd));
      expect(Math.abs(r.gapEnd)).toBeGreaterThan(Math.abs(r.gapAtTau));
      expect(r.tau).toBeGreaterThanOrEqual(r.tauRange[0]);
      expect(r.tau).toBeLessThanOrEqual(r.tauRange[1]);
    }
  });
  it("numbers quoted in docs/erkaantuminen.md", () => {
    expect(ERK.series).toHaveLength(69);
    expect(ERK.dropped).toHaveLength(6);
    expect(ERK.analysed).toEqual({ FI: 66, SE: 66, NO: 51, DK: 66 });
    expect(COUNTRIES.map((c) => divergences(c).length)).toEqual([10, 2, 1, 7]);
    expect(divergences("FI").filter((s) => s.countries.FI!.direction === "huonompaan")).toHaveLength(9);
    expect(ERK.clusters.FI).toMatchObject({ K: 4, window: [2011, 2015], p: 0.8261 });
    expect(ERK.clusters.FI_worse.p).toBe(0.6748);
    expect(divergences("FI").map((s) => [s.countries.FI!.tau, s.id])).toEqual([
      [1999, "E20"], [2000, "E24"], [2002, "nordics.govexp_social_protection_gdp_1995_2024"],
      [2008, "nordics.unemployment_rate_25_34_men_1990_2024"], [2009, "E11"], [2010, "eurostat.nordics.lfsa_urgan"],
      [2011, "eurostat.nordics.lfsa_ergan.y25_29"], [2014, "safe_corridor.long_term_unemployment_share_25_29"],
      [2015, "eurostat.nordics.lfsa_etpgan"], [2015, "safe_corridor.long_term_unemployment_share_30_34"],
    ]);
    const movers = divergences("FI").map((s) => s.countries.FI!.moved?.mover);
    expect(movers.filter((m) => m === "Suomi")).toHaveLength(9);
    const e20 = ERK.series.find((s) => s.id === "E20")!.countries.FI!;
    expect([Math.round(e20.gapAtTau * 10) / 10, Math.round(e20.gapEnd * 10) / 10]).toEqual([5, -13.2]);
  });
  it("domain medians are ordered", () => {
    const d = domainMedians();
    for (let i = 1; i < d.length; i++) expect(d[i]!.median).toBeGreaterThanOrEqual(d[i - 1]!.median);
  });
});
