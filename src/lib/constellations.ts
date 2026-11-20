// Pure logic for the default-constellation star map: the sky is pre-grouped into
// constellations (life-area × era), and explanation rails link constellations
// into conclusions according to the causal effects between them.
import { laneOf, type MapNode, type MapEdge } from "./system-map";

export const ERAS = [
  { key: 0, label: "Autonomian aika", from: 1800, to: 1900 },
  { key: 1, label: "Itsenäistyminen ja sodat", from: 1900, to: 1945 },
  { key: 2, label: "Rakentamisen vuosikymmenet", from: 1945, to: 1990 },
  { key: 3, label: "Avautuva Suomi", from: 1990, to: 2100 },
] as const;

export const eraOf = (year: number) => (year < 1900 ? 0 : year < 1945 ? 1 : year < 1990 ? 2 : 3);

export type Constellation = { id: string; lane: number; era: number; members: string[]; key: string; lines: [string, string][] };

/** Every phenomenon belongs to exactly one constellation: its life-area in its era. */
export function buildConstellations(nodes: MapNode[], edges: MapEdge[]): Constellation[] {
  const groups = new Map<string, MapNode[]>();
  for (const n of nodes) {
    const id = `${laneOf(n.domains)}-${eraOf(n.year)}`;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push(n);
  }
  return [...groups].map(([id, ms]) => {
    const set = new Set(ms.map((m) => m.id));
    const key = ms.slice().sort((a, b) => b.importance - a.importance || a.year - b.year || a.id.localeCompare(b.id))[0]!.id;
    const lines = edges.filter((e) => set.has(e.from) && set.has(e.to)).map((e) => [e.from, e.to] as [string, string]);
    const [lane, era] = id.split("-").map(Number) as [number, number];
    return { id, lane, era, members: ms.map((m) => m.id), key, lines };
  }).sort((a, b) => a.era - b.era || a.lane - b.lane);
}

export const clusterIndex = (cs: Constellation[]) => new Map(cs.flatMap((c) => c.members.map((m) => [m, c.id] as const)));

/** Number of causal effects running between two constellations (either direction). */
export function linkStrength(a: string, b: string, edges: MapEdge[], cl: Map<string, string>): number {
  let k = 0;
  for (const e of edges) { const x = cl.get(e.from), y = cl.get(e.to); if ((x === a && y === b) || (x === b && y === a)) k++; }
  return k;
}

export type Rail = { id: string; kind: "teema" | "päätelmä"; title: string; conclusion: string; members: string[]; stops: string[]; links: number[] };

/** Rail = the constellations its phenomena belong to, in time order (consecutive repeats merged). */
export function railOf(id: string, kind: Rail["kind"], title: string, conclusion: string, memberIds: string[], nodes: MapNode[], edges: MapEdge[], cl: Map<string, string>): Rail {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const ms = memberIds.filter((m) => byId.has(m) && cl.has(m)).sort((a, b) => byId.get(a)!.year - byId.get(b)!.year || a.localeCompare(b));
  const stops: string[] = [];
  for (const m of ms) { const c = cl.get(m)!; if (stops[stops.length - 1] !== c) stops.push(c); }
  const links = stops.slice(1).map((s, i) => linkStrength(stops[i]!, s, edges, cl));
  return { id, kind, title, conclusion, members: ms, stops, links };
}
