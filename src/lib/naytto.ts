// Näyttöverkko: hypoteesit, testit ja näytön kertymä. Rekisteri: docs/naytto-rekisteri.md (kirjattu
// ennen testejä), tulokset: src/data/naytto.json (scripts/naytto/build.py). Tilan säännöt ovat
// puhtaita funktioita, jotta ne voidaan testata ja ne ovat näkyvillä, eivät mustassa laatikossa.
import raw from "@/data/naytto.json";

export type Design = "annos" | "luonnollinen" | "toisto" | "ajoitus" | "tasmallisyys";
export type Result = "tukee" | "kumoaa" | "ei-ratkea" | "ei-testattu";
export type Status = "oletus" | "ristiriita" | "ehdokas" | "tuettu" | "vahvasti-tuettu" | "kumottu";

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
  oletus: { label: "Oletus", info: "ei vielä testattu, tai testit eivät ratkaisseet", step: 0 },
  ristiriita: { label: "Ristiriitainen", info: "testejä puolesta ja vastaan, mutta kumoavat eivät riitä kumoamaan (sääntö lisätty 27.11.2026)", step: 0 },
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
  // Tukevia testejä ja yksi heikko kumoava: ristiriitainen (sääntölisäys 27.11.2026).
  if (against.length > 0) return "ristiriita";
  const designs = new Set(support.map((t) => t.design));
  const strong = support.some((t) => DESIGNS[t.design].strength === "vahva");
  if (designs.size >= 2 && strong) {
    return predictions.some((p) => predictionState(p) === "osui") ? "vahvasti-tuettu" : "tuettu";
  }
  return "ehdokas";
}

type H1Data = {
  tests: Test[];
  expectations: Test;
  temporary: Test;
  firstborn: Test;
  predictions: Prediction[];
  model: { a: number; b: number; sd: number; n: number };
  fiTfrLast: [number, number];
  nordic: { tfr: Record<string, [number, number][]>; uw: Record<string, [number, number][]> };
};
export type Describe = {
  income2008: Record<string, [number, number][]>;
  dti: Record<string, [number, number][]>;
  moneyGrowth: [number, number][];
  creditGrowth: [number, number][];
  recovery: Record<string, { g2008_2015: number; g2015_2019: number; peak2008_2014: [number, number]; dipFrom: number | null; regained: number | null }>;
};
type Data = {
  built: string;
  hypotheses: { h1: H1Data; h1g: { tests: Test[]; predictions: Prediction[]; describe: Describe }; h1f: { tests: Test[]; predictions: Prediction[] }; h1e: { tests: Test[]; predictions: Prediction[]; model: { a: number; b: number; sd: number; n: number } }; h2: { tests: Test[]; predictions: Prediction[] }; h3: { tests: Test[]; predictions: Prediction[] } };
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
      h1.expectations,
    ],
    predictions: h1.predictions,
    reading:
      "Odotustesti kumosi mielialaan perustuvan selityksen: kuluttajien luottamuksen nousua ei seurannut syntyvyyden nousu, vaikka nuorten naisten työttömyys samoissa maissa ja samoina vuosina ennusti syntyvyyttä selvästi. Syntyvyys näyttää seuraavan koko maan työmarkkinatilannetta, ei yleistä talousmielialaa eikä oman alueen työttömyyttä. Ennusteet vuosille 2026 ja 2027 ratkeavat, kun Tilastokeskus julkaisee syntyvyysluvut.",
    next: "Tarkennus kirjattiin uudeksi hypoteesiksi H1c (työn epävarmuus).",
  },
  {
    id: "h1c",
    title: "Nuorten aikuisten työn epävarmuus → syntyvyys",
    claim: "Syntyvyys seuraa nuorten aikuisten työn epävarmuutta koko maassa. Määräaikaisuus mittaa epävarmuutta työttömyyttä suoremmin, koska se koskee myös niitä, joilla on työ.",
    registered: "2026-11-27",
    preregistered: "Kirjattu H1:n ja H1b:n testien jälkeen ja ennen määräaikaisuustestin laskentaa.",
    map: { edge: "Globaali finanssikriisi → Historiallisen matalan syntyvyyden aika", confidence: "heikko" },
    tests: [h1.temporary],
    predictions: [],
    reading:
      "Määräaikaisuus ei ennustanut syntyvyyttä missään neljästä maasta, eikä se lisännyt mitään työttömyyden lisäksi. Työttömyys ennusti samoissa maissa ja samoina vuosina selvästi. Kolmen tarkennuksen jälkeen jäljelle jää kapea havainto: syntyvyys seuraa koko maan nuorten naisten työttömyyttä kahden vuoden viiveellä, mutta ei alueen omaa työttömyyttä, ei mielialaa eikä määräaikaisuutta. Mekanismi on vielä auki.",
    next: "Perheen perustamisen lykkääntyminen kirjattiin uudeksi hypoteesiksi H1d. Politiikkareitti (perhepolitiikka ja julkinen talous reagoivat työttömyyteen) on vielä testaamatta.",
  },
  {
    id: "h1d",
    title: "Perheen perustamisen lykkääntyminen → syntyvyys",
    claim: "Koko maan nuorten naisten työttömyys kuvaa sitä, kuinka vaikeaa on vakiinnuttaa työura. Se siirtää perheen perustamista, joten vaikutus näkyy ennen kaikkea esikoisissa.",
    registered: "2026-11-27",
    preregistered: "Kirjattu H1:n, H1b:n ja H1c:n testien jälkeen ja ennen esikoistestin laskentaa.",
    map: { edge: "Globaali finanssikriisi → Historiallisen matalan syntyvyyden aika", confidence: "heikko" },
    tests: [h1.firstborn],
    predictions: [],
    reading:
      "Esikoisten syntyvyys seurasi työttömyyttä selvästi, myöhempien lasten heikommin, kuten lykkääntyminen ennustaa. Ero esikoisten ja myöhempien lasten välillä ei kuitenkaan ole itsessään merkitsevä, ja maittain kuva vaihtelee: Suomessa ja Ruotsissa molemmat reagoivat, Norjassa ja Tanskassa yhteys on heikko. Hypoteesi on ehdokas, ei vielä tuettu.",
    next: "Vahvempi asetelma: annos–vaste ikäryhmittäin. Jos lykkääntyminen pitää, 25–29-vuotiaiden esikoisten pitäisi reagoida enemmän kuin yli 35-vuotiaiden, joilla lykkäämisen varaa on vähemmän. Lisäksi ennuste: esikoisten osuuden pitäisi laskea vuoteen 2026, koska työttömyys nousi 2024.",
  },
  {
    id: "h1e",
    title: "Nuorten aikuisten työllisyys → syntyvyys",
    claim: "Kun 30–34-vuotiaiden työllisyys paranee, syntyvyys nousee noin kahden vuoden päästä.",
    registered: "2026-11-27",
    preregistered: "Seulan jyvä. Seulan vahvistus tehtiin ennen tätä merkintää. Annos–vaste ja ennusteet kirjattiin ennen laskentaa.",
    map: { edge: "Globaali finanssikriisi → Historiallisen matalan syntyvyyden aika", confidence: "heikko" },
    tests: NAYTTO.hypotheses.h1e.tests,
    predictions: NAYTTO.hypotheses.h1e.predictions,
    reading:
      "Seula löysi yhteyden Suomesta, ja se vahvistui Ruotsissa, Norjassa ja Tanskassa. Maakuntien välillä se ei kuitenkaan näy: alueilla, joissa nuorten aikuisten työllisyys parani muita enemmän, syntyvyys ei noussut muita enemmän. Sama kuvio toistui työttömyydellä (H1). Työmarkkinat ja syntyvyys liikkuvat yhdessä koko maan tasolla, mutta oman alueen työtilanne ei näytä olevan reitti.",
    next: "Asuntomarkkinareitti testattiin (H1f). Muuttoliikkeen vaikutuksen voi tarkistaa vertaamalla maakuntia, joista muutetaan vähän.",
  },
  {
    id: "h1f",
    title: "Asuntomarkkinat → syntyvyys",
    claim: "Perheasunnon hinta ratkaisee: kun asuntojen reaalihinnat tai korot nousevat, syntyvyys laskee noin 1–2 vuoden päästä. Yhteys on vähintään yhtä vahva kuin työllisyyden.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa H1:n ja H1e:n tulosten jälkeen.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h1f.tests,
    predictions: [],
    reading:
      "Asuntojen hinnat ja korot liikkuivat odotettuun suuntaan, mutta yhteys syntyvyyteen oli heikko ja selvästi heikompi kuin työllisyyden samoilla vuosilla ja samoissa maissa. Asuntomarkkinat eivät näillä mittareilla selitä, miksi syntyvyys seuraa koko maan työmarkkinoita. Hintatesti kattaa vain vuodet 2005–, joten pieni vaikutus voi jäädä näkymättä.",
    next: "Seuraava kansallinen reitti: perhepolitiikka. Jos etuuksien ja päivähoidon muutokset reagoivat työttömyyteen ja syntyvyys niihin, päätösten ajoitus kertoo sen.",
  },
  {
    id: "h1g",
    title: "Rahan riittävyys → syntyvyys",
    claim: "Kun kotitalouksien käytettävissä olevat reaalitulot tai luotonsaanti kasvavat, syntyvyys nousee noin 1–2 vuoden päästä. Yhteys on vähintään yhtä vahva kuin työllisyyden.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa käyttäjän kysymyksestä: vähensikö finanssikriisi kotitalouksien rahaa, ja näkyykö se syntyvyydessä?",
    map: { edge: "Globaali finanssikriisi → Historiallisen matalan syntyvyyden aika", confidence: "heikko" },
    tests: NAYTTO.hypotheses.h1g.tests,
    predictions: [],
    reading:
      "Kotitalouksien reaalitulot ennustavat syntyvyyttä selvästi koko maan tasolla, erityisesti Suomessa, mutta heikommin kuin työllisyys. Maakuntien välillä yhteys on väärän suuntainen: alueilla, joiden tulot nousivat muita enemmän, syntyvyys ei noussut muita enemmän. Kolmas kerta sama kuvio: työttömyys, työllisyys ja tulot ennustavat syntyvyyttä maiden tasolla mutta eivät maakuntien välillä.",
    next: "Toistuva kuvio on nyt oma kysymyksensä: miksi syntyvyys seuraa koko maan tilannetta mutta ei oman alueen? Testattavia selityksiä ovat muuttoliike (perheet muuttavat), kansalliset päätökset ja yhteinen ilmapiiri. Muuttoliikkeen voi testata vertaamalla maakuntia, joihin ja joista muutetaan vähän.",
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
