// Mitä jos -tilanteet 1850–2025: Suomi verrattuna "synteettiseen Suomeen" (vertailumaiden painotettu
// yhdistelmä, joka seurasi Suomea 15 vuotta ennen tilannetta). Aineisto: src/data/mitajos.json
// (scripts/mitajos/build-site-data.py). Tekstien luvut tarkistetaan testeissä (mitajos.test.ts).
import raw from "@/data/mitajos.json";

export type Ind = "gdp_pcap" | "lex";
export type EventData = {
  id: string;
  ind: Ind;
  T: number;
  years: number[];
  actual: number[];
  synthetic: number[];
  gap: number[]; // BKT: % ero, elinajanodote: vuotta
  placebo: Record<string, number[]>;
  weights: Record<string, number>;
  rank: number;
  n: number;
  preRmspe: number;
};
type Data = {
  source: string;
  pre: number;
  h: number;
  names: Record<string, string>;
  indicators: Record<Ind, { label: string; log: boolean }>;
  events: EventData[];
  scan: Record<Ind, [number, number, number][]>; // vuosi, Suomen sija, maiden määrä
};
export const MITAJOS = raw as unknown as Data;

export type Reliability = "selva" | "kohtalainen" | "heikko";
export const RELIABILITY: Record<Reliability, { label: string; info: string }> = {
  selva: { label: "Selvä", info: "Suomen poikkeama oli suurin kaikista verrattavista maista" },
  kohtalainen: { label: "Kohtalainen", info: "Suomen poikkeama oli kärkipäässä, mutta joku vertailumaa poikkesi yhtä paljon tai enemmän" },
  heikko: { label: "Heikko", info: "synteettinen Suomi ei seurannut Suomea hyvin tai verrokkeja on liian vähän" },
};

export type Situation = {
  id: string;
  title: string;
  question: string;
  finding: string;
  reading: string;
  caveat: string;
  reliability: Reliability;
};

/** Tilanteet aikajärjestyksessä. Luvut tarkistetaan testissä aineistoa vasten. */
export const SITUATIONS: Situation[] = [
  {
    id: "nalka",
    title: "Nälkävuodet 1867–68",
    question: "Mitä jos Suomen elinajanodote olisi kulkenut kuten Ruotsin ja Norjan?",
    finding: "Elinajanodote oli vuonna 1868 noin 27 vuotta synteettistä Suomea alempana, mutta jo seuraavana vuonna sen yläpuolella.",
    reading: "Isku oli raju ja lyhyt. Nälkävuosien jälkeen kuolleisuus oli hetken tavallista pienempi, koska heikoimmat olivat jo kuolleet (kuolleisuuden siirtymä).",
    caveat: "Vertailumaita on vain seitsemän, koska useimpien maiden 1800-luvun elinajanodote on Gapminderissa interpoloitu.",
    reliability: "selva",
  },
  {
    id: "1918",
    title: "Sisällissota 1918: talous",
    question: "Mitä jos Suomi olisi kulkenut kuten ensimmäisessä maailmansodassa puolueettomat maat?",
    finding: "BKT asukasta kohti oli 22 % synteettistä Suomea alempana vuonna 1918, ja ero oli kurottu kiinni vuoteen 1921 mennessä.",
    reading: "Sisällissodan taloudellinen isku oli suuri mutta lyhyt. Ero alkoi jo 1917, kun Venäjän kauppa ja elintarviketuonti romahtivat.",
    caveat: "Verrokkeina vain puolueettomat maat (Tanska, Sveitsi, Alankomaat, Ruotsi, Norja, Espanja), joten maailmansodan oma vaikutus on rajattu pois. Ero sisältää sekä Venäjän romahduksen että sisällissodan.",
    reliability: "selva",
  },
  {
    id: "1918l",
    title: "Sisällissota 1918: elinajanodote",
    question: "Mitä jos Suomen kuolleisuus olisi kulkenut kuten puolueettomien naapurimaiden?",
    finding: "Elinajanodote oli vuonna 1918 noin 12,7 vuotta synteettistä Suomea alempana ja palasi verrokkien tasolle 1921.",
    reading: "Sota, vankileirit ja espanjantauti osuivat samaan aikaan. Ne eivät erotu tästä toisistaan.",
    caveat: "Espanjantauti osui myös vertailumaihin, joten ero kuvaa sitä, mikä Suomessa oli niitä pahempaa.",
    reliability: "selva",
  },
  {
    id: "sota",
    title: "Sodat 1939–44",
    question: "Mitä jos Suomi olisi välttänyt sodan kuten Ruotsi?",
    finding: "BKT asukasta kohti ei poikennut synteettisestä Suomesta poikkeuksellisesti: ero vaihteli −9 ja +11 %:n välillä.",
    reading: "Sotatalous piti tuotannon käynnissä. Sodan hinta näkyi ihmishenkinä, kulutuksena ja sotakorvauksina, ei suoraan BKT:ssa.",
    caveat: "Sotaa käymättömiä verrokkeja on vähän, ja synteettinen Suomi on 95-prosenttisesti Ruotsi. Arvio on siksi heikko.",
    reliability: "heikko",
  },
  {
    id: "jalleen",
    title: "Jälleenrakennus 1950–60",
    question: "Mitä jos Suomi olisi kasvanut kuten Tanska ja Australia?",
    finding: "BKT asukasta kohti oli vuonna 1960 noin 16 % synteettistä Suomea korkeampi.",
    reading: "Suomi kasvoi verrokkejaan nopeammin: teollistuminen, sotakorvausteollisuus ja Korean sodan suhdanne.",
    caveat: "Yksi vertailumaa kasvoi suhteessa vielä enemmän, joten Suomi oli toinen 15 maasta.",
    reliability: "kohtalainen",
  },
  {
    id: "terveys",
    title: "Kansanterveystyö 1970-luvulla",
    question: "Mitä jos Suomen elinajanodote olisi kasvanut kuten muun Länsi-Euroopan?",
    finding: "Ero alkoi kasvaa vuonna 1972 ja oli 1,2 vuotta vuonna 1982.",
    reading: "Ajoitus sopii kansanterveyslakiin ja Pohjois-Karjala-projektiin (molemmat 1972). Tämä on ehdokas, ei testi: jos selitys pitää, eron pitäisi näkyä sydän- ja verisuonikuolleisuudessa ja ensin Pohjois-Karjalassa.",
    caveat: "Esijakso oli hyvin tasainen, mikä tekee pienestäkin erosta näkyvän. Yksi vertailumaa poikkesi suhteessa enemmän.",
    reliability: "kohtalainen",
  },
  {
    id: "lama",
    title: "1990-luvun lama",
    question: "Mitä jos Suomi olisi kulkenut kuten Ruotsi, Norja, Italia ja Portugali?",
    finding: "BKT asukasta kohti oli vuonna 1993 noin 14 % synteettistä Suomea alempana ja vielä vuonna 2000 noin 7 %.",
    reading: "Ero oli pidempikestoinen kuin sisällissodan: kymmenessä vuodessa siitä oli kurottu kiinni noin puolet.",
    caveat: "Kahdella vertailumaalla oli suhteessa yhtä suuri muutos (osin öljyn ja oman kriisin takia), joten Suomi oli kolmas 15 maasta.",
    reliability: "kohtalainen",
  },
  {
    id: "finanssi",
    title: "Finanssikriisi ja menetetty vuosikymmen",
    question: "Mitä jos Suomi olisi kulkenut kuten Ruotsi vuoden 2008 jälkeen?",
    finding: "Synteettinen Suomi ei pystynyt seuraamaan Nokia-vuosien kasvua, joten ero oli jo lähtövuonna +7 %.",
    reading: "Vuoteen 2015 mennessä ero oli −5 %, mutta koska vertailu oli vinossa jo alussa, tätä ei voi lukea kriisin vaikutukseksi.",
    caveat: "Esijakson virhe oli suuri ja Suomi oli 15 maan joukossa viimeinen. Arvio ei ole luotettava.",
    reliability: "heikko",
  },
];

export const eventData = (id: string) => MITAJOS.events.find((e) => e.id === id);
export const valueAt = (e: EventData, key: "actual" | "synthetic" | "gap", year: number) => {
  const i = e.years.indexOf(year);
  return i < 0 ? undefined : e[key][i];
};

/** Synteettisen Suomen resepti luettavassa muodossa, suurin paino ensin. */
export function recipe(e: EventData): string {
  return Object.entries(e.weights)
    .sort((a, b) => b[1] - a[1])
    .map(([c, w]) => `${Math.round(w * 100)} % ${MITAJOS.names[c] ?? c}`)
    .join(" + ");
}

/** Sijoittuuko Suomi ensimmäiseksi (selvä), kärkeen (sija ≤ 3) vai ei. */
export const rankReliability = (e: EventData): Reliability =>
  e.rank === 1 ? "selva" : e.rank <= 3 ? "kohtalainen" : "heikko";

/** Skannauksen vuodet, joina Suomi oli suurin tai toiseksi suurin poikkeama, jaksoiksi koottuina. */
export function standoutSpans(ind: Ind, maxRank = 2): { from: number; to: number; best: number }[] {
  const out: { from: number; to: number; best: number }[] = [];
  for (const [y, rank] of MITAJOS.scan[ind]) {
    if (rank > maxRank) continue;
    const last = out.at(-1);
    if (last && y - last.to <= 1) { last.to = y; last.best = Math.min(last.best, rank); }
    else out.push({ from: y, to: y, best: rank });
  }
  return out;
}
