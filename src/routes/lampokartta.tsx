import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { murrosDataQuery } from "@/lib/murros-data";
import { EARLY, heatGrid } from "@/lib/heatmap";
import { LANES } from "@/lib/system-map";

export const Route = createFileRoute("/lampokartta")({
  loader: ({ context }) => context.queryClient.ensureQueryData(murrosDataQuery()),
  head: () => ({
    meta: [
      { title: "Aineisto vuosikymmenittäin – Murrosmatriisi" },
      {
        name: "description",
        content:
          "Kuinka monta murrosta aineistoon on kirjattu kultakin vuosikymmeneltä ja elämänalueelta.",
      },
      { property: "og:title", content: "Aineisto vuosikymmenittäin – Murrosmatriisi" },
      {
        property: "og:description",
        content: "Vuosikymmenet × elämänalueet: mihin aineiston kirjatut murrokset painottuvat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HeatPage,
});

const label = (d: number) => (d === EARLY ? "ennen 1850" : `${d}-luku`);
const short = (d: number) =>
  d === EARLY ? "<1850" : d % 100 === 0 ? String(d) : String(d).slice(2);

function HeatPage() {
  const { data } = useSuspenseQuery(murrosDataQuery());
  const { decades, cells, max, decadeTotals } = useMemo(() => heatGrid(data.nodes), [data]);
  const [sel, setSel] = useState<string | null>(null);
  const cell = sel ? cells.get(sel) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Aineisto vuosikymmenittäin</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Ruudun luku kertoo, montako murrosta aineistoon on kirjattu kyseiseltä vuosikymmeneltä
            ja elämänalueelta.
          </p>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            ← Kartta
          </Link>
          <Link to="/teemat" className="underline-offset-4 hover:underline">
            Teemat →
          </Link>
        </nav>
      </header>

      <p className="mb-4 max-w-3xl rounded-md border-l-4 border-primary bg-card px-3 py-2 text-sm">
        <b>Näin luet taulukkoa:</b> luku kuvaa aineiston painottumista, ei muutoksen voimakkuutta.
        Lähivuosikymmenet ovat tiheämmin kirjattuja, koska niistä tiedetään enemmän. Sarake{" "}
        <i>ennen 1850</i> kokoaa pitkät kehityskaaret, joiden alkuvuosi on likimääräinen.
      </p>

      <div className="overflow-x-auto rounded-xl border bg-card p-3">
        <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-1 text-center text-xs">
          <caption className="sr-only">
            Kirjattujen murrosten määrä elämänalueittain ja vuosikymmenittäin
          </caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-36 bg-card" />
              {decades.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className={`font-normal text-muted-foreground ${d === EARLY ? "w-12" : ""}`}
                >
                  {short(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LANES.map((l, lane) => (
              <tr key={l.key}>
                <th scope="row" className="sticky left-0 z-10 bg-card pr-2 text-left font-normal">
                  {l.label}
                </th>
                {decades.map((d) => {
                  const k = `${lane}:${d}`;
                  const c = cells.get(k)!;
                  return (
                    <td key={k} className="p-0">
                      <button
                        onClick={() => setSel(sel === k ? null : k)}
                        disabled={!c.count}
                        aria-label={`${l.label}, ${label(d)}: ${c.count} murrosta`}
                        className={`h-8 w-full rounded-sm tabular-nums ${sel === k ? "ring-2 ring-ring" : ""} ${c.count / max > 0.5 ? "text-primary-foreground" : ""}`}
                        style={{
                          background: c.count
                            ? `color-mix(in oklch, var(--primary) ${Math.round(12 + (c.count / max) * 88)}%, var(--card))`
                            : "transparent",
                          border: d === EARLY ? "1px dashed var(--border)" : undefined,
                        }}
                      >
                        {c.count || ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-card pr-2 text-left font-semibold">
                Yhteensä
              </th>
              {decades.map((d) => (
                <td key={d} className="tabular-nums text-muted-foreground">
                  {decadeTotals.get(d)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {cell ? (
        <section className="mt-6 rounded-xl border bg-card p-4">
          <h2 className="font-display text-xl">
            {LANES[cell.lane]?.label}, {label(cell.decade)}
          </h2>
          <p className="text-sm text-muted-foreground">{cell.count} kirjattua murrosta</p>
          <ul className="mt-3 space-y-1 text-sm">
            {[...cell.nodes]
              .sort((a, b) => a.year - b.year)
              .map((n) => (
                <li key={n.id}>
                  <span className="tabular-nums text-muted-foreground">{n.year}</span> {n.title}
                </li>
              ))}
          </ul>
        </section>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Valitse ruutu nähdäksesi sen murrokset.
        </p>
      )}
    </main>
  );
}
