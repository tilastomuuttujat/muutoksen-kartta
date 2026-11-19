import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { systemMapQuery } from "@/lib/murros.functions";
import { LANES, LANE_H, TOP, W, xOf, chainOf, isPressure, layout, layout3d, LAYERS, ISO_W, ISO_H, isoPoint, LENSES, applyLens, LAYER_MODELS, layerModel, searchNodes, resolveStarts, edgeReason, pushTrail, chainDepths, waveDelay, chainWeight, shouldLabel, laneOf, type MapEdge } from "@/lib/system-map";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(systemMapQuery()),
  head: () => ({
    meta: [
      { title: "Murrosmatriisi – Suomen muutoksen kartta" },
      { name: "description", content: "Koko yhteiskunnan kehitys yhdellä kartalla. Napauta ilmiötä, niin sen syyt ja seuraukset erottuvat kokonaisuudesta." },
      { property: "og:title", content: "Murrosmatriisi – Suomen muutoksen kartta" },
      { property: "og:description", content: "Näe vaikutusketjut ja niiden paikka kokonaisuudessa yhdellä kartalla." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SystemMap,
});

const H = TOP + LANES.length * LANE_H + 30;
const DECADES = Array.from({ length: 10 }, (_, i) => 1850 + i * 20);

function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
}
function curve3d(a: { x: number; y: number }, b: { x: number; y: number }) {
  const my = (a.y + b.y) / 2;
  return `M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
}
const poly = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

function SystemMap() {
  const { data } = useSuspenseQuery(systemMapQuery());
  const [sel, setSelRaw] = useState<string | null>(null);
  const [trail, setTrail] = useState<string[]>([]);
  const setSel = (id: string | null) => { setSelRaw(id); if (id) setTrail((t) => pushTrail(t, id)); else setTrail([]); };
  const pick = (id: string) => { setSel(id); document.getElementById("kartta")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const [q, setQ] = useState("");
  const hits = useMemo(() => searchNodes(q, data.nodes), [q, data.nodes]);
  const starts = useMemo(() => resolveStarts(data.nodes), [data.nodes]);
  // zoom & pan (in viewBox units)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const viewRef = useRef(view); viewRef.current = view;
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ px: number; py: number; moved: number; pts: Map<number, { x: number; y: number }>; dist?: number | undefined } | null>(null);
  const toVB = (cx: number, cy: number) => { const r = svgRef.current!.getBoundingClientRect(); const s = VWref.current / r.width; return { x: (cx - r.left) * s, y: (cy - r.top) * s, s }; };
  const zoomAt = (px: number, py: number, next: number) => setView((v) => { const k = Math.min(8, Math.max(1, next)); const f = k / v.k; return k === 1 ? { x: 0, y: 0, k } : { x: px - (px - v.x) * f, y: py - (py - v.y) * f, k }; });
  const VWref = useRef(0);
  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const p = toVB(e.clientX, e.clientY);
      zoomAt(p.x, p.y, viewRef.current.k * Math.exp(-dy * 0.002));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [lensKey, setLensKey] = useState<string | null>(null);
  const lens = useMemo(() => (lensKey ? applyLens(lensKey, data.nodes, data.edges) : null), [lensKey, data.nodes, data.edges]);
  const is3d = mode === "3d";
  const [modelKey, setModelKey] = useState("tahti");
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const model = layerModel(modelKey);
  const layerIdx = useMemo(() => new Map(data.nodes.map((n) => [n.id, model.of(n)])), [data.nodes, model]);
  const shown = (id: string) => !hidden.has(layerIdx.get(id) ?? 0);
  const toggleLayer = (i: number) => setHidden((h) => { const n = new Set(h); n.has(i) ? n.delete(i) : n.add(i); return n.size >= 3 ? h : n; });
  const pos = useMemo(() => (is3d ? layout3d(data.nodes, modelKey) : layout(data.nodes)), [data.nodes, is3d, modelKey]);
  const VW = is3d ? ISO_W : W, VH = is3d ? ISO_H : H;
  VWref.current = VW;
  const onDown = (e: React.PointerEvent) => {
    const d: NonNullable<typeof drag.current> = drag.current ?? { px: e.clientX, py: e.clientY, moved: 0, pts: new Map() };
    d.pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); d.px = e.clientX; d.py = e.clientY; d.dist = undefined;
    drag.current = d;
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || !d.pts.has(e.pointerId)) return;
    d.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (d.pts.size === 2) {
      const [a, b] = [...d.pts.values()]; const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (d.dist) { const m = toVB((a!.x + b!.x) / 2, (a!.y + b!.y) / 2); zoomAt(m.x, m.y, viewRef.current.k * (dist / d.dist)); }
      d.dist = dist; d.moved += 10; return;
    }
    if (viewRef.current.k === 1) return;
    const s = toVB(0, 0).s, dx = (e.clientX - d.px) * s, dy = (e.clientY - d.py) * s;
    d.moved += Math.abs(e.clientX - d.px) + Math.abs(e.clientY - d.py); d.px = e.clientX; d.py = e.clientY;
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  };
  const onUp = (e: React.PointerEvent) => { const d = drag.current; if (!d) return; d.pts.delete(e.pointerId); if (!d.pts.size) setTimeout(() => { drag.current = null; }, 0); };
  const dragged = () => (drag.current?.moved ?? 0) > 5;
  const zoomBtn = (f: number) => zoomAt(VW / 2, VH / 2, view.k * f);
  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data.nodes]);
  const byIdRef = useRef(byId); byIdRef.current = byId;
  const chain = useMemo(() => (sel ? chainOf(sel, data.edges) : null), [sel, data.edges]);
  const depths = useMemo(() => (sel ? chainDepths(sel, data.edges) : null), [sel, data.edges]);
  const [replay, setReplay] = useState(0);
  const dl = (id: string) => (depths ? waveDelay(id, depths) : 0);
  const wt = (id: string) => (depths ? chainWeight(id, depths, byIdRef.current.get(id)?.importance ?? 2) : 1);
  const node = sel ? byId.get(sel) : null;

  const edgeClass = (e: MapEdge) => {
    if (!chain) return lens ? (lens.edges.has(e) ? "opacity-70" : "opacity-[0.03]") : "opacity-25";
    if (!chain.edges.has(e)) return "opacity-[0.04]";
    return "opacity-90";
  };
  const role = (id: string) => (!chain ? (lens ? (lens.nodes.has(id) ? "lens" : "dim") : "rest") : id === sel ? "focus" : chain.up.has(id) ? "cause" : chain.down.has(id) ? "effect" : "dim");
  const fill = { rest: "var(--foreground)", lens: "var(--primary)", focus: "var(--primary)", cause: "var(--calm)", effect: "var(--tension)", dim: "var(--muted-foreground)" } as const;
  const laneColor = (id: string) => `var(--lane-${LANES[laneOf(byIdRef.current.get(id)?.domains ?? [])]?.key ?? "yhteiso"})`;
  const nodeFill = (id: string, r: keyof typeof fill) => (r === "cause" || r === "effect" ? laneColor(id) : fill[r]);
  const list = (s: Set<string>) => [...s].map((id) => byId.get(id)!).filter(Boolean).sort((a, b) => a.year - b.year);

  return (
    <main className="mx-auto max-w-[1500px] px-3 py-6 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Suomen muutoksen kartta</h1>
          <p className="mt-1 text-muted-foreground">
            {data.nodes.length} ilmiötä, {data.edges.length} kytköstä. Napauta mitä tahansa pistettä.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Etsi ilmiötä tai vuotta…" aria-label="Etsi ilmiötä tai vuotta"
            onKeyDown={(e) => { if (e.key === "Enter" && hits[0]) { pick(hits[0].id); setQ(""); } if (e.key === "Escape") setQ(""); }}
            className="w-full rounded-md border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
          {q && (
            <ul className="absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded-md border bg-popover p-1 text-sm shadow-lg">
              {hits.length === 0 ? <li className="px-2 py-1.5 text-muted-foreground">Ei osumia</li> : hits.map((h) => (
                <li key={h.id}><button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted" onClick={() => { pick(h.id); setQ(""); }}>
                  <span className="tabular-nums text-muted-foreground">{h.year}</span> {h.title}</button></li>
              ))}
            </ul>
          )}
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex rounded-md border p-0.5" role="group" aria-label="Näkymä">
            {(["3d", "2d"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                className={`rounded px-2.5 py-1 ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {m === "3d" ? "Kerrokset" : "Litteä"}
              </button>
            ))}
          </div>
          <Link to="/teemat" className="underline-offset-4 hover:underline">Teemat →</Link>
          <Link to="/polku" className="underline-offset-4 hover:underline">Aikajana →</Link>
        </nav>
      </header>

      <details className="mb-3 rounded-md border bg-card/50 px-3 py-2 text-sm">
      <summary className="cursor-pointer font-semibold">Näkymän asetukset <span className="font-normal text-muted-foreground">· kerrosmalli: {model.label}{hidden.size ? `, ${hidden.size} kerros piilossa` : ""}</span></summary>
      <section aria-label="Kerrosmalli" className="mt-2 flex flex-col gap-2 text-sm">
        <div role="radiogroup" aria-label="Kerrosmalli" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-semibold">Kerrosmalli</span>
          {LAYER_MODELS.map((m) => (
            <button key={m.key} role="radio" aria-checked={modelKey === m.key} onClick={() => { setModelKey(m.key); setHidden(new Set()); setMode("3d"); }}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1 ${modelKey === m.key ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
              <span className={`inline-block h-2.5 w-2.5 rounded-full border ${modelKey === m.key ? "bg-primary-foreground" : ""}`} />{m.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-semibold">Kerrokset</span>
          {model.layers.map((l, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-1.5 rounded-md border bg-card px-2.5 py-1">
              <input type="checkbox" checked={!hidden.has(i)} onChange={() => toggleLayer(i)} className="accent-primary" />
              {l.label.split(" – ")[0]}
            </label>
          ))}
        </div>
      </section>
      </details>

      {!sel && starts.length > 0 && (
        <section aria-label="Kokeile näitä" className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold">Kokeile näitä:</span>
          {starts.map((s) => (
            <button key={s.label} onClick={() => pick(s.node!.id)} className="rounded-md border border-primary/40 bg-card px-3 py-1.5 text-left hover:border-primary">
              <b>{s.label}</b> <span className="text-muted-foreground">– {s.hint}</span>
            </button>
          ))}
        </section>
      )}

      <section aria-label="Tarkastele linssin läpi" className="mb-3">
        <div className="mb-1.5 flex items-baseline gap-2 text-sm">
          <span className="font-semibold">Tarkastele linssin läpi</span>
          <span className="text-muted-foreground">
            {lensKey ? `${LENSES.find((l) => l.key === lensKey)?.hint} · ${lens?.nodes.size ?? 0} ilmiötä` : "valitse näkökulma, muu kartta himmenee"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LENSES.map((l) => (
            <button key={l.key} onClick={() => { setLensKey(lensKey === l.key ? null : l.key); setSel(null); }} aria-pressed={lensKey === l.key} title={l.hint}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${lensKey === l.key ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
              {l.label}
            </button>
          ))}
          {lensKey && <button onClick={() => setLensKey(null)} className="px-2 py-1 text-sm underline-offset-4 hover:underline">Näytä kaikki</button>}
        </div>
      </section>

      <div className="mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {chain ? (<>
          <span className="font-semibold text-foreground">Aalto osuu elämänalueisiin:</span>
          {LANES.map((l) => <span key={l.key} className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full" style={{ background: `var(--lane-${l.key})` }} />{l.label}</span>)}
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-primary" />Valittu</span>
        </>) : (<>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-calm" />Syyt – mistä se kumpusi</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-primary" />Valittu</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-tension" />Seuraukset – mihin se johti</span>
        </>)}
        <span className="flex items-center gap-1.5"><i className="h-0.5 w-5 border-t-2 border-dashed border-tension" />Paine</span>
      </div>

      <div id="kartta" className="relative scroll-mt-2 overflow-x-auto rounded-lg border bg-card">
        <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className={`block w-full touch-pan-y ${view.k > 1 ? "cursor-grab touch-none" : ""}`} role="img" aria-label="Kartta yhteiskunnan ilmiöistä ja niiden kytköksistä"
          onClick={() => { if (!dragged()) setSel(null); }} onDoubleClick={() => setView({ x: 0, y: 0, k: 1 })}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {is3d && model.layers.map((l, i) => {
            if (hidden.has(i)) return null;
            const c = [isoPoint(20, 0, i), isoPoint(W - 20, 0, i), isoPoint(W - 20, 1, i), isoPoint(20, 1, i)];
            return (
              <g key={l.label}>
                <polygon points={poly(c)} style={{ fill: "var(--muted)", opacity: 0.35 + i * 0.15, stroke: "var(--border)" }} />
                <text x={c[0]!.x} y={c[0]!.y - 8} className="fill-foreground text-[13px] font-semibold">{l.label}</text>
                <text x={c[1]!.x} y={c[1]!.y - 8} textAnchor="end" className="fill-muted-foreground text-[12px] italic">muuttuu: {l.hint}</text>
              </g>
            );
          })}
          {is3d && DECADES.map((y) => {
            const a = isoPoint(xOf(y), 1, LAYERS.length - 1);
            return <text key={y} x={a.x} y={a.y + 18} textAnchor="middle" className="fill-muted-foreground text-[12px]">{y}</text>;
          })}
          {!is3d && LANES.map((l, i) => (
            <g key={l.key}>
              <rect x={0} y={TOP + i * LANE_H} width={W} height={LANE_H} style={{ fill: i % 2 ? "var(--muted)" : "transparent", opacity: 0.5 }} />
              <text x={10} y={TOP + i * LANE_H + 16} className="fill-muted-foreground text-[12px] font-semibold uppercase tracking-wider">{l.label}</text>
            </g>
          ))}
          {!is3d && DECADES.map((y) => (
            <g key={y}>
              <line x1={xOf(y)} x2={xOf(y)} y1={TOP} y2={H - 24} className="stroke-border" strokeDasharray="2 4" />
              <text x={xOf(y)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[12px]">{y}</text>
            </g>
          ))}
          <g fill="none">
            {data.edges.map((e, i) => {
              const a = pos.get(e.from), b = pos.get(e.to);
              if (!a || !b || !shown(e.from) || !shown(e.to)) return null;
              const on = chain?.edges.has(e);
              const p = isPressure(e);
              const ew = on ? Math.min(wt(e.from), wt(e.to)) : 1;
              const anim = on ? { animation: `wave-in 600ms ease-out ${Math.max(dl(e.from), dl(e.to)) - 200}ms both`, opacity: 0.15 + ew * 0.8 } : {};
              return (
                <path key={on ? `${i}-${sel}-${replay}` : i} d={is3d ? curve3d(a, b) : curve(a, b)} className={`transition-opacity duration-500 ${edgeClass(e)}`}
                  strokeWidth={on ? 0.6 + ew * 2.2 : lens?.edges.has(e) && !chain ? 1.4 : 1} strokeDasharray={p ? "4 4" : undefined}
                  style={{ stroke: on ? laneColor(chain!.up.has(e.to) || e.to === sel ? e.from : e.to) : p ? "var(--tension)" : "var(--foreground)", ...anim }} />
              );
            })}
          </g>
          {data.nodes.map((n) => {
            if (!shown(n.id)) return null;
            const p = pos.get(n.id)!;
            const r = role(n.id);
            const rad = 2.5 + n.importance * 0.9 + (r === "focus" ? 3 : 0);
            const w = chain && r !== "dim" ? wt(n.id) : 1;
            return (
              <g key={n.id} className="cursor-pointer" onClick={(ev) => { ev.stopPropagation(); if (!dragged()) setSel(n.id === sel ? null : n.id); }}>
                <circle cx={p.x} cy={p.y} r={rad + 6} fill="transparent" />
                <circle key={chain && r !== "dim" ? `${sel}-${replay}` : "c"} cx={p.x} cy={p.y} r={rad} className="transition-all duration-500"
                  style={{ fill: nodeFill(n.id, r), opacity: r === "dim" ? (lens && !chain ? 0.07 : 0.12) : r === "lens" ? 0.9 : r === "rest" ? 0.55 : 0.2 + w * 0.8, stroke: "var(--card)", strokeWidth: 1.5, ...(chain && r !== "dim" ? { animation: `wave-pop 700ms ease-out ${dl(n.id)}ms both` } : {}) }} />
                {(r === "focus" || ((r === "cause" || r === "effect") && depths && shouldLabel(n.id, depths, n.importance, chain!.up.size + chain!.down.size))) && (
                  <text key={`${sel}-${replay}`} x={p.x} y={p.y - rad - 4} textAnchor="middle" className="pointer-events-none fill-foreground text-[11px] font-semibold"
                    style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3, animation: chain ? `wave-in 500ms ease-out ${dl(n.id) + 150}ms both` : undefined }}>{n.title.length > 34 ? n.title.slice(0, 32) + "…" : n.title}</text>
                )}
              </g>
            );
          })}
          </g>
        </svg>
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          <button aria-label="Lähennä" onClick={() => zoomBtn(1.5)} className="h-8 w-8 rounded-md border bg-card text-lg shadow-sm hover:bg-muted">+</button>
          <button aria-label="Loitonna" onClick={() => zoomBtn(1 / 1.5)} className="h-8 w-8 rounded-md border bg-card text-lg shadow-sm hover:bg-muted">−</button>
          {view.k > 1 && <button aria-label="Palauta näkymä" onClick={() => setView({ x: 0, y: 0, k: 1 })} className="h-8 w-8 rounded-md border bg-card text-xs shadow-sm hover:bg-muted">⤢</button>}
        </div>
      </div>

      {trail.length > 1 && (
        <nav aria-label="Tutkimuspolku" className="mt-3 flex flex-wrap items-center gap-1 text-sm">
          <span className="mr-1 font-semibold">Polkusi:</span>
          {trail.map((id, i) => (
            <span key={id} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground">→</span>}
              <button onClick={() => setSel(id)} className={`rounded px-1.5 py-0.5 ${id === sel ? "bg-primary text-primary-foreground" : "hover:underline"}`}>
                {byId.get(id)?.title} <span className="opacity-70">{byId.get(id)?.year}</span>
              </button>
            </span>
          ))}
          <button onClick={() => setSel(trail[trail.length - 2]!)} className="ml-2 text-muted-foreground underline-offset-4 hover:underline">← Askel taaksepäin</button>
        </nav>
      )}

      {node && chain ? (
        <section className="mt-5 grid gap-5 md:grid-cols-[1fr_1.4fr_1fr]">
          <ChainList title="Mistä se kumpusi" items={list(chain.up)} tone="calm" onPick={pick} reason={(id) => edgeReason(id, sel!, data.edges)} />
          <div className="rounded-lg border-2 border-primary bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{node.type} · {node.year}</p>
            <h2 className="font-display text-2xl">{node.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ketjussa {chain.nodes.size} / {data.nodes.length} ilmiötä ({Math.round((chain.nodes.size / data.nodes.length) * 100)} % kartasta)
            </p>
            {node.effect && <p className="mt-3 text-sm">{node.effect}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <button className="underline-offset-4 hover:underline" onClick={() => setReplay((x) => x + 1)}>▶ Toista vaikutusaalto</button>
              <button className="underline-offset-4 hover:underline" onClick={() => setSel(null)}>Näytä koko kartta</button>
            </div>
          </div>
          <ChainList title="Mihin se johti" items={list(chain.down)} tone="tension" onPick={pick} reason={(id) => edgeReason(id, sel!, data.edges)} />
        </section>
      ) : (
        <p className="mt-4 text-center text-muted-foreground">Napauta pistettä nähdäksesi sen vaikutusketjun. Muu kartta jää taustalle näyttämään, mihin kohtaan kokonaisuutta ketju asettuu.</p>
      )}
    </main>
  );
}

function ChainList({ title, items, tone, onPick, reason }: { title: string; items: { id: string; title: string; year: number }[]; tone: "calm" | "tension"; onPick: (id: string) => void; reason: (id: string) => string }) {
  return (
    <div>
      <h3 className={`mb-2 text-sm font-semibold uppercase tracking-wider ${tone === "calm" ? "text-calm" : "text-tension"}`}>{title} ({items.length})</h3>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">Ei kirjattuja kytköksiä.</p> : (
        <ul className="max-h-72 space-y-1 overflow-y-auto pr-1 text-sm">
          {items.map((i) => (
            <li key={i.id}><button className="text-left hover:underline" onClick={() => onPick(i.id)}><span className="tabular-nums text-muted-foreground">{i.year}</span> {i.title}</button>
              {reason(i.id) && <p className="ml-10 text-xs italic text-muted-foreground">{reason(i.id)}</p>}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
