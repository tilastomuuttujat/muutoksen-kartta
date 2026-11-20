import type { Series } from "@/lib/murros-data";

const fmt = (v: number) =>
  Math.abs(v) >= 1000
    ? Math.round(v).toLocaleString("fi-FI")
    : v.toLocaleString("fi-FI", { maximumFractionDigits: 1 });

/** A small, honest line chart: real axis values, the phenomenon's year marked, and the source linked. */
export function SeriesChart({
  series,
  markYear,
  markLabel,
}: {
  series: Series;
  markYear?: number;
  markLabel?: string;
}) {
  const w = 320,
    h = 120,
    l = 44,
    r = 8,
    t = 10,
    b = 20;
  const xs = series.values.map((p) => p[0]),
    ys = series.values.map((p) => p[1]);
  const x0 = Math.min(...xs),
    x1 = Math.max(...xs);
  const lo = Math.min(0, ...ys),
    hi = Math.max(...ys);
  const x = (v: number) => l + ((v - x0) / Math.max(1, x1 - x0)) * (w - l - r);
  const y = (v: number) => t + (1 - (v - lo) / Math.max(1e-9, hi - lo)) * (h - t - b);
  const d = series.values
    .map((p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`)
    .join(" ");
  const inRange = markYear != null && markYear >= x0 && markYear <= x1;
  const last = series.values.at(-1)!;
  const host = (() => {
    try {
      return new URL(series.source).hostname.replace(/^www\./, "");
    } catch {
      return series.source;
    }
  })();
  return (
    <figure className="rounded-md border bg-background p-2">
      <figcaption className="mb-1 text-xs font-semibold leading-snug">{series.title}</figcaption>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        role="img"
        aria-label={`${series.title}: ${x0}–${x1}, viimeisin arvo ${fmt(last[1])} ${series.unit}`}
      >
        <line x1={l} x2={w - r} y1={y(lo)} y2={y(lo)} className="stroke-border" />
        <text
          x={l - 4}
          y={y(hi) + 4}
          textAnchor="end"
          className="fill-muted-foreground text-[10px]"
        >
          {fmt(hi)}
        </text>
        <text
          x={l - 4}
          y={y(lo) + 4}
          textAnchor="end"
          className="fill-muted-foreground text-[10px]"
        >
          {fmt(lo)}
        </text>
        <text x={l} y={h - 4} className="fill-muted-foreground text-[10px]">
          {x0}
        </text>
        <text x={w - r} y={h - 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
          {x1}
        </text>
        {inRange && (
          <g>
            <line
              x1={x(markYear)}
              x2={x(markYear)}
              y1={t}
              y2={h - b}
              className="stroke-primary"
              strokeDasharray="3 3"
            />
            <text x={x(markYear) + 3} y={t + 8} className="fill-primary text-[10px]">
              {markLabel ?? markYear}
            </text>
          </g>
        )}
        <path
          d={d}
          fill="none"
          strokeWidth={2}
          className="stroke-foreground"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Yksikkö: {series.unit || "–"} · {x0}–{x1}
        {markYear != null && !inRange && <> · ilmiö ({markYear}) on sarjan ulkopuolella</>} · Lähde:{" "}
        <a
          href={series.source}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {host}
        </a>
      </p>
    </figure>
  );
}
