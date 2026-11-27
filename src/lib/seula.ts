// Seula: kaikki sarjaparit, löytö ja erillinen vahvistus, sattuman kalibrointi (docs/seula.md).
// Aineisto: src/data/seula.json (scripts/seula/build.py). Jyvät ovat järjestysehdokkaita
// Näyttöverkon rekisteriin, eivät syy-yhteyksiä.
import raw from "@/data/seula.json";

export type Flag = "nimellinen" | "bkt-suhde" | "tilinpito" | "lukumaara";
export type RowStatus = "jyva" | "vahvistui-suunta" | "ei-vahvistusta" | "eri-merkki" | "ei-vahvistusaineistoa";
export type Row = {
  x: string; y: string; lag: number; rD: number; nD: number; q: number;
  rC: number | null; nC: number; pC: number | null; rRev: number | null;
  status: RowStatus; kind: DesignKey; flags: Flag[];
};
export type DesignKey = "aika" | "maa";
type Counts = { pairs: number; mechanical: number; tested: number; discovered: number; sameSign: number; confirmed: number; grains: number };
type Design = {
  series: number;
  counts: Counts;
  chance: { grainsMean: number; grains95: number; grainsMax: number; discoveredMean: number; discovered95: number };
  meta: Record<string, { t: string; u: string; lane: string }>;
  rows: Row[];
  values: Record<string, [number, number][] | Record<string, [number, number][]>>;
};
type Data = { rules: { cut: number; mechanical: number; q: number; alpha: number; minDiscovery: number; minConfirmation: number; reps: number }; designs: Record<DesignKey, Design> };

export const SEULA = raw as unknown as Data;

export const DESIGN_LABEL: Record<DesignKey, { label: string; discovery: string; confirmation: string }> = {
  aika: { label: "Aikajako, Suomi", discovery: `vuodet ≤ ${SEULA.rules.cut}`, confirmation: `vuodet ${SEULA.rules.cut + 1}–2025` },
  maa: { label: "Maajako, Pohjoismaat", discovery: "Suomi", confirmation: "Ruotsi, Norja ja Tanska" },
};

export const FLAGS: Record<Flag, { label: string; info: string }> = {
  nimellinen: { label: "Nimellinen pari", info: "molemmat käyvin hinnoin: yhteinen hintataso voi selittää" },
  "bkt-suhde": { label: "BKT-suhde", info: "nimittäjä liikkuu suhdanteen mukana" },
  tilinpito: { label: "Sama tilinpito", info: "saman kansantalouden kirjanpidon eriä" },
  lukumaara: { label: "Lukumäärä", info: "määrä seuraa pohjaväestöä" },
};

/** Seulan portaat järjestyksessä: kuinka moni pari jäi jäljelle kunkin jälkeen. */
export function funnel(d: Design) {
  const c = d.counts;
  return [
    { key: "tested", label: "Testatut parit", n: c.tested, note: `${c.mechanical} saman ilmiön paria poistettu` },
    { key: "discovered", label: "Löytö (q < 0,1)", n: c.discovered, chance: d.chance.discoveredMean },
    { key: "sameSign", label: "Sama suunta vahvistuksessa", n: c.sameSign },
    { key: "confirmed", label: "Vahvistui (p < 0,05)", n: c.confirmed },
    { key: "grains", label: "Suunta pitää: jyvät", n: c.grains, chance: d.chance.grainsMean },
  ];
}

export const grains = (d: Design) => d.rows.filter((r) => r.status === "jyva");
export const clean = (rows: Row[]) => rows.filter((r) => r.flags.length === 0);
export const flagged = (rows: Row[]) => rows.filter((r) => r.flags.length > 0);

/** Akanat: löytövaiheen vahvimmat, jotka eivät kestäneet vahvistusta. */
export const chaff = (d: Design, n = 6) =>
  d.rows.filter((r) => r.status !== "jyva").sort((a, b) => Math.abs(b.rD) - Math.abs(a.rD)).slice(0, n);

/** Elämänaluepari → jyvien määrä (vain puhtaat), suurin ensin. */
export function laneSummary(rows: Row[], meta: Design["meta"]) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = `${meta[r.x]?.lane ?? "?"} → ${meta[r.y]?.lane ?? "?"}`;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Ehdotus rekisterimerkinnäksi: väite ja seuraavat testit. */
export function proposal(r: Row, d: Design): string {
  const x = d.meta[r.x]?.t ?? r.x, y = d.meta[r.y]?.t ?? r.y;
  const dir = r.rD < 0 ? "vastakkaiseen suuntaan" : "samaan suuntaan";
  return `”${x}” muuttuu ${r.lag} vuotta ennen sarjaa ”${y}”, ${dir}. Seulassa löytö r = ${fmt(r.rD)} (${DESIGN_LABEL[r.kind].discovery}), vahvistus r = ${fmt(r.rC ?? 0)} (${DESIGN_LABEL[r.kind].confirmation}). Seuraavat testit: annos–vaste (alueet tai ryhmät), toisto muissa maissa tai jaksoissa, ja ennalta kirjattu ennuste.`;
}
export const fmt = (v: number, d = 2) => v.toLocaleString("fi-FI", { minimumFractionDigits: d, maximumFractionDigits: d });
