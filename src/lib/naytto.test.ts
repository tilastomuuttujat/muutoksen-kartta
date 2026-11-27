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
  it("every prediction has an interval around its point and is registered", () => {
    for (const h of HYPOTHESES) for (const p of h.predictions) {
      expect(p.lo).toBeLessThan(p.point);
      expect(p.hi).toBeGreaterThan(p.point);
      expect(p.registered).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
