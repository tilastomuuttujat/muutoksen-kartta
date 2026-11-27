import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AGES, type Sex } from "@/lib/lifecourse";
import { PRESETS, STATES, compare } from "@/lib/generations";

export const Route = createFileRoute("/sukupolvet")({
  head: () => ({
    meta: [
      { title: "Sukupolvilinssi – Murrosmatriisi" },
      { name: "description", content: "Saman ikäisten suomalaisten elämäntilanne kahtena vuonna rinnakkain: kotoa muutto, työ, opiskelu, parisuhde ja vanhemmuus." },
      { property: "og:title", content: "Sukupolvilinssi: keneen muutos osui?" },
      { property: "og:description", content: "Vertaa 15–45-vuotiaiden elämää ennen ja jälkeen kriisin, naiset ja miehet erikseen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GenerationsPage,
});

const SEXES: { key: Sex; label: string }[] = [
  { key: "kaikki", label: "Kaikki" },
  { key: "naiset", label: "Naiset" },
  { key: "miehet", label: "Miehet" },
];
const YEARS = Array.from({ length: 2025 - 1992 + 1 }, (_, i) => 1992 + i);
const CW = 300, CH = 150;
const px = (age: number) => ((age - 15) / 30) * CW;
const py = (v: number) => CH - (v / 100) * CH;
const line = (row: (number | null)[]) =>
  row.map((v, i) => (v == null ? "" : `${i && row[i - 1] != null ? "L" : "M"}${px(AGES[i]!).toFixed(1)},${py(v).toFixed(1)}`)).join("");
const pp = (v: number) => `${v > 0 ? "+" : ""}${Math.round(v)} %-yks.`;

function GenerationsPage() {
  const [a, setA] = useState(1993);
  const [b, setB] = useState(2000);
  const [sex, setSex] = useState<Sex>("kaikki");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Kokeiluversio</p>
          <h1 className="font-display text-3xl sm:text-4xl">Sukupolvilinssi</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Miltä 15–45-vuotiaan elämä näytti kahtena eri vuonna? Valitse murroskohta, niin näet, missä iässä elämä muuttui eniten.
          </p>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/heijastukset" className="underline-offset-4 hover:underline">← Heijastusaalto</Link>
          <Link to="/" className="underline-offset-4 hover:underline">Kartta →</Link>
        </nav>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.key} onClick={() => { setA(p.a); setB(p.b); }}
            className={`rounded-full border px-3 py-1 text-sm ${a === p.a && b === p.b ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
            {p.label} <span className="opacity-70">{p.a}–{p.b}</span>
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-muted-foreground" /> Ennen
          <select value={a} onChange={(e) => setA(Number(e.target.value))} className="rounded border bg-card px-2 py-1">
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="inline-block h-1 w-6 bg-primary" /> Jälkeen
          <select value={b} onChange={(e) => setB(Number(e.target.value))} className="rounded border bg-card px-2 py-1">
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </label>
        <div className="flex overflow-hidden rounded-full border" role="radiogroup" aria-label="Sukupuoli">
          {SEXES.map((s) => (
            <button key={s.key} role="radio" aria-checked={sex === s.key} onClick={() => setSex(s.key)}
              className={`px-3 py-1 ${sex === s.key ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATES.map((s) => {
          const c = compare(s, sex, a, b);
          return (
            <figure key={s.key} className="rounded-xl border bg-card p-3">
              <figcaption className="mb-1 font-semibold">{s.label}</figcaption>
              {c ? (
                <>
                  <svg viewBox={`-28 -6 ${CW + 36} ${CH + 26}`} className="w-full" role="img"
                    aria-label={`${s.label}: ${a} ja ${b} ikävuosittain`}>
                    {[0, 50, 100].map((v) => (
                      <g key={v}>
                        <line x1={0} x2={CW} y1={py(v)} y2={py(v)} stroke="var(--border)" />
                        <text x={-4} y={py(v) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{v}%</text>
                      </g>
                    ))}
                    {c.biggest && (
                      <line x1={px(c.biggest.age)} x2={px(c.biggest.age)} y1={0} y2={CH} stroke="var(--accent)" strokeWidth={6} opacity={0.5} />
                    )}
                    <path d={line(c.a)} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="4 3" />
                    <path d={line(c.b)} fill="none" stroke="var(--primary)" strokeWidth={2.5} />
                    {[15, 20, 25, 30, 35, 40, 45].map((age) => (
                      <text key={age} x={px(age)} y={CH + 14} textAnchor="middle" className="fill-muted-foreground text-[10px]">{age}</text>
                    ))}
                  </svg>
                  {c.biggest && Math.abs(c.biggest.diff) >= 1 ? (
                    <p className="text-sm">Suurin muutos <b>{c.biggest.age}-vuotiailla</b>: {pp(c.biggest.diff)}{" "}
                      ({Math.round(c.a[AGES.indexOf(c.biggest.age)] ?? 0)} % → {Math.round(c.b[AGES.indexOf(c.biggest.age)] ?? 0)} %).</p>
                  ) : <p className="text-sm text-muted-foreground">Ei juuri muutosta.</p>}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Tästä ei ole tietoa vuodelta {s.years.includes(a) ? b : a} (tiedot {s.years[0]}–{s.years.at(-1)}).</p>
              )}
            </figure>
          );
        })}
      </div>

      <p className="mt-6 max-w-3xl rounded-md border-l-4 border-primary bg-card px-3 py-2 text-sm">
        <b>Näin luet kuvia:</b> vaaka-akselilla on ikä, pystyakselilla osuus ikäluokasta. Katkoviiva on ennen, yhtenäinen viiva
        jälkeen, ja korostettu pystyraita on ikä, jolla muutos oli suurin. Kuvat vertaavat eri vuosien saman ikäisiä, eivät
        seuraa samoja ihmisiä. Asuminen ja toiminta tulevat eri tilastoista (Tilastokeskus 12c6 ja 115c). Vuodesta 2005 alle
        18-vuotiaat luokitellaan opiskelijoiksi, joten 15–17-vuotiaiden työssäolo näkyy nollana.
      </p>
    </main>
  );
}
