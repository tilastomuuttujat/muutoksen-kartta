import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { atlasThemesQuery } from "@/lib/murros-data";

export const Route = createFileRoute("/teemat")({
  loader: ({ context }) => context.queryClient.ensureQueryData(atlasThemesQuery()),
  head: () => ({
    meta: [
      { title: "Teemojen kehityskaaret – Murrosmatriisi" },
      { name: "description", content: "32 yhteiskunnan teemaa ja niiden kehityskaari ongelmasta korjausliikkeeseen toimituksen arvioimana." },
      { property: "og:title", content: "Teemojen kehityskaaret – Murrosmatriisi" },
      { property: "og:description", content: "Yhteiskunnan teemojen kehityskaaret vaiheittain." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Overview,
});

// Each theme is described by the editors with the same six-stage model. The values (−1 … +1) are an editorial
// assessment of how well things worked at each stage – not measurements – so the page shows them as such.
const STAGES = ["Ongelma", "Ratkaisu", "Vakiintuminen", "Muutos", "Ristiriita", "Korjausliike"];
const verdict = (v: number) => (v > 0.15 ? "toimi" : v < -0.15 ? "kitkaa" : "ristiriitainen");

function Spark({ scores, big }: { scores: number[]; big?: boolean }) {
  const w = 120, h = 44, pad = 4;
  const pts = scores.map((s, i): [number, number] => [pad + (i * (w - 2 * pad)) / Math.max(1, scores.length - 1), h / 2 - s * (h / 2 - pad)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={big ? "h-24 w-full" : "h-11 w-full"} aria-hidden>
      <line x1={0} x2={w} y1={h / 2} y2={h / 2} className="stroke-border" strokeDasharray="2 3" />
      <path d={d} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-foreground" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={big ? 3 : 1.8} style={{ fill: (scores[i] ?? 0) < -0.15 ? "var(--tension)" : (scores[i] ?? 0) > 0.15 ? "var(--calm)" : "var(--neutral-line)" }} />)}
    </svg>
  );
}

function Overview() {
  const { data } = useSuspenseQuery(atlasThemesQuery());
  const [open, setOpen] = useState<number | null>(null);
  const groups = [...new Set(data.map((t) => t.group))];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Teemojen kehityskaaret</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{data.length} yhteiskunnan teemaa, kukin kuvattuna ongelmasta korjausliikkeeseen.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-calm" />toimi</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-neutral-line" />ristiriitainen</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-tension" />kitkaa</span>
          <Link to="/polku" className="underline">Aikajana →</Link>
        </div>
      </header>

      <p className="mb-5 max-w-3xl rounded-md border-l-4 border-primary bg-card px-3 py-2 text-sm">
        <b>Näin luet käyriä:</b> jokainen teema on kuvattu samalla kuuden vaiheen mallilla (ongelma → ratkaisu → vakiintuminen →
        muutos → ristiriita → korjausliike). Pisteet ovat toimituksen arvioita siitä, miten hyvin asiat kussakin vaiheessa
        toimivat, eivät tilastollisia mittauksia. Siksi käyrät muistuttavat toisiaan: samankaltaisuus johtuu mallista.
        Vertaile teemoja vaiheittain ja avaa teema nähdäksesi vaiheiden ajoitukset.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <section key={g} className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 font-display text-lg">{g}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {data.filter((t) => t.group === g).map((t) => {
                const isOpen = open === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setOpen(isOpen ? null : t.id)}
                    aria-expanded={isOpen}
                    className={`rounded-lg border p-2 text-left transition hover:bg-muted ${isOpen ? "ring-2 ring-ring" : ""}`}
                  >
                    <div className="line-clamp-2 h-9 overflow-hidden text-sm font-semibold leading-tight">{t.name}</div>
                    <Spark scores={t.scores} />
                  </button>
                );
              })}
            </div>
            {data.filter((t) => t.group === g && t.id === open).map((t) => (
              <div key={t.id} className="mt-3 rounded-lg bg-muted p-3">
                <div className="font-display text-base">{t.name}</div>
                <p className="text-sm text-muted-foreground">{t.thesis}</p>
                <Spark scores={t.scores} big />
                <table className="mt-2 w-full text-left text-xs">
                  <caption className="sr-only">Toimituksen arvio vaiheittain</caption>
                  <thead><tr className="text-muted-foreground"><th className="font-normal">Vaihe</th><th className="font-normal">Arvio</th></tr></thead>
                  <tbody>
                    {t.scores.map((v, i) => (
                      <tr key={i} className="border-t border-border/60">
                        <td className="py-1 pr-2">{t.labels[i] || STAGES[i]}</td>
                        <td className="py-1 tabular-nums">{v > 0 ? "+" : ""}{v.toFixed(2)} <span className="text-muted-foreground">({verdict(v)})</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </section>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Asteikko −1 (kitkaa) … +1 (toimii) on toimituksellinen arvio. Käyrä ei kerro nykytilasta mitattua tietoa.
      </p>
    </main>
  );
}
