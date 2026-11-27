import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  DESIGN_LABEL,
  FLAGS,
  SEULA,
  chaff,
  clean,
  flagged,
  fmt,
  funnel,
  grains,
  laneSummary,
  proposal,
  type DesignKey,
  type Row,
} from "@/lib/seula";

export const Route = createFileRoute("/seula")({
  head: () => ({
    meta: [
      { title: "Seula – Murrosmatriisi" },
      { name: "description", content: "Kaikki tilastosarjojen parit läpi: mitkä yhteydet kestävät erillisen vahvistuksen ja ovat sattumaa parempia. Jyvät Näyttöverkon testattaviksi." },
      { property: "og:title", content: "Seula – Murrosmatriisi" },
      { property: "og:description", content: "27 000 sarjaparia, löytö ja erillinen vahvistus: jyvät akanoista." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SievePage,
});

const KEYS: DesignKey[] = ["aika", "maa"];
const DOCS = "https://github.com/tilastomuuttujat/muutoksen-kartta/blob/main/docs/seula.md";

function SievePage() {
  const all = KEYS.flatMap((k) => grains(SEULA.designs[k]));
  const tested = KEYS.reduce((s, k) => s + SEULA.designs[k].counts.tested, 0);
  const cleanAll = clean(all);
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-5">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Murrosmatriisi</Link>
        <h1 className="mt-2 font-display text-3xl">Seula</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Seula käy läpi kaikki sarjaparit X → Y ja kysyy, muuttuuko X ennen Y:tä. Satojen sarjojen joukosta löytyy aina yhteyksiä
          sattumalta, joten jokainen löytö tarkistetaan aineistosta, jota löytövaihe ei nähnyt: myöhemmiltä vuosilta tai muista
          Pohjoismaista. Lopuksi koko seula ajetaan {SEULA.rules.reps} kertaa sekoitetulla aineistolla, jotta tiedetään, kuinka monta jyvää syntyisi pelkästä sattumasta.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Säännöt kirjattiin ennen ensimmäistä ajoa: <a href={DOCS} className="underline underline-offset-4">docs/seula.md</a>. Jyvät ovat ehdokkaita <Link to="/naytto" className="underline underline-offset-4">Näyttöverkon</Link> testeihin, eivät syy-yhteyksiä.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-5" aria-labelledby="funnel-h">
        <h2 id="funnel-h" className="font-display text-xl">
          {tested.toLocaleString("fi-FI")} parista jäi {all.length} jyvää, kun sattumalta jäisi noin {fmt(KEYS.reduce((s, k) => s + SEULA.designs[k].chance.grainsMean, 0), 1)}
        </h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {KEYS.map((k) => <Funnel key={k} k={k} />)}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Palkin pituus on logaritminen. Harmaa viiva: sekoitetun aineiston keskiarvo. Löytövaiheessa todellinen aineisto ylittää sattuman reilusti, koska sarjoilla on yhteisiä suhdannevaihteluita. Siksi vasta vahvistus erottaa jyvät.
        </p>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5" aria-labelledby="clean-h">
        <h2 id="clean-h" className="font-display text-xl">{cleanAll.length} jyvää ilman tunnettua sivupolkua</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Näissä pareissa ei ole yhteistä hintatasoa, BKT-nimittäjää, samaa kirjanpitoa eikä pohjaväestöä. Moni kuvaa silti yhteistä suhdannetta; ne ovat aitoja järjestyksiä mutta eivät välttämättä vaikutuksia. Valitse jyvä nähdäksesi sarjat ja ehdotuksen rekisteriin.
        </p>
        <GrainList rows={cleanAll} />
        <h3 className="mt-6 text-sm font-semibold">Teemat, joihin puhtaat jyvät osuvat</h3>
        <ul className="mt-1 flex flex-wrap gap-1.5 text-xs">
          {laneSummary(cleanAll, { ...SEULA.designs.aika.meta, ...SEULA.designs.maa.meta }).map(([k, n]) => (
            <li key={k} className="rounded-full border px-2 py-0.5">{k} <span className="text-muted-foreground">· {n}</span></li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5" aria-labelledby="flag-h">
        <h2 id="flag-h" className="font-display text-xl">{flagged(all).length} jyvää, joilla on tunnettu sivupolku</h2>
        <p className="mt-1 text-sm text-muted-foreground">Nämä läpäisivät seulan, mutta yhteydelle on ilmeinen tilastotekninen syy. Merkinnät lisättiin ensimmäisen ajon jälkeen; ne järjestävät listaa eivätkä muuta seulan tulosta.</p>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {(Object.keys(FLAGS) as (keyof typeof FLAGS)[]).map((f) => (
            <li key={f} className="rounded border px-2 py-1"><strong>{FLAGS[f].label}</strong> · {FLAGS[f].info} ({flagged(all).filter((r) => r.flags.includes(f)).length})</li>
          ))}
        </ul>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium">Näytä merkityt jyvät</summary>
          <GrainList rows={flagged(all)} compact />
        </details>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5" aria-labelledby="chaff-h">
        <h2 id="chaff-h" className="font-display text-xl">Akanat: vahvimmat löydöt, jotka eivät kestäneet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ilman vahvistusvaihetta nämä olisivat näyttäneet vahvimmilta yhteyksiltä.</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {KEYS.map((k) => (
            <div key={k}>
              <h3 className="text-sm font-semibold">{DESIGN_LABEL[k].label}</h3>
              <ul className="mt-1 divide-y rounded border text-sm">
                {chaff(SEULA.designs[k]).map((r) => (
                  <li key={`${r.x}>${r.y}`} className="p-2">
                    <div>{t(k, r.x)} → {t(k, r.y)}</div>
                    <div className="text-xs text-muted-foreground">
                      löytö r = {fmt(r.rD)}, vahvistus {r.rC == null ? "ei aineistoa" : `r = ${fmt(r.rC)}`} · {CHAFF_REASON[r.status]}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5 text-sm">
        <h2 className="font-display text-xl">Miten tätä luetaan</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Seulan portaat: ei saman ilmiön mittari (samanaikainen |r| ≤ {fmt(SEULA.rules.mechanical, 1)}), löytö q &lt; {fmt(SEULA.rules.q, 1)} kaikkien parien joukossa, vahvistus samalla viiveellä ja suunnalla p &lt; {fmt(SEULA.rules.alpha)}, ja käänteinen suunta heikompi.</li>
          <li>Pohjoismaat eivät ole toisistaan riippumattomia, joten maajako ei poista yhteistä suhdannetta. Aikajaossa aito yhteys voi jäädä vahvistumatta, jos se on muuttunut ajan myötä.</li>
          <li>Seula ei tunnista kolmatta tekijää. Jyvä kirjataan Näyttöverkkoon ja testataan vahvemmilla asetelmilla: annos–vaste alueittain tai ryhmittäin ja ennalta kirjattu ennuste.</li>
        </ul>
      </section>
    </main>
  );
}

const CHAFF_REASON: Record<Row["status"], string> = {
  jyva: "",
  "vahvistui-suunta": "vahvistui, mutta käänteinen suunta oli yhtä vahva",
  "ei-vahvistusta": "suunta sama, mutta ei merkitsevä vahvistuksessa",
  "eri-merkki": "kääntyi vahvistuksessa vastakkaiseksi",
  "ei-vahvistusaineistoa": "liian vähän vahvistusaineistoa",
};
const t = (k: DesignKey, key: string) => SEULA.designs[k].meta[key]?.t ?? key;

function Funnel({ k }: { k: DesignKey }) {
  const d = SEULA.designs[k];
  const steps = funnel(d);
  const max = Math.log10(steps[0]!.n + 1);
  const w = (n: number) => `${Math.max(1.5, (Math.log10(n + 1) / max) * 100)}%`;
  return (
    <div>
      <h3 className="text-sm font-semibold">{DESIGN_LABEL[k].label}</h3>
      <p className="text-xs text-muted-foreground">{d.series} sarjaa · löytö: {DESIGN_LABEL[k].discovery} · vahvistus: {DESIGN_LABEL[k].confirmation}</p>
      <ol className="mt-2 space-y-1.5">
        {steps.map((s) => (
          <li key={s.key} className="text-xs">
            <div className="flex justify-between gap-2"><span>{s.label}</span><span className="font-semibold tabular-nums">{s.n.toLocaleString("fi-FI")}</span></div>
            <div className="relative mt-0.5 h-3 rounded-sm bg-muted">
              <div className={`h-3 rounded-sm ${s.key === "grains" ? "bg-primary" : "bg-primary/40"}`} style={{ width: w(s.n) }} />
              {s.chance != null && <div className="absolute top-[-2px] h-4 w-0.5 bg-foreground/60" style={{ left: w(s.chance) }} title={`sattumalta ${fmt(s.chance, 1)}`} />}
            </div>
            {s.chance != null && <div className="text-[11px] text-muted-foreground">sattumalta keskimäärin {fmt(s.chance, 1)}{s.key === "grains" ? `, 95 %:ssa ajoista enintään ${fmt(d.chance.grains95, 1)}` : ""}</div>}
            {s.note && <div className="text-[11px] text-muted-foreground">{s.note}</div>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function GrainList({ rows, compact = false }: { rows: Row[]; compact?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const sorted = [...rows].sort((a, b) => (a.pC ?? 1) - (b.pC ?? 1));
  return (
    <ul className="mt-3 divide-y rounded-lg border">
      {sorted.map((r) => {
        const id = `${r.kind}:${r.x}>${r.y}`;
        const d = SEULA.designs[r.kind];
        const on = open === id;
        return (
          <li key={id}>
            <button type="button" onClick={() => setOpen(on ? null : id)} aria-expanded={on} className="block w-full p-3 text-left hover:bg-muted/50">
              <div className={compact ? "text-xs" : "text-sm font-medium"}>{t(r.kind, r.x)} <span className="text-primary">→</span> {t(r.kind, r.y)}</div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                <span>{DESIGN_LABEL[r.kind].label}</span>
                <span>viive {r.lag} v</span>
                <span>löytö r = {fmt(r.rD)} → vahvistus r = {fmt(r.rC!)}</span>
                <span>{d.meta[r.x]?.lane} → {d.meta[r.y]?.lane}</span>
                {r.flags.map((f) => <span key={f} className="rounded border px-1">{FLAGS[f].label}</span>)}
              </div>
            </button>
            {on && <GrainDetail r={r} />}
          </li>
        );
      })}
    </ul>
  );
}

function GrainDetail({ r }: { r: Row }) {
  const d = SEULA.designs[r.kind];
  return (
    <div className="border-t bg-background p-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Spark title={t(r.kind, r.x)} unit={d.meta[r.x]?.u ?? ""} data={d.values[r.x]} split={r.kind === "aika"} />
        <Spark title={t(r.kind, r.y)} unit={d.meta[r.y]?.u ?? ""} data={d.values[r.y]} split={r.kind === "aika"} />
      </div>
      <p className="mt-3 text-xs"><strong>Ehdotus rekisteriin:</strong> {proposal(r, d)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Löytö {r.nD} ja vahvistus {r.nC} havaintoparia. Käänteinen suunta vahvistuksessa r = {r.rRev == null ? "–" : fmt(r.rRev)}. Löydön q = {fmt(r.q, 3)}, vahvistuksen p = {fmt(r.pC!, 4)}.
      </p>
    </div>
  );
}

type Series = [number, number][];
function Spark({ title, unit, data, split }: { title: string; unit: string; data: Series | Record<string, Series> | undefined; split: boolean }) {
  if (!data) return null;
  const lines: [string, Series][] = Array.isArray(data) ? [["FI", data]] : (Object.entries(data) as [string, Series][]);
  const all = lines.flatMap(([, s]) => s);
  const x0 = Math.min(...all.map((p) => p[0])), x1 = Math.max(...all.map((p) => p[0]));
  const lo = Math.min(...all.map((p) => p[1])), hi = Math.max(...all.map((p) => p[1]));
  const W = 360, H = 110, L = 4, R = 356, TOP = 6, BOT = 92;
  const x = (y: number) => L + ((y - x0) / Math.max(1, x1 - x0)) * (R - L);
  const y = (v: number) => BOT - ((v - lo) / (hi - lo || 1)) * (BOT - TOP);
  return (
    <figure>
      <figcaption className="text-xs font-medium">{title} <span className="font-normal text-muted-foreground">{unit}</span></figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${title} ${x0}–${x1}`}>
        {split && SEULA.rules.cut > x0 && <rect x={x(SEULA.rules.cut)} y={TOP} width={R - x(SEULA.rules.cut)} height={BOT - TOP} fill="var(--primary)" fillOpacity={0.07} />}
        {lines.map(([c, s]) => (
          <path key={c} d={s.map(([a, b], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(b).toFixed(1)}`).join(" ")} fill="none"
            stroke={c === "FI" ? "var(--primary)" : "var(--muted-foreground)"} strokeOpacity={c === "FI" ? 1 : 0.6} strokeWidth={c === "FI" ? 2 : 1.2} />
        ))}
        <text x={L} y={H - 2} className="fill-muted-foreground text-[10px]">{x0}</text>
        <text x={R} y={H - 2} textAnchor="end" className="fill-muted-foreground text-[10px]">{x1}</text>
        {split && <text x={x(SEULA.rules.cut) + 3} y={TOP + 10} className="fill-primary text-[10px]">vahvistus</text>}
      </svg>
      {!split && <p className="text-[11px] text-muted-foreground">Punainen: Suomi (löytö). Harmaat: Ruotsi, Norja, Tanska (vahvistus).</p>}
    </figure>
  );
}
