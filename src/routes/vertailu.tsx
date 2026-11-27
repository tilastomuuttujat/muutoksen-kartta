import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { byKey, uniqueSeries, type ScanSeries } from "@/lib/scanner";
import { BIG_GAP, compareSeries } from "@/lib/difference";

export const Route = createFileRoute("/vertailu")({
  head: () => ({
    meta: [
      { title: "Erotusvertailu – Murrosmatriisi" },
      { name: "description", content: "Kaksi tilastosarjaa päällekkäin: värillinen erotus ja viivakoodirivit näyttävät, missä sarjat eroavat eniten ja milloin kumpikin järkkyi." },
      { property: "og:title", content: "Erotusvertailu: missä kaksi kehitystä eroavat?" },
      { property: "og:description", content: "Päällekkäiset käyrät, niiden erotus ja shokkivuosien viivakoodit samalla aika-akselilla." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComparePage,
});

const COL_A = "var(--chart-1)";
const COL_B = "var(--chart-2)";
const W = 760, L = 150, R = 740;
const TOP = 16, CH = 200; // käyrät
const DT = TOP + CH + 18, DH = 80; // erotuskäyrä
const BT = DT + DH + 22, BR = 18; // viivakoodirivit
const H = BT + 3 * BR + 26;

function Picker({ label, color, value, onChange, all }: { label: string; color: string; value: string; onChange: (k: string) => void; all: ScanSeries[] }) {
  const [q, setQ] = useState("");
  const hits = q.length > 1 ? all.filter((s) => s.t.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];
  const cur = byKey(value);
  return (
    <div className="flex-1 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-sm font-semibold"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: color }} />{label}</div>
      <p className="mt-1 text-sm">{cur?.t} <span className="text-muted-foreground">({cur?.y0}–)</span></p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Hae toinen sarja…" aria-label={`Hae sarja ${label}`}
        className="mt-2 w-full rounded border bg-background px-2 py-1 text-sm" />
      {hits.length > 0 && (
        <ul className="mt-1 max-h-48 overflow-auto text-sm">
          {hits.map((s) => (
            <li key={s.k}><button className="w-full rounded px-1 py-0.5 text-left hover:bg-muted" onClick={() => { onChange(s.k); setQ(""); }}>{s.t} <span className="text-muted-foreground">{s.y0}–</span></button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ComparePage() {
  const all = useMemo(() => uniqueSeries(), []);
  const [ka, setKa] = useState("fi.histlabour.lfs2019.unemployment_rate");
  const [kb, setKb] = useState("gapminder.finland.children_per_woman_total_fertility.v20261026");
  const A = byKey(ka)!, B = byKey(kb)!;
  const d = useMemo(() => compareSeries(A, B), [A, B]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <nav className="mb-3 flex gap-4 text-sm"><Link to="/" className="underline-offset-4 hover:underline">← Kartta</Link><Link to="/skanneri" className="underline-offset-4 hover:underline">Skanneri →</Link></nav>
      <h1 className="font-display text-3xl">Erotusvertailu</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        Kaksi sarjaa päällekkäin samalla asteikolla. Värillinen alue niiden välissä näyttää, kumpi on suhteessa korkeammalla ja kuinka paljon. Alla viivakoodit: milloin kumpikin sarja järkkyi ja milloin ero oli poikkeuksellisen suuri.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Picker label="Sarja A" color={COL_A} value={ka} onChange={setKa} all={all} />
        <Picker label="Sarja B" color={COL_B} value={kb} onChange={setKb} all={all} />
      </div>
      {!d ? <p className="mt-4 text-sm">Sarjoilla ei ole tarpeeksi yhteisiä vuosia.</p> : <Chart d={d} />}
    </main>
  );
}

function Chart({ d }: { d: NonNullable<ReturnType<typeof compareSeries>> }) {
  const y0 = d.years[0]!, y1 = d.years[d.years.length - 1]!;
  const x = (y: number) => L + ((y - y0) / Math.max(1, y1 - y0)) * (R - L);
  const zmax = Math.max(2, ...d.a.map(Math.abs), ...d.b.map(Math.abs));
  const yz = (z: number) => TOP + CH / 2 - (z / zmax) * (CH / 2);
  const dmax = Math.max(1.5, ...d.diff.map(Math.abs));
  const yd = (v: number) => DT + DH / 2 - (v / dmax) * (DH / 2);
  const line = (v: number[], f: (n: number) => number) => v.map((z, i) => `${i ? "L" : "M"}${x(d.years[i]!).toFixed(1)},${f(z).toFixed(1)}`).join(" ");
  const bw = Math.max(1.5, (R - L) / d.years.length - 0.6);
  const ticks = d.years.filter((y) => y % (y1 - y0 > 60 ? 25 : 10) === 0);
  const big = d.diff.filter((v) => Math.abs(v) >= BIG_GAP).length;

  return (
    <section className="mt-4 rounded-lg border bg-card p-4">
      <p className="text-sm">
        Suurin ero vuonna <strong>{d.peak.year}</strong>: {d.peak.value > 0 ? "B" : "A"} oli {Math.abs(d.peak.value).toFixed(1)} keskihajontaa korkeammalla.
        {" "}Sarjat vaihtoivat järjestystä {d.crossings.length} kertaa{d.crossings.length ? ` (${d.crossings.slice(0, 6).join(", ")}${d.crossings.length > 6 ? "…" : ""})` : ""}.
        {" "}Suuri ero {big} vuotena {d.years.length}:stä.
      </p>
      <div className="mt-2 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[600px]" role="img" aria-label="Kaksi sarjaa päällekkäin, niiden erotus ja viivakoodirivit">
          {ticks.map((y) => <line key={y} x1={x(y)} x2={x(y)} y1={TOP} y2={BT + 3 * BR} stroke="var(--border)" />)}
          {d.years.slice(1).map((yr, j) => {
            const i = j + 1, xa = x(d.years[i - 1]!), xb = x(yr);
            const pos = d.diff[i]! + d.diff[i - 1]! > 0;
            return <polygon key={yr} points={`${xa},${yz(d.a[i - 1]!)} ${xb},${yz(d.a[i]!)} ${xb},${yz(d.b[i]!)} ${xa},${yz(d.b[i - 1]!)}`} fill={pos ? COL_B : COL_A} fillOpacity={0.28} />;
          })}
          <path d={line(d.a, yz)} fill="none" stroke={COL_A} strokeWidth={2} />
          <path d={line(d.b, yz)} fill="none" stroke={COL_B} strokeWidth={2} />
          <text x={L - 8} y={TOP + 10} textAnchor="end" className="fill-muted-foreground text-[11px]">Päällekkäin</text>
          <text x={L - 8} y={TOP + 24} textAnchor="end" className="fill-muted-foreground text-[10px]">(oma taso = 0)</text>

          <line x1={L} x2={R} y1={yd(0)} y2={yd(0)} stroke="var(--foreground)" strokeOpacity={0.4} />
          {d.years.map((yr, i) => {
            const v = d.diff[i]!;
            return <rect key={yr} x={x(yr) - bw / 2} y={Math.min(yd(0), yd(v))} width={bw} height={Math.abs(yd(v) - yd(0))} fill={v > 0 ? COL_B : COL_A} fillOpacity={0.8}><title>{`${yr}: ero ${v.toFixed(2)}`}</title></rect>;
          })}
          <text x={L - 8} y={DT + 12} textAnchor="end" className="fill-muted-foreground text-[11px]">Erotus B − A</text>
          <text x={L - 8} y={DT + 26} textAnchor="end" className="fill-muted-foreground text-[10px]">ylös = B korkeammalla</text>

          {[
            { label: "A:n shokit", col: COL_A, on: (i: number) => d.shocksA[i]!, op: () => 1 },
            { label: "B:n shokit", col: COL_B, on: (i: number) => d.shocksB[i]!, op: () => 1 },
            { label: "Suuri ero", col: "var(--foreground)", on: (i: number) => Math.abs(d.diff[i]!) >= BIG_GAP, op: (i: number) => Math.min(1, Math.abs(d.diff[i]!) / dmax + 0.25) },
          ].map((row, r) => (
            <g key={row.label}>
              <rect x={L} y={BT + r * BR} width={R - L} height={BR - 4} fill="var(--muted)" />
              <text x={L - 8} y={BT + r * BR + 11} textAnchor="end" className="fill-muted-foreground text-[11px]">{row.label}</text>
              {d.years.map((yr, i) => row.on(i) && (
                <rect key={yr} x={x(yr) - bw / 2} y={BT + r * BR} width={bw} height={BR - 4}
                  fill={r === 2 ? (d.diff[i]! > 0 ? COL_B : COL_A) : row.col} fillOpacity={row.op(i)}><title>{`${row.label} ${yr}`}</title></rect>
              ))}
            </g>
          ))}
          {ticks.map((y) => <text key={y} x={x(y)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">{y}</text>)}
        </svg>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Sarjat on muutettu samalle asteikolle (keskihajontaa oman keskitason ylä- tai alapuolella yhteisinä vuosina), joten erotus kertoo suhteellisesta asemasta, ei yksiköistä.
        Shokki = sarjan oma poikkeamavuosi skannerissa. Suuri ero = vähintään {BIG_GAP} keskihajonta. Samanaikaisuus ei osoita syy-yhteyttä.
      </p>
    </section>
  );
}
