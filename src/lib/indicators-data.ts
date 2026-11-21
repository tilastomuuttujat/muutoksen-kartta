// Indicators for the /poikkeamat page, fetched from Supabase by scripts/build-indicators.py
// into a static file so the page works without a database connection (also on GitHub Pages).
import { queryOptions } from "@tanstack/react-query";
import raw from "@/data/indicators.json";
import { assessed, episodes, referenceRange, flag, type Indicator } from "./anomaly";

const data = raw as unknown as {
  meta: { generated_at: string; crisis_source: string };
  indicators: Indicator[];
  crisis_years: number[];
};

export function loadIndicators() {
  const rows = data.indicators.map((ind) => {
    const pts = assessed(ind);
    const range = referenceRange(ind, pts);
    const last = pts.at(-1) ?? null;
    return {
      ind,
      pts,
      range,
      episodes: episodes(pts, range),
      last,
      lastFlag: last ? flag(last.value, range) : null,
    };
  });
  return { rows, crisisYears: data.crisis_years, meta: data.meta };
}
export type IndicatorRow = ReturnType<typeof loadIndicators>["rows"][number];

export const indicatorsQuery = () =>
  queryOptions({
    queryKey: ["indicators"],
    queryFn: () => Promise.resolve(loadIndicators()),
    staleTime: Infinity,
  });
