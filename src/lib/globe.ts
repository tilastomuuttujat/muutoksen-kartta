// 3D globe (orthographic, pure math) for the /pallo view: lane = longitude band, year = latitude.
import { LANES, laneOf, type MapNode } from "./system-map";
export const OLDEST = 1850, NOW = 2030, MAX_LAT = (70 * Math.PI) / 180;
const slot = (id: string) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (h % 1000) / 1000; };

/** Latitude from year (older = south), longitude from life-area sector. */
export function globePos(n: MapNode) {
  const t = (Math.max(OLDEST, Math.min(NOW, n.year)) - OLDEST) / (NOW - OLDEST);
  const sector = (Math.PI * 2) / LANES.length;
  const lane = laneOf(n.domains);
  return { lat: -MAX_LAT + t * 2 * MAX_LAT + (slot(n.id + "y") - 0.5) * 0.04, lon: lane * sector + sector * (0.08 + 0.84 * slot(n.id)), lane };
}

/** Project lat/lon after rotating the globe so (rotLat, rotLon) faces the viewer. z > 0 = front. */
export function project(lat: number, lon: number, rotLat: number, rotLon: number) {
  const l = lon - rotLon;
  const x = Math.cos(lat) * Math.sin(l), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(l);
  return { x, y: -(y * Math.cos(rotLat) - z * Math.sin(rotLat)), z: y * Math.sin(rotLat) + z * Math.cos(rotLat) };
}

/** Shortest-path angle interpolation for smooth spin toward a target. */
export function lerpAngle(a: number, b: number, t: number) {
  let d = (b - a) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
  return a + d * t;
}
