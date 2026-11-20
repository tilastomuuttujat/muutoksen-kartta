// Pure layout + chain logic for the system map (browser-safe, testable).
export type MapNode = { id: string; title: string; year: number; type: string; domains: string[]; importance: number; problem: string; effect: string; role?: string };
export type MapEdge = { from: string; to: string; type: string; rationale: string; pressure: boolean; cls?: string; confidence?: string };

// ---- Causal reading: only relations that say "A led to B", pointing forward in time ----
/** Relation types that describe similarity, contrast, an example or a part-whole link — not cause and effect. */
export const NON_CAUSAL_TYPES = new Set([
  "complemented", "complemented_by", "contrasts", "exemplified_by", "coincided_with", "coexisted_with",
  "same_process_as", "integrates", "integrated_into", "integrated_with", "foreshadowed", "broader_context_for",
]);
/** A causal edge has a cause-type relation and its cause does not start after its effect. */
export function isCausal(e: Pick<MapEdge, "from" | "to" | "type">, yearOf: (id: string) => number | undefined) {
  if (NON_CAUSAL_TYPES.has(e.type)) return false;
  const a = yearOf(e.from), b = yearOf(e.to);
  return a == null || b == null || a <= b;
}
export function causalEdges<E extends MapEdge>(nodes: Pick<MapNode, "id" | "year">[], edges: E[]): E[] {
  const year = new Map(nodes.map((n) => [n.id, n.year]));
  return edges.filter((e) => isCausal(e, (id) => year.get(id)));
}
export const CONFIDENCE_LABEL: Record<string, string> = { vahva: "vahva yhteys", kohtalainen: "kohtalainen yhteys", heikko: "heikko yhteys" };
export const isWeak = (e: Pick<MapEdge, "confidence">) => e.confidence === "heikko";

export const LANES = [
  { key: "talous", label: "Talous ja tuotanto", words: ["talous", "teollisuus", "energia", "maatalous", "metsätalous", "rahoitus", "rahapolitiikka", "euro", "EU", "liikenne", "teknologia", "digitalisaatio", "tekoäly", "julkinen talous"] },
  { key: "tyo", label: "Työ ja toimeentulo", words: ["työ", "työllisyys", "sosiaaliturva", "eläke", "eläkkeet", "asuminen", "työttömyys"] },
  { key: "hoiva", label: "Hyvinvointi ja hoiva", words: ["terveys", "hoiva", "perhe", "perheet", "lapset", "vammaisuus", "sosiaalihuolto", "väestö", "koulutus"] },
  { key: "valta", label: "Valta ja hallinto", words: ["hallinto", "valtio", "demokratia", "turvallisuus", "puolustus", "perusoikeudet", "oikeusvaltio", "kunta"] },
  { key: "yhteiso", label: "Kulttuuri ja yhteisöt", words: [] as string[] },
] as const;

export function laneOf(domains: string[]): number {
  for (const d of domains) {
    const i = LANES.findIndex((l) => (l.words as readonly string[]).includes(d));
    if (i >= 0) return i;
  }
  return LANES.length - 1;
}

export const PRESSURE_RE = /pressure|constrain|weaken|vulnerab|exposed|delayed|counterreaction|reversed/;
export const isPressure = (e: Pick<MapEdge, "type" | "pressure">) => e.pressure || PRESSURE_RE.test(e.type);

export const W = 1400, LANE_H = 150, TOP = 30, Y0 = 1850, Y1 = 2030;
export const xOf = (year: number) => 60 + ((Math.min(Y1, Math.max(Y0, year)) - Y0) / (Y1 - Y0)) * (W - 100);

export function layout(nodes: MapNode[]) {
  const pos = new Map<string, { x: number; y: number; lane: number }>();
  LANES.forEach((_, lane) => {
    const rows: number[] = [];
    const sub = 7;
    nodes.filter((n) => laneOf(n.domains) === lane).sort((a, b) => a.year - b.year).forEach((n) => {
      const x = xOf(n.year);
      let r = rows.findIndex((last) => x - last > 14);
      if (r < 0) r = rows.length < sub ? rows.length : rows.indexOf(Math.min(...rows));
      rows[r] = x;
      const order = [3, 2, 4, 1, 5, 0, 6][r] ?? 3;
      pos.set(n.id, { x, y: TOP + lane * LANE_H + 18 + order * ((LANE_H - 36) / (sub - 1)), lane });
    });
  });
  return pos;
}

/** Everything reachable upstream (causes) and downstream (effects) of `id`. */
/** Causes (up) and effects (down) of `id`, at most `maxDepth` steps away. Only edges that advance one step are kept. */
export function chainOf(id: string, edges: MapEdge[], maxDepth = Infinity) {
  const depths = chainDepths(id, edges, maxDepth);
  const up = new Set(depths.up.keys()), down = new Set(depths.down.keys());
  up.delete(id); down.delete(id);
  const nodes = new Set<string>([id, ...up, ...down]);
  const step = (d: Map<string, number>, a: string, b: string) => d.has(a) && d.has(b) && d.get(b)! === d.get(a)! + 1;
  const onChain = (e: MapEdge) => step(depths.up, e.to, e.from) || step(depths.down, e.from, e.to);
  return { up, down, nodes, edges: new Set(edges.filter(onChain)), depths };
}

// ---- 2.5D layered view: fast surface events above, slow deep structures below ----
export const LAYERS = [
  { key: "pinta", label: "Pinta – kriisit ja käänteet", hint: "nopeat", types: ["kriisi", "tapahtuma", "teknologinen murros", "onnistuminen", "tulevaisuusskenaario"] },
  { key: "saannot", label: "Säännöt – uudistukset ja instituutiot", hint: "vuosikymmenet", types: ["uudistus", "instituutio"] },
  { key: "pohja", label: "Pohja – hitaat rakenteet", hint: "sukupolvet", types: ["rakennemuutos", "pitkä kaari", "väestömuutos", "analyyttinen kehys"] },
] as const;

export function layerOf(type: string): number {
  const i = LAYERS.findIndex((l) => (l.types as readonly string[]).includes(type));
  return i >= 0 ? i : 0;
}

export const ISO = { skew: 150, depth: 150, gap: 215, top: 40, scale: 0.86 };
export const ISO_W = 60 + W * ISO.scale + ISO.skew + 20;
export const ISO_H = ISO.top + (LAYERS.length - 1) * ISO.gap + ISO.depth + 50;

/** Project a point on layer `layer` (x in flat-map units, d = depth 0..1) to screen. */
export function isoPoint(x: number, d: number, layer: number) {
  return { x: 40 + x * ISO.scale + d * ISO.skew, y: ISO.top + layer * ISO.gap + d * ISO.depth };
}

// Alternative layer models: the reader picks how the three slabs slice the whole.
type LayerModel = { key: string; label: string; layers: { label: string; hint: string }[]; of: (n: MapNode) => number };
const ARKI = ["koulutus", "terveys", "hoiva", "perhe", "perheet", "lapset", "nuoret", "asuminen", "toimeentulo", "sosiaaliturva", "työ", "työllisyys", "eläke", "eläkkeet", "mielenterveys", "vammaisuus", "opiskelijat", "työttömyys"];
const RESURSSI = ["talous", "vienti", "teollisuus", "julkinen talous", "velka", "verotus", "tuottavuus", "investoinnit", "energia", "huoltovarmuus", "rahoitus", "rahapolitiikka", "euro", "maatalous", "metsätalous"];
export const LAYER_MODELS: LayerModel[] = [
  { key: "tahti", label: "Muutoksen tahti", layers: LAYERS.map((l) => ({ label: l.label, hint: l.hint })), of: (n) => layerOf(n.type) },
  { key: "arki", label: "Arki ja konehuone", layers: [
    { label: "Arki – elämänkaari", hint: "koulu, hoiva, koti, työ" },
    { label: "Konehuone – hallinto ja säännöt", hint: "lait, kunnat, oikeus" },
    { label: "Resurssipohja – talous", hint: "vienti, verot, velka" },
  ], of: (n) => (n.domains.some((d) => ARKI.includes(d)) ? 0 : n.domains.some((d) => RESURSSI.includes(d)) ? 2 : 1) },
  { key: "kaari", label: "Päätösten kaari", layers: [
    { label: "Paineet – mikä pakotti toimimaan", hint: "kriisit, puutteet" },
    { label: "Ratkaisut – mitä päätettiin", hint: "uudistukset, instituutiot" },
    { label: "Seuraukset – mitä jäi pysyväksi", hint: "lukot, pitkät jäljet" },
  ], of: (n) => (n.role === "toimeenpanolukko" ? 2 : ["uudistus", "instituutio"].includes(n.type) ? 1 : ["rakennemuutos", "pitkä kaari", "analyyttinen kehys", "onnistuminen"].includes(n.type) ? 2 : 0) },
];
export const layerModel = (key: string) => LAYER_MODELS.find((m) => m.key === key) ?? LAYER_MODELS[0]!;

export function layout3d(nodes: MapNode[], modelKey = "tahti") {
  const model = layerModel(modelKey);
  const flat = layout(nodes);
  const span = LANES.length * LANE_H;
  const pos = new Map<string, { x: number; y: number; lane: number; layer: number }>();
  for (const n of nodes) {
    const p = flat.get(n.id)!;
    const layer = model.of(n);
    pos.set(n.id, { ...isoPoint(p.x, (p.y - TOP) / span, layer), lane: p.lane, layer });
  }
  return pos;
}

// ---- Lenses: smart filters that highlight one aspect of the whole ----
type LensDef = { key: string; label: string; hint: string; node?: (n: MapNode) => boolean; edge?: (e: MapEdge) => boolean; hubs?: number };
const hasAny = (n: MapNode, words: string[]) => n.domains.some((d) => words.includes(d));
export const LENSES: LensDef[] = [
  { key: "kriisit", label: "Käännekohdat", hint: "Mikä rikkoi vanhan polun", node: (n) => n.type === "kriisi" || n.type === "tapahtuma" },
  { key: "kantavat", label: "Peruspilarit", hint: "Minkä varaan vakaus rakennettiin", hubs: 20 },
  { key: "pohjavirrat", label: "Hitaat pohjavirrat", hint: "Hitaat voimat, jotka muuttavat pohjaa huomaamatta", node: (n) => ["rakennemuutos", "pitkä kaari", "väestömuutos"].includes(n.type) },
  { key: "lukot", label: "Nykyiset lukot", hint: "Miksi koneisto jumittaa tänään", node: (n) => n.role === "toimeenpanolukko", edge: (e) => isPressure(e) },
  { key: "sukupolvet", label: "Sukupolviketju", hint: "Mitä rakennettiin – mitä jää nuorten käteen", node: (n) => hasAny(n, ["nuoret", "lapset", "koulutus", "opiskelijat", "asuminen", "asuntomarkkinat", "työurat", "eläke", "eläkkeet", "ikääntyminen", "vanhuspalvelut", "huoltosuhde", "väestö", "perheet", "perhe"]) },
];

/** Nodes and edges a lens keeps visible. Edge lenses also keep their endpoints. */
export function applyLens(key: string, nodes: MapNode[], edges: MapEdge[]) {
  const lens = LENSES.find((l) => l.key === key);
  if (!lens) return null;
  let ns = new Set(nodes.filter((n) => lens.node?.(n)).map((n) => n.id));
  if (lens.hubs) {
    const deg = new Map<string, number>();
    for (const e of edges) { deg.set(e.from, (deg.get(e.from) ?? 0) + 1); deg.set(e.to, (deg.get(e.to) ?? 0) + 1); }
    ns = new Set([...deg.entries()].sort((a, b) => b[1] - a[1]).slice(0, lens.hubs).map(([id]) => id));
  }
  const es = new Set<MapEdge>();
  for (const e of edges) {
    if (lens.edge ? lens.edge(e) || (ns.has(e.from) && ns.has(e.to)) : ns.has(e.from) && ns.has(e.to)) { es.add(e); if (lens.edge) { ns.add(e.from); ns.add(e.to); } }
  }
  return { nodes: ns, edges: es };
}

// --- Usability helpers: search, suggested starts, edge reasons, trail ---
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
export function searchNodes(q: string, nodes: MapNode[], limit = 8): MapNode[] {
  const t = norm(q.trim());
  if (!t) return [];
  if (/^\d{4}$/.test(t)) {
    const y = Number(t);
    return nodes.filter((n) => Math.abs(n.year - y) <= 3).sort((a, b) => Math.abs(a.year - y) - Math.abs(b.year - y) || b.importance - a.importance).slice(0, limit);
  }
  return nodes
    .map((n) => ({ n, i: norm(n.title).indexOf(t) }))
    .filter((r) => r.i >= 0 || r.n.domains.some((d) => norm(d) === t))
    .sort((a, b) => (a.i < 0 ? 99 : a.i === 0 ? 0 : 1) - (b.i < 0 ? 99 : b.i === 0 ? 0 : 1) || b.n.importance - a.n.importance)
    .slice(0, limit)
    .map((r) => r.n);
}

export const STARTS: { label: string; q: string; hint: string; from?: number }[] = [
  { label: "1990-luvun lama", q: "lama", from: 1988, hint: "kuinka syvälle se ulottui?" },
  { label: "Peruskoulu", q: "peruskoulu", hint: "mitä siitä seurasi?" },
  { label: "Digitalisaatio", q: "digi", hint: "miten teknologia muutti arkea?" },
  { label: "Väestön ikääntyminen", q: "ikäänty", hint: "hidas pohjavirta" },
];
export function resolveStarts(nodes: MapNode[]) {
  return STARTS.map((s) => ({ ...s, node: searchNodes(s.q, s.from ? nodes.filter((n) => n.year >= s.from!) : nodes, 1)[0] })).filter((s) => s.node);
}

export function edgeReason(a: string, b: string, edges: MapEdge[]): string {
  const e = edges.find((x) => (x.from === a && x.to === b) || (x.from === b && x.to === a));
  return e?.rationale?.trim() ?? "";
}

/** Exploration trail: revisiting a step cuts the trail back to it. */
export function pushTrail(trail: string[], id: string): string[] {
  const i = trail.indexOf(id);
  return i >= 0 ? trail.slice(0, i + 1) : [...trail, id].slice(-8);
}

// ---- Impulse wave: hop distance from the focused node, used to stagger the chain lighting up ----
export function chainDepths(id: string, edges: MapEdge[], maxDepth = Infinity) {
  const walk = (dir: "up" | "down") => {
    const d = new Map<string, number>([[id, 0]]);
    const q = [id];
    while (q.length) {
      const cur = q.shift()!;
      if (d.get(cur)! >= maxDepth) continue;
      for (const e of edges) {
        const next = dir === "down" ? (e.from === cur ? e.to : null) : e.to === cur ? e.from : null;
        if (next && !d.has(next)) { d.set(next, d.get(cur)! + 1); q.push(next); }
      }
    }
    return d;
  };
  return { up: walk("up"), down: walk("down") };
}

/** Delay (ms) before a node lights up: causes gather first (furthest first), then effects ripple outward. */
export function waveDelay(id: string, depths: ReturnType<typeof chainDepths>, step = 380) {
  const maxUp = Math.max(0, ...depths.up.values());
  if (depths.down.get(id) === 0) return maxUp * step * 0.5;
  if (depths.up.has(id)) return (maxUp - depths.up.get(id)!) * step * 0.5;
  if (depths.down.has(id)) return maxUp * step * 0.5 + depths.down.get(id)! * step;
  return 0;
}

/** Emphasis 0..1 for a chain member: fades with hop distance and lower importance, so the main route stands out. */
export function chainWeight(id: string, depths: ReturnType<typeof chainDepths>, importance: number) {
  const d = Math.min(depths.up.get(id) ?? Infinity, depths.down.get(id) ?? Infinity);
  if (d === 0) return 1;
  if (!Number.isFinite(d)) return 0;
  const hop = d === 1 ? 1 : d === 2 ? 0.6 : 0.3;
  const imp = importance >= 4 ? 1 : importance === 3 ? 0.75 : 0.45;
  return Math.max(0.15, hop * imp);
}

/** Whether a chain member gets a name label: small chains label everyone; large ones keep direct neighbours and the main route. */
export function shouldLabel(id: string, depths: ReturnType<typeof chainDepths>, importance: number, chainSize: number, smallMax = 18) {
  const d = Math.min(depths.up.get(id) ?? Infinity, depths.down.get(id) ?? Infinity);
  if (!Number.isFinite(d)) return false;
  if (chainSize <= smallMax || d <= 1) return true;
  return chainWeight(id, depths, importance) >= 0.75;
}
