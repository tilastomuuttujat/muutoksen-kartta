// Pure "constellation + star path" logic: a clicked phenomenon forms a constellation
// (itself + direct causes/effects); the star path (spine) is the chain of the most
// significant phenomena; each constellation docks to the spine via its key star.
import type { MapNode, MapEdge } from "./system-map";

export const SPINE_MIN_IMPORTANCE = 5;
export const MAX_PINNED = 4;

/** Spine = most significant phenomena in time order. */
export function spineOf(nodes: MapNode[], min = SPINE_MIN_IMPORTANCE): MapNode[] {
  return nodes.filter((n) => n.importance >= min).sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
}

/** Constellation = the phenomenon plus its direct causes and effects. */
export function constellationOf(id: string, edges: MapEdge[]): Set<string> {
  const s = new Set([id]);
  for (const e of edges) { if (e.from === id) s.add(e.to); if (e.to === id) s.add(e.from); }
  return s;
}

export type Dock = { key: string; spine: string; direct: boolean };

/**
 * Key star = most significant member (spine members preferred, ties: closest in time to the
 * focus). Docks to the spine node it is (direct) or the spine node nearest in time.
 */
export function dockOf(focusId: string, members: Set<string>, nodes: MapNode[], spine: MapNode[]): Dock | null {
  if (!spine.length) return null;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const f = byId.get(focusId); if (!f) return null;
  const spineIds = new Set(spine.map((n) => n.id));
  const onSpine = [...members].filter((id) => spineIds.has(id)).map((id) => byId.get(id)!);
  if (onSpine.length) {
    const k = onSpine.sort((a, b) => (a.id === focusId ? -1 : b.id === focusId ? 1 : Math.abs(a.year - f.year) - Math.abs(b.year - f.year)))[0]!;
    return { key: k.id, spine: k.id, direct: true };
  }
  const k = [...members].map((id) => byId.get(id)!).filter(Boolean)
    .sort((a, b) => b.importance - a.importance || Math.abs(a.year - f.year) - Math.abs(b.year - f.year))[0]!;
  const near = spine.slice().sort((a, b) => Math.abs(a.year - k.year) - Math.abs(b.year - k.year))[0]!;
  return { key: k.id, spine: near.id, direct: false };
}

/** Stars shared by two or more constellations. */
export function junctions(cons: Set<string>[]): Set<string> {
  const c = new Map<string, number>();
  for (const s of cons) for (const id of s) c.set(id, (c.get(id) ?? 0) + 1);
  return new Set([...c].filter(([, k]) => k >= 2).map(([id]) => id));
}

/** Spine segment spanned by the docks (inclusive), in spine order. */
export function activeSegment(spine: MapNode[], docks: string[]): string[] {
  const idx = docks.map((d) => spine.findIndex((n) => n.id === d)).filter((i) => i >= 0);
  if (!idx.length) return [];
  return spine.slice(Math.min(...idx), Math.max(...idx) + 1).map((n) => n.id);
}

/** Conclusions ranked by how many constellations support them; needs ≥ minCons. */
export function synthesis(cons: Set<string>[], nodeConclusions: Record<string, string[]>, minCons = 2) {
  const support = new Map<string, Set<number>>();
  cons.forEach((s, i) => { for (const id of s) for (const c of nodeConclusions[id] ?? []) { if (!support.has(c)) support.set(c, new Set()); support.get(c)!.add(i); } });
  return [...support].map(([id, s]) => ({ id, count: s.size })).filter((x) => x.count >= minCons).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}
