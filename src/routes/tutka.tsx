import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { murrosDataQuery } from "@/lib/murros-data";
import { LANES } from "@/lib/system-map";
const ZONE_SHORT = ["1. Välittömät", "2. Kerrannais-", "3. Ulkois-", "4.+ Rakenteelliset"];
const ZONE_LONG = ["Välittömät vaikutukset", "Kerrannaisvaikutukset", "Ulkoisvaikutukset", "Rakenteelliset vaikutukset"];
import { radarLayout, isMainline, placeLabels, sensorHits, SENSORS, R, RINGS, NOW, OLDEST, type SensorKey } from "@/lib/radar";

export const Route = createFileRoute("/tutka")({
  loader: ({ context }) => context.queryClient.ensureQueryData(murrosDataQuery()),
  head: () => ({
    meta: [
      { title: "Satelliittitutka – Murrosmatriisi" },
      { name: "description", content: "Skannaa Suomen muutoksen ilmiöitä tutkalla: etäisyys keskustasta kertoo, kuinka kaukana vaikutus on." },
      { property: "og:title", content: "Satelliittitutka – Murrosmatriisi" },
      { property: "og:description", content: "Valitse ilmiö, ja tutka näyttää sen vaikutusetäisyydet koko järjestelmässä." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RadarPage,
});

const PAD = 40, S = R + PAD;

function RadarPage() {
  const { data } = useSuspenseQuery(murrosDataQuery());
  const [focus, setFocus] = useState<string | null>(null);
  const [sensor, setSensor] = useState<SensorKey>("optinen");
  const [mainOnly, setMainOnly] = useState(true);
  const pos = useMemo(() => radarLayout(data.nodes, data.edges, focus), [data, focus]);
  const hits = useMemo(() => sensorHits(sensor, data.nodes, data.edges), [sensor, data]);
  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);
  const fn = focus ? byId.get(focus) : null;
  const rings = focus
    ? Array.from({ length: RINGS }, (_, i) => ({ r: ((i + 1) / RINGS) * R * 0.88, label: ZONE_SHORT[i] }))
    : [1, 2, 3, 4].map((i) => ({ r: (i / 4) * R * 0.95 + 8, label: String(Math.round(NOW - (i / 4) * (NOW - OLDEST))) }));
  const main = useMemo(() => new Set(data.nodes.filter((n) => n.id === focus || isMainline(pos.get(n.id)?.hop ?? null, n.importance)).map((n) => n.id)), [data, pos, focus]);
  const byHop = useMemo(() => {
    const m = new Map<number, string[]>();
    pos.forEach((p, id) => { if (p.hop && p.hop > 0 && (!mainOnly || main.has(id))) m.set(Math.min(p.hop, RINGS), [...(m.get(Math.min(p.hop, RINGS)) ?? []), id]); });
    return m;
  }, [pos, main, mainOnly]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Satelliittitutka</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {focus ? "Tutka skannaa valitusta ilmiöstä: mitä lähempänä keskustaa, sitä suorempi vaikutus." : "Keskellä on nykyhetki, reunalla 1850. Klikkaa pistettä, niin tutka skannaa sen vaikutusetäisyydet."}
          </p>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">← Kartta</Link>
          <Link to="/lampokartta" className="underline-offset-4 hover:underline">Lämpökartta →</Link>
        </nav>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Sensori">
        <span className="text-sm text-muted-foreground">Sensori:</span>
        {SENSORS.map((s) => (
          <button key={s.key} role="radio" aria-checked={sensor === s.key} onClick={() => setSensor(s.key)}
            className={`rounded-full border px-3 py-1 text-sm transition ${sensor === s.key ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
            {s.label} <span className="opacity-70">· {s.hint}</span>
          </button>
        ))}
        {focus && <label className="ml-auto flex items-center gap-1.5 text-sm"><input type="checkbox" checked={mainOnly} onChange={(e) => setMainOnly(e.target.checked)} /> Vain päälinja</label>}
        {focus && <button onClick={() => setFocus(null)} className="rounded-full border bg-card px-3 py-1 text-sm hover:bg-muted">Palaa nykyhetkeen</button>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-xl border bg-card p-2">
          <svg viewBox={`${-S - 60} ${-S} ${S * 2 + 120} ${S * 2}`} className="mx-auto block w-full max-w-[720px]" role="img" aria-label="Satelliittitutka">
            {LANES.map((l, i) => {
              const a = -Math.PI / 2 + (i * Math.PI * 2) / LANES.length;
              const am = a + Math.PI / LANES.length;
              return (
                <g key={l.key}>
                  <line x1={0} y1={0} x2={Math.cos(a) * R} y2={Math.sin(a) * R} stroke="var(--border)" />
                  <text x={Math.cos(am) * (R + 22)} y={Math.sin(am) * (R + 22)} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill={`var(--lane-${l.key})`}>{l.label}</text>
                </g>
              );
            })}
            {rings.map((g) => (
              <g key={g.label}>
                <circle r={g.r} fill="none" stroke="var(--border)" strokeDasharray="3 4" />
                <text x={4} y={-g.r - 3} fontSize={9} fill="var(--muted-foreground)">{g.label}</text>
              </g>
            ))}
            {focus && <circle key={focus} r={R} fill="none" stroke="var(--primary)" strokeWidth={2} className="radar-ping" />}
            {focus && data.edges.map((e, i) => {
              const a = pos.get(e.from), b = pos.get(e.to);
              if (!a || !b || a.hop == null || b.hop == null || Math.abs(a.hop - b.hop) !== 1 || Math.max(a.hop, b.hop) > 2) return null;
              if (mainOnly && (!main.has(e.from) || !main.has(e.to))) return null;
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={`var(--lane-${LANES[b.lane]!.key})`} strokeOpacity={0.35} />;
            })}
            {data.nodes.map((n) => {
              const p = pos.get(n.id)!;
              const detected = n.id === focus || hits.has(n.id) && (!focus || p.hop != null) && (!mainOnly || main.has(n.id));
              const rr = n.id === focus ? 9 : 2 + n.importance * 0.9;
              return (
                <circle key={n.id} cx={p.x} cy={p.y} r={rr} onClick={() => setFocus(n.id === focus ? null : n.id)}
                  fill={detected ? `var(--lane-${LANES[p.lane]!.key})` : "var(--muted-foreground)"}
                  opacity={detected ? (n.id === focus ? 1 : 0.85) : 0.15}
                  stroke={n.id === focus ? "var(--foreground)" : "none"} strokeWidth={2}
                  style={{ cursor: "pointer", transition: "cx .6s ease, cy .6s ease, opacity .3s" }}>
                  <title>{`${n.title} (${n.year})`}</title>
                </circle>
              );
            })}
            {focus && mainOnly && placeLabels(
              data.nodes.filter((n) => n.id !== focus && main.has(n.id) && hits.has(n.id)).map((n) => { const p = pos.get(n.id)!; return { id: n.id, x: p.x, y: p.y, importance: n.importance, text: n.title.length > 28 ? n.title.slice(0, 27) + "…" : n.title }; }),
              5, 11, fn ? [{ x0: -fn.title.length * 3.5, x1: fn.title.length * 3.5, y0: -28, y1: -8 }] : [],
            ).map((l) => <text key={"l" + l.id} x={l.x} y={l.y} textAnchor={l.anchor} fontSize={9} fill="var(--foreground)" stroke="var(--card)" strokeWidth={3} paintOrder="stroke" style={{ pointerEvents: "none" }}>{l.text}</text>)}
            {fn && <text y={-14} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--foreground)">{fn.title}</text>}
          </svg>
        </div>

        <aside className="rounded-xl border bg-card p-4 text-sm">
          {fn ? (
            <>
              <p className="text-muted-foreground">{fn.year}</p>
              <h2 className="font-display text-xl">{fn.title}</h2>
              {fn.effect && <p className="mt-2">{fn.effect}</p>}
              {[...byHop.entries()].sort((a, b) => a[0] - b[0]).map(([hop, ids]) => (
                <div key={hop} className="mt-4">
                  <h3 className="font-semibold">{ZONE_LONG[Math.min(hop, RINGS) - 1]} ({hop === RINGS ? `${RINGS}.+` : `${hop}.`} aste) · {ids.length}</h3>
                  <ul className="mt-1 space-y-0.5">
                    {ids.map((id) => byId.get(id)!).sort((a, b) => b.importance - a.importance).slice(0, 8).map((x) => (
                      <li key={x.id}><button onClick={() => setFocus(x.id)} className="text-left underline-offset-4 hover:underline">{x.title}</button></li>
                    ))}
                  </ul>
                </div>
              ))}
              {byHop.size === 0 && <p className="mt-3 text-muted-foreground">Tällä ilmiöllä ei ole kytköksiä.</p>}
            </>
          ) : (
            <>
              <h2 className="font-display text-xl">Näin luet tutkaa</h2>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Sektori kertoo elämänalueen.</li>
                <li>Etäisyys keskeltä kertoo ajan: mitä kauempana, sitä vanhempi.</li>
                <li>Sensori näyttää vain tietynlaiset pisteet: <b>Lämpö</b> jännitteet, <b>Tutka</b> 25 kantavinta rakennetta.</li>
                <li>Klikkaa pistettä: se siirtyy keskelle ja muut asettuvat renkaille vaikutusetäisyyden mukaan.</li>
              </ul>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
