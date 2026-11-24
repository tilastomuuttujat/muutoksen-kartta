// Animoitu aikajana: syntyvyyden käyrä piirtyy vuosi kerrallaan, ja kunkin selityksen arvio
// ilmestyy siihen kohtaan, jossa sitä koskeva havainto tehdään. Kaikki luvut tulevat aineistosta.
import { useEffect, useRef, useState } from "react";
import {
  DECISIONS,
  NORDIC,
  VERDICTS,
  currentBeat,
  pointsUntil,
  revealedExplanations,
  series,
  type Phenomenon,
  type Verdict,
} from "@/lib/selitykset";

const X0 = 2000, X1 = 2025;
const W = 760, H = 470, L = 46, R = 640;
const TOP = 128, BOT = 300; // syntyvyys
const ET = 336, EB = 396; // työllisyys
const DY = 428; // päätökset
const x = (yr: number) => L + ((yr - X0) / (X1 - X0)) * (R - L);
const y = (v: number) => BOT - ((v - 1.1) / (2.3 - 1.1)) * (BOT - TOP);
const ye = (v: number) => EB - ((v - 66) / (74 - 66)) * (EB - ET);
const path = (pts: [number, number][], fy: (v: number) => number) =>
  pts.map(([a, b], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${fy(b).toFixed(1)}`).join(" ");
const f2 = (v: number) => v.toLocaleString("fi-FI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CHIP: Record<Verdict, { stroke: string; text: string }> = {
  sopii: { stroke: "#047857", text: "fill-emerald-800" },
  osittain: { stroke: "#b45309", text: "fill-amber-800" },
  "ei-yksin": { stroke: "#b91c1c", text: "fill-red-800" },
  "ei-testattu": { stroke: "#64748b", text: "fill-slate-600" },
};

const SECONDS_PER_YEAR = 0.85;
const HOLD_SECONDS = 1.8; // pysähdys, kun uusi selitysarvio ilmestyy

export function ExplanationTimeline({ ph }: { ph: Phenomenon }) {
  const [year, setYear] = useState(X1);
  const [playing, setPlaying] = useState(false);
  const reduced = useRef(false);
  const holdUntil = useRef(0);
  const last = useRef<number | null>(null);

  useEffect(() => {
    reduced.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  const acc = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const holdYears = ph.beats.filter((b) => b.explanation).map((b) => b.at);
    const tick = (t: number) => {
      const dt = (t - (last.current ?? t)) / 1000;
      last.current = t;
      raf = requestAnimationFrame(tick);
      if (t < holdUntil.current) return;
      let step = dt / SECONDS_PER_YEAR;
      if (reduced.current) {
        // Vähennetty liike: hypätään vuosi kerrallaan ilman liukuvaa piirtoa.
        acc.current += dt;
        if (acc.current < SECONDS_PER_YEAR) return;
        acc.current = 0;
        step = 1;
      }
      setYear((yr) => {
        const next = Math.min(X1, yr + step);
        const crossed = holdYears.find((h) => yr < h && next >= h);
        if (crossed != null) {
          holdUntil.current = t + HOLD_SECONDS * 1000;
          return crossed;
        }
        return next;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      last.current = null;
    };
  }, [playing, ph.beats]);

  useEffect(() => {
    if (year >= X1) setPlaying(false);
  }, [year]);

  const play = () => {
    if (year >= X1) setYear(X0);
    holdUntil.current = 0;
    setPlaying(true);
  };

  const fi = series("Hedelmällisyysluku").filter(([yr]) => yr >= X0);
  const emp = series("Työllisyysaste 15–64").filter(([yr]) => yr >= X0);
  const beat = currentBeat(ph.beats, year);
  const revealed = revealedExplanations(ph.beats, year);
  const byId = Object.fromEntries(ph.explanations.map((e) => [e.id, e]));
  const fiNow = pointsUntil(fi, year).at(-1);
  const bandOn = year >= 2015;

  return (
    <section className="mt-6 rounded-lg border bg-card p-4" aria-labelledby="timeline-h">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="timeline-h" className="font-display text-xl">Aikajana: missä vaiheessa kukin selitys joutui koetukselle</h2>
        <div className="ml-auto flex items-center gap-1">
          {playing ? (
            <button onClick={() => setPlaying(false)} className="rounded-md border px-3 py-1 text-sm">❚❚ Tauko</button>
          ) : (
            <button onClick={play} className="rounded-md bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">▶ {year >= X1 ? "Toista alusta" : "Jatka"}</button>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-auto w-full" role="img"
        aria-label={`Syntyvyys Suomessa ja muissa Pohjoismaissa ${X0}–${Math.floor(year)}, työllisyysaste ja päätökset; selitysarviot aikajanalla`}>
        {/* selitysarviot ilmestyvät ylös omille riveilleen */}
        {revealed.map((r, i) => {
          const e = byId[r.id]!;
          const c = CHIP[e.verdict];
          const cx = Math.min(x(r.at), R - 150);
          const cy = 14 + i * 21;
          const v = fi.find(([yr]) => yr === r.at)?.[1];
          return (
            <g key={r.id} className="lc-pop">
              {v != null && <line x1={x(r.at)} x2={x(r.at)} y1={cy + 16} y2={y(v)} stroke={c.stroke} strokeOpacity={0.5} strokeDasharray="2 3" />}
              <rect x={cx} y={cy} width={150} height={17} rx={8.5} fill="var(--card)" stroke={c.stroke} />
              <text x={cx + 8} y={cy + 12.5} className={`text-[11px] font-semibold ${c.text}`}>
                {VERDICTS[e.verdict].symbol} {e.short}
              </text>
            </g>
          );
        })}

        {bandOn && <rect x={x(2015)} y={TOP} width={x(Math.min(year, 2019)) - x(2015)} height={EB - TOP} fill="var(--primary)" fillOpacity={0.07} />}
        {[1.2, 1.6, 2.0].map((t) => (
          <g key={t}>
            <line x1={L} x2={R} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{f2(t)}</text>
          </g>
        ))}
        <text x={L} y={TOP - 6} className="fill-muted-foreground text-[11px]">Syntyvyys, lasta naista kohden</text>
        {NORDIC.countries.filter((c) => c.geo !== "FI").map((c) => (
          <path key={c.geo} d={path(pointsUntil(c.values, year), y)} fill="none" stroke="var(--muted-foreground)" strokeOpacity={0.45} strokeWidth={1.4} />
        ))}
        <path d={path(pointsUntil(fi, year), y)} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinejoin="round" />
        {fiNow && (
          <g>
            <circle cx={x(fiNow[0])} cy={y(fiNow[1])} r={5} fill="var(--primary)" />
            {year < X1 - 1 && <text x={x(fiNow[0]) + 8} y={y(fiNow[1]) - 8} className="fill-primary text-[12px] font-semibold">Suomi {f2(fiNow[1])}</text>}
          </g>
        )}

        {year >= X1 - 1 && (() => {
          // Lopussa kaikkien maiden nimet oikeaan reunaan, väljennettynä niin etteivät ne mene päällekkäin.
          const tips = NORDIC.countries
            .map((c) => {
              const pts = c.geo === "FI" ? fi : c.values;
              const tip = pts.at(-1)!;
              return { geo: c.geo, label: c.geo === "FI" ? `Suomi ${f2(tip[1])}` : `${c.name} ${f2(tip[1])}`, v: tip[1] };
            })
            .sort((a, b) => y(a.v) - y(b.v));
          let prev = -99;
          return tips.map((t) => {
            const ly = Math.max(y(t.v) + 4, prev + 13);
            prev = ly;
            return <text key={t.geo} x={R + 10} y={ly} className={t.geo === "FI" ? "fill-primary text-[12px] font-semibold" : "fill-muted-foreground text-[11px]"}>{t.label}</text>;
          });
        })()}

        <text x={L} y={ET - 6} className="fill-muted-foreground text-[11px]">Työllisyysaste 15–64, %</text>
        {[66, 70, 74].map((t) => (
          <g key={t}>
            <line x1={L} x2={R} y1={ye(t)} y2={ye(t)} stroke="var(--border)" strokeDasharray={t === 70 ? undefined : "2 3"} />
            <text x={L - 6} y={ye(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{t}</text>
          </g>
        ))}
        <path d={path(pointsUntil(emp, year), ye)} fill="none" stroke="var(--foreground)" strokeOpacity={0.7} strokeWidth={1.8} />

        <text x={L} y={DY - 14} className="fill-muted-foreground text-[11px]">Päätökset: ▼ heikensi turvaa, ▲ vahvisti</text>
        {DECISIONS.filter((d) => d.year <= year).map((d, i) => {
          const same = DECISIONS.filter((o, j) => j < DECISIONS.indexOf(d) && o.year === d.year).length;
          return (
            <text key={i} x={x(d.year) + same * 11} y={DY + 6} textAnchor="middle" className={`lc-pop text-[14px] ${d.dir === "up" ? "fill-emerald-700" : "fill-red-700"}`}>
              {d.dir === "up" ? "▲" : "▼"}<title>{`${d.year}: ${d.label}`}</title>
            </text>
          );
        })}

        {[2000, 2005, 2010, 2015, 2020, 2025].filter((t) => Math.abs(x(t) - x(year)) > 18).map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">{t}</text>
        ))}
        <line x1={x(year)} x2={x(year)} y1={TOP - 2} y2={DY + 12} stroke="var(--foreground)" strokeOpacity={0.35} />
        <text x={x(year)} y={H - 8} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">{Math.floor(year)}</text>
      </svg>

      <input type="range" min={X0} max={X1} step={1} value={Math.floor(year)} aria-label="Vuosi"
        onChange={(e) => { setPlaying(false); setYear(Number(e.target.value)); }} className="mt-1 w-full accent-[var(--primary)]" />

      <div className="mt-2 min-h-[4.5rem] rounded-md border bg-background p-3 text-sm" aria-live="polite">
        {beat ? (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {beat.until ? `${beat.at}–${beat.until}` : beat.at}
            </div>
            <p className="mt-0.5">{beat.text}</p>
            {beat.explanation && byId[beat.explanation] && (
              <p className="mt-1 font-semibold">
                <span aria-hidden="true">{VERDICTS[byId[beat.explanation]!.verdict].symbol}</span>{" "}
                {byId[beat.explanation]!.title}: {VERDICTS[byId[beat.explanation]!.verdict].label}.
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">Paina ▶ ja seuraa, miten syntyvyys ja selitykset etenevät vuosi kerrallaan.</p>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Lähteet: Tilastokeskus 12dt ja 13aj, Eurostat demo_find. Muiden Pohjoismaiden luvut vuoteen 2024. Selitysarviot ja niiden perustelut alla.
      </p>
    </section>
  );
}
