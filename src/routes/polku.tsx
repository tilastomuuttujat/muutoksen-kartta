import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { themePathQuery, type PathItem } from "@/lib/murros-data";

const THEMES = [
  { key: "koulutus", label: "Koulutus" },
  { key: "talous", label: "Talous" },
  { key: "työ", label: "Työ" },
  { key: "julkinen valta", label: "Julkinen valta" },
  { key: "poliittinen osallistuminen", label: "Osallistuminen" },
  { key: "oikeusvaltio", label: "Oikeusvaltio" },
  { key: "kansalaisyhteiskunta", label: "Kansalaisyhteiskunta" },
] as const;

type Search = { teema?: string };

export const Route = createFileRoute("/polku")({
  validateSearch: (s: { teema?: unknown }): Search => {
    const t = typeof s.teema === "string" ? s.teema : "";
    return { teema: THEMES.some((x) => x.key === t) ? t : "koulutus" };
  },
  loaderDeps: ({ search }) => ({ teema: search.teema ?? "koulutus" }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(themePathQuery(deps.teema)),
  head: () => ({
    meta: [
      { title: "Murrosmatriisi – miten tähän on tultu?" },
      { name: "description", content: "Suomen yhteiskunnan kehitys selkeinä polkuina: ongelma, ratkaisu ja sen pitkä vaikutus." },
      { property: "og:title", content: "Murrosmatriisi – miten tähän on tultu?" },
      { property: "og:description", content: "Valitse teema ja kulje yhteiskunnan murrosten läpi nykypäivään." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const teema = Route.useSearch().teema ?? "koulutus";
  const navigate = useNavigate({ from: "/polku" });
  const label = THEMES.find((t) => t.key === teema)?.label ?? teema;
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-3xl px-5 pt-14 pb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Murrosmatriisi</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-6xl">Miten tähän on tultu?</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Jokainen uudistus ratkaisi jonkin ongelman – ja muovasi seuraavan. Valitse teema ja kulje kehitys läpi nykypäivään.
        </p>
        <nav aria-label="Teemat" className="mt-8 flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate({ search: { teema: t.key } })}
              aria-pressed={t.key === teema}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                t.key === teema ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="sr-only">Teeman {label} kehityspolku</h2>
        <Suspense fallback={<p className="text-muted-foreground">Ladataan…</p>}>
          <Timeline teema={teema} />
        </Suspense>
      </section>
    </main>
  );
}

function Timeline({ teema }: { teema: string }) {
  const { data } = useSuspenseQuery(themePathQuery(teema));
  if (!data.length) return <p className="text-muted-foreground">Tähän teemaan ei vielä löytynyt aineistoa.</p>;
  return (
    <ol className="relative border-l-2 border-border pl-8">
      {data.map((it) => <Step key={it.id} it={it} />)}
      <li className="relative">
        <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
        <p className="font-display text-2xl">Tänään</p>
      </li>
    </ol>
  );
}

function Step({ it }: { it: PathItem }) {
  const [open, setOpen] = useState(false);
  const years = it.year_start === it.year_end ? `${it.year_start}` : `${it.year_start}–${it.year_end}`;
  return (
    <li className="relative mb-10">
      <span className="absolute -left-[39px] top-2 h-3 w-3 rounded-full border-2 border-primary bg-background" />
      <p className="font-display text-sm text-primary">{years} · {it.type}</p>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="mt-1 text-left">
        <h3 className="font-display text-2xl leading-snug hover:underline">{it.title}</h3>
      </button>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Ongelma</p>
          <p className="mt-1">{it.problem}</p>
        </div>
        <div className="rounded-lg bg-accent p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Mitä siitä seurasi</p>
          <p className="mt-1">{it.long_effect}</p>
        </div>
      </div>
      {open && (
        <div className="mt-3 space-y-2 text-muted-foreground">
          {it.mechanism && <p><b className="text-foreground">Miten se toimi:</b> {it.mechanism}</p>}
          {it.current_relevance && <p><b className="text-foreground">Miksi sillä on väliä nyt:</b> {it.current_relevance}</p>}
        </div>
      )}
      {!open && (it.mechanism || it.current_relevance) && (
        <button onClick={() => setOpen(true)} className="mt-2 text-sm text-primary hover:underline">Lue lisää →</button>
      )}
    </li>
  );
}
