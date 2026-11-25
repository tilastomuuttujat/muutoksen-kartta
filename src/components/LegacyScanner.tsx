import { useMemo, useState } from "react";
import { LANES, SCANNER, uniqueSeries } from "@/lib/scanner";
import {
  LABELS,
  PERIODS,
  opposing,
  scanAll,
  valueAt,
  type Legacy,
  type Kind,
  type Window,
} from "@/lib/legacy-scan";

const fmt = (v: number) =>
  v.toLocaleString("fi-FI", { maximumFractionDigits: 2 });
const signed = (v: number) => (v > 0 ? "+" : "") + fmt(v);
const colors: Record<Kind, string> = {
  continued: "#b45309",
  remaining: "#d97706",
  returned: "#0d9488",
  crossed: "#2563eb",
  small: "#94a3b8",
};
const kinds = Object.keys(LABELS) as Kind[];

export function LegacyScanner() {
  const [w, setW] = useState<Window>(PERIODS[4]!);
  const [lane, setLane] = useState("");
  const [kind, setKind] = useState<Kind | "">("");
  const [q, setQ] = useState("");
  const [key, setKey] = useState("");
  const [limit, setLimit] = useState(20);
  const [comparison, setComparison] = useState(3);
  const rows = useMemo(() => scanAll(SCANNER.series, w), [w]);
  const prior = useMemo(
    () =>
      new Map(
        scanAll(SCANNER.series, PERIODS[comparison]!).map((r) => [r.s.k, r]),
      ),
    [comparison],
  );
  const filtered = rows.filter(
    (r) =>
      (!lane || r.s.lane === lane) &&
      (!kind || r.kind === kind) &&
      (!q || r.s.t.toLocaleLowerCase("fi").includes(q.toLocaleLowerCase("fi"))),
  );
  const selected = filtered.find((r) => r.s.k === key) ?? filtered[0];
  const opposite = selected ? opposing(selected, rows) : [];
  const valid =
    [w.start, w.shock, w.end].every(
      (y) => Number.isInteger(y) && y >= 1850 && y <= 2025,
    ) &&
    w.start < w.shock &&
    w.shock < w.end;
  const change = (k: keyof Window, v: number) => {
    setW((p) => ({ ...p, [k]: v }));
    setLimit(20);
  };
  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Vaihtoehtoinen skanneri · aikakausien perintö
        </p>
        <h2 className="mt-2 font-display text-2xl">
          Mitä muutoksesta jäi seuraavalle aikakaudelle?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Valitse lähtövuosi, murrosvuosi ja tarkastelun päätepiste. Näet mitkä
          mittarit palasivat lähtötasolle, mitkä jäivät uudelle tasolle ja missä
          kehitys kulki vastakkaisiin suuntiin.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.start}
              type="button"
              aria-pressed={
                w.start === p.start && w.shock === p.shock && w.end === p.end
              }
              onClick={() => {
                setW(p);
                setLimit(20);
              }}
              className={
                "rounded-full border px-3 py-2 text-sm " +
                (w.start === p.start && w.shock === p.shock && w.end === p.end
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {(
            [
              ["start", "Ennen"],
              ["shock", "Murros"],
              ["end", "Jälkeen"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="text-sm font-medium">
              {label}
              <input
                type="number"
                min={1850}
                max={2025}
                value={w[k]}
                onChange={(e) => change(k, Number(e.target.value))}
                className="mt-1 block w-full rounded-md border bg-background p-2 text-lg"
              />
            </label>
          ))}
        </div>
        {!valid && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            Valitse kolme kokonaislukuvuotta aikajärjestyksessä (1850–2025).
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          {rows.length} / {uniqueSeries().length} sarjaa täyttää kattavuusehdot.
          Puuttuvia vuosia ei arvioida.
        </p>
      </section>
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-xl">1. Missä muutos jäi elämään?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elämänalueiden jakauma. Napauta kaistaa rajataksesi sarjat. Värit
          kuvaavat muutoksen pysyvyyttä, eivät sen hyvyyttä.
        </p>
        <div className="my-4 flex flex-wrap gap-3 text-xs">
          {kinds.map((k) => (
            <button
              key={k}
              onClick={() => {
                setKind(kind === k ? "" : k);
                setLimit(20);
              }}
              aria-pressed={kind === k}
              className={
                "flex items-center gap-1 rounded border px-2 py-1 " +
                (kind === k ? "border-primary" : "border-transparent")
              }
            >
              <span
                className="h-3 w-3 rounded-sm"
                style={{ background: colors[k] }}
              />
              {LABELS[k]}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {LANES.map((l) => {
            const list = rows.filter((r) => r.s.lane === l);
            return (
              <button
                key={l}
                aria-pressed={lane === l}
                onClick={() => {
                  setLane(lane === l ? "" : l);
                  setLimit(20);
                }}
                className={
                  "grid w-full grid-cols-[minmax(100px,1fr)_2fr_32px] items-center gap-2 rounded p-1 text-left text-xs " +
                  (lane === l ? "ring-2 ring-primary" : "hover:bg-muted")
                }
              >
                <span>{l}</span>
                <span className="flex h-5 overflow-hidden rounded bg-muted">
                  {kinds.map((k) => {
                    const n = list.filter((r) => r.kind === k).length;
                    return (
                      <span
                        key={k}
                        title={LABELS[k] + ": " + n}
                        style={{
                          width:
                            (list.length ? (n / list.length) * 100 : 0) + "%",
                          background: colors[k],
                        }}
                      />
                    );
                  })}
                </span>
                <span className="text-right tabular-nums">{list.length}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Palkkien pituus on osuus alueen kattavista sarjoista; oikealla
          sarjojen määrä. Alueet eivät ole yhteiskunnallisia painokertoimia.
        </p>
      </section>
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-xl">
          2. Seuraa yksittäistä kehityskulkua
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            aria-label="Hae mittaria"
            placeholder="Hae mittaria…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(20);
            }}
            className="min-w-0 flex-1 rounded border bg-background p-2 text-sm"
          />
          <button
            className="rounded border px-3 text-sm"
            onClick={() => {
              setLane("");
              setKind("");
              setQ("");
              setLimit(20);
            }}
          >
            Poista rajaukset
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {filtered.length} mittaria · {lane || "Kaikki alueet"} ·{" "}
          {kind ? LABELS[kind] : "Kaikki kehityskulut"}
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="max-h-[440px] overflow-y-auto rounded border">
            {filtered.slice(0, limit).map((r) => (
              <button
                key={r.s.k}
                aria-pressed={selected?.s.k === r.s.k}
                onClick={() => setKey(r.s.k)}
                className={
                  "block w-full border-b p-3 text-left text-sm " +
                  (selected?.s.k === r.s.k ? "bg-muted" : "hover:bg-muted/50")
                }
              >
                <span className="block font-medium">{r.s.t}</span>
                <span className="text-xs text-muted-foreground">
                  {LABELS[r.kind]} · {signed(r.residual)} ×
                </span>
              </button>
            ))}
            {filtered.length > limit && (
              <button
                className="w-full p-3 text-sm text-primary"
                onClick={() => setLimit((n) => n + 30)}
              >
                Näytä lisää
              </button>
            )}
            {!filtered.length && (
              <p className="p-4 text-sm">
                Ei kattavia sarjoja näillä rajauksilla.
              </p>
            )}
          </div>
          {selected && <Detail r={selected} w={w} />}
        </div>
      </section>
      {selected && (
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-xl">
            3. Kulkevatko muut elämänalueet toiseen suuntaan?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kohde: {selected.s.t}. Alla muiden kaistojen mittarit, joiden
            nettomuutos on vastakkaissuuntainen ja vähintään yhden oman
            vertailutason suuruinen. Tämä ei vielä osoita ristiriitaa tai
            vaikutusta.
          </p>
          <div className="mt-4 space-y-3">
            {opposite.slice(0, 8).map((r) => (
              <div key={r.s.k} className="border-b pb-3">
                <div className="flex justify-between gap-2 text-sm">
                  <span>{r.s.t}</span>
                  <strong className="tabular-nums">
                    {signed(r.residual)} ×
                  </strong>
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.s.lane} · {fmt(r.a)} → {fmt(r.c)} {r.s.u}
                </p>
                <div className="mt-1 h-2 rounded bg-muted">
                  <div
                    className="h-full rounded bg-blue-500"
                    style={{
                      width:
                        Math.min(
                          100,
                          (Math.abs(r.residual) /
                            Math.max(1, Math.abs(opposite[0]?.residual ?? 1))) *
                            100,
                        ) + "%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {!opposite.length && (
            <p className="mt-3 text-sm text-muted-foreground">
              Ei ehdokkaita tällä kriteerillä.
            </p>
          )}
        </section>
      )}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-xl">
          4. Toistuuko sama kehityskulku toisena aikakautena?
        </h2>
        <label className="mt-3 block text-sm">
          Vertailujakso
          <select
            value={comparison}
            onChange={(e) => setComparison(Number(e.target.value))}
            className="mt-1 w-full rounded border bg-background p-2"
          >
            {PERIODS.map((p, i) => (
              <option value={i} key={i}>
                {p.label} ({p.start}–{p.end})
              </option>
            ))}
          </select>
        </label>
        {selected && prior.has(selected.s.k) ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail r={prior.get(selected.s.k)!} w={PERIODS[comparison]!} />
            <Detail r={selected} w={w} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Valitulla mittarilla ei ole riittävän kattavaa tietoa
            vertailujaksolla.
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          Yhteinen sarjajoukko: {rows.filter((r) => prior.has(r.s.k)).length}{" "}
          mittaria. Samankaltainen muutos voi olla tutkimisen arvoinen, mutta ei
          todista sukupolvivaikutusta.
        </p>
      </section>
      <details className="rounded-xl border bg-card p-5 text-sm">
        <summary className="cursor-pointer font-medium">
          Laskenta, rajaukset ja lähde
        </summary>
        <p className="mt-3">
          Kolme ankkurivuotta ovat todellisia aineistossa olevia arvoja; koko
          ikkunasta vaaditaan vähintään 70 % vuosista. Vertailutaso on sarjan
          siihenastisten peräkkäisten vuosien absoluuttisen muutoksen 75.
          prosenttipiste (vähintään 10 muutosta). Nollatasoiset sarjat ja
          kaksoiskappaleet jätetään pois. Nettomuutos ja alkumuutos jaetaan
          tällä tasolla. Jos alkumuutos on pienempi kuin yksi vertailutaso,
          palautumista ei luokitella. Muuten jäljellä olevan muutoksen suhde
          alkumuutokseen: itseisarvo enintään 20 % = lähellä lähtötasoa;
          negatiivinen = ylitti lähtötason vastakkaiseen suuntaan; yli 120 % =
          etääntyi lisää; muut = osa muutoksesta jäi.
        </p>
        <p className="mt-2">
          Ei trendikorjausta, merkitsevyystestiä eikä syy-seurausarviota. Myös
          trendit, mittarimuutokset ja väestön rakenne voivat näkyä tuloksissa.
          Aineisto sisältää havaintoja ja arvioita; tarkista alkuperäiset
          lähteet ennen johtopäätöksiä.
        </p>
        <p className="mt-2 text-muted-foreground">
          Lähde: {SCANNER.meta.source}.
        </p>
      </details>
    </div>
  );
}
function Detail({ r, w }: { r: Legacy; w: Window }) {
  const vals = Array.from({ length: w.end - w.start + 1 }, (_, i) =>
    valueAt(r.s, w.start + i),
  );
  const nums = vals.filter((v): v is number => v !== null);
  const lo = Math.min(...nums),
    hi = Math.max(...nums);
  const x = (i: number) => 24 + (i / (vals.length - 1)) * 272;
  const y = (v: number) => 105 - ((v - lo) / (hi - lo || 1)) * 85;
  const path = vals
    .map((v, i) =>
      v === null
        ? ""
        : (i === 0 || vals[i - 1] === null ? "M" : "L") + x(i) + "," + y(v),
    )
    .join(" ");
  return (
    <div className="min-w-0 rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">
        {r.s.lane} · {r.s.u}
      </p>
      <h3 className="mt-1 break-words font-medium">{r.s.t}</h3>
      <svg
        viewBox="0 0 320 138"
        className="my-2 w-full"
        role="img"
        aria-label="Vuosiarvot valitulla aikavälillä"
      >
        <line
          x1="24"
          x2="296"
          y1={y(r.a)}
          y2={y(r.a)}
          stroke="currentColor"
          opacity=".3"
          strokeDasharray="4 4"
        />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
        {[w.start, w.shock, w.end].map((yr, i) => (
          <g key={yr}>
            <circle
              cx={x(yr - w.start)}
              cy={y([r.a, r.b, r.c][i]!)}
              r="4"
              fill={colors[r.kind]}
            />
            <text
              x={x(yr - w.start)}
              y="126"
              textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
              fontSize="9"
              fill="currentColor"
            >
              {yr}
            </text>
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-3 gap-1 text-center text-xs">
        {[r.a, r.b, r.c].map((v, i) => (
          <div key={i} className="rounded bg-muted p-2">
            <span className="block text-muted-foreground">
              {[w.start, w.shock, w.end][i]}
            </span>
            <strong>{fmt(v)}</strong>
          </div>
        ))}
      </div>
      <p
        className="mt-3 text-sm font-semibold"
        style={{ color: colors[r.kind] }}
      >
        {LABELS[r.kind]}
      </p>
      <p className="mt-1 text-xs">
        Alkumuutos {signed(r.impulse)} × · nettomuutos {signed(r.residual)} ×
        {r.ratio !== null ? " · jäljellä " + fmt(r.ratio * 100) + " %" : ""}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {r.observations}/{vals.length} vuosihavaintoa · vertailutaso{" "}
        {fmt(r.scale)} {r.s.u}/vuosi
      </p>
    </div>
  );
}
