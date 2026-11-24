// Selitysten punnitus: yhden ilmiön kilpailevat selitykset rinnakkain.
// Jokaisella selityksellä on ennuste (mitä näkisimme, jos se pitäisi), havainto ja tulos.
// Sisältö on toimituksellista ja lähteistettyä; luvut piirretään src/data/indicators.json-
// ja src/data/nordic-tfr.json-aineistoista, joten kaaviot eivät voi poiketa lähteestään.
import indicatorsRaw from "@/data/indicators.json";
import nordicRaw from "@/data/nordic-tfr.json";

export type Verdict = "sopii" | "osittain" | "ei-yksin" | "ei-testattu";
export type Source = { label: string; url: string };
export type Evidence = "order" | "economy" | "nordic" | "unions" | "decisions";
export type Explanation = {
  id: string;
  title: string;
  /** Lyhyt nimi aikajanan merkintään. */
  short: string;
  /** Mitä näkisimme, jos selitys pitäisi. */
  predicts: string;
  /** Mitä havaittiin. */
  observed: string;
  verdict: Verdict;
  /** Mitä tulos ei kerro. */
  caveat: string;
  evidence: Evidence;
  sources: Source[];
};
/** Aikajanan tahti: vuonna `at` (tai jaksolla at–until) näytettävä havainto ja sen tuoma selitysarvio. */
export type Beat = {
  at: number;
  until?: number;
  text: string;
  /** Selitys, jonka tämä havainto arvioi; tulos ilmestyy aikajanalle tästä vuodesta alkaen. */
  explanation?: string;
};
export type Phenomenon = {
  id: string;
  question: string;
  period: [number, number];
  lead: string;
  explanations: Explanation[];
  notTold: string[];
  beats: Beat[];
};

export const VERDICTS: Record<Verdict, { label: string; symbol: string; rank: number; tone: string }> = {
  sopii: { label: "sopii havaintoihin", symbol: "✔", rank: 0, tone: "good" },
  osittain: { label: "selittää osan", symbol: "◐", rank: 1, tone: "partial" },
  "ei-yksin": { label: "ei selitä yksin", symbol: "✖", rank: 2, tone: "bad" },
  "ei-testattu": { label: "ei testattu", symbol: "?", rank: 3, tone: "open" },
};

/** Selitykset näytön vahvuuden mukaan: ensin havaintoihin sopivat, lopuksi testaamattomat. */
export const byVerdict = (xs: Explanation[]) => [...xs].sort((a, b) => VERDICTS[a.verdict].rank - VERDICTS[b.verdict].rank);

type Ind = { key: string; name: string; values: [number, number][] };
const indicators = (indicatorsRaw as unknown as { indicators: Ind[] }).indicators;
export const series = (key: string): [number, number][] => {
  const ind = indicators.find((i) => i.key === key || i.name === key);
  if (!ind) throw new Error(`Sarja puuttuu: ${key}`);
  return ind.values;
};
export const between = (s: [number, number][], a: number, b: number) => s.filter(([y]) => y >= a && y <= b);
export const valueAt = (s: [number, number][], year: number) => s.find(([y]) => y === year)?.[1] ?? null;

export const NORDIC = nordicRaw as unknown as {
  meta: { source: string; source_url: string };
  countries: { geo: string; name: string; values: [number, number][] }[];
};

/** Muutoksen jako osiin: kunkin osan muutos ja osuus kokonaismuutoksesta. */
export function decompose(parts: { label: string; from: number; to: number }[]) {
  const total = parts.reduce((s, p) => s + (p.to - p.from), 0);
  return {
    total,
    parts: parts.map((p) => ({ label: p.label, change: p.to - p.from, share: total === 0 ? 0 : (p.to - p.from) / total })),
  };
}

export const DECISIONS: { year: number; dir: "up" | "down"; label: string }[] = [
  { year: 2016, dir: "down", label: "Oikeutta kokoaikaiseen varhaiskasvatukseen rajattiin" },
  { year: 2017, dir: "down", label: "Kilpailukykysopimus ja ansiosidonnaisen lyhennys" },
  { year: 2018, dir: "down", label: "Aktiivimalli; perhevapaauudistus kaatui" },
  { year: 2018, dir: "up", label: "Varhaiskasvatusmaksuja alennettiin" },
  { year: 2020, dir: "up", label: "Aktiivimalli kumottiin, kokoaikainen varhaiskasvatus palautettiin" },
  { year: 2022, dir: "up", label: "Perhevapaauudistus" },
  { year: 2024, dir: "down", label: "Asumistuen leikkaus, suojaosan ja lapsikorotusten poisto" },
];

const STAT = (table: string, db: string, label: string): Source => ({
  label,
  url: `https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__${db}/statfin_${db}_pxt_${table}.px/`,
});

export const PHENOMENA: Phenomenon[] = [
  {
    id: "syntyvyys",
    question: "Miksi syntyvyys laski vuosina 2010–2024?",
    period: [2010, 2024],
    lead:
      "Kokonaishedelmällisyysluku laski 1,87:stä 1,25:een, alemmas kuin koskaan. Alla viisi tavallista selitystä. Kustakin kerrotaan, mitä näkisimme, jos se pitäisi, ja mitä aineisto näyttää.",
    explanations: [
      {
        id: "esikoiset",
        short: "Esikoiset harvenevat",
        title: "Ensimmäinen lapsi jää saamatta tai lykkääntyy",
        predicts: "Lasku keskittyy esikoisiin, ja esikoisen saavien äitien ikä nousee.",
        observed:
          "Noin 82 % laskusta liittyi siihen, että harvempi nainen sai ensimmäisen lapsen. Esikoisen saaneiden äitien keski-ikä nousi 28,3 vuodesta 30,5 vuoteen.",
        verdict: "sopii",
        caveat: "Kertoo, missä vaiheessa perheen muodostumista lasku tapahtui, ei sitä, miksi esikoinen jää saamatta.",
        evidence: "order",
        sources: [
          { label: "FLUX: Hellstrand, Nisén & Myrskylä 2026", url: "https://fluxconsortium.fi/wp-content/uploads/2026/02/PB-Hellstrand-Jalovaara-FI.pdf" },
          STAT("12dm", "synt", "Tilastokeskus 12dm"),
          STAT("14lg", "synt", "Tilastokeskus 14lg"),
        ],
      },
      {
        id: "parisuhteet",
        short: "Parisuhteet vähenevät",
        title: "Parisuhteita on vähemmän",
        predicts: "Lasku johtuu siitä, että harvempi on parisuhteessa; pareilla syntyvyys pysyy ennallaan.",
        observed:
          "Noin neljännes 2010-luvun ensisyntyvyyden laskusta liittyi parisuhteiden muodostumiseen ja purkautumiseen, noin kolme neljäsosaa siihen, että avio- ja avoliitoissa saatiin esikoinen harvemmin.",
        verdict: "osittain",
        caveat: "Osuudet ovat yhden rekisteritutkimuksen tulos 2010-luvulta, eivät koko jaksolta 2010–2024.",
        evidence: "unions",
        sources: [{ label: "Hellstrand, Nisén & Myrskylä 2022", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9127029" }],
      },
      {
        id: "talous",
        short: "Huono talous",
        title: "Huono talous ja työttömyys",
        predicts: "Syntyvyys laskee taantumassa ja palautuu, kun työllisyys paranee.",
        observed: "Vuosina 2015–2019 työllisyysaste nousi 67,1 prosentista 71,6 prosenttiin, mutta syntyvyys laski nopeimmin juuri silloin: 1,65:stä 1,35:een.",
        verdict: "ei-yksin",
        caveat: "Ei sulje pois sitä, että epävarmuus ja tulotaso vaikuttavat yksilöiden päätöksiin. Keskimääräinen työllisyys ei kerro, kenellä työ oli vakaata.",
        evidence: "economy",
        sources: [STAT("12dt", "synt", "Tilastokeskus 12dt"), STAT("13aj", "tyti", "Tilastokeskus 13aj"), { label: "Hellstrand ym. 2021", url: "https://www.utupub.fi/handle/11111/36047" }],
      },
      {
        id: "pohjoismaat",
        short: "Suomen oma politiikka",
        title: "Suomen oma perhepolitiikka",
        predicts: "Lasku on suomalainen ilmiö, eikä sitä näy maissa, joiden politiikka on erilainen.",
        observed: "Syntyvyys laski vuoden 2010 jälkeen kaikissa Pohjoismaissa: Ruotsissa 1,98:sta 1,43:een, Norjassa 1,95:stä 1,45:een, Tanskassa 1,87:stä 1,47:ään ja Islannissa 2,20:sta 1,56:een.",
        verdict: "ei-yksin",
        caveat: "Ei selitä yhteistä laskua, mutta voi selittää, miksi Suomen taso on muita matalampi.",
        evidence: "nordic",
        sources: [{ label: "Eurostat demo_find", url: "https://ec.europa.eu/eurostat/databrowser/view/demo_find/default/table" }],
      },
      {
        id: "turva",
        short: "Turvan heikennykset",
        title: "Työn ja toimeentulon turvan heikentyminen",
        predicts: "Syntyvyys laskee nopeimmin, kun nuorten aikuisten turvaa heikennetään, ja kääntyy, kun turvaa parannetaan.",
        observed: "Heikennyksiä tehtiin vuosina 2016–2019 ja 2024, jolloin syntyvyys laski. Myös parannusten jälkeen (2020, 2022) lasku jatkui pienen nousun jälkeen.",
        verdict: "ei-testattu",
        caveat: "Ajoitus ei osoita syy-yhteyttä, eikä sille ole vertailuryhmää. Testaamiseen tarvittaisiin tutkimus, joka vertaa muutosten kohteena olleita muihin.",
        evidence: "decisions",
        sources: [
          { label: "HE 113/2016", url: "https://www.edilex.fi/he/20160113" },
          { label: "STM: aktiivimalli", url: "https://stm.fi/-/aktiivimalli-on-kumottu-vuoden-2020-alusta-alkaen" },
          { label: "Kela: työttömyysturva 2024", url: "https://www.kela.fi/ajankohtaista/kelan-tyottomyysturvaan-muutoksia-vuonna-2024" },
        ],
      },
    ],
    beats: [
      { at: 2000, until: 2009, text: "2000-luvulla syntyvyys pysyi kaikissa Pohjoismaissa 1,7–2,0 lapsessa naista kohden." },
      { at: 2010, text: "Käänne: syntyvyys alkaa laskea samaan aikaan kaikissa Pohjoismaissa, joiden perhepolitiikka on erilainen.", explanation: "pohjoismaat" },
      { at: 2013, text: "Lasku näkyy ensin esikoisissa: harvempi nainen saa ensimmäisen lapsen, ja esikoisen saavat ovat vanhempia.", explanation: "esikoiset" },
      { at: 2015, until: 2019, text: "Työllisyys nousee 67 prosentista 72 prosenttiin, mutta syntyvyys laskee nopeimmin juuri nyt.", explanation: "talous" },
      { at: 2016, until: 2019, text: "Samaan aikaan nuorten aikuisten turvaa heikennetään (▼). Ajoitus osuu yhteen, mutta vertailuryhmää ei ole.", explanation: "turva" },
      { at: 2019, text: "Rekisteritutkimus: noin kolme neljäsosaa esikoisten vähenemisestä tapahtui pareilla, neljännes parisuhteiden muutoksista.", explanation: "parisuhteet" },
      { at: 2020, until: 2022, text: "Turvaa parannetaan (▲). Syntyvyys nousee hetkeksi vuonna 2021 ja laskee taas." },
      { at: 2024, text: "Uudet heikennykset (▼). Syntyvyys on ennätysmatala, 1,25." },
      { at: 2025, text: "Syntyvyys nousee 1,30:een, ja nousu painottuu esikoisiin. Yksi vuosi ei vielä tee käännettä." },
    ],
    notTold: [
      "Kuinka suuri osa lapsettomuudesta on toivottua ja kuinka suuri tahatonta.",
      "Miksi esikoisia syntyy vähemmän myös pareille, joilla on yhteinen koti.",
      "Asumisen, arvojen ja epävarmuuden kokemuksen osuutta: niitä ei voi erottaa koko maan aikasarjoista.",
    ],
  },
];

/** Tahti, joka on voimassa vuonna `year` (viimeisin alkanut). */
export function currentBeat(beats: Beat[], year: number): Beat | null {
  let cur: Beat | null = null;
  for (const b of beats) if (b.at <= Math.floor(year)) cur = b;
  return cur;
}

/** Selitykset, joiden arvio on jo tullut aikajanalle vuoteen `year` mennessä, ilmestymisjärjestyksessä. */
export function revealedExplanations(beats: Beat[], year: number): { id: string; at: number }[] {
  return beats.filter((b) => b.explanation && b.at <= Math.floor(year)).map((b) => ({ id: b.explanation!, at: b.at }));
}

/** Sarjan pisteet vuoteen `year` asti; murtovuodelle lisätään tasaisesti interpoloitu kärkipiste animaatiota varten. */
export function pointsUntil(points: [number, number][], year: number): [number, number][] {
  const out = points.filter(([y]) => y <= year);
  const next = points.find(([y]) => y > year);
  const last = out.at(-1);
  if (last && next && year > last[0]) {
    const t = (year - last[0]) / (next[0] - last[0]);
    out.push([year, last[1] + t * (next[1] - last[1])]);
  }
  return out;
}
