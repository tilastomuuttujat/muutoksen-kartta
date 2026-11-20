import { READER_PATHS } from "@/lib/reader-paths";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { murrosDataQuery, allThemePaths } from "@/lib/murros-data";
import { LANES, searchNodes } from "@/lib/system-map";
import { slotOf } from "@/lib/radar";
import { ERAS, eraOf, buildConstellations, clusterIndex, railOf, type Rail } from "@/lib/constellations";

export const Route = createFileRoute("/tahtikartta")({
  validateSearch: (search: Record<string, unknown>): { kysymys?: string } =>
    typeof search.kysymys === "string" ? { kysymys: search.kysymys } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(murrosDataQuery()),
  head: () => ({
    meta: [
      { title: "Tähtikartta – Murrosmatriisi" },
      { name: "description", content: "Suomen kehitys tähtitaivaana: valmiit tähtikuviot ja selitysradat, jotka kytkevät ne vaikutusten kautta päätelmiksi." },
      { property: "og:title", content: "Tähtikartta – Murrosmatriisi" },
      { property: "og:description", content: "Tähtikuviot ja niitä yhdistävät selitysradat näyttävät, miten Suomen kehityksen päätelmät syntyvät." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StarMapPage,
});

const SW = 1200, SH = 640, TOP = 14, BH = (SH - 40) / 5, CX0 = 120, CW = (SW - CX0 - 10) / 4;
const COLORS = ["var(--primary)", "var(--lane-talous)", "var(--lane-hoiva)", "var(--lane-tyo)", "var(--lane-valta)", "var(--lane-yhteiso)"];
const short = (t: string, k = 30) => (t.length > k ? t.slice(0, k - 1) + "…" : t);

function StarMapPage() {
  const { data } = useSuspenseQuery(murrosDataQuery());
  const { kysymys } = Route.useSearch();
  const [rail, setRail] = useState<string | null>(null);
  const [cons, setCons] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);
  const constellations = useMemo(() => buildConstellations(data.nodes, data.edges), [data]);
  const cl = useMemo(() => clusterIndex(constellations), [constellations]);
  const cById = useMemo(() => new Map(constellations.map((c) => [c.id, c])), [constellations]);
  const pos = useMemo(() => new Map(data.nodes.map((n) => {
    const era = ERAS[eraOf(n.year)]!, f = (Math.min(n.year, 2030) - era.from) / (Math.min(era.to, 2030) - era.from);
    const lane = Number(cl.get(n.id)!.split("-")[0]);
    return [n.id, { x: CX0 + eraOf(n.year) * CW + 18 + f * (CW - 36), y: TOP + lane * BH + 22 + slotOf(n.id) * (BH - 34) }];
  })), [data, cl]);
  const center = useMemo(() => new Map(constellations.map((c) => {
    const ps = c.members.map((m) => pos.get(m)!);
    return [c.id, { x: ps.reduce((s, p) => s + p.x, 0) / ps.length, y: ps.reduce((s, p) => s + p.y, 0) / ps.length }];
  })), [constellations, pos]);
  const rails = useMemo(() => {
    const out: Rail[] = [];
    for (const [k, items] of Object.entries(allThemePaths())) {
      const last = items[items.length - 1];
      out.push(railOf("t:" + k, "teema", k[0]!.toUpperCase() + k.slice(1), last?.current_relevance ?? "", items.map((i) => i.id), data.nodes, data.edges, cl));
    }
    for (const c of data.conclusions) {
      const ms = Object.entries(data.nodeConclusions).filter(([, cs]) => cs.includes(c.id)).map(([id]) => id);
      const r = railOf("c:" + c.id, "päätelmä", c.title, c.claim, ms, data.nodes, data.edges, cl);
      if (r.stops.length >= 2) out.push(r);
    }
    return out.filter((r) => r.stops.length >= 2);
  }, [data, cl]);
  const color = (r: Rail) => COLORS[rails.indexOf(r) % COLORS.length]!;
  const sel = rails.find((r) => r.id === rail) ?? null;
  const selStops = new Set(sel?.stops ?? []), selMembers = new Set(sel?.members ?? []);
  const shown = cons ? rails.filter((r) => r.stops.includes(cons)) : rails;
  const consName = (id: string) => { const c = cById.get(id)!; return `${LANES[c.lane]!.label} · ${ERAS[c.era]!.label}`; };
  const guide = READER_PATHS.find((item) => item.id === kysymys);
  const guideNodes = guide?.stops.map((id) => byId.get(id)).filter((n) => n !== undefined) ?? [];
  const guideEdges = guide?.stops.slice(1).map((id, i) =>
    data.edges.find((edge) => edge.from === guide.stops[i] && edge.to === id && edge.rationale.trim())) ?? [];
  const guided = Boolean(guide && guideNodes.length === guide.stops.length && guideEdges.every(Boolean));
  const guideIds = new Set(guideNodes.map((n) => n.id));
  const pathOf = (r: Rail) => {
    const ps = r.stops.map((s) => center.get(s)!);
    let d = `M${ps[0]!.x},${ps[0]!.y}`;
    for (let i = 1; i < ps.length; i++) { const a = ps[i - 1]!, b = ps[i]!; d += ` Q${(a.x + b.x) / 2},${Math.min(a.y, b.y) - 30} ${b.x},${b.y}`; }
    return d;
  };
  const hits = q ? searchNodes(q, data.nodes, 6) : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {guided && guide ? (
        <article className="mx-auto mb-8 max-w-2xl" aria-labelledby="reader-story">
          <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Muutoksen kartta</Link>
          <h1 id="reader-story" className="mb-5 mt-3 font-display text-3xl sm:text-4xl">{guide.title}</h1>
          <div className="space-y-4 text-base leading-relaxed">
            {guide.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <p className="mt-5 border-l-2 pl-4 text-sm leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">Mikä jää avoimeksi?</strong>{" "}{guide.openQuestion}
          </p>
        </article>
      ) : (
        <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">Tähtikartta</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">Taivas koostuu tähtikuvioista: kukin on yhden elämänalueen ilmiöt yhdellä aikakaudella. Selitysradat kulkevat kuvioiden läpi ja kytkevät ne päätelmiksi. Radan varrella näet, montako vaikutusta kuvioiden välillä kulkee.</p>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">← Kartta</Link>
            <Link to="/pallo" className="underline-offset-4 hover:underline">Pallo →</Link>
            <Link to="/tutka" className="underline-offset-4 hover:underline">Tutka →</Link>
          </nav>
        </header>
      )}
      {guided && <h2 className="mb-3 font-display text-xl">Tarina Tähtikartalla</h2>}
      <div className="mb-3 relative max-w-sm">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Hae ilmiötä – näet sen tähtikuvion…" className="w-full rounded-full border bg-card px-4 py-1.5 text-sm" aria-label="Hae ilmiötä" />
        {hits.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border bg-card p-1 text-sm shadow">
            {hits.map((h) => <li key={h.id}><button className="w-full rounded px-2 py-1 text-left hover:bg-muted" onClick={() => { setCons(cl.get(h.id) ?? null); setRail(null); setQ(""); }}>{h.title} <span className="text-muted-foreground">({h.year})</span></button></li>)}
          </ul>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-xl border bg-foreground">
          <svg viewBox={`0 0 ${SW} ${SH}`} className="block w-full select-none" role="img" aria-label="Tähtitaivas: tähtikuviot ja selitysradat">
            {ERAS.map((e, i) => <text key={e.key} x={CX0 + i * CW + CW / 2} y={SH - 8} textAnchor="middle" fontSize={12} fill="var(--background)" opacity={0.5}>{e.label} {e.from}–{e.key === 3 ? "" : e.to}</text>)}
            {LANES.map((l, i) => <text key={l.key} x={10} y={TOP + i * BH + BH / 2} fontSize={13} fontWeight={600} fill={`var(--lane-${l.key})`} opacity={0.8}>{l.label}</text>)}
            {rails.map((r) => !guided && r.id !== rail && (
              <path key={r.id} d={pathOf(r)} fill="none" stroke={color(r)} strokeOpacity={sel ? 0.06 : cons && !r.stops.includes(cons) ? 0.05 : 0.22} strokeWidth={1.5} style={{ cursor: "pointer" }} onClick={() => setRail(r.id)} />
            ))}
            {constellations.map((c) => {
              const dim = guided ? !c.members.some((id) => guideIds.has(id)) : (sel && !selStops.has(c.id)) || (cons && cons !== c.id && !sel);
              return (
                <g key={c.id} opacity={dim ? 0.3 : 1} style={{ cursor: "pointer" }} onClick={() => { setCons(cons === c.id ? null : c.id); setRail(null); }}>
                  {c.lines.map(([a, b], i) => { const p = pos.get(a)!, q2 = pos.get(b)!; return <line key={i} x1={p.x} y1={p.y} x2={q2.x} y2={q2.y} stroke={`var(--lane-${LANES[c.lane]!.key})`} strokeOpacity={0.45} strokeWidth={0.8} />; })}
                  {c.members.map((m) => { const n = byId.get(m)!, p = pos.get(m)!, hot = guided ? guideIds.has(m) : selMembers.has(m); return (
                    <circle key={m} cx={p.x} cy={p.y} r={hot ? 5 : 1.2 + n.importance * 0.55} fill={hot ? "var(--background)" : `var(--lane-${LANES[c.lane]!.key})`} style={{ filter: hot || m === c.key ? `drop-shadow(0 0 4px var(--lane-${LANES[c.lane]!.key}))` : undefined }}><title>{`${n.title} (${n.year})`}</title></circle>
                  ); })}
                  <text x={center.get(c.id)!.x} y={TOP + c.lane * BH + 14} textAnchor="middle" fontSize={10.5} fill="var(--background)" opacity={0.75} stroke="var(--foreground)" strokeWidth={3} paintOrder="stroke">{short(byId.get(c.key)!.title, 26)}</text>
                </g>
              );
            })}
            {guided && <g pointerEvents="none">
              <defs><marker id="guide-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--lane-talous)" />
              </marker></defs>
              <polyline points={guideNodes.map((n) => { const p = pos.get(n.id)!; return `${p.x},${p.y}`; }).join(" ")}
                fill="none" stroke="var(--lane-talous)" strokeWidth="3" markerMid="url(#guide-arrow)" markerEnd="url(#guide-arrow)" />
              {guideNodes.map((n, i) => {
                const p = pos.get(n.id)!;
                return <text key={n.id} x={p.x} y={p.y - 9} textAnchor="middle" fill="var(--background)"
                  fontSize={15} fontWeight={700} stroke="var(--foreground)" strokeWidth={4} paintOrder="stroke">{i + 1}</text>;
              })}
            </g>}
            {!guided && sel && (
              <g style={{ pointerEvents: "none" }}>
                <path d={pathOf(sel)} fill="none" stroke={color(sel)} strokeWidth={3} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color(sel)})` }} />
                {sel.stops.map((s, i) => { const p = center.get(s)!; return <g key={s}><circle cx={p.x} cy={p.y} r={10} fill="none" stroke={color(sel)} strokeWidth={2} /><text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--background)">{i + 1}</text></g>; })}
              </g>
            )}
          </svg>
        </div>
        <aside className="space-y-4 rounded-xl border bg-card p-4 text-sm">
          {guided && guide ? (
            <>
              <Link to="/tahtikartta" search={{}} className="underline-offset-4 hover:underline">← Kaikki selitysradat</Link>
              <h3 className="font-display text-xl">Seuraa yhteyksiä</h3>
              <ol className="space-y-3">
                {guideNodes.map((n, i) => (
                  <li key={n.id}>
                    <p className="font-semibold">{i + 1}. {n.title} <span className="font-normal text-muted-foreground">· {n.year}</span></p>
                    <Link to="/tutka" search={{ ilmiö: n.id, kysymys: guide.id }} className="text-sm underline underline-offset-4">Tutki ilmiötä Tutkassa →</Link>
                    {guideEdges[i] && <p className="mt-1 text-sm text-muted-foreground">↓ {guideEdges[i]?.rationale}</p>}
                  </li>
                ))}
              </ol>
            </>
          ) : sel ? (
            <>
              <button onClick={() => setRail(null)} className="text-muted-foreground underline-offset-4 hover:underline">← Kaikki selitysradat</button>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{sel.kind === "teema" ? "Teeman selitysrata" : "Päätelmän selitysrata"}</p>
                <h2 className="font-display text-xl">{sel.title}</h2>
              </div>
              <ol className="space-y-1">
                {sel.stops.map((s, i) => (
                  <li key={`${s}-${i}`}>
                    <p><span className="font-semibold">{i + 1}.</span> {consName(s)}</p>
                    <p className="pl-4 text-xs text-muted-foreground">{sel.members.filter((m) => cl.get(m) === s).map((m) => byId.get(m)!.title).slice(0, 3).join(", ")}</p>
                    {i < sel.links.length && <p className="pl-4 text-xs">↓ {sel.links[i] ? `${sel.links[i]} kirjattua yhteyttä kuvioiden välillä` : "teemallinen yhteys"}</p>}
                  </li>
                ))}
              </ol>
              {sel.conclusion && (
                <div className="rounded-lg border p-3">
                  <h3 className="font-semibold">{sel.kind === "päätelmä" ? "Päätelmäehdotus · kytkentä tarkistamatta" : "Teeman yhteenveto"}</h3>
                  <p className="mt-1 text-muted-foreground">{sel.conclusion}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="font-display text-xl">{cons ? consName(cons) : "Selitysradat"}</h2>
              <p className="text-muted-foreground">{cons ? `Tähtikuviossa on ${cById.get(cons)!.members.length} ilmiötä. Sen kautta kulkee ${shown.length} selitysrataa.` : "Valitse rata, niin näet, mitkä tähtikuviot se kytkee ja mihin päätelmään ne johtavat. Voit myös klikata tähtikuviota."}</p>
              <ul className="space-y-1">
                {shown.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => setRail(r.id)} className="flex w-full items-start gap-2 rounded px-2 py-1 text-left hover:bg-muted">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: color(r) }} />
                      <span><span className="font-medium">{r.title}</span> <span className="text-xs text-muted-foreground">· {r.kind} · {r.stops.length} kuviota</span></span>
                    </button>
                  </li>
                ))}
              </ul>
              {cons && <button onClick={() => setCons(null)} className="rounded-full border px-3 py-1 hover:bg-muted">Näytä koko taivas</button>}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
