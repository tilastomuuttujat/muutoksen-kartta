import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { murrosDataQuery } from "@/lib/murros-data";
import { LANES } from "@/lib/system-map";
import { spineOf, constellationOf, dockOf } from "@/lib/star-path";
import { globePos, project, lerpAngle, MAX_LAT, OLDEST, NOW } from "@/lib/globe";

export const Route = createFileRoute("/pallo")({
  loader: ({ context }) => context.queryClient.ensureQueryData(murrosDataQuery()),
  head: () => ({
    meta: [
      { title: "Muutoksen pallo – Murrosmatriisi" },
      { name: "description", content: "Pyöritä Suomen muutoksen ilmiöitä 3D-pallona ja tuo haluamasi ilmiö keskelle." },
      { property: "og:title", content: "Muutoksen pallo – Murrosmatriisi" },
      { property: "og:description", content: "Klikkaa ilmiötä, niin pallo kääntyy ja näyttää sen syyt ja seuraukset." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GlobePage,
});

const RAD = 300;
const yearLat = (y: number) => -MAX_LAT + ((y - OLDEST) / (NOW - OLDEST)) * 2 * MAX_LAT;

function GlobePage() {
  const { data } = useSuspenseQuery(murrosDataQuery());
  const [focus, setFocus] = useState<string | null>(null);
  const [rot, setRot] = useState({ lat: 0.25, lon: 0.6 });
  const target = useRef<{ lat: number; lon: number } | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppress = useRef(false);
  const geo = useMemo(() => new Map(data.nodes.map((n) => [n.id, globePos(n)])), [data]);
  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);
  const spine = useMemo(() => spineOf(data.nodes), [data]);
  const [showSpine, setShowSpine] = useState(true);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = target.current;
      if (t) setRot((r) => {
        const nx = { lat: r.lat + (t.lat - r.lat) * 0.12, lon: lerpAngle(r.lon, t.lon, 0.12) };
        if (Math.abs(nx.lat - t.lat) < 0.001 && Math.abs(lerpAngle(nx.lon, t.lon, 1) - nx.lon) < 0.001) target.current = null;
        return nx;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const choose = (id: string | null) => {
    setFocus(id);
    const g = id ? geo.get(id) : null;
    if (g) target.current = { lat: g.lat, lon: g.lon };
  };
  const fn = focus ? byId.get(focus) : null;
  const causes = focus ? data.causal.filter((e) => e.to === focus).map((e) => e.from) : [];
  const effects = focus ? data.causal.filter((e) => e.from === focus).map((e) => e.to) : [];
  const linked = new Set([...causes, ...effects]);
  const dock = focus && showSpine ? dockOf(focus, constellationOf(focus, data.edges), data.nodes, spine) : null;

  const pts = data.nodes.map((n) => { const g = geo.get(n.id)!; return { n, g, p: project(g.lat, g.lon, rot.lat, rot.lon) }; }).sort((a, b) => a.p.z - b.p.z);
  const P = new Map(pts.map((x) => [x.n.id, x.p]));
  const path = (pp: { x: number; y: number; z: number }[]) => {
    let d = "", pen = false;
    for (const q of pp) { if (q.z < 0) { pen = false; continue; } d += `${pen ? "L" : "M"}${(q.x * RAD).toFixed(1)},${(q.y * RAD).toFixed(1)}`; pen = true; }
    return d;
  };
  const steps = Array.from({ length: 73 }, (_, i) => i / 72);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Muutoksen pallo</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">Pyöritä palloa vetämällä. Klikkaa ilmiötä, niin pallo kääntyy ja tuo sen keskelle syineen ja seurauksineen. Etelässä vanhat ilmiöt, pohjoisessa uudet.</p>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">← Kartta</Link>
          <Link to="/tutka" className="underline-offset-4 hover:underline">Tutka →</Link>
          <Link to="/tahtikartta" className="underline-offset-4 hover:underline">Tähtikartta →</Link>
        </nav>
      </header>
      <label className="mb-3 flex items-center gap-1.5 text-sm"><input type="checkbox" checked={showSpine} onChange={(e) => setShowSpine(e.target.checked)} /> Näytä tähtirata (merkittävimmät käänteet)</label>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-xl border bg-card p-2">
          <svg viewBox={`${-RAD - 20} ${-RAD - 20} ${RAD * 2 + 40} ${RAD * 2 + 40}`} className="mx-auto block w-full max-w-[680px] select-none" style={{ touchAction: "none", cursor: "grab" }} role="img" aria-label="Muutoksen pallo"
            onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; }}
            onPointerMove={(e) => {
              const d = drag.current; if (!d) return;
              const dx = e.clientX - d.x, dy = e.clientY - d.y;
              if (!d.moved && Math.hypot(dx, dy) < 6) return;
              if (!d.moved) { d.moved = true; (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId); target.current = null; }
              d.x = e.clientX; d.y = e.clientY;
              setRot((r) => ({ lon: r.lon - dx * 0.008, lat: Math.max(-1.3, Math.min(1.3, r.lat + dy * 0.008)) }));
            }}
            onPointerUp={() => { if (drag.current?.moved) { suppress.current = true; setTimeout(() => { suppress.current = false; }, 0); } drag.current = null; }}
            onPointerCancel={() => { drag.current = null; }}>
            <defs>
              <radialGradient id="globe-shade" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="var(--card)" />
                <stop offset="100%" stopColor="var(--muted)" />
              </radialGradient>
            </defs>
            <circle r={RAD} fill="url(#globe-shade)" stroke="var(--border)" />
            {[1900, 1950, 2000].map((y) => {
              const lat = yearLat(y);
              const lbl = project(lat, rot.lon - 0.0, rot.lat, rot.lon);
              return (
                <g key={y}>
                  <path d={path(steps.map((s) => project(lat, s * 2 * Math.PI, rot.lat, rot.lon)))} fill="none" stroke="var(--border)" strokeDasharray="3 4" />
                  {lbl.z > 0 && <text x={lbl.x * RAD + 4} y={lbl.y * RAD - 3} fontSize={10} fill="var(--muted-foreground)">{y}</text>}
                </g>
              );
            })}
            {LANES.map((l, i) => {
              const lon = (i * 2 * Math.PI) / LANES.length;
              const mid = project(0, lon + Math.PI / LANES.length, rot.lat, rot.lon);
              return (
                <g key={l.key}>
                  <path d={path(steps.map((s) => project(-MAX_LAT + s * 2 * MAX_LAT, lon, rot.lat, rot.lon)))} fill="none" stroke="var(--border)" />
                  {mid.z > 0.2 && <text x={mid.x * RAD} y={mid.y * RAD} textAnchor="middle" fontSize={12} fontWeight={600} fill={`var(--lane-${l.key})`} opacity={0.6 + mid.z * 0.4} style={{ pointerEvents: "none" }}>{l.label}</text>}
                </g>
              );
            })}
            {showSpine && (() => {
              const pp = spine.flatMap((n, i) => { const a = geo.get(n.id)!, b = spine[i + 1] && geo.get(spine[i + 1]!.id); if (!b) return [P.get(n.id)!];
                return Array.from({ length: 8 }, (_, k) => project(a.lat + (b.lat - a.lat) * k / 8, lerpAngle(a.lon, b.lon, k / 8), rot.lat, rot.lon)); });
              return <path d={path(pp)} fill="none" stroke="var(--primary)" strokeOpacity={0.5} strokeWidth={2.5} strokeLinecap="round" style={{ pointerEvents: "none" }} />;
            })()}
            {dock && !dock.direct && (() => { const a = P.get(dock.key)!, b = P.get(dock.spine)!; return a.z > 0 && b.z > 0 && <line x1={a.x * RAD} y1={a.y * RAD} x2={b.x * RAD} y2={b.y * RAD} stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 4" style={{ pointerEvents: "none" }} />; })()}
            {focus && [...linked].map((id) => {
              const a = P.get(focus)!, b = P.get(id); if (!b || b.z < 0) return null;
              return <line key={"e" + id} x1={a.x * RAD} y1={a.y * RAD} x2={b.x * RAD} y2={b.y * RAD} stroke={causes.includes(id) ? "var(--muted-foreground)" : "var(--primary)"} strokeOpacity={0.55} strokeWidth={1.5} />;
            })}
            {pts.map(({ n, g, p }) => {
              const front = p.z > 0, isF = n.id === focus, hi = isF || linked.has(n.id);
              const r = (isF ? 9 : 2 + n.importance * 0.9) * (0.6 + 0.4 * Math.max(0, p.z));
              const op = !front ? 0.08 : focus && !hi ? 0.25 : 0.4 + 0.6 * p.z;
              return (
                <circle key={n.id} cx={p.x * RAD} cy={p.y * RAD} r={r} fill={`var(--lane-${LANES[g.lane]!.key})`} opacity={op}
                  stroke={isF ? "var(--foreground)" : "none"} strokeWidth={2} style={{ cursor: front ? "pointer" : "default", pointerEvents: front ? "auto" : "none" }}
                  onClick={() => { if (!suppress.current) choose(isF ? null : n.id); }}>
                  <title>{`${n.title} (${n.year})`}</title>
                </circle>
              );
            })}
            {focus && [...linked].map((id) => {
              const p = P.get(id), n = byId.get(id); if (!p || !n || p.z < 0.3) return null;
              const t = n.title.length > 26 ? n.title.slice(0, 25) + "…" : n.title;
              return <text key={"l" + id} x={p.x * RAD + (p.x >= 0 ? 7 : -7)} y={p.y * RAD + 3} textAnchor={p.x >= 0 ? "start" : "end"} fontSize={10} fill="var(--foreground)" stroke="var(--card)" strokeWidth={3} paintOrder="stroke" style={{ pointerEvents: "none" }}>{t}</text>;
            })}
            {fn && (() => { const p = P.get(fn.id)!; return <text x={p.x * RAD} y={p.y * RAD - 16} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--foreground)" stroke="var(--card)" strokeWidth={4} paintOrder="stroke" style={{ pointerEvents: "none" }}>{fn.title} ({fn.year})</text>; })()}
          </svg>
        </div>
        <aside className="rounded-xl border bg-card p-4 text-sm">
          {fn ? (
            <>
              <p className="text-muted-foreground">{fn.year}</p>
              <h2 className="font-display text-xl">{fn.title}</h2>
              {fn.effect && <p className="mt-2">{fn.effect}</p>}
              {dock && <p className="mt-2 text-muted-foreground">{dock.direct ? "Kuuluu tähtirataan." : `Kiinnittyy tähtirataan: ${byId.get(dock.key)!.title} → ${byId.get(dock.spine)!.title}`}</p>}
              {[["Syyt", causes], ["Seuraukset", effects]].map(([h, ids]) => (ids as string[]).length > 0 && (
                <div key={h as string} className="mt-4">
                  <h3 className="font-semibold">{h as string} · {(ids as string[]).length}</h3>
                  <ul className="mt-1 space-y-0.5">
                    {(ids as string[]).map((id) => byId.get(id)!).sort((a, b) => a.year - b.year).map((x) => (
                      <li key={x.id}><button onClick={() => choose(x.id)} className="text-left underline-offset-4 hover:underline">{x.title} <span className="text-muted-foreground">({x.year})</span></button></li>
                    ))}
                  </ul>
                </div>
              ))}
              <button onClick={() => choose(null)} className="mt-4 rounded-full border px-3 py-1 hover:bg-muted">Tyhjennä valinta</button>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl">Näin luet palloa</h2>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Pituuspiirien välinen lohko on elämänalue.</li>
                <li>Leveysaste kertoo ajan: etelässä 1850, pohjoisessa nykyhetki.</li>
                <li>Klikkaa ilmiötä: pallo kääntyy ja tuo sen keskelle, ja syyt ja seuraukset kytkeytyvät siihen.</li>
              </ul>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
