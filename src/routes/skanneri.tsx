import { createFileRoute, Link } from "@tanstack/react-router";
import { CrisisTrace } from "@/components/CrisisTrace";
import { useMemo, useState } from "react";
import { LegacyScanner } from "@/components/LegacyScanner";
import {
  DETECTORS,
  LANES,
  MODES,
  SCANNER,
  byKey,
  changes,
  compareEpisodes,
  crisisYears,
  eventsOf,
  laneShares,
  lastYear,
  scanTarget,
  status,
  uniqueSeries,
  type Det,
  type LeadResult,
  type Mode,
  type ScanSeries,
  type Status,
} from "@/lib/scanner";

type Search = { nakyma?: "perinto" | "jalki"; kohde?: string; tapa?: Mode; viive?: number; kriisit?: "pois"; a?: number; b?: number };
type Patch = { [K in keyof Search]?: Search[K] | undefined };
const DEFAULT_TARGET = "gapminder.finland.children_per_woman_total_fertility.v20261026";

export const Route = createFileRoute("/skanneri")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const out: Search = {};
    if (s["nakyma"] === "perinto" || s["nakyma"] === "jalki") out.nakyma = s["nakyma"];
    if (typeof s["kohde"] === "string") out.kohde = s["kohde"];
    if (s["tapa"] === "a" || s["tapa"] === "t" || s["tapa"] === "m") out.tapa = s["tapa"];
    const v = Number(s["viive"]);
    if (v >= 1 && v <= 5) out.viive = Math.round(v);
    if (s["kriisit"] === "pois") out.kriisit = "pois";
    for (const k of ["a", "b"] as const) {
      const y = Number(s[k]);
      if (y >= 1850 && y <= 2025) out[k] = Math.round(y);
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Skanneri – Murrosmatriisi" },
      {
        name: "description",
        content: "Koko aineiston skannaus 1850–2025: mitkä sarjat muuttuvat ennen valittua ilmiötä ja mitkä sen jälkeen, ja miten kaksi kriisiä erosivat toisistaan.",
      },
      { property: "og:title", content: "Skanneri – Murrosmatriisi" },
      { property: "og:description", content: "Vertaa skannauksia: mikä edeltää mitä, ja mikä erotti kriisit toisistaan. Tulokset ovat testattavia ehdokkaita, eivät syitä." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScannerPage,
});

const nf = (v: number, d = 2) => v.toLocaleString("fi-FI", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v: number) => `${Math.round(v * 100)} %`;
const STATUS: Record<Status, { label: string; cls: string }> = {
  ehdokas: { label: "Ehdokas", cls: "border-primary text-primary" },
  heikko: { label: "Heikko", cls: "border-amber-600 text-amber-800 dark:text-amber-300" },
  sattumaa: { label: "Sattumaa", cls: "border-border text-muted-foreground" },
};

function ScannerPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const set = (patch: Patch) => navigate({ search: (prev) => ({ ...prev, ...patch }) as Search, replace: true, resetScroll: false });
  const target = byKey(search.kohde ?? DEFAULT_TARGET) ?? byKey(DEFAULT_TARGET)!;
  const mode: Mode = search.tapa ?? "m";
  const w = search.viive ?? 2;
  const dropCrises = search.kriisit === "pois";
  const det: Det = mode === "t" ? "t" : "a";
  const A = search.a ?? 1991, B = search.b ?? 2009;

  const unique = useMemo(() => uniqueSeries(), []);
  const ndup = SCANNER.series.length - unique.length;
  const crises = useMemo(() => crisisYears("a"), []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Murrosmatriisi</Link>
        <h1 className="mt-2 font-display text-3xl">Skanneri</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Skanneri käy läpi {unique.length} kansallista sarjaa vuosilta 1850–2025 ja vertaa niiden muutoksia keskenään.
          Se rajaa nopeasti, mitkä ilmiöt kannattaa testata selityksiksi. Löydökset ovat <strong>järjestysehdokkaita</strong>:
          ne kertovat, mikä muuttui ensin, eivät sitä, mikä aiheutti mitä.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {ndup} sarjaa on jätetty pois, koska ne ovat toisen sarjan kaksoiskappaleita (vuosimuutosten korrelaatio yli 0,97).
        </p>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Skannerin näkymä">
        <button type="button" aria-pressed={!search.nakyma} onClick={() => set({ nakyma: undefined })} className="rounded-lg border px-4 py-2 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground">Järjestysskanneri</button>
        <button type="button" aria-pressed={search.nakyma === "perinto"} onClick={() => set({ nakyma: "perinto" })} className="rounded-lg border px-4 py-2 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground">Perintöskanneri · uusi</button>
        <button type="button" aria-pressed={search.nakyma === "jalki"} onClick={() => set({ nakyma: "jalki" })} className="rounded-lg border px-4 py-2 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground">Kriisin jälki · trendikorjattu</button>
      </nav>
      {search.nakyma === "perinto" ? <LegacyScanner /> : search.nakyma === "jalki" ? <CrisisTrace /> : <>
      <Seismograph det={det} a={A} b={B} onPick={(y) => set({ a: y })} />

      <TargetScan target={target} mode={mode} w={w} dropCrises={dropCrises} crises={crises} set={set} />

      <EpisodeCompare det={det} A={A} B={B} set={set} />

      <section className="mt-8 rounded-lg border bg-card p-4 text-sm">
        <h2 className="font-display text-xl">Miten tätä luetaan</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Ehdokas</strong> tarkoittaa, että järjestys erottuu sattumasta, vaikka samaan aikaan testataan satoja sarjoja (väärien löydösten osuus alle 10 %, Benjamini–Hochberg). <strong>Heikko</strong> on yksittäin merkitsevä, mutta voi olla monen testin sattumaa.</li>
          <li>Ehdokas ei ole syy. Molempiin voi vaikuttaa kolmas tekijä eri viiveellä, ja osa pareista on mekaanisia (osa ja kokonaisuus, sama luku eri yksikössä, väestön kasvu). Seuraava askel on ennalta kirjattu testi, kuten <Link to="/selitykset" className="underline underline-offset-4">Selitysten punnituksessa</Link>.</li>
          <li><strong>Vuosimuutokset</strong>-tapa on herkin: siinä muutokset rajataan sarjan omaan 5–95 %:n väliin ja sarjan oma jatkuvuus poistetaan, jotta kaksi tasaista trendiä ei näytä yhteydeltä.</li>
          <li><strong>Poikkeamat</strong> ja <strong>käänteet</strong> ovat harvinaisia tapahtumia, joten yksittäisen parin testi on niillä heikko. Ne sopivat paremmin kriisien vertailuun.</li>
          <li>Kriisivuosien poisto ({crises[0]}–{crises.at(-1)}, {crises.length} vuotta, joina poikkeamien osuus ylitti sattuman rajan) näyttää, säilyykö yhteys tavallisina vuosina.</li>
          <li>Teemaluokitus on lähdeaineiston, ja se on paikoin karkea. Elämänalue on johdettu siitä avainsanoilla.</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Lähde: {SCANNER.meta.source}. Tunnistimet: {DETECTORS.a.info.toLowerCase()}; {DETECTORS.t.info.toLowerCase()}.</p>
      </section>
      </>}
    </main>
  );
}

// ——— Seismografi: koko aineiston ja elämänalueiden tapahtumaosuus vuosittain ———

function Seismograph({ det, a, b, onPick }: { det: Det; a: number; b: number; onPick: (y: number) => void }) {
  const nat = SCANNER.national[det];
  const lanes = useMemo(() => LANES.map((l) => ({ lane: l, shares: laneShares(l, det) })), [det]);
  const W = 760, L = 150, R = 750, TOP = 10, BOT = 120, ROW = 14, LT = 140;
  const H = LT + lanes.length * ROW + 24;
  const X0 = 1850, X1 = 2025;
  const x = (y: number) => L + ((y - X0) / (X1 - X0)) * (R - L);
  const max = Math.max(...nat.share, nat.threshold) * 1.05;
  const y = (v: number) => BOT - (v / max) * (BOT - TOP);
  const d = nat.years.map((yr, i) => `${i ? "L" : "M"}${x(yr).toFixed(1)},${y(nat.share[i]!).toFixed(1)}`).join(" ");
  const peaks = nat.years.map((yr, i) => [yr, nat.share[i]!] as const).filter(([, s]) => s > nat.threshold);
  return (
    <section className="rounded-lg border bg-card p-4" aria-labelledby="seis-h">
      <h2 id="seis-h" className="font-display text-xl">
        {det === "a" ? "Kriisivuodet erottuvat sattumasta" : "Rakennemuutoksen käänteet keskittyvät sotiin ja 1990-luvun lamaan"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Osuus sarjoista, joissa on {DETECTORS[det].short} kyseisenä vuonna. Katkoviiva on sattuman raja ({pct(nat.threshold)}). Valitse vuosi napauttamalla kuvaa: se tulee vertailun ensimmäiseksi vuodeksi.
      </p>
      <div className="mt-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[640px] cursor-crosshair" role="img"
        aria-label={`${DETECTORS[det].label}: osuus sarjoista vuosittain 1850–2025 sekä elämänalueittain`}
        onClick={(e) => {
          const box = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - box.left) / box.width) * W;
          const yr = Math.round(X0 + ((px - L) / (R - L)) * (X1 - X0));
          if (yr >= X0 && yr <= X1) onPick(yr);
        }}>
        {[a, b].map((yr, i) => (
          <g key={i}>
            <rect x={x(yr) - 3} y={TOP} width={6} height={H - TOP - 20} fill="var(--primary)" fillOpacity={0.12} />
            <text x={x(yr)} y={H - 4} textAnchor="middle" className="fill-primary text-[11px] font-semibold">{i ? "B" : "A"} {yr}</text>
          </g>
        ))}
        <line x1={L} x2={R} y1={y(nat.threshold)} y2={y(nat.threshold)} stroke="var(--foreground)" strokeOpacity={0.5} strokeDasharray="4 3" />
        <text x={L - 6} y={y(nat.threshold) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">sattuman raja</text>
        <text x={L - 6} y={y(0) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">0 %</text>
        <path d={d} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.3} />
        {peaks.map(([yr, s]) => <circle key={yr} cx={x(yr)} cy={y(s)} r={2.6} fill="var(--primary)" />)}
        {peaks.filter(([yr], i) => i === 0 || yr - peaks[i - 1]![0] > 3).map(([yr, s]) => (
          <text key={yr} x={x(yr)} y={y(s) - 6} textAnchor="middle" className="fill-foreground text-[10px]">{yr}</text>
        ))}
        {lanes.map(({ lane, shares }, i) => {
          const top = LT + i * ROW;
          return (
            <g key={lane}>
              <text x={L - 6} y={top + 10} textAnchor="end" className="fill-muted-foreground text-[10px]">{lane}</text>
              {[...shares].map(([yr, s]) => (
                <rect key={yr} x={x(yr) - 1.8} y={top} width={3.6} height={ROW - 3} fill="var(--primary)" fillOpacity={Math.min(1, s / 0.6)}>
                  <title>{`${lane} ${yr}: ${pct(s)}`}</title>
                </rect>
              ))}
            </g>
          );
        })}
        {[1850, 1900, 1950, 2000].map((t) => (
          <text key={t} x={x(t)} y={LT - 4} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>
        ))}
      </svg>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Kaistat: elämänalueen sarjoista tapahtuman saaneiden osuus (tummempi = suurempi), vain vuodet, joilla alueella on vähintään viisi sarjaa.</p>
    </section>
  );
}

// ——— Kohdesarja: mikä edeltää ja mikä seuraa ———

function TargetScan({ target, mode, w, dropCrises, crises, set }: {
  target: ScanSeries; mode: Mode; w: number; dropCrises: boolean; crises: number[]; set: (p: Patch) => void;
}) {
  const [query, setQuery] = useState("");
  const [pair, setPair] = useState<string | null>(null);
  const results = useMemo(
    () => scanTarget(target, mode, w, dropCrises ? new Set(crises) : undefined),
    [target, mode, w, dropCrises, crises],
  );
  const lead = [...results].sort((a, b) => a.pLead - b.pLead).slice(0, 12);
  const lag = [...results].sort((a, b) => a.pLag - b.pLag).slice(0, 12);
  const nLead = results.filter((r) => status(r.pLead, r.qLead) === "ehdokas").length;
  const nLag = results.filter((r) => status(r.pLag, r.qLag) === "ehdokas").length;
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return uniqueSeries().filter((s) => s.t.toLowerCase().includes(q) || s.k.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);
  const pairRow = results.find((r) => r.s.k === pair);

  return (
    <section className="mt-8 rounded-lg border bg-card p-4" aria-labelledby="target-h">
      <h2 id="target-h" className="font-display text-xl">Mikä muuttuu ennen valittua ilmiötä, mikä sen jälkeen?</h2>
      <p className="mt-1 text-sm text-muted-foreground">Valitse kohdesarja. Skanneri vertaa sitä kaikkiin muihin sarjoihin ja järjestää ne sen mukaan, kuinka selvästi niiden muutos edeltää tai seuraa kohteen muutosta.</p>

      <div className="mt-3">
        <label className="text-sm font-medium" htmlFor="target-q">Hae kohdesarja</label>
        <input id="target-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="esim. työttömyys, syntyvyys, palkka"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        {matches.length > 0 && (
          <ul className="mt-1 max-h-60 overflow-auto rounded-md border bg-background text-sm">
            {matches.map((s) => (
              <li key={s.k}>
                <button className="w-full px-3 py-1.5 text-left hover:bg-muted" onClick={() => { set({ kohde: s.k }); setQuery(""); setPair(null); }}>
                  {s.t} <span className="text-muted-foreground">· {s.y0}–{lastYear(s)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button key={m} onClick={() => set({ tapa: m })} aria-pressed={mode === m}
            className={`rounded-md border px-3 py-1 ${mode === m ? "bg-primary text-primary-foreground" : ""}`}>{MODES[m]}</button>
        ))}
        <label className="ml-2 flex items-center gap-1">Viive enintään
          <select value={w} onChange={(e) => set({ viive: Number(e.target.value) })} className="rounded-md border bg-background px-2 py-1">
            {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} v</option>)}
          </select>
        </label>
        <label className="ml-2 flex items-center gap-1">
          <input type="checkbox" checked={dropCrises} onChange={(e) => set({ kriisit: e.target.checked ? "pois" : undefined })} />
          Ohita kriisivuodet
        </label>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold">{target.t}</div>
        <div className="text-xs text-muted-foreground">{target.u} · {target.lane} · {target.y0}–{lastYear(target)}</div>
        <Sparkline s={target} det={mode === "t" ? "t" : "a"} />
      </div>

      <p className="mt-3 text-sm">
        Testattu {results.length} sarjaa. <strong>{nLead}</strong> muuttuu kohdetta ennen ja <strong>{nLag}</strong> sen jälkeen niin selvästi, että järjestys erottuu sattumasta.
      </p>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <ResultList title="Muuttuu ensin (ehdokas edellä)" rows={lead} dir="lead" onPick={setPair} active={pair} onTarget={(k) => { set({ kohde: k }); setPair(null); }} />
        <ResultList title="Muuttuu jäljessä (kohde edellä)" rows={lag} dir="lag" onPick={setPair} active={pair} onTarget={(k) => { set({ kohde: k }); setPair(null); }} />
      </div>

      {pairRow && <PairView target={target} row={pairRow} det={mode === "t" ? "t" : "a"} onClose={() => setPair(null)} />}
    </section>
  );
}

function stat(r: LeadResult, dir: "lead" | "lag") {
  if (r.mode === "m") {
    const rr = dir === "lead" ? r.r! : r.rLag!, k = dir === "lead" ? r.k! : r.kLag!;
    return `r = ${nf(rr)}, viive ${k} v${rr < 0 ? " (vastakkaiset suunnat)" : ""}`;
  }
  return dir === "lead"
    ? `${r.before}/${r.n} kohteen tapahtumaa edeltää, ${r.after} seuraa`
    : `${r.after}/${r.n} kohteen tapahtumaa seuraa, ${r.before} edeltää`;
}

function ResultList({ title, rows, dir, onPick, onTarget, active }: {
  title: string; rows: LeadResult[]; dir: "lead" | "lag"; onPick: (k: string) => void; onTarget: (k: string) => void; active: string | null;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ol className="mt-1 divide-y rounded-md border text-sm">
        {rows.map((r) => {
          const p = dir === "lead" ? r.pLead : r.pLag, q = dir === "lead" ? r.qLead : r.qLag;
          const st = STATUS[status(p, q)];
          return (
            <li key={r.s.k} className={`px-2 py-1.5 ${active === r.s.k ? "bg-muted" : ""}`}>
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 rounded-full border px-1.5 text-[10px] font-semibold uppercase ${st.cls}`}>{st.label}</span>
                <button className="text-left hover:underline" onClick={() => onPick(r.s.k)}>{r.s.t}</button>
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-2 pl-1 text-xs text-muted-foreground">
                <span>{stat(r, dir)}</span>
                <span>q = {q < 0.001 ? "< 0,001" : nf(q, 3)}</span>
                <span>{r.s.lane}</span>
                <button className="underline underline-offset-2" onClick={() => onTarget(r.s.k)}>tee kohteeksi</button>
              </div>
            </li>
          );
        })}
        {rows.length === 0 && <li className="px-2 py-2 text-muted-foreground">Ei verrattavia sarjoja: kohdesarja on liian lyhyt tai sen tapahtumia on liian vähän.</li>}
      </ol>
    </div>
  );
}

// Pienet kuvaajat: sarjan taso ja tapahtumat samalla aika-akselilla.
function Sparkline({ s, det, from, to, accent = true }: { s: ScanSeries; det: Det; from?: number; to?: number; accent?: boolean }) {
  const W = 760, H = 70, L = 4, R = 756;
  const a = from ?? s.y0, b = to ?? lastYear(s);
  const pts = s.v.map((v, i) => [s.y0 + i, v] as const).filter((p): p is readonly [number, number] => p[1] != null && p[0] >= a && p[0] <= b);
  if (pts.length < 2) return null;
  const lo = Math.min(...pts.map((p) => p[1])), hi = Math.max(...pts.map((p) => p[1]));
  const x = (y: number) => L + ((y - a) / Math.max(1, b - a)) * (R - L);
  const y = (v: number) => 54 - ((v - lo) / (hi - lo || 1)) * 48;
  const ev = [...eventsOf(s, det)].filter(([yr, on]) => on && yr >= a && yr <= b).map(([yr]) => yr);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 h-auto w-full" role="img" aria-label={`${s.t} ${a}–${b}; ${DETECTORS[det].short}vuodet merkitty`}>
      <path d={pts.map(([yr, v], i) => `${i ? "L" : "M"}${x(yr).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} fill="none"
        stroke={accent ? "var(--primary)" : "var(--foreground)"} strokeOpacity={accent ? 1 : 0.7} strokeWidth={1.8} />
      {ev.map((yr) => <line key={yr} x1={x(yr)} x2={x(yr)} y1={58} y2={66} stroke="var(--foreground)" strokeWidth={1.4}><title>{`${yr}: ${DETECTORS[det].short}`}</title></line>)}
      <text x={L} y={H - 1} className="fill-muted-foreground text-[10px]">{a}</text>
      <text x={R} y={H - 1} textAnchor="end" className="fill-muted-foreground text-[10px]">{b}</text>
    </svg>
  );
}

function PairView({ target, row, det, onClose }: { target: ScanSeries; row: LeadResult; det: Det; onClose: () => void }) {
  const from = Math.max(target.y0, row.s.y0), to = Math.min(lastYear(target), lastYear(row.s));
  const changeText = row.mode === "m" ? (() => {
    const ct = changes(target), cc = changes(row.s);
    const n = [...ct.keys()].filter((y) => cc.has(y)).length;
    return `${n} yhteistä vuosimuutosta.`;
  })() : `Viivat alla: ${DETECTORS[det].short}vuodet.`;
  return (
    <div className="mt-4 rounded-md border bg-background p-3">
      <div className="flex items-start gap-2">
        <h3 className="text-sm font-semibold">Pari tarkemmin, {from}–{to}</h3>
        <button onClick={onClose} className="ml-auto rounded-md border px-2 text-xs">Sulje</button>
      </div>
      <div className="mt-2 text-xs font-semibold text-primary">Kohde: {target.t}</div>
      <Sparkline s={target} det={det} from={from} to={to} />
      <div className="mt-2 text-xs font-semibold">Verrattava: {row.s.t} <span className="font-normal text-muted-foreground">({row.s.u})</span></div>
      <Sparkline s={row.s} det={det} from={from} to={to} accent={false} />
      <p className="mt-2 text-xs text-muted-foreground">
        {changeText} Edellä: {stat(row, "lead")}. Jäljessä: {stat(row, "lag")}. Tarkista ennen päätelmää, onko pari mekaaninen (osa ja kokonaisuus, sama asia eri yksikössä) ja mikä kolmas tekijä voisi selittää molemmat.
      </p>
    </div>
  );
}

// ——— Kahden jakson vertailu ———

function EpisodeCompare({ det, A, B, set }: { det: Det; A: number; B: number; set: (p: Patch) => void }) {
  const c = useMemo(() => compareEpisodes(det, A, B, 1), [det, A, B]);
  const years = SCANNER.national[det].years;
  const top = (list: ScanSeries[]) => list.slice(0, 14);
  return (
    <section className="mt-8 rounded-lg border bg-card p-4" aria-labelledby="ep-h">
      <h2 id="ep-h" className="font-display text-xl">Mikä erotti kaksi jaksoa toisistaan?</h2>
      <p className="mt-1 text-sm text-muted-foreground">Jakso on valittu vuosi ± 1. Palkki: osuus elämänalueen sarjoista, joissa oli {DETECTORS[det].short} jakson aikana.</p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        {(["a", "b"] as const).map((k) => (
          <label key={k} className="flex items-center gap-1">{k.toUpperCase()}
            <select value={k === "a" ? A : B} onChange={(e) => set({ [k]: Number(e.target.value) })} className="rounded-md border bg-background px-2 py-1">
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        ))}
        <span className="text-muted-foreground">Esimerkkejä:</span>
        {([[1931, 1991], [1991, 2009], [2009, 2020], [1918, 1945]] as const).map(([a, b]) => (
          <button key={`${a}-${b}`} onClick={() => set({ a, b })} className="rounded-md border px-2 py-0.5">{a} / {b}</button>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {c.lanes.map((l) => {
          const sa = l.na ? l.a / l.na : null, sb = l.nb ? l.b / l.nb : null;
          return (
            <div key={l.lane} className="grid grid-cols-[9rem_1fr] items-center gap-2 text-xs sm:grid-cols-[13rem_1fr]">
              <span className="text-muted-foreground">{l.lane}</span>
              <div className="space-y-0.5">
                <Bar v={sa} n={l.na} label={`A ${A}`} strong />
                <Bar v={sb} n={l.nb} label={`B ${B}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
        <EpisodeList title={`Vain A (${A})`} list={top(c.onlyA)} total={c.onlyA.length} />
        <EpisodeList title={`Vain B (${B})`} list={top(c.onlyB)} total={c.onlyB.length} />
        <EpisodeList title="Molemmissa" list={top(c.both)} total={c.both.length} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Listoissa vain sarjat, jotka kattavat molemmat jaksot, joten ero ei johdu siitä, että sarja puuttuu toisesta.</p>
    </section>
  );
}

function Bar({ v, n, label, strong }: { v: number | null; n: number; label: string; strong?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 flex-1 rounded-sm bg-muted">
        {v != null && <div className={`h-3 rounded-sm ${strong ? "bg-primary" : "bg-foreground/50"}`} style={{ width: `${Math.max(1, v * 100)}%` }} />}
      </div>
      <span className="w-28 shrink-0 tabular-nums">{label}: {v == null ? "ei sarjoja" : `${pct(v)} (n ${n})`}</span>
    </div>
  );
}

function EpisodeList({ title, list, total }: { title: string; list: ScanSeries[]; total: number }) {
  return (
    <div>
      <h3 className="font-semibold">{title} <span className="font-normal text-muted-foreground">· {total} sarjaa</span></h3>
      <ul className="mt-1 space-y-0.5 text-xs">
        {list.map((s) => <li key={s.k}>{s.t} <span className="text-muted-foreground">· {s.lane}</span></li>)}
        {total > list.length && <li className="text-muted-foreground">… ja {total - list.length} muuta</li>}
      </ul>
    </div>
  );
}
