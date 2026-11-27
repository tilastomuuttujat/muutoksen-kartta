import { describe, expect, it } from "vitest";
import { HYPOTHESES, NAYTTO, hypothesis, predictionState, statusOf, statusOfHypothesis, type Prediction } from "./naytto";

const T = (design: Parameters<typeof statusOf>[0][number]["design"], result: Parameters<typeof statusOf>[0][number]["result"]) => ({ design, result });
const pred = (actual: number | null): Prediction => ({ id: "x", target: "", year: 2026, point: 1.27, lo: 1.22, hi: 1.32, registered: "", basis: "", actual });

describe("status rules (docs/naytto-rekisteri.md)", () => {
  it("one strong refutation is enough", () => {
    expect(statusOf([T("toisto", "tukee"), T("tasmallisyys", "tukee"), T("annos", "kumoaa")])).toBe("kumottu");
  });
  it("two weak refutations are enough", () => {
    expect(statusOf([T("ajoitus", "kumoaa"), T("tasmallisyys", "kumoaa"), T("annos", "tukee")])).toBe("kumottu");
  });
  it("supported needs two designs, one of them strong", () => {
    expect(statusOf([T("toisto", "tukee"), T("ajoitus", "tukee")])).toBe("ehdokas");
    expect(statusOf([T("toisto", "tukee"), T("annos", "tukee")])).toBe("tuettu");
    expect(statusOf([T("annos", "tukee"), T("annos", "tukee")])).toBe("ehdokas");
  });
  it("a hit prediction lifts supported to strongly supported", () => {
    expect(statusOf([T("toisto", "tukee"), T("annos", "tukee")], [pred(1.25)])).toBe("vahvasti-tuettu");
    expect(statusOf([T("toisto", "tukee"), T("annos", "tukee")], [pred(1.4)])).toBe("tuettu");
  });
  it("support and a single weak refutation is contradictory", () => {
    expect(statusOf([T("toisto", "tukee"), T("ajoitus", "kumoaa")])).toBe("ristiriita");
  });
  it("untested and unresolved tests do not count", () => {
    expect(statusOf([T("annos", "ei-testattu"), T("toisto", "ei-ratkea")])).toBe("oletus");
  });
  it("prediction states", () => {
    expect(predictionState(pred(null))).toBe("odottaa");
    expect(predictionState(pred(1.3))).toBe("osui");
    expect(predictionState(pred(1.1))).toBe("ohi");
  });
});

describe("pilot results", () => {
  it("statuses", () => {
    expect(statusOfHypothesis(hypothesis("h1")!)).toBe("kumottu");
    expect(statusOfHypothesis(hypothesis("h1b")!)).toBe("ristiriita");
    expect(statusOfHypothesis(hypothesis("h1c")!)).toBe("oletus");
    expect(statusOfHypothesis(hypothesis("h1d")!)).toBe("ehdokas");
    expect(statusOfHypothesis(hypothesis("h1e")!)).toBe("ehdokas");
    expect(statusOfHypothesis(hypothesis("h1f")!)).toBe("oletus");
    expect(statusOfHypothesis(hypothesis("h1g")!)).toBe("kumottu");
    expect(statusOfHypothesis(hypothesis("h4")!)).toBe("ristiriita");
    expect(statusOfHypothesis(hypothesis("h5")!)).toBe("kumottu");
    expect(statusOfHypothesis(hypothesis("h6")!)).toBe("ehdokas");
    expect(statusOfHypothesis(hypothesis("h2")!)).toBe("kumottu");
    expect(statusOfHypothesis(hypothesis("h3")!)).toBe("tuettu");
  });
  it("numbers quoted in the page text", () => {
    const h1 = NAYTTO.hypotheses.h1;
    const rep = h1.tests.find((t) => t.id === "toisto")!.detail as { pooled: { r: number; p: number }; others: { r: number; p: number } };
    expect(rep.pooled.r).toBeLessThan(0);
    expect(rep.others.r).toBeCloseTo(-0.29, 2);
    expect(rep.others.p).toBeLessThan(0.05);
    const reg = h1.tests.find((t) => t.id === "annos")!.detail as { b: number; p: number; regions: number };
    expect(reg.b).toBeGreaterThanOrEqual(0);
    expect(reg.regions).toBe(18);
    const h3 = NAYTTO.hypotheses.h3.tests.find((t) => t.id === "annos")!.detail as { rank: number; of: number; did: Record<string, number> };
    expect(h3.rank).toBe(2);
    expect(h3.of).toBe(23);
    const ps = Object.entries(h3.did).sort((a, b) => a[1] - b[1]).findIndex(([k]) => k === "HVA13") + 1;
    expect(ps).toBe(4);
  });
  it("expectation test numbers quoted in the register and the summary", () => {
    const e = NAYTTO.hypotheses.h1.expectations;
    expect(e.result).toBe("kumoaa");
    const d = e.detail as { confidence: { r: number; p: number; lag: number }; unemployment: { r: number } };
    expect(d.confidence.r).toBeCloseTo(-0.23, 2);
    expect(d.confidence.p).toBeCloseTo(0.08, 2);
    expect(d.confidence.lag).toBe(1);
    expect(d.unemployment.r).toBeCloseTo(-0.41, 2);
  });
  it("temporary-work test numbers quoted in the register", () => {
    const t = NAYTTO.hypotheses.h1.temporary;
    expect(t.result).toBe("ei-ratkea");
    const d = t.detail as { temporary: { r: number; p: number }; unemployment: { r: number }; partial: { r: number }; countries: Record<string, { r: number; p: number }> };
    expect(d.temporary.r).toBeCloseTo(-0.1, 2);
    expect(d.temporary.p).toBeCloseTo(0.52, 2);
    expect(d.unemployment.r).toBeCloseTo(-0.33, 2);
    expect(d.partial.r).toBeCloseTo(-0.08, 2);
    expect(d.countries["DK"]!.r).toBeCloseTo(0.33, 2);
    for (const c of Object.values(d.countries)) expect(c.p).toBeGreaterThan(0.05);
  });
  it("firstborn test numbers quoted in the register", () => {
    const t = NAYTTO.hypotheses.h1.firstborn;
    expect(t.result).toBe("tukee");
    const d = t.detail as { first: { r: number; p: number }; later: { r: number; p: number }; check: number; countries: Record<string, { first: { r: number }; later: { r: number } }> };
    expect(d.check).toBeGreaterThan(0.99);
    expect(d.first.r).toBeCloseTo(-0.29, 2);
    expect(d.first.p).toBeCloseTo(0.009, 3);
    expect(d.later.r).toBeCloseTo(-0.17, 2);
    expect(d.later.p).toBeCloseTo(0.2, 2);
    expect(d.countries["FI"]!.first.r).toBeCloseTo(-0.55, 2);
    expect(d.countries["DK"]!.first.r).toBeCloseTo(0.16, 2);
  });
  it("H1e numbers quoted in the register", () => {
    const h = NAYTTO.hypotheses.h1e;
    const reg = h.tests.find((t) => t.id === "annos")!;
    expect(reg.result).toBe("ei-ratkea");
    const d = reg.detail as { pctPerPoint: number; p: number; regions: number };
    expect(d.pctPerPoint).toBeCloseTo(0.03, 2);
    expect(d.p).toBeCloseTo(0.45, 2);
    expect(d.regions).toBe(18);
    expect(h.predictions.map((p) => p.point)).toEqual([1.273, 1.257]);
  });
  it("H1f numbers quoted in the register", () => {
    const [prices, rates] = NAYTTO.hypotheses.h1f.tests as { result: string; detail: { predictor: { r: number; p: number }; employment: { r: number }; countries: Record<string, { r: number }> } }[];
    expect(prices!.result).toBe("ei-ratkea");
    expect(prices!.detail.predictor.r).toBeCloseTo(-0.15, 2);
    expect(prices!.detail.predictor.p).toBeCloseTo(0.42, 2);
    expect(prices!.detail.employment.r).toBeCloseTo(0.43, 2);
    expect(prices!.detail.countries["FI"]!.r).toBeCloseTo(-0.41, 2);
    expect(rates!.result).toBe("ei-ratkea");
    expect(rates!.detail.predictor.r).toBeCloseTo(-0.12, 2);
    expect(rates!.detail.employment.r).toBeCloseTo(0.45, 2);
    expect(rates!.detail.countries["FI"]!.r).toBeCloseTo(0.39, 2);
  });
  it("H1g numbers quoted in the register", () => {
    const g = NAYTTO.hypotheses.h1g;
    const [inc, cred, reg] = g.tests as { result: string; detail: Record<string, unknown> }[];
    const P = (t: { detail: Record<string, unknown> }) => t.detail["predictor"] as { r: number; p: number };
    expect(inc!.result).toBe("ei-ratkea");
    expect(P(inc!).r).toBeCloseTo(0.365, 3);
    expect(cred!.result).toBe("ei-ratkea");
    expect(P(cred!).r).toBeCloseTo(0.3, 2);
    expect(reg!.result).toBe("kumoaa");
    expect(reg!.detail["per10pct"] as number).toBeCloseTo(-1.2, 1);
    const r = g.describe.recovery;
    expect(r["FI"]!.g2008_2015).toBeCloseTo(2.2, 1);
    expect(r["SE"]!.g2008_2015).toBeCloseTo(10.3, 1);
    expect(r["FI"]!.regained).toBe(2016);
    expect(Object.fromEntries(g.describe.moneyGrowth)[2009]).toBeCloseTo(0.5, 1);
    expect(Object.fromEntries(g.describe.moneyGrowth)[2015]).toBeCloseTo(10, 1);
  });
  it("H4 and H5 numbers quoted in the register", () => {
    const [, rep, svc] = NAYTTO.hypotheses.h4.tests as { result: string; detail: Record<string, { r: number; p: number }> }[];
    expect(rep!.result).toBe("ei-ratkea");
    expect(rep!.detail["predictor"]!.r).toBeCloseTo(-0.14, 2);
    expect(svc!.result).toBe("kumoaa");
    expect(svc!.detail["d63"]!.r).toBeCloseTo(-0.155, 3);
    expect(svc!.detail["d62"]!.r).toBeCloseTo(-0.25, 2);
    const pers = NAYTTO.hypotheses.h5.tests[1]!;
    expect(pers.result).toBe("tukee");
    const d = pers.detail as { r: number; p: number; neff: number; countries: Record<string, { r: number }> };
    expect(d.r).toBeCloseTo(0.39, 2);
    expect(d.p).toBeLessThan(0.05);
    for (const c of Object.values(d.countries)) expect(c.r).toBeGreaterThan(0);
  });
  it("H5 cohort test numbers quoted in the register", () => {
    const c = NAYTTO.hypotheses.h5.tests.find((t) => t.id === "ikaluokat")!;
    expect(c.result).toBe("kumoaa");
    const d = c.detail as { r: number; p: number; n: number; per5: number; cohorts: number[]; women: { r: number }; men: { r: number }; rows: { born: number; exposure: number }[] };
    expect(d.r).toBeCloseTo(0.42, 2);
    expect(d.p).toBeCloseTo(0.77, 2);
    expect(d.n).toBe(22);
    expect(d.cohorts).toEqual([1966, 1987]);
    expect(d.per5).toBeCloseTo(0.27, 2);
    expect(d.women.r).toBeCloseTo(0.42, 2);
    expect(d.men.r).toBeCloseTo(0.43, 2);
    const lama = d.rows.filter((r) => r.born >= 1969 && r.born <= 1975).map((r) => r.exposure);
    expect(Math.min(...lama)).toBeGreaterThan(12.5);
    expect(Math.max(...lama)).toBeLessThan(18);
  });
  it("H1d cohort test numbers quoted in the register", () => {
    const c = NAYTTO.hypotheses.h1.firstbornCohorts;
    expect(c.result).toBe("ei-ratkea");
    const d = c.detail as { r: number; p: number; n: number; per5: number; cohorts: number[]; by40: { r: number; p: number; n: number }; rows: { born: number; outcome: number }[] };
    expect(d.r).toBeCloseTo(-0.88, 2);
    expect(d.p).toBeCloseTo(0.11, 2);
    expect(d.n).toBe(27);
    expect(d.cohorts).toEqual([1970, 1996]);
    expect(d.per5 * 100).toBeCloseTo(-4.5, 0);
    expect(d.by40.r).toBeCloseTo(-0.6, 2);
    expect(d.by40.p).toBeCloseTo(0.06, 2);
    const o = Object.fromEntries(d.rows.map((r) => [r.born, r.outcome]));
    for (const b of [1970, 1971, 1972, 1973, 1974, 1975]) expect(o[b]!).toBeGreaterThanOrEqual(0.465);
    for (const b of [1980, 1985]) expect(o[b]!).toBeLessThan(0.465);
    expect(o[1996]!).toBeCloseTo(0.3, 2);
  });
  it("H6 numbers quoted in the register", () => {
    const [k, c, m] = NAYTTO.hypotheses.h6.tests as { result: string; detail: Record<string, unknown> }[];
    expect(k!.result).toBe("ei-ratkea");
    expect(k!.detail["pct"]).toBeCloseTo(15, 0);
    expect(k!.detail["above"]).toBe(19);
    expect(k!.detail["placebo"]).toBe(21);
    const ser = Object.fromEntries(k!.detail["series"] as [number, number][]);
    expect(ser[2003]).toBeCloseTo(30.2, 1);
    expect(ser[2004]).toBeCloseTo(35.4, 1);
    expect(ser[2007]).toBeCloseTo(40.2, 1);
    expect(c!.result).toBe("ei-ratkea");
    expect(c!.detail["pct"]).toBeCloseTo(-5, 0);
    expect(m!.result).toBe("tukee");
    expect(m!.detail["r"] as number).toBeCloseTo(0.34, 2);
    const e = NAYTTO.hypotheses.h6.extra;
    expect(e["men"]!.pct).toBeCloseTo(16, 0);
    expect(e["women"]!.pct).toBeCloseTo(10.5, 1);
    expect(e["homicide"]!.pct).toBeCloseTo(3, 0);
  });
  it("H6 price tests quoted in the register", () => {
    const t = NAYTTO.hypotheses.h6.tests;
    const price = t.find((x) => x.id === "hinta")!, ev = t.find((x) => x.id === "korotukset")!;
    expect(price.result).toBe("ei-ratkea");
    const d = price.detail as { r: number; p: number; n: number; without2004: { r: number }; realPrice: [number, number][] };
    expect(d.r).toBeCloseTo(-0.35, 2);
    expect(d.p).toBeCloseTo(0.12, 2);
    expect(d.n).toBe(29);
    expect(d.without2004.r).toBeCloseTo(-0.2, 2);
    const rp = Object.fromEntries(d.realPrice);
    expect(rp[2004]).toBeCloseTo(93.8, 1);
    expect(rp[2007]).toBeCloseTo(86.7, 1);
    expect(ev.result).toBe("ei-ratkea");
    expect((ev.detail as { events: number[] }).events).toEqual([2008, 2009, 2012, 2018]);
    expect((ev.detail as { p: number }).p).toBeCloseTo(0.31, 2);
    expect(statusOfHypothesis(hypothesis("h6")!)).toBe("ehdokas");
  });
  it("H7 numbers quoted in the register", () => {
    const [reg, tim] = NAYTTO.hypotheses.h7.tests as { result: string; detail: Record<string, unknown> }[];
    expect(reg!.result).toBe("kumoaa");
    expect(reg!.detail["pctPerPoint"] as number).toBeCloseTo(-0.3, 1);
    expect(reg!.detail["p"] as number).toBeCloseTo(0.63, 2);
    expect(reg!.detail["regions"]).toBe(18);
    expect(tim!.result).toBe("ei-ratkea");
    expect(tim!.detail["r"] as number).toBeCloseTo(0.12, 2);
    expect((tim!.detail["women"] as { r: number }).r).toBeCloseTo(0.26, 2);
    const s = Object.fromEntries(tim!.detail["series"] as [number, number][]);
    expect(s[1992]).toBe(1138);
    expect(Math.max(...[1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995].map((y) => s[y]!))).toBe(s[1992]);
    expect(statusOfHypothesis(hypothesis("h7")!)).toBe("kumottu");
  });
  it("H8 and H9 numbers quoted in the register", () => {
    const h8 = NAYTTO.hypotheses.h8.tests as { id: string; result: string; detail: Record<string, unknown> }[];
    expect(h8[0]!.result).toBe("tukee");
    expect(h8[0]!.detail["r"] as number).toBeCloseTo(0.35, 2);
    expect(h8[1]!.result).toBe("kumoaa");
    expect(h8[1]!.detail["r"] as number).toBeCloseTo(-0.17, 2);
    expect(h8[2]!.result).toBe("ei-ratkea");
    expect(h8[2]!.detail["above"]).toBe(11);
    const h9 = NAYTTO.hypotheses.h9.tests[0]!;
    expect(h9.result).toBe("tukee");
    const d = h9.detail as { r: number; p: number; n: number; countries: Record<string, { r: number }> };
    expect(d.r).toBeCloseTo(-0.27, 2);
    expect(d.n).toBe(79);
    expect(d.countries["NO"]!.r).toBeCloseTo(-0.56, 2);
    expect(d.countries["FI"]!.r).toBeCloseTo(0.23, 2);
    expect(statusOfHypothesis(hypothesis("h8")!)).toBe("ristiriita");
    expect(statusOfHypothesis(hypothesis("h9")!)).toBe("ehdokas");
  });
  it("H10 numbers quoted in the register", () => {
    const [t1, t2] = NAYTTO.hypotheses.h10.tests as { result: string; detail: { dev: number; series: [number, number][] } }[];
    expect(t1!.result).toBe("kumoaa");
    expect(t1!.detail.dev).toBeCloseTo(0.5, 1);
    const s = Object.fromEntries(t1!.detail.series);
    expect(s[2022]).toBeCloseTo(4.93, 2);
    expect(s[2023]).toBeCloseTo(5.85, 2);
    expect(s[2024]).toBeCloseTo(4.91, 2);
    expect(t2!.result).toBe("ei-ratkea");
    expect(t2!.detail.dev).toBeCloseTo(0.6, 1);
    const e = NAYTTO.hypotheses.h10.extra as { students18: { dev: number; below: number }; age19_2024: { value: number; prev: number } };
    expect(e.students18.dev).toBeCloseTo(2.0, 1);
    expect(e.age19_2024.value).toBeCloseTo(17.14, 2);
    expect(statusOfHypothesis(hypothesis("h10")!)).toBe("kumottu");
  });
  it("H11 main result and checks quoted in the register", () => {
    const [t1, t2] = NAYTTO.hypotheses.h11.tests as { result: string; detail: { b: number; p: number; checks?: Record<string, { b: number; p: number; fails?: boolean }> } }[];
    expect(t1!.result).toBe("ei-ratkea");
    expect(t2!.result).toBe("ei-ratkea");
    expect(t1!.detail.b).toBeCloseTo(-0.99, 2);
    expect(t2!.detail.b).toBeCloseTo(0.78, 2);
    const c = t1!.detail.checks!;
    expect(c["lead"]!.b).toBeCloseTo(-0.83, 2);
    expect(c["lead"]!.fails).toBe(true);
    expect(c["trends"]!.b).toBeCloseTo(-0.16, 2);
    expect(c["trends"]!.p).toBeCloseTo(0.32, 2);
    expect(c["excluded"]!.b).toBeCloseTo(-1.08, 2);
    expect(statusOfHypothesis(hypothesis("h11")!)).toBe("oletus");
  });
  it("standard regional checks ran and changed nothing", () => {
    const H = NAYTTO.hypotheses as unknown as Record<string, { tests: { id: string; result: string; detail?: { checks?: { changed: boolean; lead: { p: number }; trends: { p: number } } } }[] }>;
    for (const hk of ["h1", "h1e", "h1g", "h7"]) {
      const t = H[hk]!.tests.find((x) => x.id === "annos")!;
      expect(t.detail?.checks).toBeDefined();
      expect(t.detail!.checks!.changed).toBe(false);
      expect(t.detail!.checks!.trends.p).toBeGreaterThan(0.05);
    }
    expect(H["h7"]!.tests.find((x) => x.id === "annos")!.detail!.checks!.trends.p).toBeCloseTo(0.18, 2);
  });
  it("H12 numbers quoted in the register", () => {
    const [t1, t2, t3] = NAYTTO.hypotheses.h12.tests as { result: string; detail: Record<string, unknown> }[];
    expect(t1!.result).toBe("ei-ratkea");
    expect(t1!.detail["r"] as number).toBeCloseTo(-0.28, 2);
    expect(t2!.result).toBe("tukee");
    expect(t2!.detail["r"] as number).toBeCloseTo(-0.425, 3);
    const c = t2!.detail["countries"] as Record<string, { r: number }>;
    expect(c["SE"]!.r).toBeCloseTo(-0.54, 2);
    expect(c["FI"]!.r).toBeCloseTo(0.34, 2);
    expect(t3!.result).toBe("ei-ratkea");
    expect(t3!.detail["pctPerPoint"] as number).toBeCloseTo(-2.6, 1);
    const ch = t3!.detail["checks"] as { changed: boolean; original: string; trends: { p: number } };
    expect(ch.changed).toBe(true);
    expect(ch.original).toBe("tukee");
    expect(ch.trends.p).toBeCloseTo(0.41, 2);
    expect(statusOfHypothesis(hypothesis("h12")!)).toBe("ehdokas");
  });
  it("H13 numbers quoted in the register", () => {
    const [t1, t2, t3] = NAYTTO.hypotheses.h13.tests as { result: string; detail: Record<string, unknown> }[];
    expect(t1!.result).toBe("kumoaa");
    expect(t1!.detail["before"] as number).toBeCloseTo(0.39, 2);
    expect(t1!.detail["after"] as number).toBeCloseTo(0.86, 2);
    expect(t2!.result).toBe("kumoaa");
    expect(t3!.result).toBe("tukee");
    const c = t3!.detail["countries"] as Record<string, { gdp: number; ghg: number }>;
    expect(c["FI"]!.gdp).toBeCloseTo(14, 0);
    expect(c["FI"]!.ghg).toBeCloseTo(-44, 0);
    expect(c["NO"]!.ghg).toBeCloseTo(-18.48, 1);
    expect(c["DK"]!.ghg).toBeCloseTo(-46, 0);
    expect(statusOfHypothesis(hypothesis("h13")!)).toBe("kumottu");
  });
  it("H14 numbers quoted in the register", () => {
    const [t1, t2] = NAYTTO.hypotheses.h14.tests as { result: string; detail: { pct: number; above: number; placebo: number; series: [number, number][] } }[];
    expect(t1!.result).toBe("tukee");
    expect(t1!.detail.pct).toBeCloseTo(39, 0);
    expect(t1!.detail.above).toBe(t1!.detail.placebo);
    expect(t1!.detail.placebo).toBe(43);
    const s = Object.fromEntries(t1!.detail.series);
    expect(s[1987]).toBeCloseTo(2.05, 2);
    expect(s[1989]).toBeCloseTo(2.89, 2);
    expect(t2!.result).toBe("tukee");
    expect(t2!.detail.pct).toBeCloseTo(1, 0);
    expect(NAYTTO.hypotheses.h14.extra.dev1992_1999pct).toBeCloseTo(49.5, 1);
    expect(statusOfHypothesis(hypothesis("h14")!)).toBe("tuettu");
  });
  it("H15 numbers quoted in the register", () => {
    const [t1, t2] = NAYTTO.hypotheses.h15.tests as { result: string; detail: { diff2002: number; above: number; placebo: number; fi2002: number; others2002: Record<string, number> } }[];
    expect(t1!.result).toBe("ei-ratkea");
    expect(t1!.detail.diff2002).toBeCloseTo(0.3, 2);
    expect(t1!.detail.above).toBe(14);
    expect(t1!.detail.placebo).toBe(20);
    expect(t1!.detail.fi2002).toBeCloseTo(2.0, 1);
    expect(t2!.result).toBe("kumoaa");
    expect(t2!.detail.diff2002).toBeCloseTo(-0.5, 2);
    expect(t2!.detail.others2002["SE"]).toBeCloseTo(4.3, 1);
    expect(statusOfHypothesis(hypothesis("h15")!)).toBe("oletus");
  });
  it("H16 numbers quoted in the register", () => {
    const [t1, t2] = NAYTTO.hypotheses.h16.tests as { result: string; detail: { pct: number; below: number; placebo: number; placeboMin: number; series: [number, number][] } }[];
    expect(t1!.result).toBe("tukee");
    expect(t1!.detail.pct).toBeCloseTo(-35, 0);
    expect(t1!.detail.below).toBe(65);
    expect(t1!.detail.placebo).toBe(65);
    expect(t1!.detail.placeboMin).toBeCloseTo(-25, 0);
    const s = Object.fromEntries(t1!.detail.series);
    expect(s[1929]).toBeCloseTo(10.39, 2);
    expect(s[1937]).toBeCloseTo(5.27, 2);
    expect(t2!.result).toBe("kumoaa");
    expect(t2!.detail.pct).toBeCloseTo(7, 0);
    expect(statusOfHypothesis(hypothesis("h16")!)).toBe("ristiriita");
  });
  it("H17 numbers quoted in the register", () => {
    const [t1, t2, t3] = NAYTTO.hypotheses.h17.tests as { result: string; detail: { pct: number; steeper: number; placebo: number; series: [number, number][] } }[];
    expect(t1!.result).toBe("kumoaa");
    expect(t1!.detail.pct).toBeCloseTo(6, 0);
    expect(t1!.detail.steeper).toBe(32);
    expect(t1!.detail.placebo).toBe(69);
    expect(t2!.result).toBe("tukee");
    expect(t2!.detail.pct).toBeCloseTo(-68.5, 0);
    expect(t2!.detail.steeper).toBe(69);
    const m = Object.fromEntries(t2!.detail.series);
    expect(m[1944]).toBeCloseTo(443, 0);
    expect(m[1950]).toBeCloseTo(146, 0);
    expect(t3!.result).toBe("kumoaa");
    expect(t3!.detail.pct).toBeCloseTo(-2, 0);
    expect(t3!.detail.steeper).toBe(41);
    expect(statusOfHypothesis(hypothesis("h17")!)).toBe("kumottu");
  });
  it("every prediction has an interval around its point and is registered", () => {
    for (const h of HYPOTHESES) for (const p of h.predictions) {
      expect(p.lo).toBeLessThan(p.point);
      expect(p.hi).toBeGreaterThan(p.point);
      expect(p.registered).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
