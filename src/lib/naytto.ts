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
  firstbornCohorts: Test;
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
  hypotheses: { h1: H1Data; h1g: { tests: Test[]; predictions: Prediction[]; describe: Describe }; h1f: { tests: Test[]; predictions: Prediction[] }; h1e: { tests: Test[]; predictions: Prediction[]; model: { a: number; b: number; sd: number; n: number } }; h2: { tests: Test[]; predictions: Prediction[] }; h3: { tests: Test[]; predictions: Prediction[] }; h4: { tests: Test[]; predictions: Prediction[] }; h5: { tests: Test[]; predictions: Prediction[] }; h7: { tests: Test[]; predictions: Prediction[] }; h8: { tests: Test[]; predictions: Prediction[] }; h9: { tests: Test[]; predictions: Prediction[] }; h10: { tests: Test[]; predictions: Prediction[]; extra: Record<string, unknown> }; h11: { tests: Test[]; predictions: Prediction[] }; h12: { tests: Test[]; predictions: Prediction[] }; h13: { tests: Test[]; predictions: Prediction[] }; h15: { tests: Test[]; predictions: Prediction[] }; h16: { tests: Test[]; predictions: Prediction[] }; h14: { tests: Test[]; predictions: Prediction[]; extra: { dev1992_1999pct: number } }; h6: { tests: Test[]; predictions: Prediction[]; extra: Record<string, { dev: number; pct: number; percentile: number }> } };
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
    tests: [h1.firstborn, h1.firstbornCohorts],
    predictions: [],
    reading:
      "Esikoisten syntyvyys seurasi koko maan työttömyyttä selvästi, myöhempien lasten heikommin, kuten lykkääntyminen ennustaa. Ikäluokkatestissä huonona aikana työmarkkinoille tulleilla oli 30 ikävuoteen mennessä trendiin nähden vähemmän esikoisia (r = −0,88), mutta yhteys ei erottunut sattumasta, koska molemmat käyrät muuttuvat hitaasti. Raakaluvuissa laman ikäluokilla ei näy notkahdusta: ikäluokkien pitkä lasku on paljon suurempi kuin mahdollinen laman vaikutus. Hypoteesi on ehdokas, ei vielä tuettu.",
    next: "Lyhyiden, äkillisten muutosten testi: alueittainen tai vuosittainen vertailu, jossa hidas ikäluokkatrendi ei sotke. Toinen vaihtoehto on toistaa ikäluokkatesti Ruotsin aineistolla, jossa 1990-luvun lama osui eri ikäluokkiin.",
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
    id: "h4",
    title: "Työttömyys → julkisten palvelujen kasvu hidastuu",
    claim: "Kun työttömyys nousee, julkisten palvelujen (terveys, koulutus, hoiva) reaalikasvu hidastuu 1–2 vuoden päästä, kun taas rahaetuudet kasvavat automaattisesti.",
    registered: "2026-11-27",
    preregistered: "Seulan jyvä (aikajako). Toisto muissa maissa ja täsmällisyystesti kirjattiin ennen laskentaa.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h4.tests,
    predictions: [],
    reading:
      "Suomessa julkisten palvelujen kasvu on hidastunut työttömyyden noustessa, ja yhteys kesti seulan aikajaon. Ruotsissa ja Tanskassa sama yhteys on heikko. Lisäksi rahaetuuksien kasvu hidastui vähintään yhtä paljon kuin palvelujen, joten kyse näyttää olevan julkisten menojen yleisestä sopeuttamisesta, ei palveluihin kohdistuvasta leikkauksesta.",
    next: "Suomen erityispiirteen testi: kuntien palvelumenot ja valtionosuudet. Jos sopeutus kulki valtionosuuksien kautta, kuntien palvelujen kasvun pitäisi hidastua eniten niissä kunnissa, joiden tuloista valtionosuudet ovat suurin osa (annos–vaste).",
  },
  {
    id: "h5",
    title: "Nuorten aikuisten työttömyys pitkittyy",
    claim: "Työttömyysaalto jättää jäljen: pitkäaikaistyöttömien osuus nousee ja pysyy koholla, ja huonona aikana työmarkkinoille tulleet ikäluokat ovat vielä 33–37-vuotiaina muita harvemmin töissä.",
    registered: "2026-11-27",
    preregistered: "Seulan jyvä (maajako). Pysyvyys- ja ikäluokkatesti kirjattiin ennen laskentaa.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h5.tests,
    predictions: [],
    reading:
      "Työttömyyden nousua seuraa pitkäaikaistyöttömyyden kasvu, joka on vielä kolmen vuoden päästä koholla kaikissa neljässä Pohjoismaassa. Pitkän aikavälin jälki ei kuitenkaan näy: 1990-luvun laman aikana työmarkkinoille tulleet ikäluokat olivat 33–37-vuotiaina työllisyydeltään muiden tasolla. Työllisyydellä mitattuna jälki haalistuu noin kymmenessä vuodessa. Tulot, terveys ja perheen perustaminen ovat eri kysymyksiä, joita tämä testi ei mittaa.",
    next: "Tarkennus: jälki voi näkyä muualla kuin työllisyydessä. Seuraavaksi kannattaisi testata laman ikäluokkien tulot ja esikoisen saamisen ikä samalla ikäluokka-asetelmalla (aineisto: StatFin tulonjako ja 12dm).",
  },
  {
    id: "h6",
    title: "Alkoholiveron alennus 2004 → alkoholikuolleisuus",
    claim: "Alkoholiveron alennus maaliskuussa 2004 (noin kolmannes, samaan aikaan kun Viro liittyi EU:hun) nosti alkoholiperäistä kuolleisuutta. Muihin kuolinsyihin se ei vaikuttanut.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. Uusi teema, ei seulasta.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h6.tests,
    predictions: [],
    reading:
      "Alkoholikuolleisuus nousi vuodesta 2003 vuoteen 2007 noin kolmanneksella, kun alkoholin reaalihinta laski noin 15 %, ja kääntyi laskuun, kun hinta nousi veronkorotusten myötä vuosina 2008–2014. Järjestys sopii väitteeseen, ja myynnin ja kuolleisuuden yhteys vuositasolla tukee mekanismia. Kirjatut katkos- ja annostestit jäivät kuitenkin rajan alle: kuolleisuus nousi jo ennen alennusta, ja vuositason aineisto (alle 30 vuotta) on liian lyhyt erottamaan vaikutusta muusta vaihtelusta. Miehillä katkos oli selvempi kuin naisilla; henkirikoksissa sitä ei näy.",
    next: "Vahvempi asetelma vaatii tarkemman aineiston: kuukausittainen kuolleisuus (StatFin 11bf, 1969–) veronmuutosten ympärillä tai alue-erot Viron tuonnin mukaan (Etelä-Suomi vs. muut). Kuukausiaineisto erottaisi maaliskuun 2004 katkoksen vuoden sisäisestä vaihtelusta.",
  },
  {
    id: "h7",
    title: "Työttömyys → itsemurhat",
    claim: "Työttömyyden nousu lisää itsemurhia.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. Uusi teema, ei seulasta.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h7.tests,
    predictions: [],
    reading:
      "Maakunnissa, joissa työttömyys oli muita korkeampi, itsemurhia ei ollut seuraavana vuonna enempää, ja koko maan tasollakin yhteys on heikko. Työikäisten itsemurhat alkoivat nousta jo 1980-luvun lopulla ennen lamaa, olivat korkeimmillaan 1990–1993 ja kääntyivät pitkään laskuun 1990-luvun puolivälissä, vaikka työttömyys oli yhä korkea. Itsemurhakuolleisuuden pitkä lasku sopii paremmin muihin selityksiin, kuten mielenterveyspalvelujen ja -lääkityksen muutoksiin ja itsemurhien ehkäisyprojektiin (1986–1996), joita tämä testi ei mittaa.",
    next: "Muut selitykset testattiin: alkoholi (H8, ristiriitainen) ja masennuslääkkeet (H9, ehdokas).",
  },
  {
    id: "h8",
    title: "Alkoholi → itsemurhat",
    claim: "Alkoholinkäytön kasvu lisää itsemurhia.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. H7:n testaamaton selitys.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h8.tests,
    predictions: [],
    reading:
      "Suomessa alkoholin myynti ja työikäisten itsemurhat ovat liikkuneet yhdessä 1960-luvulta asti. Ruotsissa, Norjassa ja Tanskassa yhteys on kuitenkin päinvastainen, eikä vuoden 2004 veronalennus näy itsemurhissa, vaikka se näkyi alkoholikuolleisuudessa. Yhteys näyttää suomalaiselta erityispiirteeltä, esimerkiksi humalahakuisen juomatavan takia, mutta tätä selitystä ei ole testattu.",
    next: "Suomen erityispiirteen testi: jos humalahakuisuus selittää, yhteyden pitäisi olla vahvempi alkoholimyrkytysten ja väkevien juomien kuin oluen ja viinin myynnin kanssa.",
  },
  {
    id: "h9",
    title: "Masennuslääkkeet → itsemurhat",
    claim: "Masennuslääkkeiden käytön kasvu vähentää itsemurhia.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. H7:n testaamaton selitys.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h9.tests,
    predictions: [],
    reading:
      "Neljässä Pohjoismaassa yhdessä masennuslääkkeiden käytön kasvu on kulkenut itsemurhien vähenemisen kanssa samana vuonna, selvimmin Norjassa. Suomessa yhteys on päinvastainen, ja Suomen itsemurhien suurin lasku 1990-luvulla tapahtui ennen kuin lääkeaineisto alkaa. Samanaikainen yhteys ei kerro, kumpi muuttui ensin.",
    next: "Pidempi lääkeaineisto (Kela, Suomi 1990–) ja ikäryhmittäinen vertailu: jos lääkkeet vaikuttavat, itsemurhien pitäisi laskea eniten niissä ikäryhmissä, joissa käyttö kasvoi eniten.",
  },
  {
    id: "h10",
    title: "Oppivelvollisuuden laajennus 2021 → nuorten syrjäytyminen",
    claim: "Oppivelvollisuuden laajennus 18 ikävuoteen (ikäluokasta 2005) vähensi niiden 18-vuotiaiden osuutta, jotka eivät opiskele eivätkä ole töissä.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. Uusi teema.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h10.tests,
    predictions: [],
    reading:
      "Laajennuksen kaksi ensimmäistä ikäluokkaa eivät eronneet aiemmista: niiden 18-vuotiaiden osuus, jotka eivät opiskele eivätkä ole töissä, oli 2023–2024 noin 5 %, kuten aiemminkin, ja 21-vuotiailla muutos oli samaa luokkaa. Tulos koskee kuitenkin vain tilannetta vuoden lopussa, kun koko ikäluokka on jo täyttänyt 18 ja oppivelvollisuus on päättynyt. Sitä, pysyivätkö nuoret koulussa oppivelvollisuuden aikana, tästä aineistosta ei voi mitata, koska alle 18-vuotiaat on luokiteltu opiskelijoiksi.",
    next: "Oikea mittari olisi toisen asteen keskeyttäminen ja tutkinnon suorittaminen ikäluokittain (Tilastokeskus: koulutuksen keskeyttäminen ja sijoittuminen). Ensimmäiset luvut laajennuksen ikäluokista, jotka ovat suorittaneet tutkinnon tai eivät, valmistuvat vuosina 2025–2026.",
  },
  {
    id: "h11",
    title: "Ulkomaan kansalaisten osuus → Suomen kansalaisten työllisyys",
    claim: "Kun ulkomaan kansalaisten osuus työikäisistä kasvaa, Suomen kansalaisten työllisyys heikkenee.",
    registered: "2026-11-27",
    preregistered: "Päätestit kirjattiin ennen laskentaa. Tarkistukset ja niiden seuraukset kirjattiin päätestien jälkeen mutta ennen tarkistusten laskentaa.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h11.tests,
    predictions: [],
    reading:
      "Päätestissä maakunnissa, joissa ulkomaan kansalaisten osuus kasvoi muita enemmän, Suomen kansalaisten työllisyys oli seuraavana vuonna heikompi. Tarkistukset osoittivat, että yhteys syntyy alueiden pitkistä kehityssuunnista: osuus kaksi vuotta myöhemmin ”ennustaa” nykyistä työllisyyttä yhtä vahvasti, ja kun kunkin maakunnan oma kehityssuunta otetaan huomioon, yhteys katoaa. Ulkomaan kansalaisten osuus on siis kasvanut eniten maakunnissa, joiden työllisyys on kehittynyt muita heikommin, mutta aineisto ei osoita, että kasvu olisi heikentänyt työllisyyttä. Kansalaisuuden saamisen vaikutusta ryhmien koostumukseen ei voitu testata.",
    next: "Tarkempi testi vaatisi syntyperän tai kielen mukaan jaotellun alueaineiston, jolloin kansalaisuuden saaminen ei sotke vertailua, sekä asetelman, jossa maahanmuuton alueellinen jakautuminen ei riipu työpaikoista (esim. pakolaisten kuntasijoitus).",
  },
  {
    id: "h12",
    title: "Taantuma → vähemmän liikennekuolemia",
    claim: "Kun työttömyys nousee, liikennekuolemat vähenevät, koska työmatkoja ja muuta ajoa on vähemmän.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. Uusi teema. Maakuntatestissä vakiotarkistukset.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h12.tests,
    predictions: [],
    reading:
      "Ruotsissa, Norjassa ja Tanskassa liikennekuolemat ovat vähentyneet työttömyyden noustessa, kuten taantumahypoteesi ennustaa. Suomessa yhteys on heikompi ja 2000-luvulla jopa päinvastainen. Maakuntien välinen yhteys näytti aluksi tukevan väitettä, mutta vakiotarkistus osoitti sen syntyvän alueiden pitkistä kehityssuunnista: liikennekuolemat ovat vähentyneet eniten maakunnissa, joissa työttömyys on kehittynyt muita heikommin.",
    next: "Mekanismin testi: jos taantuma vähentää ajamista, liikennesuoritteen (ajetut kilometrit) pitäisi laskea työttömyyden noustessa, ja liikennekuolemat ajettua kilometriä kohden eivät muuttuisi. Suomen poikkeavuutta voisi tutkia vertaamalla, miten ajosuorite on Suomessa reagoinut suhdanteisiin.",
  },
  {
    id: "h13",
    title: "Talouskasvun ja päästöjen irtikytkentä",
    claim: "Talouskasvu ja päästöt kulkivat ennen tiiviisti yhdessä, mutta vuodesta 2005 alkaen yhteys heikkeni: päästöjen jousto BKT:n suhteen on pienempi, ja päästöt laskevat vaikka talous kasvaa.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. Uusi teema.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h13.tests,
    predictions: [],
    reading:
      "Tulos on kaksijakoinen. Päästöt laskivat vuodesta 2005 kaikissa neljässä Pohjoismaassa 18–46 %, vaikka talous kasvoi 14–39 %: pitkä kehityssuunta irtosi kasvusta. Vuodesta toiseen päästöt seuraavat taloutta kuitenkin edelleen, jopa tiiviimmin kuin ennen: taantumissa 2009 ja 2020 ne laskivat jyrkästi. Kirjattu mittari, vuosimuutosten jousto, mittasi suhdanneherkkyyttä eikä pitkää kehitystä, joten hypoteesi kumoutui sääntöjen mukaan, vaikka väitteen ydin näkyy aineistossa.",
    next: "Tarkennus oikealla mittarilla (H13b): päästöjen muutos nollakasvun vuonna (vakiotermi) ennen ja jälkeen 2005. Koska luvut on jo nähty, testi ei olisi ennalta kirjattu; uusi ennalta kirjattava testi olisi esimerkiksi ennuste vuoden 2025 päästöistä BKT-ennusteen perusteella.",
  },
  {
    id: "h14",
    title: "Avioerolain uudistus 1988 → avioerot",
    claim: "Avioliittolain uudistus 1.1.1988, joka poisti syyllisyysperusteet ja salli eron puolen vuoden harkinta-ajan jälkeen, lisäsi avioeroja.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. Uusi teema.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h14.tests,
    predictions: [],
    reading:
      "Avioeroja oli 1988–1991 noin 39 % enemmän kuin aiempi kehitys ennusti, ja poikkeama oli suurempi kuin missään tavallisessa jaksossa 1960-luvulta alkaen. Solmittujen avioliittojen määrä pysyi ennallaan, joten muutos koski juuri eroja. Taso ei palannut: vielä 1990-luvun lopulla avioeroja oli noin puolet enemmän kuin vanha trendi ennusti. Uudistus ei siis vain purkanut kasautuneita eroja, vaan muutti avioerojen tason pysyvästi.",
    next: "Kartan aineistoon voisi lisätä yhteyden avioliittolain uudistuksesta (1988) avioerojen tasoon (ehdotus Lovableen). Jatkotesti: näkyykö muutos eniten pitkissä avioliitoissa, joissa syyllisyysperusteet olivat aiemmin suurin este?",
  },
  {
    id: "h15",
    title: "Euron käyttöönotto 2002 → hinnat",
    claim: "Euron käyttöönotto käteisenä tammikuussa 2002 nosti hintoja Suomessa, koska hintoja pyöristettiin ylöspäin. Vaikutus näkyy eniten pienissä ostoksissa, kuten ravintoloissa ja kahviloissa.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. Uusi teema.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h15.tests,
    predictions: [],
    reading:
      "Euron käyttöönotto ei näy Suomen vuosi-inflaatiossa, kun sitä verrataan Ruotsiin, Tanskaan ja Norjaan, joissa euroa ei otettu käyttöön: ero vuonna 2002 oli +0,3 prosenttiyksikköä, mikä on tavallista vuosivaihtelua. Ravintoloiden ja kahviloiden hinnat, joissa pyöristyksen pitäisi näkyä selvimmin, nousivat Suomessa vähemmän kuin vertailumaissa. Testi mittaa tilastoitua hintatasoa, ei koettua inflaatiota; kokemus kalliimmasta arjesta voi johtua näkyvistä pienistä hinnoista, joita indeksi painottaa vähän.",
    next: "Tarkempi testi: kuukausi-indeksi (tammikuu 2002) ja yksittäiset pienet ostokset, kuten kahvikuppi ja parturi, joiden hinnoissa pyöristys näkyisi suoraan.",
  },
  {
    id: "h16",
    title: "Kieltolain kumoaminen 1932 → henkirikokset",
    claim: "Kieltolain kumoaminen 5.4.1932 vähensi henkirikoksia, koska laittomien alkoholimarkkinoiden väkivalta väheni.",
    registered: "2026-11-27",
    preregistered: "Kirjattu ennen laskentaa. Uusi teema.",
    map: { edge: "ei omaa yhteyttä kartassa", confidence: null },
    tests: NAYTTO.hypotheses.h16.tests,
    predictions: [],
    reading:
      "Tappoja ja murhia oli kumoamisen jälkeisinä vuosina 1933–1937 kolmannes vähemmän kuin kieltolain viimeisinä vuosina, ja lasku oli jyrkempi kuin yhdessäkään tavallisessa viisivuotisjaksossa sotien jälkeen. Pahoinpitelyt eivät kuitenkaan vähentyneet. Tämä sopii ajatukseen, että kuolemaan johtanut väkivalta liittyi salakauppaan ja trokaukseen eikä alkoholinkäyttöön yleensä, mutta sitä ei ole testattu. Henkirikokset olivat huipussaan jo 1929, joten lama ja muut 1930-luvun muutokset voivat selittää osan laskusta.",
    next: "Mekanismin testi: jos laskun takana on laittomien markkinoiden väheneminen, henkirikosten pitäisi vähentyä eniten alueilla, joilla salakuljetus oli yleisintä (rannikko ja satamakaupungit), ja salakuljetusrikosten määrän pitäisi pudota kumoamisen jälkeen.",
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
