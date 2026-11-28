import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PUZZLE_KEYS,
  SELITTAMATON,
  VERDICT_INFO,
  fiNum,
  predictive,
  remaining,
  shown,
  signed,
  sortedRows,
  unitLabel,
  type Candidate,
  type Puzzle,
  type PuzzleKey,
} from "@/lib/selittamaton";

export const Route = createFileRoute("/selittamaton")({
  head: () => ({
    meta: [
      { title: "Selittämätön – Murrosmatriisi" },
      { name: "description", content: "Kuinka paljon syntyvyyden romahduksesta, pysyvästä työttömyydestä ja velkaantumisesta jää selittämättä, kun tunnetut selitykset on otettu huomioon – ja missä aukko on suurin." },
      { property: "og:title", content: "Selittämätön – Murrosmatriisi" },
      { property: "og:description", content: "Aukot tunnetuissa selityksissä: aineistoa uusille hypoteeseille." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: UnexplainedPage,
});

const DOCS = "https://github.com/tilastomuuttujat/muutoksen-kartta/blob/main/docs/selittamaton.md";

const TEXT: Record<PuzzleKey, { title: string; question: string; y: string; finland: (p: Puzzle) => string }> = {
  syntyvyys: {
    title: "Syntyvyyden romahdus 2010-luvulla",
    question: "Kokonaishedelmällisyysluvun muutos 2010 → 2023 Euroopan maissa.",
    y: "TFR:n muutos 2010 → 2023",
    finland: (p) => `Suomen syntyvyys laski ${fiNum(-shown("syntyvyys", p.finland!.y), 0)} %, enemmän kuin missään muussa mukana olleessa maassa. Tunnetut selitykset ennustivat ${fiNum(-shown("syntyvyys", p.finland!.pred), 0)} %:n laskun. Suomen selittämätön osa oli ${p.finland!.rankFromLowest}. suurin ${p.finland!.of} maasta, mutta ei poikkeuksellinen, koska malli epäonnistuu kaikkialla.`,
  },
  tyottomyys: {
    title: "Pysyvästi korkea työttömyys",
    question: "Työttömyysasteen keskiarvo 2000–2019 verrattuna 1980-lukuun korkean tulotason maissa.",
    y: "työttömyys 2000–19 vs. 1980-luku",
    finland: (p) => `Suomen työttömyys oli 2000–2019 keskimäärin ${fiNum(p.finland!.y)} %-yksikköä korkeampi kuin 1980-luvulla. Ennuste oli ${fiNum(p.finland!.pred)} %-yksikköä, joten Suomi ei ole poikkeama: sen pysyvä työttömyys on tavallista maiden joukossa, joissa tunnetut selitykset eivät ylipäätään selitä eroja.`,
  },
  velka: {
    title: "Kotitalouksien velkaantuminen",
    question: "Kotitalouksien velka suhteessa käytettävissä oleviin tuloihin, muutos 2008 → 2023.",
    y: "velkaantumisaste 2008 → 2023",
    finland: (p) => `Suomen kotitalouksien velkaantumisaste nousi ${fiNum(p.finland!.y)} %-yksikköä, vaikka korot, asuntohinnat, tulot ja lähtötaso ennustivat ${fiNum(-p.finland!.pred)} %-yksikön laskua. Selittämätön osa, ${signed(p.finland!.res)} %-yksikköä, oli ${p.finland!.of - (p.finland!.rankFromLowest ?? 0) + 1}. suurin ${p.finland!.of} maasta.`,
  },
};

function UnexplainedPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-5">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Murrosmatriisi</Link>
        <h1 className="mt-2 font-display text-3xl">Selittämätön</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Seula ja Näyttöverkko kysyvät, pitääkö tunnettu väite. Tämä näkymä kysyy päinvastaista: kuinka paljon ilmiöstä jää
          selittämättä, kun kaikki vakiintuneet selitykset on otettu huomioon? Jokaisen maan ennuste lasketaan mallista, josta
          kyseinen maa on jätetty pois, joten malli ei voi oppia maata ulkoa. Selittämätön osa on aineistoa uusille hypoteeseille.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Selitykset, mittarit, maat ja uudet ehdokkaat kirjattiin ennen laskentaa: <a href={DOCS} className="underline underline-offset-4">docs/selittamaton.md</a>.
          Ehdokas, joka selittää jäännöstä, on uusi testattava hypoteesi <Link to="/naytto" className="underline underline-offset-4">Näyttöverkkoon</Link>, ei syy.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-5" aria-labelledby="sum-h">
        <h2 id="sum-h" className="font-display text-xl">Tunnetut selitykset eivät riitä yhdessäkään kolmesta</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PUZZLE_KEYS.map((k) => {
            const p = SELITTAMATON.puzzles[k];
            return (
              <a key={k} href={`#${k}`} className="rounded-lg border p-3 hover:bg-muted/40">
                <div className="text-sm font-semibold">{TEXT[k].title}</div>
                <div className="mt-2 font-display text-3xl tabular-nums">{p.looR2 < 0 ? "0 %" : `${Math.round(p.looR2 * 100)} %`}</div>
                <div className="text-xs text-muted-foreground">maiden eroista ennustuu tunnetuilla selityksillä ({p.n} maata; LOO-R² {fiNum(p.looR2, 2)})</div>
                <div className="mt-2 text-xs">Suomi: {k === "tyottomyys" ? "ei poikkeama" : k === "velka" ? "suuri selittämätön nousu" : "suurin lasku, ei erotu muista"}</div>
              </a>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Negatiivinen LOO-R² tarkoittaa, että selitykset ennustavat pois jätettyä maata huonommin kuin pelkkä maiden keskiarvo. Jälkikäteinen sovite on aina parempi (R² {PUZZLE_KEYS.map((k) => fiNum(SELITTAMATON.puzzles[k].fitR2, 2)).join(", ")}), mutta se ei kerro ennustekyvystä.
        </p>
      </section>

      {PUZZLE_KEYS.map((k) => <PuzzleSection key={k} k={k} />)}
    </main>
  );
}

function PuzzleSection({ k }: { k: PuzzleKey }) {
  const p = SELITTAMATON.puzzles[k];
  const t = TEXT[k];
  return (
    <section id={k} className="mt-6 rounded-xl border bg-card p-5" aria-labelledby={`${k}-h`}>
      <h2 id={`${k}-h`} className="font-display text-xl">{t.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.question} Tunnetut selitykset {predictive(p.looR2)}.</p>
      <p className="mt-3 max-w-3xl text-sm">{t.finland(p)}</p>
      {p.commonGap && (
        <p className="mt-2 max-w-3xl text-sm">
          Yhteinen aukko: vaikka mikään tunnettu tekijä ei olisi muuttunut, malli ennustaa muutokseksi {signed(shown(k, p.commonGap.value), 0)} {unitLabel(k)} (90 %:n väli {signed(shown(k, p.commonGap.lo), 0)} … {signed(shown(k, p.commonGap.hi), 0)}). Väli on niin leveä, ettei aukon kokoa voi määrittää.
        </p>
      )}
      <ResidualBars k={k} p={p} />
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Tunnetut selitykset</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {p.known.map((x) => (
              <li key={x.id} className="flex justify-between gap-3 border-b py-1">
                <span>{x.label}</span>
                <span className="tabular-nums text-muted-foreground" title="standardoitu kerroin koko aineistossa">{signed(x.beta, 2)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-muted-foreground">Luku: standardoitu kerroin koko aineistossa. {p.dropped.length > 0 && `${p.dropped.length} maata jäi pois puuttuvien tietojen vuoksi.`}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Uudet ehdokkaat jäännökselle</h3>
          <ul className="mt-1 space-y-2 text-sm">
            {p.candidates.map((c) => <CandidateRow key={c.id} c={c} />)}
          </ul>
        </div>
      </div>
      {remaining(p).map((c) => <CandidateScatter key={c.id} c={c} p={p} k={k} />)}
      {p.sensitivityNoK6 && (
        <div className="mt-4 rounded-lg border border-dashed p-3 text-sm">
          <div className="font-semibold">Jälkikäteinen herkkyystarkistus (ei rekisteröity)</div>
          <p className="mt-1 text-muted-foreground">
            Kuluttajien luottamuksen vertailujakso karsi 12 maata. Ilman sitä mukana on {p.sensitivityNoK6.n} maata: LOO-R² on {fiNum(p.sensitivityNoK6.looR2, 2)}, joten tunnetut selitykset eivät edelleenkään ennusta.
            Suomen selittämätön osa on {p.sensitivityNoK6.finland.rankFromLowest}. suurin {p.sensitivityNoK6.finland.of} maasta. Internetin käytön kasvu
            {" "}({p.sensitivityNoK6.candidates.find((c) => c.id === "C2")!.verdict}, rho {signed(p.sensitivityNoK6.candidates.find((c) => c.id === "C2")!.rho, 2)}): mitä enemmän käyttö kasvoi, sitä vähemmän syntyvyys laski selitettyä enemmän, mikä on vastoin älypuhelinselitystä.
          </p>
        </div>
      )}
    </section>
  );
}

function CandidateRow({ c }: { c: Candidate }) {
  const tone = c.verdict === "jäljellä" ? "border-primary text-primary" : c.verdict === "väärä suunta" ? "border-foreground/50" : "border-muted-foreground/40 text-muted-foreground";
  return (
    <li className="border-b pb-2">
      <div className="flex items-start justify-between gap-3">
        <span>{c.label}</span>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${tone}`}>{c.verdict}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Ennuste {c.predicted < 0 ? "−" : "+"} · {c.rho == null ? "ei aineistoa" : `rho ${signed(c.rho, 2)}, q ${fiNum(c.q, 3)}, ${c.n} maata`} · {VERDICT_INFO[c.verdict]}
      </div>
    </li>
  );
}

function ResidualBars({ k, p }: { k: PuzzleKey; p: Puzzle }) {
  const rows = sortedRows(p);
  const vals = rows.map((r) => shown(k, r.res));
  const m = Math.max(...vals.map(Math.abs)) * 1.05;
  const ROW = 15, L = 130, R = 560, W = 640, H = rows.length * ROW + 30;
  const x = (v: number) => L + ((v + m) / (2 * m)) * (R - L);
  return (
    <div className="mt-4 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px] max-w-3xl" role="img"
        aria-label={`Selittämätön osa maittain: ${rows.map((r) => `${r.name} ${signed(shown(k, r.res), 0)}`).join(", ")}`}>
        <line x1={x(0)} x2={x(0)} y1={4} y2={H - 22} stroke="var(--foreground)" strokeOpacity={0.4} />
        {rows.map((r, i) => {
          const v = shown(k, r.res), fi = r.geo === "FI" || r.geo === "FIN";
          const y0 = 6 + i * ROW;
          return (
            <g key={r.geo}>
              <text x={L - 6} y={y0 + 10} textAnchor="end" className={fi ? "fill-primary text-[11px] font-semibold" : "fill-foreground text-[11px]"}>{r.name}</text>
              <rect x={Math.min(x(0), x(v))} y={y0 + 2} width={Math.abs(x(v) - x(0))} height={ROW - 5} fill={fi ? "var(--primary)" : "var(--muted-foreground)"} fillOpacity={fi ? 1 : 0.55} />
              <text x={v >= 0 ? x(v) + 4 : x(v) - 4} y={y0 + 10} textAnchor={v >= 0 ? "start" : "end"} className="fill-muted-foreground text-[10px] tabular-nums">{signed(v, 0)}</text>
            </g>
          );
        })}
        <text x={x(-m) } y={H - 6} className="fill-muted-foreground text-[10px]">← laski / jäi alemmaksi kuin ennustettiin</text>
        <text x={x(m)} y={H - 6} textAnchor="end" className="fill-muted-foreground text-[10px]">nousi / jäi korkeammaksi kuin ennustettiin →</text>
      </svg>
      <p className="text-xs text-muted-foreground">Selittämätön osa: havaittu {TEXT[k].y} miinus ennuste mallista, josta maa on jätetty pois ({unitLabel(k)}).</p>
    </div>
  );
}

function CandidateScatter({ c, p, k }: { c: Candidate; p: Puzzle; k: PuzzleKey }) {
  const pts = c.points ?? [];
  const xs = pts.map((q) => q.x), ys = pts.map((q) => shown(k, q.res));
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const W = 620, H = 220, L = 50, R = 560, TOP = 16, BOT = 180;
  const padX = (x1 - x0) * 0.08, padY = (y1 - y0) * 0.08;
  const x = (v: number) => L + ((v - x0 + padX) / (x1 - x0 + 2 * padX)) * (R - L);
  const y = (v: number) => BOT - ((v - y0 + padY) / (y1 - y0 + 2 * padY)) * (BOT - TOP);
  const name = (g: string) => p.rows.find((r) => r.geo === g)?.name ?? g;
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold">Jäljellä oleva ehdokas: {c.label}</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px] max-w-2xl" role="img" aria-label={`${c.label} ja selittämätön osa maittain`}>
          {y0 < 0 && y1 > 0 && <line x1={L} x2={R} y1={y(0)} y2={y(0)} stroke="var(--foreground)" strokeOpacity={0.3} />}
          {pts.map((q) => {
            const fi = q.geo === "FI";
            return (
              <g key={q.geo}>
                <circle cx={x(q.x)} cy={y(shown(k, q.res))} r={fi ? 5 : 4} fill={fi ? "var(--primary)" : "var(--muted-foreground)"} fillOpacity={fi ? 1 : 0.7}><title>{`${name(q.geo)}: ${fiNum(q.x)}; ${signed(shown(k, q.res), 0)}`}</title></circle>
                <text x={x(q.x) + 7} y={y(shown(k, q.res)) + 4} className={fi ? "fill-primary text-[10px] font-semibold" : "fill-muted-foreground text-[10px]"}>{name(q.geo)}</text>
              </g>
            );
          })}
          <text x={x(x0)} y={BOT + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">{fiNum(x0)}</text>
          <text x={x(x1)} y={BOT + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">{fiNum(x1)}</text>
          <text x={(L + R) / 2} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">{c.label}</text>
          <text x={L} y={TOP - 4} className="fill-muted-foreground text-[10px]">selittämätön osa, {unitLabel(k)}</text>
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">rho {signed(c.rho ?? 0, 2)}, p {fiNum(c.p ?? 1, 3)}, q {fiNum(c.q, 3)}. Uusi hypoteesi: testattava muulla aineistolla (esim. 1995–2008 tai alueittain), ei syy.</p>
    </div>
  );
}
