import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { atlasThemesQuery, type AtlasTheme } from "@/lib/murros.functions";

export const Route = createFileRoute("/teemat")({
  loader: ({ context }) => context.queryClient.ensureQueryData(atlasThemesQuery()),
  head: () => ({
    meta: [
      { title: "Teemojen kehityskaaret – Murrosmatriisi" },
      { name: "description", content: "32 yhteiskunnan teemaa ja niiden kehityskaari yhdessä kuvassa: missä on nyt jännitettä, missä vakautta." },
      { property: "og:title", content: "Teemojen kehityskaaret – Murrosmatriisi" },
      { property: "og:description", content: "Näe yhdellä vilkaisulla, missä yhteiskunnan teemoissa on nyt jännitettä." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Overview,
});

const STAGES = ["Ongelma", "Ratkaisu", "Vakaus", "Muutos", "Ristiriita", "Korjaus"];

function tone(t: AtlasTheme) {
  const now = t.scores[4] ?? 0;
  return now < -0.15 ? "tension" : now > 0.15 ? "calm" : "neutral-line";
}

function Spark({ scores, color, big }: { scores: number[]; color: string; big?: boolean }) {
  const w = 120, h = 44, pad = 4;
  const pts = scores.map((s, i): [number, number] => [pad + (i * (w - 2 * pad)) / Math.max(1, scores.length - 1), h / 2 - s * (h / 2 - pad)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${pts.at(-1)?.[0]},${h / 2} L${pts[0]?.[0]},${h / 2} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={big ? "h-24 w-full" : "h-11 w-full"} aria-hidden>
      <line x1={0} x2={w} y1={h / 2} y2={h / 2} className="stroke-border" strokeDasharray="2 3" />
      <path d={area} style={{ fill: `var(--${color})`, opacity: 0.15 }} />
      <path d={d} fill="none" strokeWidth={2} strokeLinejoin="round" style={{ stroke: `var(--${color})` }} />
      {pts[4] && <circle cx={pts[4][0]} cy={pts[4][1]} r={3.5} style={{ fill: `var(--${color})` }} />}
    </svg>
  );
}

function Overview() {
  const { data } = useSuspenseQuery(atlasThemesQuery());
  const [open, setOpen] = useState<number | null>(null);
  const groups = [...new Set(data.map((t) => t.group))];
  const tense = data.filter((t) => tone(t) === "tension").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Yhteiskunta yhdellä silmäyksellä</h1>
          <p className="mt-1 text-muted-foreground">
            <span className="font-semibold text-tension">{tense}</span> / {data.length} teemassa on nyt jännitettä.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-tension" />Jännite</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-neutral-line" />Tasapaino</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-calm" />Vakaa</span>
          <Link to="/polku" className="underline">Aikajana →</Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <section key={g} className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 font-display text-lg">{g}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {data.filter((t) => t.group === g).map((t) => {
                const c = tone(t);
                const isOpen = open === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setOpen(isOpen ? null : t.id)}
                    className={`rounded-lg border p-2 text-left transition hover:bg-muted ${isOpen ? "ring-2 ring-ring" : ""}`}
                    style={{ borderLeft: `4px solid var(--${c})` }}
                  >
                    <div className="line-clamp-2 h-9 overflow-hidden text-sm font-semibold leading-tight">{t.name}</div>
                    <Spark scores={t.scores} color={c} />
                  </button>
                );
              })}
            </div>
            {data.filter((t) => t.group === g && t.id === open).map((t) => (
              <div key={t.id} className="mt-3 rounded-lg bg-muted p-3">
                <div className="font-display text-base">{t.name}</div>
                <p className="text-sm text-muted-foreground">{t.thesis}</p>
                <Spark scores={t.scores} color={tone(t)} big />
                <div className="grid grid-cols-6 text-center text-[10px] text-muted-foreground sm:text-xs">
                  {STAGES.map((s) => <span key={s}>{s}</span>)}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Käyrä: kunkin teeman kehitys ongelmasta korjausliikkeeseen. Piste = nykytilanne. Viivan yläpuolella = toimii, alapuolella = kitkaa.
      </p>
    </main>
  );
}
