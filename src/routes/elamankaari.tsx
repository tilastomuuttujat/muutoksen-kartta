import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AGES, META, STATES, markerLabel, markerSeries, type Sex, type State } from "@/lib/lifecourse";

type Search = { tila?: string; sukupuoli?: Sex };

export const Route = createFileRoute("/elamankaari")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const out: Search = {};
    if (typeof s["tila"] === "string") out.tila = s["tila"];
    if (s["sukupuoli"] === "naiset" || s["sukupuoli"] === "miehet" || s["sukupuoli"] === "kaikki") out.sukupuoli = s["sukupuoli"];
    return out;
  },
  head: () => ({
    meta: [
      { title: "Elämänkaari – Murrosmatriisi" },
      {
        name: "description",
        content: "Missä elämänvaiheessa 15–45-vuotiaat ovat olleet vuosina 1987–2025: kotoa muutto, työ, parisuhde ja vanhemmuus ikävuosittain.",
      },
      { property: "og:title", content: "Elämänkaari – Murrosmatriisi" },
      { property: "og:description", content: "Miten 25-vuotiaan elämä on muuttunut: siirtymät ikävuosittain Tilastokeskuksen rekistereistä." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LifeCoursePage,
});

const SEXES: { key: Sex; label: string }[] = [
  { key: "kaikki", label: "Kaikki" },
  { key: "naiset", label: "Naiset" },
  { key: "miehet", label: "Miehet" },
];
const GROUPS: { key: State["group"]; label: string }[] = [
  { key: "asuminen", label: "Asuminen ja perhe" },
  { key: "toiminta", label: "Työ ja opiskelu" },
];
const num = (v: number, d = 1) => v.toLocaleString("fi-FI", { minimumFractionDigits: d, maximumFractionDigits: d });

function LifeCoursePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const state = STATES.find((s) => s.key === search.tila) ?? STATES[0]!;
  const sex: Sex = search.sukupuoli ?? "kaikki";
  const set = (patch: Search) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const markers = useMemo(() => markerSeries(state, sex), [state, sex]);
  const firstM = markers.find((m) => m.age != null);
  const lastM = [...markers].reverse().find((m) => m.age != null);
  const label = markerLabel(state);
  const title =
    firstM && lastM && firstM.age != null && lastM.age != null
      ? `${state.label}: ${label} ${num(firstM.age)} v (${firstM.year}) → ${num(lastM.age)} v (${lastM.year})`
      : `${state.label}: osuus ikävuosittain`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Murrosmatriisi</Link>
        <h1 className="mt-2 font-display text-3xl">Elämänkaari</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Missä elämänvaiheessa kunkin ikäiset ovat olleet vuosina {Math.min(...STATES.map((s) => s.years[0]!))}–
          {Math.max(...STATES.map((s) => s.years.at(-1)!))}. Väri kertoo osuuden ikävuoden väestöstä, viiva siirtymän iän.
          Pystysuunnassa luetaan yhden vuoden elämänkaari, vaakasuunnassa saman ikäisten muutos.
        </p>
      </header>

      <div className="mb-3 flex flex-wrap items-start gap-4">
        {GROUPS.map((g) => (
          <div key={g.key} role="group" aria-label={g.label}>
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{g.label}</div>
            <div className="flex flex-wrap gap-1">
              {STATES.filter((s) => s.group === g.key).map((s) => (
                <button key={s.key} onClick={() => set({ tila: s.key })} aria-pressed={s.key === state.key}
                  className={`rounded-full border px-3 py-1 text-sm ${s.key === state.key ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div role="group" aria-label="Sukupuoli">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ketkä</div>
          <div className="flex rounded-md border p-0.5">
            {SEXES.map((s) => (
              <button key={s.key} onClick={() => set({ sukupuoli: s.key })} aria-pressed={s.key === sex}
                className={`rounded px-2.5 py-1 text-sm ${s.key === sex ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="font-display text-xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {state.group === "asuminen" ? "Perheasema" : "Pääasiallinen toiminta"} vuoden lopussa, osuus ikävuoden väestöstä.
          {label && ` Musta viiva: ${label}.`}
        </p>
        <Heatmap state={state} sex={sex} markers={markers} />
      </section>

      <section className="mt-4 rounded-lg border bg-card p-4">
        <h2 className="font-display text-xl">Ikäprofiili: {state.years[0]} ja {state.years.at(-1)}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sama asia poikkileikkauksena: kuinka suuri osa kunkin ikäisistä oli tässä tilanteessa.</p>
        <Profile state={state} sex={sex} />
      </section>

      <section className="mt-4 text-sm text-muted-foreground">
        <p>
          Lähde: <a href={state.source_url} className="underline underline-offset-4">{state.source}</a>. {META.note}
        </p>
        <p className="mt-2">
          Kyse on poikkileikkauksista: kunkin vuoden ikäjakauma, ei samojen ihmisten seuranta. Perheasema "asuu vanhempien luona" tarkoittaa
          tilastossa lapsena perheessä asuvia, myös yhden vanhemman kanssa. Pääasiallinen toiminta on rekisteritieto vuoden viimeiseltä viikolta:
          työssä käyvä opiskelija voi näkyä työllisenä. Siirtymäikä on laskettu ikävuosien välillä tasaisesti interpoloiden.
          {state.group === "toiminta" &&
            " Vuodesta 2005 tilasto luokittelee alle 18-vuotiaat pääasiallisesti opiskelijoiksi, joten 15–17-vuotiaiden työssäolo näkyy nollana: kyse on luokitusmuutoksesta."}
        </p>
      </section>
    </main>
  );
}

const W = 760, H = 400, L = 44, R = 700, T = 12, B = 360;

function Heatmap({ state, sex, markers }: { state: State; sex: Sex; markers: { year: number; age: number | null }[] }) {
  const grid = state.shares[sex];
  const years = state.years;
  const max = Math.max(...grid.flat().filter((v): v is number => v != null));
  const cw = (R - L) / years.length, ch = (B - T) / AGES.length;
  const x = (i: number) => L + i * cw;
  const y = (age: number) => B - (age - AGES[0]! + 1) * ch;
  const yc = (age: number) => B - (age - AGES[0]! + 0.5) * ch;
  const pts = markers.map((m, i) => (m.age == null ? null : `${(x(i) + cw / 2).toFixed(1)},${yc(m.age).toFixed(1)}`));
  const path = pts.reduce((acc, p, i) => (p == null ? acc : `${acc}${acc && pts[i - 1] != null ? " L" : " M"}${p}`), "");
  const yearTicks = years.filter((yr) => yr % 5 === 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label={`${state.label}: osuus ikävuosittain ${years[0]}–${years.at(-1)}`}>
      {grid.map((row, i) =>
        row.map((v, j) =>
          v == null ? null : (
            <rect key={`${i}-${j}`} x={x(i)} y={y(AGES[j]!)} width={cw + 0.5} height={ch + 0.5} fill="var(--chart-2)" fillOpacity={0.04 + 0.92 * (v / max)}>
              <title>{`${years[i]}, ${AGES[j]}-vuotiaat: ${num(v)} %`}</title>
            </rect>
          ),
        ),
      )}
      {[15, 20, 25, 30, 35, 40, 45].map((a) => (
        <text key={a} x={L - 6} y={yc(a) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{a}</text>
      ))}
      <text x={L - 6} y={T - 2 + 0} textAnchor="end" className="fill-muted-foreground text-[11px]">ikä</text>
      {yearTicks.map((yr) => {
        const i = years.indexOf(yr);
        return <text key={yr} x={x(i) + cw / 2} y={B + 16} textAnchor="middle" className="fill-muted-foreground text-[11px]">{yr}</text>;
      })}
      {path && <path d={path} fill="none" stroke="var(--foreground)" strokeWidth={2.4} strokeLinejoin="round" />}
      {[markers.find((m) => m.age != null), [...markers].reverse().find((m) => m.age != null)].map((m, k) => {
        if (!m || m.age == null) return null;
        const i = years.indexOf(m.year);
        return (
          <g key={k}>
            <circle cx={x(i) + cw / 2} cy={yc(m.age)} r={4} fill="var(--foreground)" />
            <text x={k ? R + 8 : x(i) + cw / 2 + 6} y={yc(m.age) - 8} textAnchor="start" className="fill-foreground text-[12px] font-semibold">{`${num(m.age)} v`}</text>
          </g>
        );
      })}
      <g transform={`translate(${R + 8}, ${T})`}>
        <defs>
          <linearGradient id={`lc-scale-${state.key}`} x1="0" x2="0" y1="1" y2="0">
            <stop offset="0" stopColor="var(--chart-2)" stopOpacity={0.04} />
            <stop offset="1" stopColor="var(--chart-2)" stopOpacity={0.96} />
          </linearGradient>
        </defs>
        <rect width={12} height={90} fill={`url(#lc-scale-${state.key})`} />
        <text x={16} y={8} className="fill-muted-foreground text-[11px]">{`${num(max, 0)} %`}</text>
        <text x={16} y={90} className="fill-muted-foreground text-[11px]">0 %</text>
      </g>
    </svg>
  );
}

function Profile({ state, sex }: { state: State; sex: Sex }) {
  const grid = state.shares[sex];
  const rows = [
    { year: state.years[0]!, row: grid[0]!, color: "var(--muted-foreground)", width: 1.8 },
    { year: state.years.at(-1)!, row: grid.at(-1)!, color: "var(--chart-2)", width: 2.8 },
  ];
  const max = Math.max(...rows.flatMap((r) => r.row.filter((v): v is number => v != null)));
  const top = Math.ceil(max / 10) * 10;
  const w = 760, h = 260, l = 44, r = 640, t = 12, b = 228;
  const x = (age: number) => l + ((age - AGES[0]!) / (AGES.at(-1)! - AGES[0]!)) * (r - l);
  const y = (v: number) => b - (v / top) * (b - t);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-auto w-full" role="img" aria-label={`${state.label}: ikäprofiili ${rows[0]!.year} ja ${rows[1]!.year}`}>
      {[0, top / 2, top].map((v) => (
        <g key={v}>
          <line x1={l} x2={r} y1={y(v)} y2={y(v)} stroke="var(--border)" />
          <text x={l - 6} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{`${num(v, 0)} %`}</text>
        </g>
      ))}
      {[15, 20, 25, 30, 35, 40, 45].map((a) => (
        <text key={a} x={x(a)} y={b + 16} textAnchor="middle" className="fill-muted-foreground text-[11px]">{a}</text>
      ))}
      {rows.map(({ year, row, color, width }) => {
        const d = row.map((v, j) => (v == null ? "" : `${j ? "L" : "M"}${x(AGES[j]!).toFixed(1)},${y(v).toFixed(1)}`)).join(" ");
        const lastIdx = row.length - 1;
        const lv = row[lastIdx];
        return (
          <g key={year}>
            <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" />
            {row.map((v, j) => v == null ? null : (
              <circle key={j} cx={x(AGES[j]!)} cy={y(v)} r={6} fill="transparent"><title>{`${year}, ${AGES[j]}-vuotiaat: ${num(v)} %`}</title></circle>
            ))}
            {lv != null && <text x={r + 8} y={y(lv) + 4} style={{ fill: color }} className="text-[12px] font-semibold">{year}</text>}
          </g>
        );
      })}
    </svg>
  );
}
