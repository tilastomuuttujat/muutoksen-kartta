// Pure grid logic (decade x life area) for the "aineisto vuosikymmenittäin" page.
// It counts how many phenomena the dataset records per cell. That shows where the material is
// concentrated – not how strong change was – so the page must say so.
import { LANES, laneOf, type MapNode } from "./system-map";

/** Phenomena dated before this year are long arcs with an approximate start; they get one shared column. */
export const FIRST_DECADE = 1850;
/** Decade key for the shared "before 1850" column. */
export const EARLY = -1;

export type HeatCell = { lane: number; decade: number; count: number; nodes: MapNode[] };

export function heatGrid(nodes: MapNode[]) {
  const years = nodes.map((n) => n.year).filter((y) => Number.isFinite(y));
  const last = Math.floor(Math.max(FIRST_DECADE, ...years) / 10) * 10;
  const decades: number[] = [];
  if (years.some((y) => y < FIRST_DECADE)) decades.push(EARLY);
  for (let d = FIRST_DECADE; d <= last; d += 10) decades.push(d);
  const cells = new Map<string, HeatCell>();
  for (const lane of LANES.keys())
    for (const decade of decades)
      cells.set(`${lane}:${decade}`, { lane, decade, count: 0, nodes: [] });
  for (const n of nodes) {
    if (!Number.isFinite(n.year)) continue;
    const decade = n.year < FIRST_DECADE ? EARLY : Math.floor(n.year / 10) * 10;
    const c = cells.get(`${laneOf(n.domains)}:${decade}`)!;
    c.nodes.push(n);
    c.count++;
  }
  const max = Math.max(1, ...[...cells.values()].map((c) => c.count));
  const decadeTotals = new Map(
    decades.map((d) => [d, LANES.reduce((s, _, lane) => s + cells.get(`${lane}:${d}`)!.count, 0)]),
  );
  return { decades, cells, max, decadeTotals };
}
