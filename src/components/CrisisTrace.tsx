// Kriisin jälki (trendikorjattu): jäikö kriisistä poikkeama sarjan aiempaan suuntaan nähden, ja onko
// se suurempi kuin tavallisten vuosien samankokoisten heilahdusten jälki? Laskenta: src/lib/crisis-trace.ts.
import { useMemo, useState } from "react";
import {
  EPISODES,
  KINDS,
  KIND_ORDER,
  MIN_SHOCK,
  PRE_YEARS,
  deviationText,
  distribution,
  horizonsFor,
  placeboSummary,
  rareSummary,
  scanEpisode,
  trendAt,
  type Episode,
  type Horizon,
  type Kind,
  type SeriesResult,
} from "@/lib/crisis-trace";
import { LANES, SCANNER } from "@/lib/scanner";

const pct = (v: number) => `${Math.round(v * 100)} %`;
const nf = (v: number, d = 1) => v.toLocaleString("fi-FI", { maximumFractionDigits: d });

function useEpisode(e: Episode, h: number) {
  return useMemo(() => {
    const rows = scanEpisode(SCANNER.series, e, h);
    return { rows, dist: distribution(rows), normal: placeboSummary(SCANNER.series, e.to - e.from + 1, h), rare: rareSummary(rows) };
  }, [e, h]);
}

export function CrisisTrace() {
  const [h, setH] = useState<Horizon>(5);
  const [epId, setEpId] = useState("lama");
  const ep = EPISODES.find((e) => e.id === epId)!;
  const hs = horizonsFor(ep);
  const hh = (hs as readonly number[]).includes(h) ? h : hs.at(-1)!;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Kriisin jälki · trendikorjattu</p>
        <h2 className="mt-2 font-display text-2xl">Jäikö kriisistä pysyvä jälki, vai käykö tavallisillekin heilahduksille samoin?</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Jokaisen sarjan kehitystä verrataan sen omaan suuntaan {PRE_YEARS} vuotta ennen kriisiä. Kriisin isku on suurin
          poikkeama tästä trendistä kriisivuosina, ja jälki on poikkeama {hh} vuotta kriisin jälkeen. Samat luvut lasketaan
          myös tavallisille vuosille. Vasta ero niihin kertoo, oliko kriisin jälki poikkeuksellinen.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Seuranta kriisin jälkeen:</span>
          {([3, 5, 10] as const).map((v) => (
            <button key={v} type="button" onClick={() => setH(v)} aria-pressed={hh === v} disabled={!(hs as readonly number[]).includes(v)}
              className="rounded-md border px-3 py-1 aria-pressed:bg-primary aria-pressed:text-primary-foreground disabled:opacity-40">{v} vuotta</button>
          ))}
        </div>
      </section>

      <Overview h={hh} selected={ep.id} onPick={setEpId} />
      <EpisodeView key={`${ep.id}-${hh}`} e={ep} h={hh} />

      <details className="rounded-xl border bg-card p-5 text-sm">
        <summary className="cursor-pointer font-medium">Laskenta ja rajaukset</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Aina positiiviset sarjat käsitellään logaritmeina, jolloin trendi on kasvuvauhti ja poikkeama prosentteja.</li>
          <li>Trendi on suora, joka sovitetaan {PRE_YEARS} kriisiä edeltävään vuoteen (vähintään kahdeksan havaintoa). Kriisin isku on suurin poikkeama siitä kriisivuosina, mitattuna sarjan tavallisina vuosimuutoksina (mediaani). Alle {MIN_SHOCK} tavallisen vuosimuutoksen iskuja ei luokitella.</li>
          <li>Luokat: jäljellä alle kolmannes iskusta = palasi trendiin; kolmannes – 1,2-kertainen = pysyvä jälki; yli 1,2-kertainen = syveni; trendin toisella puolella yli kolmannes = kääntyi yli.</li>
          <li>Tavalliset vuodet: kaikki samanpituiset jaksot, joiden trendijaksoon, iskuväliin tai seurantaan ei osu yhtään kriisiä. Harmaa palkki on näiden jaksojen 5–95 %:n vaihteluväli. ▲ tai ▼ tarkoittaa, että kriisin osuus on sen ulkopuolella.</li>
          <li>Harvinaisen suuri jälki: sarjan jäännöspoikkeama on suurempi kuin 95 %:ssa saman sarjan tavallisista jaksoista. Vertailu tehdään sarjoille, joilla on vähintään 19 tavallista jaksoa, joten lyhyet sarjat jäävät pois. Sattumalta 5 % sarjoista ylittää rajan. Sarjat eivät ole toisistaan riippumattomia, joten määrää kannattaa lukea suuruusluokkana.</li>
          <li>Suoran trendin jatkaminen on epävarmaa, ja virhe kasvaa seurannan pidetessä. Siksi tavallisetkin heilahdukset näyttävät usein "syvenevän". Juuri tästä syystä kriisejä verrataan tavallisiin vuosiin eikä nollaan.</li>
          <li>Kaksoiskappaleet jätetään pois. Elämänalue on johdettu lähdeaineiston teemasta. Tulos kertoo pysyvyydestä, ei siitä, aiheuttiko kriisi muutoksen.</li>
        </ul>
        <p className="mt-2 text-muted-foreground">Lähde: {SCANNER.meta.source}.</p>
      </details>
    </div>
  );
}

// ——— Kaikki kriisit samalla seurantavälillä ———

function Overview({ h, selected, onPick }: { h: number; selected: string; onPick: (id: string) => void }) {
  const rows = useMemo(
    () =>
      EPISODES.filter((e) => (horizonsFor(e) as readonly number[]).includes(h)).map((e) => {
        const r = scanEpisode(SCANNER.series, e, h);
        return { e, dist: distribution(r), normal: placeboSummary(SCANNER.series, e.to - e.from + 1, h), rare: rareSummary(r) };
      }),
    [h],
  );
  const mark = (k: Kind, r: (typeof rows)[number]) =>
    r.dist.share[k] > r.normal.hi[k] ? "▲" : r.dist.share[k] < r.normal.lo[k] ? "▼" : "";
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="font-display text-xl">Sodat ja nälkävuodet palautuivat trendiin tavallista useammin; talouskriisit jättivät harvinaisen suuria jälkiä</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Seuranta {h} vuotta kriisin jälkeen. Prosentit ovat osuuksia sarjoista, joihin kriisi iski. Suluissa tavallisten vuosien vaihteluväli; ▲ ja ▼ merkitsevät sen ylitystä tai alitusta. Valitse kriisi riviltä.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-1 pr-2 font-medium">Kriisi</th>
              <th className="px-2 font-medium">Sarjoja</th>
              {(["palasi", "jalki", "syveni", "ylitti"] as Kind[]).map((k) => <th key={k} className="px-2 font-medium">{KINDS[k].label}</th>)}
              <th className="px-2 font-medium">Harvinaisen suuri jälki</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.e.id} className={`border-b align-top ${selected === r.e.id ? "bg-muted" : ""}`}>
                <td className="py-1.5 pr-2">
                  <button type="button" onClick={() => onPick(r.e.id)} className="text-left font-medium underline-offset-4 hover:underline" aria-pressed={selected === r.e.id}>
                    {r.e.label}
                  </button>
                  <div className="text-xs text-muted-foreground">{r.e.from}–{r.e.to}</div>
                </td>
                <td className="px-2 tabular-nums">{r.dist.n}</td>
                {(["palasi", "jalki", "syveni", "ylitti"] as Kind[]).map((k) => {
                  const m = mark(k, r);
                  return (
                    <td key={k} className="px-2 tabular-nums">
                      <span className={m ? "font-semibold text-primary" : ""}>{pct(r.dist.share[k])}{m && ` ${m}`}</span>
                      <div className="text-[11px] text-muted-foreground">({Math.round(r.normal.lo[k] * 100)}–{pct(r.normal.hi[k])})</div>
                    </td>
                  );
                })}
                <td className="px-2 tabular-nums">
                  {r.rare.tested ? (
                    <>
                      <span className={r.rare.rare >= 2 * r.rare.expected && r.rare.rare >= 3 ? "font-semibold text-primary" : ""}>{r.rare.rare} / {r.rare.tested}</span>
                      <div className="text-[11px] text-muted-foreground">sattumalta ~{nf(r.rare.expected)}</div>
                    </>
                  ) : <span className="text-muted-foreground">ei verrattavia</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {h === 10 && <p className="mt-2 text-xs text-muted-foreground">Pandemia puuttuu: kymmenen vuoden seurantaa ei vielä ole.</p>}
    </section>
  );
}

// ——— Valittu kriisi ———

function EpisodeView({ e, h }: { e: Episode; h: number }) {
  const { rows, dist, normal, rare } = useEpisode(e, h);
  const [lane, setLane] = useState("");
  const [onlyRare, setOnlyRare] = useState(true);
  const [key, setKey] = useState<string | null>(null);
  const list = rows
    .filter((r) => (!lane || r.s.lane === lane) && (!onlyRare || r.p < 0.05))
    .sort((a, b) => a.p - b.p || Math.abs(b.residual) - Math.abs(a.residual));
  const sel = rows.find((r) => r.s.k === key) ?? list[0];
  const lanes = LANES.map((l) => {
    const rs = rows.filter((r) => r.s.lane === l);
    const t = rs.filter((r) => r.placeboN >= 19);
    return { l, n: rs.length, tested: t.length, rare: t.filter((r) => r.p < 0.05).length };
  }).filter((x) => x.n > 0);

  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="font-display text-xl">{e.label} ({e.from}–{e.to}), seuranta {h} vuotta</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Kriisi iski {dist.n} sarjaan (vähintään {MIN_SHOCK} tavallisen vuosimuutoksen poikkeama trendistä).
        {rare.tested > 0 && ` Harvinaisen suuri jälki jäi ${rare.rare} sarjaan ${rare.tested}:stä, kun sattumalta odottaisi noin ${nf(rare.expected)}.`}
      </p>

      <DotRange dist={dist.share} lo={normal.lo} hi={normal.hi} mean={normal.mean} windows={normal.windows} />

      <h3 className="mt-6 text-sm font-semibold">Elämänalueittain</h3>
      <div className="mt-2 space-y-1">
        {lanes.map((x) => (
          <button key={x.l} type="button" onClick={() => setLane(lane === x.l ? "" : x.l)} aria-pressed={lane === x.l}
            className="grid w-full grid-cols-[9rem_1fr_7rem] items-center gap-2 rounded px-1 text-left text-xs hover:bg-muted aria-pressed:bg-muted sm:grid-cols-[13rem_1fr_8rem]">
            <span className="text-muted-foreground">{x.l}</span>
            <span className="h-2.5 rounded-sm bg-muted">
              {x.tested > 0 && <span className="block h-2.5 rounded-sm bg-primary" style={{ width: `${Math.max(2, (x.rare / x.tested) * 100)}%` }} />}
            </span>
            <span className="tabular-nums">{x.tested ? `${x.rare} / ${x.tested} harvinaista` : `${x.n} sarjaa, ei vertailua`}</span>
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Palkki: harvinaisen suurten jälkien osuus sarjoista, joille vertailu tavallisiin vuosiin voitiin tehdä. Napauta aluetta rajataksesi listan.</p>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <h3 className="font-semibold">Sarjat{lane && ` · ${lane}`}</h3>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={onlyRare} onChange={(ev) => setOnlyRare(ev.target.checked)} /> Vain harvinaisen suuret jäljet
        </label>
        {lane && <button type="button" className="rounded border px-2 text-xs" onClick={() => setLane("")}>Kaikki alueet</button>}
      </div>
      <div className="mt-2 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <ul className="max-h-[460px] overflow-y-auto rounded border text-sm">
          {list.map((r) => (
            <li key={r.s.k}>
              <button type="button" onClick={() => setKey(r.s.k)} aria-pressed={sel?.s.k === r.s.k}
                className="block w-full border-b p-2.5 text-left hover:bg-muted/50 aria-pressed:bg-muted">
                <span className="block font-medium">{r.s.t}</span>
                <span className="text-xs text-muted-foreground">
                  {KINDS[r.kind].label} · isku {deviationText(r, r.shock)} → jälki {deviationText(r, r.residual)}
                  {r.p < 0.05 && " · harvinainen"}
                </span>
              </button>
            </li>
          ))}
          {!list.length && <li className="p-3 text-muted-foreground">Ei sarjoja näillä rajauksilla.</li>}
        </ul>
        {sel && <TraceChart r={sel} e={e} />}
      </div>
    </section>
  );
}

function DotRange({ dist, lo, hi, mean, windows }: { dist: Record<Kind, number>; lo: Record<Kind, number>; hi: Record<Kind, number>; mean: Record<Kind, number>; windows: number }) {
  const W = 640, L = 130, R = 610, ROW = 30;
  const max = Math.max(0.8, ...KIND_ORDER.map((k) => Math.max(dist[k], hi[k]))) + 0.02;
  const x = (v: number) => L + (v / max) * (R - L);
  const H = KIND_ORDER.length * ROW + 30;
  return (
    <figure className="mt-4">
      <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px] max-w-3xl" role="img"
        aria-label={KIND_ORDER.map((k) => `${KINDS[k].label}: kriisissä ${pct(dist[k])}, tavallisesti ${pct(lo[k])}–${pct(hi[k])}`).join("; ")}>
        {[0, 0.2, 0.4, 0.6, 0.8].filter((t) => t <= max).map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={8} y2={H - 18} stroke="var(--border)" />
            <text x={x(t)} y={H - 4} textAnchor="middle" className="fill-muted-foreground text-[10px]">{pct(t)}</text>
          </g>
        ))}
        {KIND_ORDER.map((k, i) => {
          const cy = 20 + i * ROW;
          const out = dist[k] > hi[k] || dist[k] < lo[k];
          return (
            <g key={k}>
              <text x={L - 8} y={cy + 4} textAnchor="end" className="fill-foreground text-[12px]">{KINDS[k].label}</text>
              <rect x={x(lo[k])} y={cy - 6} width={Math.max(2, x(hi[k]) - x(lo[k]))} height={12} rx={3} fill="var(--muted-foreground)" fillOpacity={0.25} />
              <line x1={x(mean[k])} x2={x(mean[k])} y1={cy - 7} y2={cy + 7} stroke="var(--muted-foreground)" strokeWidth={1.5} />
              <circle cx={x(dist[k])} cy={cy} r={6} fill={out ? "var(--primary)" : "var(--card)"} stroke="var(--primary)" strokeWidth={2} />
              <text x={x(dist[k]) + 10} y={cy + 4} className={`text-[11px] ${out ? "fill-primary font-semibold" : "fill-muted-foreground"}`}>{pct(dist[k])}</text>
            </g>
          );
        })}
      </svg>
      </div>
      <figcaption className="text-xs text-muted-foreground">
        Pallo: kriisin osuus (täytetty, jos tavallisen vaihteluvälin ulkopuolella). Harmaa palkki: {windows} tavallisen jakson 5–95 %:n vaihteluväli, viiva niiden keskiarvo.
      </figcaption>
    </figure>
  );
}

function TraceChart({ r, e }: { r: SeriesResult; e: Episode }) {
  const from = e.from - PRE_YEARS, to = Math.min(r.endYear + 3, r.s.y0 + r.s.v.length - 1);
  const W = 560, H = 230, L = 52, R = 548, TOP = 14, BOT = 196;
  const obs: [number, number][] = [];
  for (let y = from; y <= to; y++) {
    const v = r.s.v[y - r.s.y0];
    if (typeof v === "number") obs.push([y, v]);
  }
  const tr: [number, number][] = [];
  for (let y = from; y <= r.endYear; y++) tr.push([y, trendAt(r, y)]);
  const all = [...obs, ...tr].map((p) => p[1]);
  const lo = Math.min(...all), hi = Math.max(...all);
  const x = (y: number) => L + ((y - from) / Math.max(1, to - from)) * (R - L);
  const y = (v: number) => BOT - ((v - lo) / (hi - lo || 1)) * (BOT - TOP);
  const path = (pts: [number, number][]) => pts.map(([a, b], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(b).toFixed(1)}`).join(" ");
  const at = (yr: number) => obs.find((p) => p[0] === yr)?.[1];
  const peakV = at(r.peakYear), endV = at(r.endYear);
  const fmt = (v: number) => v.toLocaleString("fi-FI", { maximumSignificantDigits: 3 });
  return (
    <div className="rounded border p-3">
      <h4 className="font-medium">{r.s.t}</h4>
      <p className="text-xs text-muted-foreground">{r.s.u} · {r.s.lane}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-auto w-full" role="img"
        aria-label={`${r.s.t} ${from}–${to}: havaittu kehitys ja kriisiä edeltänyt trendi`}>
        <rect x={x(e.from)} y={TOP} width={Math.max(2, x(e.to) - x(e.from))} height={BOT - TOP} fill="var(--primary)" fillOpacity={0.08} />
        <text x={x(e.from)} y={TOP - 3} className="fill-muted-foreground text-[10px]">kriisi</text>
        <line x1={x(r.endYear)} x2={x(r.endYear)} y1={TOP} y2={BOT} stroke="var(--foreground)" strokeOpacity={0.25} strokeDasharray="2 3" />
        {[lo, (lo + hi) / 2, hi].map((t, i) => (
          <text key={i} x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{fmt(t)}</text>
        ))}
        <path d={path(tr)} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="5 4" />
        <path d={path(obs)} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
        {peakV != null && <circle cx={x(r.peakYear)} cy={y(peakV)} r={4} fill="var(--primary)" />}
        {endV != null && <circle cx={x(r.endYear)} cy={y(endV)} r={4} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />}
        {[from, e.from, r.endYear].map((t) => (
          <text key={t} x={x(t)} y={H - 18} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>
        ))}
        <text x={L} y={H - 3} className="fill-muted-foreground text-[10px]">Katkoviiva: {PRE_YEARS} kriisiä edeltäneen vuoden trendi jatkettuna</text>
      </svg>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted-foreground">Isku ({r.peakYear})</dt><dd>{deviationText(r, r.shock)} trendistä</dd>
        <dt className="text-muted-foreground">Jälki ({r.endYear})</dt><dd>{deviationText(r, r.residual)} trendistä</dd>
        <dt className="text-muted-foreground">Luokka</dt><dd>{KINDS[r.kind].label}</dd>
        <dt className="text-muted-foreground">Tavallisiin vuosiin</dt>
        <dd>{r.placeboN >= 19 ? `jälki suurempi kuin ${Math.round((1 - r.p) * 100)} %:ssa sarjan ${r.placeboN} tavallisesta jaksosta` : "liian vähän tavallisia jaksoja vertailuun"}</dd>
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">Trendin jatkaminen on laskennallinen vertailukohta, ei arvio siitä, mitä ilman kriisiä olisi tapahtunut.</p>
    </div>
  );
}
