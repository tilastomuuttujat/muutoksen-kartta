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
  it("every prediction has an interval around its point and is registered", () => {
    for (const h of HYPOTHESES) for (const p of h.predictions) {
      expect(p.lo).toBeLessThan(p.point);
      expect(p.hi).toBeGreaterThan(p.point);
      expect(p.registered).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
