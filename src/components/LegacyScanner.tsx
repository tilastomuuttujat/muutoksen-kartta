import { useMemo, useState } from "react";
import indicatorData from "@/data/indicators.json";
import { LANES, SCANNER, uniqueSeries } from "@/lib/scanner";
import {
  LABELS,
  PERIODS,
  opposing,
  scanAll,
  scanLegacy,
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

// Approved continuations from the sourced indicator snapshot, for the legacy view.
const continuations = new Map([
  [
    "gapminder.finland.children_per_woman_total_fertility.v20261026",
    { from: 2024, table: "synt/12dt", note: "Tilastokeskus, StatFin 12dt" },
  ],
  [
    "fi.histlabour.lfs2019.employment_rate",
    {
      from: 2019,
      table: "tyti/13aj",
      note: "Tilastokeskus, StatFin 13aj, tarkistettu työvoimatutkimus",
    },
  ],
  [
    "fi.historical20261026.jst.real_wage_index",
    {
      from: 2021,
      table: "ati/14un",
      note: "Tilastokeskus, StatFin 14un. Historiallista indeksiä jatketaan reaaliansioindeksin vuosimuutoksilla.",
    },
  ],
  [
    "fi.distribution.gini2020.disposable",
    {
      from: 2019,
      table: "tjt/11x3",
      note: "Tilastokeskus, StatFin 11x3, käytettävissä olevat rahatulot",
    },
  ],
]);

const statfinCrime = [
  {
    key: "assault",
    title: "Pahoinpitelyt (lievät, perusmuotoiset ja törkeät)",
    values: [
      30158, 33751, 34003, 32080, 32315, 39319, 37425, 34680, 32145, 33133,
      32972, 33053, 33150, 33426, 32778, 33620, 37647, 40712, 40466, 44013,
    ],
  },
  {
    key: "fraud",
    title: "Petokset (lievät, perusmuotoiset ja törkeät)",
    values: [
      11615, 12777, 14864, 16267, 14518, 16409, 19023, 20245, 20041, 22516,
      21752, 20386, 21978, 25518, 31720, 34580, 36591, 40391, 38404, 33112,
    ],
  },
  {
    key: "robbery",
    title: "Ryöstöt ja ryöstön yritykset",
    values: [
      1700, 1784, 1696, 1640, 1508, 1622, 1616, 1523, 1687, 1548, 1670, 1643,
      1707, 1808, 2000, 1901, 2336, 2732, 2592, 2433,
    ],
  },
  {
    key: "theft_petty",
    title: "Varkaudet, törkeät varkaudet ja näpistykset",
    values: [
      135880, 135425, 137388, 142763, 139531, 142513, 130928, 133751, 135282,
      130522, 124060, 118464, 116275, 120074, 131312, 121283, 122411, 123849,
      124304, 142069,
    ],
  },
  {
    key: "narcotics",
    title: "Huumausainerikokset (rikoslain 50. luku)",
    values: [
      14226, 16293, 16508, 18524, 19724, 20394, 20102, 22656, 21781, 23400,
      25082, 27831, 29183, 32357, 37152, 28298, 25212, 26838, 25618, 26433,
    ],
  },
  {
    key: "manslaughter",
    title: "Tapot",
    values: [
      74, 69, 85, 73, 72, 64, 46, 57, 59, 48, 55, 45, 59, 45, 53, 47, 52, 38,
      53, 56,
    ],
  },
  {
    key: "murder",
    title: "Murhat",
    values: [
      37, 58, 47, 40, 38, 49, 43, 38, 41, 36, 21, 27, 28, 27, 33, 36, 26, 19,
      36, 24,
    ],
  },
];
const crimeSourceUrl =
  "https://statfin.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__rpk/statfin_rpk_pxt_13gw.px/";
const population = SCANNER.series.find(
  (series) => series.k === "fi.statfin15ai.total.ep.fe4e7bf6af",
);

const recentValues = [
  {
    key: "crime.hcs.fi.prison_all_daily_average",
    from: 2023,
    values: [3143, 3356, 3545],
    urls: [
      "https://www.rikosseuraamus.fi/app/uploads/sites/11/2026/05/RISE-Tilastollinen-vuosikirja-2025.pdf",
      "https://www.rikosseuraamus.fi/app/uploads/sites/11/2026/05/RISE-Tilastollinen-vuosikirja-2025.pdf",
      "https://www.rikosseuraamus.fi/app/uploads/sites/11/2026/05/RISE-Tilastollinen-vuosikirja-2025.pdf",
    ],
    note: "Rikosseuraamuslaitos, vuosikirja 2025, taulukko 2. Vankien päivittäinen keskimäärä.",
  },
  {
    key: "crime.hcs.fi.prison_all_dec31",
    from: 2023,
    values: [3166, 3406, 3598],
    urls: [
      "https://www.rikosseuraamus.fi/app/uploads/sites/11/2024/11/RISE-Tilastollinen-vuosikirja-2023.pdf",
      "https://www.rikosseuraamus.fi/app/uploads/sites/11/2024/11/RISE-Tilastollinen-vuosikirja-2024.pdf",
      "https://www.rikosseuraamus.fi/app/uploads/sites/11/2026/05/RISE-Tilastollinen-vuosikirja-2025.pdf",
    ],
    note: "Rikosseuraamuslaitos, taulukko 1, kaikki laitokset, vuoden lopussa.",
  },
  {
    key: "crime.hcs.fi.prison_sentenced_dec31",
    from: 2023,
    values: [2325, 2500, 2602],
    urls: [
      "https://www.rikosseuraamus.fi/app/uploads/sites/11/2024/11/RISE-Tilastollinen-vuosikirja-2023.pdf",
      "https://www.rikosseuraamus.fi/app/uploads/sites/11/2024/11/RISE-Tilastollinen-vuosikirja-2024.pdf",
      "https://www.rikosseuraamus.fi/app/uploads/sites/11/2026/05/RISE-Tilastollinen-vuosikirja-2025.pdf",
    ],
    note: "Rikosseuraamuslaitos, taulukko 1, vankeusvangit vuoden lopussa; sakkovangit ja tutkintavangit tilastoitu erikseen.",
  },
  {
    key: "fi.histlabour.lfs2019.unemployment_rate",
    from: 2019,
    values: [6.8, 7.7, 7.7, 6.8, 7.2, 8.4, 9.7],
    urls: [
      "https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tyti/statfin_tyti_pxt_13aj.px/",
      "https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tyti/statfin_tyti_pxt_13aj.px/",
      "https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tyti/statfin_tyti_pxt_13aj.px/",
      "https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tyti/statfin_tyti_pxt_13aj.px/",
      "https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tyti/statfin_tyti_pxt_13aj.px/",
      "https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tyti/statfin_tyti_pxt_13aj.px/",
      "https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tyti/statfin_tyti_pxt_13aj.px/",
    ],
    note: "Tilastokeskus, työvoimatutkimus 13aj, 15–74-vuotiaat, koko maa. Tarkistettu sarja.",
  },
];

const legacySeries = SCANNER.series.map((series) => {
  const recent = recentValues.find((item) => item.key === series.k);
  if (recent) {
    const values = [...series.v];
    recent.values.forEach((value, index) => {
      const offset = recent.from + index - series.y0;
      while (values.length <= offset) values.push(null);
      values[offset] ??= value;
    });
    // The rate and the number of unemployed answer different questions.
    if (recent.key === "fi.histlabour.lfs2019.unemployment_rate") {
      return { ...series, dup: undefined, v: values } as Legacy["s"];
    }
    return { ...series, v: values };
  }
  const crime = statfinCrime.find(
    (item) => series.k === "crime.hcs.fi.police_" + item.key,
  );
  if (crime && ["manslaughter", "murder"].includes(crime.key)) {
    const values = [...series.v];
    for (let year = 2023; year <= 2025; year++) {
      while (values.length <= year - series.y0) values.push(null);
      values[year - series.y0] ??= crime.values[year - 2006] ?? null;
    }
    return { ...series, v: values };
  }
  const source = continuations.get(series.k);
  const indicator =
    source &&
    indicatorData.indicators.find(
      (item) => item.key === series.k && item.unit === series.u,
    );
  if (!source || !indicator) return series;
  const values = [...series.v];
  for (const [year, value] of indicator.values) {
    if (
      typeof year !== "number" ||
      year < source.from ||
      year > 2025 ||
      typeof value !== "number" ||
      !Number.isFinite(value)
    )
      continue;
    while (values.length <= year - series.y0) values.push(null);
    values[year - series.y0] ??= value;
  }
  return { ...series, v: values };
});
const historyChoices = uniqueSeries(legacySeries);

export function LegacyScanner() {
  const [w, setW] = useState<Window>(PERIODS[4]!);
  const [lane, setLane] = useState("");
  const [kind, setKind] = useState<Kind | "">("");
  const [q, setQ] = useState("");
  const [key, setKey] = useState(
    "gapminder.finland.children_per_woman_total_fertility.v20261026",
  );
  const [limit, setLimit] = useState(20);
  const [comparison, setComparison] = useState(3);
  const [historyKey, setHistoryKey] = useState(
    "gapminder.finland.children_per_woman_total_fertility.v20261026",
  );
  const historySeries =
    historyChoices.find((s) => s.k === historyKey) ?? historyChoices[0]!;
  const rows = useMemo(() => scanAll(legacySeries, w), [w]);
  const prior = useMemo(
    () =>
      new Map(
        scanAll(legacySeries, PERIODS[comparison]!).map((r) => [r.s.k, r]),
      ),
    [comparison],
  );
  const filtered = rows.filter(
    (r) =>
      (!lane || r.s.lane === lane) &&
      (!kind || r.kind === kind) &&
      (!q || r.s.t.toLocaleLowerCase("fi").includes(q.toLocaleLowerCase("fi"))),
  );
  const selected =
    filtered.find((r) => r.s.k === key) ??
    (key === historyKey ? undefined : filtered[0]);
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
          Valitse aikajanan alta murroskausi. Näet mitkä mittarit palasivat
          lähtötasolle, mitkä jäivät uudelle tasolle ja missä kehitys kulki
          vastakkaisiin suuntiin.
        </p>
        <HistoryOverview
          series={historySeries}
          selected={w.shock}
          onPick={(p, seriesKey) => {
            setW(p);
            setLimit(20);
            setLane("");
            setKind("");
            setQ("");
            setKey(seriesKey);
          }}
          onSeries={(k) => {
            setHistoryKey(k);
            setKey(k);
            setLane("");
            setKind("");
            setQ("");
          }}
        />
        <details className="mt-4 rounded-lg border p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Muokkaa tarkasteluvuosia · {w.start}–{w.end} (murros {w.shock})
          </summary>
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
        </details>
        <p className="mt-3 text-sm text-muted-foreground">
          {rows.length} / {historyChoices.length} sarjaa täyttää kattavuusehdot.
          Puuttuvia vuosia ei arvioida.
        </p>
      </section>
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-xl">1. Missä muutos jäi elämään?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Valitse elämänalue ja mittari. Kuvaaja näyttää havaitun kehityksen ja
          murrosta edeltäneen suunnan jatkumon.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Elämänalue
            <select
              value={lane}
              onChange={(e) => {
                setLane(e.target.value);
                setKey("");
                setLimit(20);
              }}
              className="mt-1 w-full rounded border bg-background p-2"
            >
              <option value="">Kaikki elämänalueet</option>
              {LANES.map((l) => (
                <option key={l} value={l}>
                  {l} ({rows.filter((r) => r.s.lane === l).length})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Muutos suhteessa lähtötasoon
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as Kind | "");
                setKey("");
                setLimit(20);
              }}
              className="mt-1 w-full rounded border bg-background p-2"
            >
              <option value="">Kaikki kehityskulut</option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 block text-sm font-medium">
          Mittari
          <select
            value={selected?.s.k ?? ""}
            onChange={(e) => {
              setKey(e.target.value);
              setHistoryKey(e.target.value);
            }}
            className="mt-1 w-full rounded border bg-background p-2"
          >
            {!selected && (
              <option value="">
                {filtered.length
                  ? "Valitse kauden mittari"
                  : "Ei kattavia mittareita"}
              </option>
            )}
            {filtered.map((r) => (
              <option key={r.s.k} value={r.s.k}>
                {r.s.t}
              </option>
            ))}
          </select>
        </label>
        {selected && <DevelopmentChart r={selected} w={w} />}
        {!selected && (
          <p className="mt-4 text-sm text-muted-foreground">
            Ei kattavia mittareita valitulla jaksolla.
          </p>
        )}
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
                onClick={() => {
                  setKey(r.s.k);
                  setHistoryKey(r.s.k);
                }}
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
          Trendiviiva on erillinen havainnollistava vertailu: lineaarinen
          sovitus enintään kymmenen vuotta ennen lähtövuotta (vähintään kuusi
          havaintoa). Se ei muuta luokituksia. Ei merkitsevyystestiä eikä
          syy-seurausarviota. Myös trendit, mittarimuutokset ja väestön rakenne
          voivat näkyä tuloksissa. Aineisto sisältää havaintoja ja arvioita;
          tarkista alkuperäiset lähteet ennen johtopäätöksiä.
        </p>
        <p className="mt-2 text-muted-foreground">
          Lähde: {SCANNER.meta.source}. Neljän sarjan viimeiset vuodet on
          täydennetty hankkeen StatFin-aineistosta.
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

function DevelopmentChart({ r, w }: { r: Legacy; w: Window }) {
  const start = Math.max(1850, w.start - 10);
  const end = Math.max(w.end, Math.min(2045, w.shock + 20));
  const observed = Array.from({ length: end - start + 1 }, (_, i) => ({
    year: start + i,
    v: start + i <= 2025 ? valueAt(r.s, start + i) : null,
  }));
  const pre = observed.filter(
    (p): p is { year: number; v: number } => p.year <= w.start && p.v !== null,
  );
  const mean = pre.length ? pre.reduce((a, p) => a + p.v, 0) / pre.length : 0;
  const my = pre.length ? pre.reduce((a, p) => a + p.year, 0) / pre.length : 0;
  const den = pre.reduce((a, p) => a + (p.year - my) ** 2, 0);
  const slope = den
    ? pre.reduce((a, p) => a + (p.year - my) * (p.v - mean), 0) / den
    : 0;
  const trend = (yr: number) => mean + slope * (yr - my);
  const hasTrend = pre.length >= 6 && den > 0;
  const lastObserved = Math.max(
    ...observed.filter((p) => p.v !== null).map((p) => p.year),
  );
  const points = observed.flatMap((p) => (p.v === null ? [] : [p.v]));
  if (hasTrend) points.push(trend(start), trend(Math.min(lastObserved, end)));
  const lo = Math.min(...points),
    hi = Math.max(...points),
    span = hi - lo || 1;
  const x = (yr: number) => 85 + ((yr - start) / (end - start)) * 625;
  const y = (v: number) => 210 - ((v - lo) / span) * 166;
  const path = observed
    .map((p, i) =>
      p.v === null
        ? ""
        : (i === 0 || observed[i - 1]?.v === null ? "M" : "L") +
          x(p.year) +
          "," +
          y(p.v),
    )
    .join(" ");
  const marks = [
    ...new Set(
      [
        start,
        w.start,
        w.shock,
        w.end,
        w.shock + 5,
        w.shock + 10,
        w.shock + 20,
      ].filter((yr) => yr >= start && yr <= end),
    ),
  ].sort((a, b) => a - b);
  const milestones = [5, 10, 20].map((n) => ({
    n,
    year: w.shock + n,
    v: w.shock + n <= 2025 ? valueAt(r.s, w.shock + n) : null,
  }));
  return (
    <div className="mt-5 rounded-lg border p-4">
      <h3 className="font-display text-xl">{r.s.t}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {r.s.u} · {w.start}–{w.end} · {LABELS[r.kind]} suhteessa lähtötasoon
      </p>
      <div className="mt-3 overflow-x-auto">
        <svg
          viewBox="0 0 745 270"
          className="w-full min-w-[540px]"
          role="img"
          aria-label="Havaittu kehitys, historiallinen trendijatkumo ja murrosvuosi"
        >
          {lastObserved < end && (
            <rect
              x={x(lastObserved)}
              y={30}
              width={x(end) - x(lastObserved)}
              height={180}
              fill="#94a3b8"
              opacity=".15"
            />
          )}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line
                x1="85"
                x2="710"
                y1={y(lo + p * span)}
                y2={y(lo + p * span)}
                stroke="currentColor"
                opacity=".12"
              />
              <text
                x="78"
                y={y(lo + p * span) + 4}
                textAnchor="end"
                fontSize="11"
                fill="currentColor"
              >
                {fmt(lo + p * span)}
              </text>
            </g>
          ))}
          <line
            x1={x(w.shock)}
            x2={x(w.shock)}
            y1="25"
            y2="210"
            stroke="#b45309"
            strokeDasharray="4 4"
          />
          <text
            x={x(w.shock)}
            y="17"
            textAnchor="middle"
            fontSize="12"
            fill="#b45309"
          >
            Murros {w.shock}
          </text>
          <line
            x1={x(w.end)}
            x2={x(w.end)}
            y1="30"
            y2="210"
            stroke="currentColor"
            opacity=".35"
            strokeDasharray="3 4"
          />
          {hasTrend && (
            <line
              x1={x(start)}
              x2={x(lastObserved)}
              y1={y(trend(start))}
              y2={y(trend(lastObserved))}
              stroke="currentColor"
              opacity=".65"
              strokeDasharray="7 5"
              strokeWidth="2"
            />
          )}
          <path
            d={path}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.7"
            strokeLinejoin="round"
          />
          {[w.start, w.shock, w.end].map((yr) => (
            <circle
              key={yr}
              cx={x(yr)}
              cy={y(valueAt(r.s, yr)!)}
              r="4"
              fill="#2563eb"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
          {marks.map((yr, i) => (
            <text
              key={yr}
              x={x(yr)}
              y={i % 2 ? 249 : 233}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
            >
              {yr}
            </text>
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <span className="text-blue-700 dark:text-blue-300">
          ━━ Havaittu kehitys
        </span>
        <span>
          ┄┄{" "}
          {hasTrend
            ? "Murrosta edeltävä trendijatkumo"
            : "Ei riittävää trendiaineistoa"}
        </span>
        <span className="text-muted-foreground">
          ▧ Ei havaintoja sarjan lopun jälkeen
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {milestones.map((m) => (
          <div key={m.n} className="rounded bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">
              +{m.n} vuotta · {m.year}
            </p>
            <p className="font-semibold">
              {m.v === null ? "Ei tietoa" : fmt(m.v)}
            </p>
            {m.v !== null && (
              <p className="text-xs text-muted-foreground">
                Muutos lähtötasosta {signed(m.v - r.a)}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Katkoviiva on laskennallinen trendijatkumo, ei arvio siitä, mitä ilman
        kriisiä olisi varmasti tapahtunut. Havaitut arvot voivat sisältää
        arvioita. Katkokset viivassa tarkoittavat puuttuvia havaintoja.
      </p>
    </div>
  );
}

const crimeGroups = [
  ["conv_assault_1850_1926", "police_assault"],
  ["conv_fraud_1850_1926", "police_fraud"],
  ["conv_homicide_1850_1926", "police_manslaughter", "police_murder"],
  ["conv_robbery_1850_1926", "police_robbery"],
  ["conv_theft_1850_1926", "police_theft_petty"],
].map((group) => group.map((key) => "crime.hcs.fi." + key));
const crimeColors = ["#2563eb", "#a94326", "#0f766e", "#7c3aed"];

function HistoryOverview({
  series,
  selected,
  onPick,
  onSeries,
}: {
  series: Legacy["s"];
  selected: number;
  onPick: (p: Window, seriesKey: string) => void;
  onSeries: (k: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [perCapita, setPerCapita] = useState(false);
  const all = historyChoices;
  const choices = all.filter(
    (s) =>
      s.k === series.k ||
      s.t.toLocaleLowerCase("fi").includes(search.toLocaleLowerCase("fi")),
  );
  const start = 1850,
    end = 2025;
  const crimeGroup = crimeGroups.find((group) => group.includes(series.k));
  const companions = crimeGroup?.flatMap((key) =>
    all.filter((item) => item.k === key),
  );
  const baseSeries =
    companions?.length && companions.length > 1 ? companions : [series];
  const official = statfinCrime.filter(
    (item) =>
      !["manslaughter", "murder"].includes(item.key) &&
      baseSeries.some((base) => base.k === "crime.hcs.fi.police_" + item.key),
  );
  const chartSeries = [
    ...baseSeries,
    ...official.map((item) => ({
      ...series,
      k: "statfin13gw." + item.key,
      t: item.title + " · StatFin 13gw",
      y0: 2006,
      v: item.values,
    })),
  ];
  const crimeView =
    series.k.startsWith("crime.hcs.fi.conv_") ||
    series.k.startsWith("crime.hcs.fi.police_");
  const useRates = perCapita && crimeView;
  const hasSource =
    official.length > 0 ||
    baseSeries.some((item) => /police_(manslaughter|murder)$/.test(item.k));
  const chartValue = (item: Legacy["s"], year: number) => {
    const count = valueAt(item, year);
    if (!useRates || count === null) return count;
    const base = population ? valueAt(population, year) : null;
    return base && base > 0 ? (count * 100) / base : null;
  };
  const paired = chartSeries.length > 1;
  const lines = chartSeries.map((item, index) => ({
    item,
    color: crimeColors[index] ?? crimeColors[0]!,
    values: Array.from({ length: end - start + 1 }, (_, i) => ({
      year: start + i,
      v: chartValue(item, start + i),
    })),
  }));
  const nums = lines.flatMap(({ values }) =>
    values.flatMap((p) => (p.v === null ? [] : [p.v])),
  );
  const lo = paired ? 0 : Math.min(...nums),
    hi = Math.max(...nums),
    span = hi - lo || 1;
  const x = (year: number) => 76 + ((year - start) / (end - start)) * 840;
  const y = (v: number) => 242 - ((v - lo) / span) * 182;
  const path = (values: (typeof lines)[number]["values"]) =>
    values
      .map((p, i) =>
        p.v === null
          ? ""
          : (i === 0 || values[i - 1]?.v === null ? "M" : "L") +
            x(p.year) +
            "," +
            y(p.v),
      )
      .join(" ");
  return (
    <div className="mt-4 rounded-lg border bg-background p-3 sm:p-4">
      <h3 className="font-display text-xl">
        Kuusi murrosta yhdellä aikajanalla · 1850–2025
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Valitse murros tarkentaaksesi alempaa analyysiä. Tyhjä kohta tarkoittaa
        puuttuvaa havaintoa.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr]">
        <input
          aria-label="Hae historiamittaria"
          placeholder="Hae mittaria…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 rounded border bg-background p-2 text-sm"
        />
        <select
          aria-label="Historian mittari"
          value={series.k}
          onChange={(e) => onSeries(e.target.value)}
          className="min-w-0 rounded border bg-background p-2 text-sm"
        >
          {choices.map((s) => (
            <option key={s.k} value={s.k}>
              {s.t}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-4 text-sm font-semibold">{series.t}</p>
      <p className="text-xs text-muted-foreground">
        {useRates
          ? "Lukumäärä 100 000 asukasta kohti"
          : crimeView
            ? "Lukumäärä vuodessa"
            : series.u}
      </p>
      {crimeView && (
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={perCapita}
            onChange={(event) => setPerCapita(event.target.checked)}
          />
          Näytä kuvaaja 100 000 asukasta kohti
        </label>
      )}
      {useRates && (
        <p className="mt-1 text-xs text-muted-foreground">
          Jakajana käytetään keskiväkilukua vuodesta 1860. Kortit näyttävät
          lukumäärät.
        </p>
      )}
      {hasSource && (
        <p className="mt-1 text-xs text-muted-foreground">
          <a href={crimeSourceUrl} className="underline">
            Tilastokeskus, StatFin 13gw
          </a>
          , tutkiva viranomainen poliisi.{" "}
          {official.length
            ? "Uudempi tilasto näkyy omana viivanaan."
            : "Vuodet 2023–2025 jatkavat historiallisia sarjoja."}
        </p>
      )}
      {paired && (
        <>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {lines.map(({ item, color }) => (
              <li key={item.k} className="flex items-center gap-2">
                <span
                  className="h-1 w-5 rounded"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                {item.t} ({item.y0}–{item.y0 + item.v.length - 1})
              </li>
            ))}
          </ul>
          {baseSeries.length > 1 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Vuonna 1927 vaihtuu mittari: tuomittujen henkilöiden määrästä
              siirrytään poliisin tietoon tulleiden rikosten määrään. Myös
              rikosluokat voivat erota.
            </p>
          )}
        </>
      )}
      <ContinuationSource seriesKey={series.k} />
      {recentValues
        .filter((item) => item.key === series.k)
        .map((item) => (
          <p key={item.key} className="mt-1 text-xs text-muted-foreground">
            {item.note}{" "}
            {[...new Set(item.urls)].map((url, index) => (
              <a key={url} href={url} className="mr-2 underline">
                {item.urls.length === new Set(item.urls).size
                  ? String(item.from + index)
                  : "Lähde"}
              </a>
            ))}
          </p>
        ))}
      {baseSeries.some((item) => item.k.endsWith("police_murder")) && (
        <p className="mt-1 text-xs text-muted-foreground">
          Lähdevertailu 2006–2022: tapoissa 2 ja murhissa 4 vuosieroa. Vuonna
          2015 historiallisessa koosteessa on 48 murhaa ja StatFinissä 36. Eron
          syy jää avoimeksi. Vuosien 2020–2022 luvut täsmäävät.
        </p>
      )}
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 960 280"
          className="mt-2 w-full min-w-[700px]"
          role="img"
          aria-label={series.t + " 1850–2025 ja kuusi historiallista murrosta"}
        >
          {PERIODS.map((p) => (
            <g key={p.shock}>
              <rect
                x={x(p.start)}
                y={42}
                width={x(p.end) - x(p.start)}
                height={200}
                fill={selected === p.shock ? "#2563eb" : "#94a3b8"}
                opacity={selected === p.shock ? 0.12 : 0.07}
              />
              <line
                x1={x(p.shock)}
                x2={x(p.shock)}
                y1="35"
                y2="242"
                stroke={selected === p.shock ? "#2563eb" : "#a16207"}
                strokeDasharray="4 4"
              />
              <text
                x={x(p.shock)}
                y={p.shock === 2020 ? 30 : 17}
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
              >
                {p.shock}
              </text>
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line
                x1="76"
                x2="916"
                y1={y(lo + t * span)}
                y2={y(lo + t * span)}
                stroke="currentColor"
                opacity=".12"
              />
              <text
                x="68"
                y={y(lo + t * span) + 4}
                textAnchor="end"
                fill="currentColor"
                fontSize="11"
              >
                {fmt(lo + t * span)}
              </text>
            </g>
          ))}
          {baseSeries.length > 1 && (
            <g>
              <line
                x1={x(1927)}
                x2={x(1927)}
                y1="34"
                y2="242"
                stroke="currentColor"
                opacity=".55"
                strokeDasharray="2 4"
              />
              <text x={x(1927) + 6} y="30" fontSize="11" fill="currentColor">
                1927 · mittari vaihtuu
              </text>
            </g>
          )}
          {lines.map(({ item, color, values }) => (
            <path
              key={item.k}
              d={path(values)}
              stroke={color}
              strokeWidth="2.5"
              fill="none"
              strokeLinejoin="round"
            />
          ))}
          {[1850, 1875, 1900, 1925, 1950, 1975, 2000, 2025].map((yr) => (
            <text
              key={yr}
              x={x(yr)}
              y="265"
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
            >
              {yr}
            </text>
          ))}
          {lines.flatMap(({ item, color }) =>
            PERIODS.map((p) => {
              const v = chartValue(item, p.shock);
              return v === null ? null : (
                <circle
                  key={item.k + ":" + p.shock}
                  cx={x(p.shock)}
                  cy={y(v)}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="1.5"
                />
              );
            }),
          )}
        </svg>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PERIODS.map((p) => {
          const r =
            scanLegacy(series, p) ??
            baseSeries
              .map((item) => scanLegacy(item, p))
              .find((result) => result !== null);
          return (
            <button
              key={p.shock}
              onClick={() => onPick(p, r?.s.k ?? series.k)}
              aria-pressed={selected === p.shock}
              className="rounded-lg border p-3 text-left text-sm hover:bg-muted aria-pressed:ring-2 aria-pressed:ring-primary"
            >
              <span className="block text-xs text-muted-foreground">
                {p.start}–{p.end}
              </span>
              <strong className="block">{p.label}</strong>
              {r ? (
                <>
                  {paired && (
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {r.s.t}
                    </span>
                  )}
                  <span className="mt-2 block text-xs">
                    {fmt(r.a)} → {fmt(r.b)} → {fmt(r.c)}
                  </span>
                  <span
                    className="mt-1 block text-xs"
                    style={{ color: colors[r.kind] }}
                  >
                    {LABELS[r.kind]}
                  </span>
                </>
              ) : (
                <span className="mt-2 block text-xs text-muted-foreground">
                  Ei riittävää vertailuaineistoa
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Kortit näyttävät lähtövuoden, murrosvuoden ja päätepisteen arvot.
        Murrosjaksojen pituudet vaihtelevat; luokitus ei osoita syy-yhteyttä.
      </p>
    </div>
  );
}

function ContinuationSource({ seriesKey }: { seriesKey: string }) {
  const source = continuations.get(seriesKey);
  if (!source) return null;
  const [domain, table] = source.table.split("/");
  return (
    <p className="mt-1 text-xs text-muted-foreground">
      Täydennys vuodesta {source.from}.{" "}
      <a
        className="underline"
        href={`https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__${domain}/statfin_${domain}_pxt_${table}.px/`}
      >
        {source.note}
      </a>
    </p>
  );
}
