import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { murrosDataQuery } from "@/lib/murros-data";
import { heatGrid } from "@/lib/heatmap";
import { LANES } from "@/lib/system-map";

export const Route = createFileRoute("/lampokartta")({
  loader: ({ context }) => context.queryClient.ensureQueryData(murrosDataQuery()),
  head: () => ({
    meta: [
      { title: "Muutoksen lämpökartta – Murrosmatriisi" },
      { name: "description", content: "Missä elämänalueilla ja millä vuosikymmenillä Suomen muutospaine on ollut kuumimmillaan – yhdellä silmäyksellä." },
      { property: "og:title", content: "Muutoksen lämpökartta – Murrosmatriisi" },
      { property: "og:description", content: "Vuosikymmenet × elämänalueet: näe, missä paine on kasautunut." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HeatPage,
});

function HeatPage() {
  const { data } = useSuspenseQuery(murrosDataQuery());
  const { decades, cells, max } = useMemo(() => heatGrid(data.nodes, data.edges), [data]);
  const [sel, setSel] = useState<string | null>(null);
  const cell = sel ? cells.get(sel) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Muutoksen lämpökartta</h1>
          <p className="mt-1 text-muted-foreground">Mitä kuumempi ruutu, sitä enemmän painavia ilmiöitä ja jännitteisiä kytköksiä siihen kasautui.</p>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">← Kartta</Link>
          <Link to="/teemat" className="underline-offset-4 hover:underline">Teemat →</Link>
        </nav>
      </header>

      <div className="overflow-x-auto rounded-xl border bg-card p-3">
        <div className="grid min-w-[640px] gap-1" style={{ gridTemplateColumns: `7rem repeat(${decades.length}, minmax(0, 1fr))` }}>
          <div className="sticky left-0 z-10 bg-card" />
          {decades.map((d) => <div key={d} className="text-center text-[10px] text-muted-foreground">{d % 100 === 0 ? d : String(d).slice(2)}</div>)}
          {LANES.map((l, lane) => (
            <div key={l.key} className="contents">
              <div className="sticky left-0 z-10 bg-card pr-2 text-xs leading-4 flex items-center">{l.label}</div>
              {decades.map((d) => {
                const k = `${lane}:${d}`; const c = cells.get(k)!; const t = c.heat / max;
                return (
                  <button key={k} onClick={() => setSel(sel === k ? null : k)} aria-label={`${l.label} ${d}-luku: ${c.nodes.length} ilmiötä`}
                    className={`h-8 rounded-sm transition ${sel === k ? "ring-2 ring-ring" : ""}`}
                    style={{ background: c.heat ? `color-mix(in oklch, var(--tension) ${Math.round(15 + Math.sqrt(t) * 85)}%, var(--calm))` : "var(--muted)", opacity: c.heat ? 1 : 0.5 }} />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          Viileä <span className="h-2 w-32 rounded" style={{ background: "linear-gradient(90deg, var(--calm), var(--tension))" }} /> Kuuma
        </div>
      </div>

      {cell && (
        <section className="mt-6 rounded-xl border bg-card p-4">
          <h2 className="font-display text-xl">{LANES[cell.lane]?.label}, {cell.decade}-luku</h2>
          <p className="text-sm text-muted-foreground">{cell.nodes.length} ilmiötä</p>
          <ul className="mt-3 space-y-1 text-sm">
            {[...cell.nodes].sort((a, b) => b.importance - a.importance).map((n) => (
              <li key={n.id}><span className="text-muted-foreground">{n.year}</span> {n.title}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
