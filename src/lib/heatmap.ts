// Pure heat-grid logic (decade x life area) for the heatmap page.
import { LANES, laneOf, isPressure, type MapEdge, type MapNode } from "./system-map";

export type HeatCell = { lane: number; decade: number; heat: number; nodes: MapNode[] };

/** Heat = sum of node importance + 1 per pressure edge touching a node in the cell. */
export function heatGrid(nodes: MapNode[], edges: MapEdge[]) {
  const pressure = new Map<string, number>();
  for (const e of edges) if (isPressure(e)) {
    pressure.set(e.from, (pressure.get(e.from) ?? 0) + 1);
    pressure.set(e.to, (pressure.get(e.to) ?? 0) + 1);
  }
  const years = nodes.map((n) => n.year).filter((y) => Number.isFinite(y));
  const first = Math.floor(Math.min(...years) / 10) * 10;
  const last = Math.floor(Math.max(...years) / 10) * 10;
  const decades: number[] = [];
  for (let d = first; d <= last; d += 10) decades.push(d);
  const cells = new Map<string, HeatCell>();
  for (const lane of LANES.keys()) for (const decade of decades) cells.set(`${lane}:${decade}`, { lane, decade, heat: 0, nodes: [] });
  for (const n of nodes) {
    if (!Number.isFinite(n.year)) continue;
    const c = cells.get(`${laneOf(n.domains)}:${Math.floor(n.year / 10) * 10}`)!;
    c.nodes.push(n);
    c.heat += n.importance + (pressure.get(n.id) ?? 0);
  }
  const max = Math.max(1, ...[...cells.values()].map((c) => c.heat));
  return { decades, cells, max };
}
