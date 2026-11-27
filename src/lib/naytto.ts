// Näyttöverkko: hypoteesit, testit ja näytön kertymä. Rekisteri: docs/naytto-rekisteri.md (kirjattu
// ennen testejä), tulokset: src/data/naytto.json (scripts/naytto/build.py). Tilan säännöt ovat
// puhtaita funktioita, jotta ne voidaan testata ja ne ovat näkyvillä, eivät mustassa laatikossa.
import raw from "@/data/naytto.json";

export type Design = "annos" | "luonnollinen" | "toisto" | "ajoitus" | "tasmallisyys";
export type Result = "tukee" | "kumoaa" | "ei-ratkea" | "ei-testattu";
export type Status = "oletus" | "ehdokas" | "tuettu" | "vahvasti-tuettu" | "kumottu";

export const DESIGNS: Record<Design, { label: string; strength: "vahva" | "keski" | "heikko"; question: string }> = {
  annos: { label: "Annos–vaste", strength: "vahva", question: "Muuttuvatko enemmän altistuneet alueet tai ryhmät enemmän?" },
  luonnollinen: { label: "Luonnollinen koe", strength: "vahva", question: "Poikkeaako Suomi verrokeistaan juuri tapahtuman jälkeen?" },
  toisto: { label: "Toisto", strength: "keski", question: "Toistuuko sama yhteys muissa maissa?" },
  ajoitus: { label: "Ajoitus", strength: "heikko", question: "Muuttuuko syy ennen seurausta?" },
  tasmallisyys: { label: "Täsmällisyys", strength: "heikko", question: "Osuuko vaikutus juuri siihen, mihin mekanismi ennustaa?" },
};
export const RESULTS: Record<Result, { label: string; symbol: string }> = {
  tukee: { label: "Tukee", symbol: "✔" },
  kumoaa: { label: "Kumoaa", symbol: "✖" },
  "ei-ratkea": { label: "Ei ratkea", symbol: "◐" },
  "ei-testattu": { label: "Ei testattu", symbol: "?" },
};
export const STATUSES: Record<Status, { label: string; info: string; step: number }> = {
  oletus: { label: "Oletus", info: "ei vielä testattu", step: 0 },
  ehdokas: { label: "Ehdokas", info: "vähintään yksi testi tukee, mikään ei kumoa", step: 1 },
  tuettu: { label: "Tuettu", info: "kaksi eri asetelmaa tukee, niistä yksi vahva, mikään ei kumoa", step: 2 },
  "vahvasti-tuettu": { label: "Vahvasti tuettu", info: "lisäksi vähintään yksi ennuste on osunut", step: 3 },
  kumottu: { label: "Kumottu", info: "vahva asetelma tai kaksi testiä kumoaa", step: -1 },
};

export type Test = { id: string; design: Design; result: Result; summary: string; date?: string; detail?: unknown };
export type Prediction = {
  id: string; target: string; year: number; point: number; lo: number; hi: number;
  registered: string; basis: string; actual: number | null;
};

/** Ennusteen tila: odottaa, osui (toteutunut 80 %:n välillä) tai meni ohi. */
export const predictionState = (p: Prediction): "odottaa" | "osui" | "ohi" =>
  p.actual == null ? "odottaa" : p.actual >= p.lo && p.actual <= p.hi ? "osui" : "ohi";

/** Tilan säännöt (docs/naytto-rekisteri.md). */
export function statusOf(tests: Pick<Test, "design" | "result">[], predictions: Prediction[] = []): Status {
  const done = tests.filter((t) => t.result !== "ei-testattu");
  const against = done.filter((t) => t.result === "kumoaa");
  if (against.some((t) => DESIGNS[t.design].strength === "vahva") || against.length >= 2) return "kumottu";
  const support = done.filter((t) => t.result === "tukee");
  if (support.length === 0) return "oletus";
  // Yksi heikko kumoava testi ja tukevia testejä: näyttö on ristiriitaista, ei ehdokas (sääntö: mikään ei kumoa).
  if (against.length > 0) return "oletus";
  const designs = new Set(support.map((t) => t.design));
  const strong = support.some((t) => DESIGNS[t.design].strength === "vahva");
  if (designs.size >= 2 && strong) {
    return predictions.some((p) => predictionState(p) === "osui") ? "vahvasti-tuettu" : "tuettu";
  }
  return "ehdokas";
}

type H1Data = {
  tests: Test[];
  predictions: Prediction[];
  model: { a: number; b: number; sd: number; n: number };
  fiTfrLast: [number, number];
  nordic: { tfr: Record<string, [number, number][]>; uw: Record<string, [number, number][]> };
};
type Data = {
  built: string;
  hypotheses: { h1: H1Data; h2: { tests: Test[]; predictions: Prediction[] }; h3: { tests: Test[]; predictions: Prediction[] } };
};
export const NAYTTO = raw as unknown as Data;

export type Hypothesis = {
  id: string;
  title: string;
  claim: string;
  registered: string;
  preregistered: string; // mihin nähden ennalta kirjattu
  map: { edge: string; confidence: "vahva" | "kohtalainen" | "heikko" | null };
  tests: Test[];
  predictions: Prediction[];
  reading: string;
  next: string;
};

const h1 = NAYTTO.hypotheses.h1;
const t = (id: string, list: Test[]) => list.find((x) => x.id === id)!;

export const HYPOTHESES: Hypothesis[] = [
  {
    id: "h1",
    title: "Nuorten naisten työttömyys → syntyvyys",
    claim: "25–34-vuotiaiden naisten työttömyyden nousu laskee syntyvyyttä noin kahden vuoden viiveellä.",
    registered: "2026-11-27",
    preregistered: "Testit kirjattiin ennen ajoa. Lähtöhavainto (skanneri, r = −0,66) ei ollut ennalta kirjattu.",
    map: { edge: "Globaali finanssikriisi → Historiallisen matalan syntyvyyden aika", confidence: "heikko" },
    tests: h1.tests,
    predictions: [],
    reading:
      "Yhteys toistuu Pohjoismaissa, myös ilman Suomea. Maakuntien välillä sitä ei kuitenkaan ole: alueilla, joissa nuorten naisten työttömyys nousi muita enemmän, syntyvyys ei laskenut muita enemmän. Väite oman tai lähialueen työttömyyden vaikutuksesta kumoutuu. Jäljelle jää koko maan tilanteeseen liittyvä yhteys (H1b).",
    next: "Tarkennus kirjattiin uudeksi hypoteesiksi H1b.",
  },
  {
    id: "h1b",
    title: "Kansallinen talousepävarmuus → syntyvyys",
    claim: "Syntyvyys reagoi koko maan talousnäkymiin, joita nuorten aikuisten työttömyys mittaa, noin kahden vuoden viiveellä. Alue-eroja se ei selitä.",
    registered: "2026-11-27",
    preregistered: "Kirjattu H1:n testien jälkeen, joten H1:n tulokset eivät ole sille ennalta kirjattuja. Ennusteet ja tulevat testit ovat.",
    map: { edge: "Globaali finanssikriisi → Historiallisen matalan syntyvyyden aika", confidence: "heikko" },
    tests: [
      { ...t("toisto", h1.tests), summary: `${t("toisto", h1.tests).summary}. Testi tehtiin H1:lle ennen tätä merkintää.` },
      { id: "odotukset", design: "ajoitus", result: "ei-testattu", summary: "Kuluttajien luottamus edeltää syntyvyyttä Pohjoismaissa (ei vielä tehty)" },
    ],
    predictions: h1.predictions,
    reading: "Ennusteet perustuvat Pohjoismaiden yhteiseen malliin. Ne ratkeavat, kun Tilastokeskus julkaisee vuosien 2026 ja 2027 syntyvyysluvut.",
    next: "Odotustesti: jos kuluttajien luottamus edeltää syntyvyyttä vahvemmin kuin työttömyys, tarkennus vahvistuu.",
  },
  {
    id: "h3",
    title: "Kansanterveystyö 1972 → elinajanodote",
    claim: "Kansanterveyslaki ja Pohjois-Karjala-projekti (1972) nopeuttivat elinajanodotteen kasvua ennen kaikkea sydän- ja verisuonikuolleisuuden kautta.",
    registered: "2026-11-27",
    preregistered: "Alue- ja kuolinsyytestit kirjattiin ennen ajoa. Luonnollinen koe tehtiin päivää aiemmin Mitä jos? -näkymässä.",
    map: { edge: "Kansanterveyslaki (solmu, ei yhteyttä terveysvaikutuksiin)", confidence: null },
    tests: NAYTTO.hypotheses.h3.tests,
    predictions: [],
    reading:
      "Suomi erkani verrokeistaan juuri 1972 jälkeen, ja Pohjois-Karjalassa verenkiertoelinten kuolleisuuden osuus laski toiseksi eniten 23 alueesta. Projektin vertailualue Pohjois-Savo oli neljäs, mikä sopii siihen, että kansanterveystyö levisi nopeasti muuallekin. Koko maan kuolinsyytesti jäi rajan alle.",
    next: "Kartan aineistoon voisi lisätä yhteyden Kansanterveyslaki → elinajanodotteen nousu (ehdotus Lovableen).",
  },
  {
    id: "h2",
    title: "1990-luvun lama osui teollisuusalueisiin",
    claim: "Maakunnat, joissa teollisuuden ja rakentamisen osuus työllisistä oli 1989 suurempi, menettivät 1989–1993 enemmän työpaikkoja.",
    registered: "2026-11-25",
    preregistered: "Kirjattu ennen laskentaa (docs/skannauskoe.md, koe 2).",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h2.tests,
    predictions: [],
    reading: "Lama osui kaikkiin maakuntiin ja laajasti kaikkiin yksityisiin aloihin, joten toimialarakenne ei selitä alue-eroja. Tulos sopii laajaan kysynnän romahdukseen.",
    next: "Seuraava testi: selittääkö alueiden velkaantuminen tai pankkikriisin paikallinen vakavuus alue-erot?",
  },
];

export const hypothesis = (id: string) => HYPOTHESES.find((h) => h.id === id);
export const statusOfHypothesis = (h: Hypothesis) => statusOf(h.tests, h.predictions);
