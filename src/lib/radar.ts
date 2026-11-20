// Satellite radar: pure layout + sensor logic for the /tutka view (testable, browser-safe).
import { LANES, laneOf, chainDepths, isPressure, type MapNode, type MapEdge } from "./system-map";

export const R = 300; // outer radius in SVG units
export const NOW = 2030, OLDEST = 1850;
export const RINGS = 4; // hop rings shown when scanning from a node

const angleOf = (lane: number, slot: number) => {
  const sector = (Math.PI * 2) / LANES.length;
  return -Math.PI / 2 + lane * sector + sector * (0.08 + 0.84 * slot);
};
/** Stable 0..1 slot from id so points spread inside their sector. */
export const slotOf = (id: string) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (h % 1000) / 1000; };

export type RadarPoint = { x: number; y: number; r: number; lane: number; hop: number | null };

/**
 * Rest state: center = present day, distance = how far back in time.
 * Scan state (focusId): center = scanned node, distance = causal hops (1..RINGS); unreachable → outer rim.
 */
export function radarLayout(nodes: MapNode[], edges: MapEdge[], focusId?: string | null, step?: number) {
  const pos = new Map<string, RadarPoint>();
  const depths = focusId ? chainDepths(focusId, edges) : null;
  const focusYear = nodes.find((n) => n.id === focusId)?.year ?? 0;
  const timed = focusId && step != null ? timeDepths(focusId, nodes, edges, step < 0 ? "up" : "down") : null;
  for (const n of nodes) {
    const lane = laneOf(n.domains);
    let r: number, hop: number | null = null;
    if (depths) {
      let d = Math.min(depths.up.get(n.id) ?? Infinity, depths.down.get(n.id) ?? Infinity);
      if (timed) { const t = timed.get(n.id); d = t === 0 ? 0 : t != null && Math.abs(n.year - focusYear) <= Math.abs(step!) ? t : Infinity; }
      if (d === 0) { pos.set(n.id, { x: 0, y: 0, r: 0, lane, hop: 0 }); continue; }
      if (Number.isFinite(d)) { hop = d; r = (Math.min(d, RINGS) - 0.5 + slotOf(n.id + "r") * 0.8 - 0.4) / RINGS * R * 0.88; }
      else r = R * (0.95 + slotOf(n.id + "r") * 0.05);
    } else {
      r = ((NOW - Math.max(OLDEST, Math.min(NOW, n.year))) / (NOW - OLDEST)) * R * 0.95 + 8;
    }
    const a = angleOf(lane, slotOf(n.id));
    pos.set(n.id, { x: Math.round(Math.cos(a) * r * 10) / 10, y: Math.round(Math.sin(a) * r * 10) / 10, r, lane, hop });
  }
  return pos;
}

/**
 * Time-directed hop distances: "up" = backgrounds (each step goes back or stays in time),
 * "down" = consequences (each step goes forward or stays). Keeps past and future apart.
 */
export function timeDepths(id: string, nodes: MapNode[], edges: MapEdge[], dir: "up" | "down") {
  const year = new Map(nodes.map((n) => [n.id, n.year]));
  const d = new Map<string, number>([[id, 0]]);
  const q = [id];
  while (q.length) {
    const cur = q.shift()!, cy = year.get(cur) ?? 0;
    for (const e of edges) {
      const next = dir === "down" ? (e.from === cur ? e.to : null) : e.to === cur ? e.from : null;
      if (!next || d.has(next)) continue;
      const ny = year.get(next) ?? 0;
      if (dir === "down" ? ny < cy : ny > cy) continue;
      d.set(next, d.get(cur)! + 1); q.push(next);
    }
  }
  return d;
}

/** Playback steps in years relative to the scanned phenomenon: deepest backgrounds → focus → farthest consequences. */
export const STEPS = [-100, -50, -20, -10, -5, 0, 5, 10, 20, 50, 100];
export const nextStep = (s: number) => STEPS[(STEPS.indexOf(s) + 1) % STEPS.length]!;

export const SENSORS = [
  { key: "optinen", label: "Optinen", hint: "kaikki ilmiöt" },
  { key: "lampo", label: "Lämpö", hint: "jännitteet ja purkaukset" },
  { key: "sar", label: "Tutka", hint: "kantavat rakenteet" },
] as const;
export type SensorKey = (typeof SENSORS)[number]["key"];

/** Which nodes a sensor detects. */
export function sensorHits(sensor: SensorKey, nodes: MapNode[], edges: MapEdge[]): Set<string> {
  if (sensor === "lampo") {
    const s = new Set<string>();
    for (const e of edges) if (isPressure(e)) { s.add(e.from); s.add(e.to); }
    return s;
  }
  if (sensor === "sar") {
    const deg = new Map<string, number>();
    for (const e of edges) { deg.set(e.from, (deg.get(e.from) ?? 0) + 1); deg.set(e.to, (deg.get(e.to) ?? 0) + 1); }
    return new Set([...nodes].sort((a, b) => (deg.get(b.id) ?? 0) - (deg.get(a.id) ?? 0)).slice(0, 25).map((n) => n.id));
  }
  return new Set(nodes.map((n) => n.id));
}

/** Main line on scan: all direct links; 2nd step only importance ≥ 4; 3rd+ only the top turning points (5). */
export const isMainline = (hop: number | null, importance: number) =>
  hop != null && (hop <= 1 || (hop === 2 ? importance >= 4 : importance >= 5));

/** Collision-avoiding label placement: most important first; tries a few vertical offsets, else skips. */
export type LabelIn = { id: string; x: number; y: number; text: string; importance: number };
export type LabelOut = { id: string; x: number; y: number; text: string; anchor: "start" | "end" };
export function placeLabels(items: LabelIn[], charW = 5, h = 11, reserved: { x0: number; y0: number; x1: number; y1: number }[] = []): LabelOut[] {
  const boxes = [...reserved];
  const out: LabelOut[] = [];
  const sorted = [...items].sort((a, b) => b.importance - a.importance);
  for (const it of sorted) {
    const w = it.text.length * charW;
    const right = it.x >= 0;
    for (const dy of [0, -h, h, -2 * h, 2 * h]) {
      const lx = it.x + (right ? 7 : -7), ly = it.y + 3 + dy;
      const b = { x0: right ? lx : lx - w, x1: right ? lx + w : lx, y0: ly - h + 2, y1: ly + 2 };
      if (!boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0)) {
        boxes.push(b);
        out.push({ id: it.id, x: lx, y: ly, text: it.text, anchor: right ? "start" : "end" });
        break;
      }
    }
  }
  return out;
}

/** 360° time dial: −100 v at 12 o'clock, 0 v at 6 o'clock, +100 v back at 12, counter-clockwise (past on the left). Angle in radians (SVG, 0 = east). */
export function stepToAngle(step: number): number {
  return -Math.PI / 2 - ((step + 100) / 200) * Math.PI * 2;
}
export function angleToStep(angle: number): number {
  let f = (-Math.PI / 2 - angle) / (Math.PI * 2);
  f = ((f % 1) + 1) % 1;
  return Math.round(f * 200 - 100);
}
