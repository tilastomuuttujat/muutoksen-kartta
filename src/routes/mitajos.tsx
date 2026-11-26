import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MITAJOS,
  RELIABILITY,
  SITUATIONS,
  eventData,
  recipe,
  standoutSpans,
  type EventData,
  type Ind,
  type Reliability,
} from "@/lib/mitajos";

type Search = { tilanne?: string };

export const Route = createFileRoute("/mitajos")({
  validateSearch: (s: Record<string, unknown>): Search =>
    typeof s["tilanne"] === "string" && SITUATIONS.some((x) => x.id === s["tilanne"]) ? { tilanne: s["tilanne"] } : {},
  head: () => ({
    meta: [
      { title: "Mitä jos – Murrosmatriisi" },
      { name: "description", content: "Mitä jos Suomi olisi kulkenut kuten verrokkinsa? Nälkävuodet, sisällissota, sodat, jälleenrakennus, kansanterveystyö, 1990-luvun lama ja finanssikriisi synteettistä Suomea vasten." },
      { property: "og:title", content: "Mitä jos – Murrosmatriisi" },
      { property: "og:description", content: "Suomi verrattuna synteettiseen Suomeen, joka seurasi sitä ennen murrosta: missä ero oli suuri, ja kuinka nopeasti se kurottiin kiinni." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhatIfPage,
});

const RCLS: Record<Reliability, string> = {
  selva: "border-primary bg-primary text-primary-foreground",
  kohtalainen: "border-primary text-primary",
  heikko: "border-border text-muted-foreground",
};
const nf = (v: number, d = 0) => v.toLocaleString("fi-FI", { maximumFractionDigits: d, minimumFractionDigits: d });

function WhatIfPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const sel = SITUATIONS.find((s) => s.id === search.tilanne) ?? SITUATIONS[0]!;
  const e = eventData(sel.id)!;
  const pick = (id: string) => navigate({ search: { tilanne: id }, replace: true, resetScroll: false });

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Murrosmatriisi</Link>
        <h1 className="mt-2 font-display text-3xl">Mitä jos?</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Mitä jos Suomi olisi kulkenut kuten verrokkinsa? Jokaiselle tilanteelle on koottu <strong>synteettinen Suomi</strong>:
          vertailumaiden yhdistelmä, joka seurasi Suomen kehitystä {MITAJOS.pre} vuotta ennen murrosta. Ero sen jälkeen on
          arvio murroksen vaikutuksesta. Arvio on uskottava vain, jos Suomen ero on suurempi kuin vertailumaiden omat erot,
          kun sama laskenta tehdään niille.
        </p>
      </header>

      <Timeline selected={sel.id} onPick={pick} />

      <section className="mt-6 rounded-xl border bg-card p-5" aria-labelledby="sit-h">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${RCLS[sel.reliability]}`}>Luotettavuus: {RELIABILITY[sel.reliability].label}</span>
          <span className="text-xs text-muted-foreground">Suomi {e.rank}. / {e.n} maasta · {MITAJOS.indicators[e.ind].label}</span>
        </div>
        <p className="mt-3 text-sm font-medium text-muted-foreground">{sel.title} · {sel.question}</p>
        <h2 id="sit-h" className="mt-1 font-display text-2xl">{sel.finding}</h2>

        <LevelChart e={e} />
        <GapChart e={e} />

        <p className="mt-3 text-sm"><span className="font-semibold">Synteettinen Suomi:</span> {recipe(e)}.</p>
        <p className="mt-2 text-sm">{sel.reading}</p>
        <p className="mt-2 text-sm text-muted-foreground"><span className="font-semibold">Varaus:</span> {sel.caveat}</p>
        <p className="mt-2 text-xs text-muted-foreground">Luotettavuus {RELIABILITY[sel.reliability].label.toLowerCase()}: {RELIABILITY[sel.reliability].info}.</p>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5 text-sm">
        <h2 className="font-display text-xl">Miten tätä luetaan</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Synteettinen Suomi on vertailumaiden painotettu yhdistelmä (painot ovat positiivisia ja summautuvat sataan prosenttiin). Painot valitaan niin, että yhdistelmä seuraa Suomen vaihtelua {MITAJOS.pre} vuotta ennen murrosta. Tasoja ei verrata suoraan, koska Suomi oli pitkään köyhempi kuin yksikään vertailumaa.</li>
          <li>Harmaat viivat: sama laskenta jokaiselle vertailumaalle, ikään kuin murros olisi osunut siihen. Ne näyttävät, kuinka paljon synteettinen verrokki osuu harhaan ilman Suomen tapahtumaa.</li>
          <li>Sija: Suomen poikkeaman suuruus kaikkien maiden joukossa (jälkijakson virhe suhteessa esijakson virheeseen). Sija 1 tarkoittaa, että Suomi poikkesi eniten.</li>
          <li>Arvio kertoo, mitä olisi tapahtunut, jos Suomi olisi jatkanut verrokkiensa tavoin. Se ei kerro, mitä Suomessa olisi tapahtunut ilman murrosta, jos verrokkeihin osui oma tapahtuma (sota, miehitys, öljy).</li>
          <li>Gapminder täyttää puuttuvat vuodet tasaisella kasvulla. Tällaiset vuodet on jätetty pois. Suomen BKT-sarja alkaa siksi vasta vuodesta 1861.</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Lähde: {MITAJOS.source}. Menetelmä ja tulokset: docs/mitajos.md.</p>
      </section>
    </main>
  );
}

// ——— Aikajana: tilanteet ja vuodet, joina Suomi poikkesi verrokeistaan eniten ———

function Timeline({ selected, onPick }: { selected: string; onPick: (id: string) => void }) {
  const W = 760, L = 120, R = 744, X0 = 1850, X1 = 2025;
  const x = (y: number) => L + ((y - X0) / (X1 - X0)) * (R - L);
  const rows: { ind: Ind; label: string }[] = [
    { ind: "lex", label: "Elinajanodote" },
    { ind: "gdp_pcap", label: "BKT asukasta kohti" },
  ];
  const MY = 34, SY = 92;
  const H = SY + rows.length * 22 + 26;
  return (
    <section className="rounded-xl border bg-card p-5" aria-labelledby="tl-h">
      <h2 id="tl-h" className="font-display text-xl">Kahdeksan tilannetta 1850–2025</h2>
      <p className="mt-1 text-sm text-muted-foreground">Valitse tilanne. Alla olevat palkit näyttävät vuodet, joina Suomi poikkesi verrokeistaan eniten tai toiseksi eniten, kun samaa laskentaa ajetaan jokaiselle vuodelle.</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SITUATIONS.map((s) => (
          <button key={s.id} type="button" onClick={() => onPick(s.id)} aria-pressed={s.id === selected}
            className="rounded-full border px-3 py-1 text-xs aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">
            {s.title}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[620px]" role="img" aria-label="Mitä jos -tilanteet aikajanalla ja vuodet, joina Suomi poikkesi verrokeistaan">
          <line x1={L} x2={R} y1={MY} y2={MY} stroke="var(--border)" strokeWidth={2} />
          {[1850, 1875, 1900, 1925, 1950, 1975, 2000, 2025].map((t) => (
            <text key={t} x={x(t)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>
          ))}
          {SITUATIONS.map((s, k) => {
            const i = k > SITUATIONS.findIndex((x) => x.id === "1918l") ? k - 1 : k;
            const e = eventData(s.id)!;
            const on = s.id === selected;
            const cx = x(e.T) + (s.id === "1918l" ? 9 : 0);
            return (
              <g key={s.id} className="cursor-pointer" onClick={() => onPick(s.id)} role="button" tabIndex={0}
                aria-label={`${s.title}, luotettavuus ${RELIABILITY[s.reliability].label}`} aria-pressed={on}
                onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onPick(s.id); } }}>
                <circle cx={cx} cy={MY} r={on ? 9 : 7} fill={s.reliability === "heikko" ? "var(--card)" : "var(--primary)"}
                  fillOpacity={s.reliability === "kohtalainen" ? 0.45 : 1} stroke="var(--primary)" strokeWidth={on ? 3 : 1.5} />
                {s.id !== "1918l" && (
                  <text x={cx} y={i % 2 ? MY + 26 : MY - 15} textAnchor="middle" className={`text-[10.5px] ${on || (s.id === "1918" && selected === "1918l") ? "fill-foreground font-semibold" : "fill-muted-foreground"}`}>
                    {s.title.replace(/: .*/, "").replace(" ja menetetty vuosikymmen", "")}
                  </text>
                )}
              </g>
            );
          })}
          {rows.map((r, i) => {
            const y = SY + i * 22;
            const first = MITAJOS.scan[r.ind][0]?.[0] ?? X0;
            return (
              <g key={r.ind}>
                <text x={L - 8} y={y + 10} textAnchor="end" className="fill-muted-foreground text-[10.5px]">{r.label}</text>
                <rect x={x(first)} y={y + 3} width={x(MITAJOS.scan[r.ind].at(-1)![0]) - x(first)} height={10} fill="var(--muted)" />
                {standoutSpans(r.ind).map((sp) => (
                  <rect key={sp.from} x={x(sp.from)} y={y + 1} width={Math.max(3, x(sp.to + 1) - x(sp.from))} height={14} rx={2}
                    fill="var(--primary)" fillOpacity={sp.best === 1 ? 1 : 0.5}>
                    <title>{`${sp.from}${sp.to > sp.from ? `–${sp.to}` : ""}: Suomi ${sp.best === 1 ? "suurin" : "toiseksi suurin"} poikkeama`}</title>
                  </rect>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Täysi pallo: selvä tai kohtalainen arvio, tyhjä: heikko. Palkit: tumma = Suomi poikkesi eniten, vaalea = toiseksi eniten (vuosi on vertailujakson alku). Kaikki palkit eivät ole Suomen tapahtumia:
        esimerkiksi 1930-luvun alun BKT-palkki johtuu verrokkimaiden romahduksesta 1940-luvulla.
      </p>
    </section>
  );
}

// ——— Kuvaajat ———

function axisYears(e: EventData) {
  const a = e.years[0]!, b = e.years.at(-1)!;
  return [a, e.T, b];
}

function LevelChart({ e }: { e: EventData }) {
  const W = 720, H = 230, L = 64, R = 640, TOP = 14, BOT = 196;
  const all = [...e.actual, ...e.synthetic];
  const lo = Math.min(...all), hi = Math.max(...all);
  const x = (y: number) => L + ((y - e.years[0]!) / (e.years.at(-1)! - e.years[0]!)) * (R - L);
  const y = (v: number) => BOT - ((v - lo) / (hi - lo || 1)) * (BOT - TOP);
  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(e.years[i]!).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const iT = e.years.indexOf(e.T);
  const area = [
    ...e.years.slice(iT).map((yr, k) => `${k ? "L" : "M"}${x(yr).toFixed(1)},${y(e.actual[iT + k]!).toFixed(1)}`),
    ...e.years.slice(iT).reverse().map((yr, k) => `L${x(yr).toFixed(1)},${y(e.synthetic[e.years.length - 1 - k]!).toFixed(1)}`),
    "Z",
  ].join(" ");
  const isGdp = e.ind === "gdp_pcap";
  const fmt = (v: number) => (isGdp ? `${nf(v / 1000, 1)} t$` : `${nf(v, 0)} v`);
  const lastA = e.actual.at(-1)!, lastS = e.synthetic.at(-1)!;
  const gapLabel = Math.abs(y(lastA) - y(lastS)) < 14 ? 8 : 0;
  return (
    <figure className="mt-4">
      <figcaption className="text-xs text-muted-foreground">{MITAJOS.indicators[e.ind].label}{isGdp ? " (tuhatta dollaria, kiintein hinnoin)" : " (vuotta)"}</figcaption>
      <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[540px]" role="img"
        aria-label={`Suomi ja synteettinen Suomi ${e.years[0]}–${e.years.at(-1)}; murros ${e.T}`}>
        <rect x={x(e.T)} y={TOP} width={R - x(e.T)} height={BOT - TOP} fill="var(--primary)" fillOpacity={0.04} />
        <path d={area} fill="var(--primary)" fillOpacity={0.14} />
        {[lo, (lo + hi) / 2, hi].map((t, i) => (
          <text key={i} x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{fmt(t)}</text>
        ))}
        <line x1={x(e.T)} x2={x(e.T)} y1={TOP} y2={BOT} stroke="var(--foreground)" strokeOpacity={0.4} strokeDasharray="2 3" />
        <path d={line(e.synthetic)} fill="none" stroke="var(--muted-foreground)" strokeWidth={2} strokeDasharray="6 4" />
        <path d={line(e.actual)} fill="none" stroke="var(--primary)" strokeWidth={2.6} />
        <text x={R + 6} y={y(lastA) + 4 - gapLabel} className="fill-primary text-[11px] font-semibold">Suomi</text>
        <text x={R + 6} y={y(lastS) + 4 + gapLabel} className="fill-muted-foreground text-[11px]">synteettinen</text>
        {axisYears(e).map((t) => (
          <text key={t} x={x(t)} y={H - 14} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>
        ))}
      </svg>
      </div>
    </figure>
  );
}

function GapChart({ e }: { e: EventData }) {
  const W = 720, H = 190, L = 64, R = 640, TOP = 10, BOT = 160;
  const vals = [...e.gap, ...Object.values(e.placebo).flat()];
  const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  const x = (y: number) => L + ((y - e.years[0]!) / (e.years.at(-1)! - e.years[0]!)) * (R - L);
  const y = (v: number) => BOT - ((v - lo) / (hi - lo || 1)) * (BOT - TOP);
  const line = (v: number[]) => v.map((g, i) => `${i ? "L" : "M"}${x(e.years[i]!).toFixed(1)},${y(g).toFixed(1)}`).join(" ");
  const isGdp = e.ind === "gdp_pcap";
  const unit = isGdp ? " %" : " v";
  return (
    <figure className="mt-4">
      <figcaption className="text-xs text-muted-foreground">
        Ero synteettiseen Suomeen ({isGdp ? "%" : "vuotta"}). Punainen: Suomi. Harmaat: sama laskenta jokaiselle {e.n - 1} vertailumaalle.
      </figcaption>
      <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[540px]" role="img"
        aria-label={`Suomen ero synteettiseen Suomeen ja vertailumaiden vastaavat erot, Suomi ${e.rank}. / ${e.n}`}>
        {Object.entries(e.placebo).map(([c, v]) => (
          <path key={c} d={line(v)} fill="none" stroke="var(--muted-foreground)" strokeOpacity={0.45} strokeWidth={1}>
            <title>{MITAJOS.names[c] ?? c}</title>
          </path>
        ))}
        <line x1={L} x2={R} y1={y(0)} y2={y(0)} stroke="var(--foreground)" strokeOpacity={0.6} />
        <line x1={x(e.T)} x2={x(e.T)} y1={TOP} y2={BOT} stroke="var(--foreground)" strokeOpacity={0.4} strokeDasharray="2 3" />
        <path d={line(e.gap)} fill="none" stroke="var(--primary)" strokeWidth={2.6} />
        {[lo, 0, hi].map((t, i) => (
          <text key={i} x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{t > 0 ? "+" : ""}{nf(t, isGdp ? 0 : 1)}{unit}</text>
        ))}
        {axisYears(e).map((t) => (
          <text key={t} x={x(t)} y={H - 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>
        ))}
      </svg>
      </div>
    </figure>
  );
}
