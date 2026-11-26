import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CRISES, LAYERS, SERIES, layerShares, typical, wavePeak } from "@/lib/reflections";

type Search = { kriisi?: string };

export const Route = createFileRoute("/heijastukset")({
  validateSearch: (s: Record<string, unknown>): Search => (typeof s["kriisi"] === "string" ? { kriisi: s["kriisi"] } : {}),
  head: () => ({
    meta: [
      { title: "Heijastusaalto – Murrosmatriisi" },
      { name: "description", content: "Miten yhteiskunnan suuret järistykset etenivät taloudesta työhön ja arkeen: kolme kerrosta, 1870–2025." },
      { property: "og:title", content: "Heijastusaalto: taloudesta arkeen" },
      { property: "og:description", content: "Näe yhdellä kuvalla, miten kriisit etenivät taloudesta työmarkkinoille ja ihmisten arkeen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReflectionsPage,
});

const Y0 = 1870, Y1 = 2025, W = 940, BAND = 70, GAP = 26, LEFT = 0;
const x = (y: number) => LEFT + ((y - Y0) / (Y1 - Y0)) * W;
const pct = (v: number) => `${Math.round(v * 100)} %`;

function ReflectionsPage() {
  const { kriisi } = Route.useSearch();
  const nav = Route.useNavigate();
  const crisis = CRISES.find((c) => c.key === kriisi) ?? CRISES[4]!;
  const layers = useMemo(
    () => LAYERS.map((l) => { const rows = layerShares(SERIES, l.lanes, Y0, Y1); return { ...l, rows, typ: typical(rows) }; }),
    [],
  );
  const [hover, setHover] = useState<number | null>(null);
  const peaks = layers.map((l) => wavePeak(l.rows, crisis.start, crisis.end));
  const H = LAYERS.length * (BAND + GAP);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Kokeiluversio</p>
          <h1 className="font-display text-3xl sm:text-4xl">Heijastusaalto</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Kun yhteiskunta järkkyy, aalto kulkee kerroksesta toiseen: taloudesta työhön ja toimeentuloon ja lopulta
            ihmisten arkeen. Mitä tummempi kohta, sitä useampi kerroksen mittari poikkesi tavallisesta sinä vuonna.
          </p>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">← Kartta</Link>
          <Link to="/sukupolvet" className="underline-offset-4 hover:underline">Sukupolvilinssi →</Link>
        </nav>
      </header>

      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Valitse kriisi">
        {CRISES.map((c) => (
          <button
            key={c.key}
            role="radio"
            aria-checked={c.key === crisis.key}
            onClick={() => nav({ search: { kriisi: c.key }, replace: true })}
            className={`rounded-full border px-3 py-1 text-sm ${c.key === crisis.key ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card p-3">
        <svg viewBox={`-215 -10 ${W + 225} ${H + 30}`} className="w-full min-w-[720px]" onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const vx = ((e.clientX - r.left) / r.width) * (W + 225) - 215;
            const y = Math.round(Y0 + (vx / W) * (Y1 - Y0));
            setHover(y >= Y0 && y <= Y1 ? y : null);
          }}>
          <rect x={x(crisis.start)} y={-6} width={x(crisis.end + 6) - x(crisis.start)} height={H} fill="var(--muted)" opacity={0.6} />
          <rect x={x(crisis.start)} y={-6} width={x(crisis.end + 1) - x(crisis.start)} height={H} fill="var(--primary)" opacity={0.08} />
          {layers.map((l, li) => {
            const top = li * (BAND + GAP);
            const max = 0.6;
            const path = l.rows.map((r, i) => `${i ? "L" : "M"}${x(r.year).toFixed(1)},${(top + BAND - Math.min(r.share / max, 1) * BAND).toFixed(1)}`).join("");
            const p = peaks[li];
            return (
              <g key={l.key}>
                <text x={-12} y={top + BAND / 2 - 4} textAnchor="end" className="fill-foreground text-[13px] font-semibold">{li + 1}. {l.label}</text>
                <text x={-12} y={top + BAND / 2 + 12} textAnchor="end" className="fill-muted-foreground text-[11px]">{l.hint}</text>
                {l.rows.map((r) => (
                  <rect key={r.year} x={x(r.year)} y={top} width={W / (Y1 - Y0) + 0.5} height={BAND}
                    fill={r.n < 5 ? "transparent" : `color-mix(in oklch, var(--primary) ${Math.round(Math.min(r.share / max, 1) * 85)}%, var(--card))`} />
                ))}
                <path d={`${path}`} fill="none" stroke="var(--foreground)" strokeWidth={1} opacity={0.35} />
                <line x1={0} x2={W} y1={top + BAND - (l.typ / max) * BAND} y2={top + BAND - (l.typ / max) * BAND} stroke="var(--foreground)" strokeDasharray="3 3" opacity={0.4} />
                {p && (
                  <g>
                    <circle cx={x(p.year) + 3} cy={top + BAND - Math.min(p.share / max, 1) * BAND} r={6} fill="var(--accent)" stroke="var(--foreground)" />
                    {li > 0 && peaks[li - 1] && (
                      <line x1={x(peaks[li - 1]!.year) + 3} y1={top - GAP + 2} x2={x(p.year) + 3} y2={top - 2} stroke="var(--foreground)" strokeWidth={2} markerEnd="url(#arr)" />
                    )}
                  </g>
                )}
              </g>
            );
          })}
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--foreground)" /></marker>
          </defs>
          {[1870, 1900, 1925, 1950, 1975, 2000, 2025].map((y) => (
            <text key={y} x={x(y)} y={H + 12} textAnchor="middle" className="fill-muted-foreground text-[11px]">{y}</text>
          ))}
          {hover && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={-6} y2={H} stroke="var(--foreground)" opacity={0.5} />
              <text x={x(hover) + 4} y={4} className="fill-foreground text-[12px] font-semibold">{hover}</text>
              {layers.map((l, li) => { const r = l.rows[hover - Y0]!; return (
                <text key={l.key} x={x(hover) + 4} y={li * (BAND + GAP) + 18} className="fill-foreground text-[11px]">{r.n >= 5 ? `${pct(r.share)} (${r.hits}/${r.n})` : "vähän mittareita"}</text>
              ); })}
            </g>
          )}
        </svg>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {layers.map((l, li) => {
          const p = peaks[li];
          const ratio = p && l.typ ? p.share / l.typ : 0;
          return (
            <div key={l.key} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{li + 1}. kerros</p>
              <h2 className="font-display text-lg">{l.label}</h2>
              {p ? (
                <>
                  <p className="mt-2 text-3xl tabular-nums">{p.year}</p>
                  <p className="text-sm">
                    huippu {p.year - crisis.start === 0 ? "kriisin alkuvuonna" : `${p.year - crisis.start} v kriisin alusta`}:{" "}
                    <b>{pct(p.share)}</b> mittareista poikkesi ({p.hits}/{p.n}), tavallisesti {pct(l.typ)}.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ratio >= 2 ? "Selvä järistys." : ratio >= 1.4 ? "Tavallista suurempi heilahdus." : "Ei juuri tavallista suurempaa liikettä."}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Tältä ajalta liian vähän mittareita.</p>
              )}
            </div>
          );
        })}
      </section>

      <p className="mt-6 max-w-3xl rounded-md border-l-4 border-primary bg-card px-3 py-2 text-sm">
        <b>Näin luet kuvaa:</b> jokainen kaista on yksi kerros, ja sen sävy kertoo, kuinka suuri osa kerroksen mittareista
        (yhteensä {SERIES.filter((s) => !s.dup).length} kansallista tilastosarjaa) muuttui poikkeuksellisesti sinä vuonna.
        Katkoviiva on kerroksen tavallinen taso. Nuolet yhdistävät kerrosten huippuvuodet valitun kriisin aikana ja kuusi
        vuotta sen jälkeen (harmaa alue). Nuoli kertoo järjestyksen, ei syytä: kerros voi reagoida myöhemmin myös
        omista syistään. Varhaisilta vuosilta mittareita on vähän, joten yksittäinen poikkeama painaa enemmän.
      </p>
    </main>
  );
}
