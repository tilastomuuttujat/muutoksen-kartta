# Ehdotus: yksin asuminen kartalle

Kartalta puuttuu kokonaan yksin asumisen yleistyminen, vaikka se on yksi Suomen suurimmista
kotitalousrakenteen muutoksista ja kytkeytyy suoraan syntyvyyteen. Tämä ehdotus lisää kolme
ilmiötä ja kuusi kytkentää Supabasen `items`- ja `relations`-tauluihin.

Kartan data on Supabasessa, jota hallitaan Lovablessa. Vie ehdotus sinne (esim. pyytämällä
Lovablea lisäämään alla olevat rivit) ja päivitä sitten kartan staattinen aineisto komennolla
`python3 scripts/build-murros-data.py` (vaatii palveluavaimen, ks. AGENTS.md).

## Näyttö

Tilastokeskus, StatFin [15fi](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__asku/statfin_asku_pxt_15fi.px/)
ja [12c6](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__perh/statfin_perh_pxt_12c6.px/), haettu 22.11.2026.
Sama data on poikkeamanäkymässä (`/poikkeamat`, elämänalue Hyvinvointi ja hoiva).

| Mittari | 1992 | 2010 | 2015 | 2020 | 2025 |
| --- | --- | --- | --- | --- | --- |
| Yhden hengen asuntokuntien osuus asuntokunnista | – | 41,0 % | 42,2 % | 45,3 % | 46,7 % |
| Yksin asuvien osuus väestöstä | 13,7 % | 19,4 % | – | 22,7 % | 23,7 % |
| Yksin asuvat 20–24-v. | 12,9 % | 25,9 % | 27,2 % | 37,5 % | 37,4 % |
| Yksin asuvat 25–29-v. | 16,8 % | 24,7 % | 25,7 % | 32,0 % | 33,7 % |
| Yksin asuvat 30–34-v. | 13,2 % | 18,7 % | 19,9 % | 23,5 % | 26,1 % |
| Lapsiperheen vanhempana (puolisona) 30–34-v. | 56,0 % | 47,3 % | 44,2 % | 37,6 % | 32,0 % |

20–24-vuotiaiden yksin asuminen nousi vuosina 2015–2023 noin 27 %:sta 41 %:iin ja kääntyi
vuosina 2024–2025 laskuun ensimmäistä kertaa tarkastelujaksolla (40,8 % → 37,4 %).

## Ilmiöt (`items`)

Kentät kuten tietokannan muissa ilmiöissä; `unpublished: false`.

```json
[
  {
    "id": "yksin-asumisen-yleistyminen",
    "title": "Yksin asumisen yleistyminen",
    "type": "rakennemuutos",
    "subtype": "kotitalousrakenteen muutos",
    "year_start": 1992,
    "year_end": 2050,
    "phase": "1990–2007",
    "domains": ["asuminen", "perhe", "väestö", "hyvinvointi"],
    "importance": 4,
    "problem": "Yhä useampi asuu yksin: vuonna 2025 yhden hengen asuntokuntia oli 46,7 % kaikista asuntokunnista, ja yksin asui 1,34 miljoonaa ihmistä eli 23,7 % väestöstä (1992: 13,7 %).",
    "mechanism": "Ikääntyminen ja leskeys kasvattavat yksin asuvien vanhusten määrää, ja nuoret aikuiset asuvat yhä pidempään yksin ennen parisuhdetta tai sen sijaan. 25–29-vuotiaista yksin asui 16,8 % vuonna 1992 ja 33,7 % vuonna 2025.",
    "long_effect": "Asuntokunnat pienenivät (2,45 henkeä 1990, 1,96 henkeä 2024), pienten asuntojen kysyntä kasvoi, ja perheen perustamisen iässä lapsiperheissä elävien osuus laski: 30–34-vuotiaista puolisona lapsiperheessä 56 % vuonna 1992, 32 % vuonna 2025.",
    "current_relevance": "Kertoo parisuhteiden muodostumisesta ja kotitalouksien taloudellisesta liikkumavarasta. Huom.: noin puolet asuntokunnista on yhden hengen, mutta yksin asuu noin neljännes väestöstä.",
    "effects": [
      "yhden hengen asuntokuntien osuus 39,7 % (2005) → 46,7 % (2025)",
      "yksin asuvat 25–29-vuotiaat 16,8 % (1992) → 33,7 % (2025)",
      "lapsiperheen vanhempana 30–34-vuotiaat 56,0 % (1992) → 32,0 % (2025)",
      "yksin asuvista 38 % yli 65-vuotiaita (2025)"
    ],
    "sources": ["Tilastokeskus: StatFin 15fi (asuntokunnat koon mukaan)", "Tilastokeskus: StatFin 12c6 (väestö perheaseman mukaan)"],
    "confidence": "kohtalainen",
    "evidence_confidence": "vahva",
    "interpretation_confidence": "kohtalainen"
  },
  {
    "id": "nuorten-yksin-asumisen-kiihtyminen-2017",
    "title": "Nuorten aikuisten yksin asumisen kiihtyminen",
    "type": "väestömuutos",
    "subtype": "kotitalousrakenteen muutos",
    "year_start": 2017,
    "year_end": 2023,
    "phase": "2008–2026",
    "domains": ["asuminen", "nuoret", "opiskelijat", "perhe"],
    "importance": 3,
    "problem": "Vuosina 2015–2023 20–24-vuotiaiden yksin asuminen nousi noin 27 %:sta 41 %:iin ja 25–29-vuotiaiden 26 %:sta 34 %:iin. Muutos oli nopeampi kuin kertaakaan vuodesta 1992.",
    "mechanism": "Kiihtyminen ajoittuu opiskelijoiden siirtoon yleisen asumistuen piiriin (2017). Myös pienten asuntojen tuotanto oli vilkasta. Kumpaakaan vaikutusta ei ole tässä erikseen osoitettu.",
    "long_effect": "Vuosina 2024–2025 20–24-vuotiaiden yksin asuminen kääntyi laskuun (40,8 % → 37,4 %) asumistuen leikkausten jälkeen.",
    "current_relevance": "Nuorten asumismuoto reagoi asumistuen sääntöihin; tällä on merkitystä parisuhteiden muodostumiselle ja taloudelliselle liikkumavaralle.",
    "effects": ["yksin asuvat 20–24-vuotiaat 27,2 % (2015) → 40,8 % (2023)", "yksin asuvat 25–29-vuotiaat 25,7 % (2015) → 34,2 % (2023)"],
    "sources": ["Tilastokeskus: StatFin 12c6 (väestö perheaseman mukaan)"],
    "confidence": "kohtalainen",
    "evidence_confidence": "vahva",
    "interpretation_confidence": "heikko"
  },
  {
    "id": "opiskelijat-yleiseen-asumistukeen-2017",
    "title": "Opiskelijat yleisen asumistuen piiriin",
    "type": "uudistus",
    "subtype": "sosiaaliturvan muutos",
    "year_start": 2017,
    "year_end": 2017,
    "phase": "2008–2026",
    "domains": ["asuminen", "opiskelijat", "sosiaaliturva", "nuoret"],
    "importance": 3,
    "problem": "Opiskelijoiden asumisen tuki siirrettiin 1.8.2017 opintotuen asumislisästä yleiseen asumistukeen.",
    "mechanism": "TARKISTETTAVA: tuen määräytymisperusteiden muutoksen vaikutus asumismuodon valintaan (yksin vai jaetusti) on varmistettava Kelan ja tutkimuksen arvioista ennen julkaisua.",
    "long_effect": "Ajoittuu nuorten aikuisten yksin asumisen nopeimpaan kasvuun vuosina 2017–2023.",
    "current_relevance": "Osa asumistuen jatkuvaa uudistamista; vuoden 2024 leikkaukset muuttivat taas nuorten asumisen taloutta.",
    "effects": [],
    "sources": ["Kela", "Tilastokeskus: StatFin 12c6"],
    "confidence": "kohtalainen",
    "evidence_confidence": "vahva",
    "interpretation_confidence": "heikko"
  }
]
```

## Kytkennät (`relations`)

Kaikki kytkennät kulkevat ajassa eteenpäin (syyn alkuvuosi ≤ seurauksen alkuvuosi), jotta ne näkyvät
kartan syy–seuraus-näkymissä (`isCausal` tiedostossa `src/lib/system-map.ts`).

```json
[
  { "from_id": "vaeston-ikaantyminen-1975", "to_id": "yksin-asumisen-yleistyminen", "type": "contributed_to", "rel_class": "rakenne", "confidence": "vahva",
    "rationale": "Ikääntyminen ja leskeys kasvattavat yksin asuvien määrää: vuonna 2025 yksin asuvista 38 % oli yli 65-vuotiaita." },
  { "from_id": "kaupungistuminen", "to_id": "yksin-asumisen-yleistyminen", "type": "contributed_to", "rel_class": "rakenne", "confidence": "kohtalainen",
    "rationale": "Kaupunkien pienasuntokanta ja vuokramarkkinat mahdollistavat yksin asumisen nuorena; yksin asuminen on yleisintä kasvukeskuksissa." },
  { "from_id": "yksin-asumisen-yleistyminen", "to_id": "historiallisen-matala-syntyvyys-2010", "type": "contributed_to", "rel_class": "tulkinta", "confidence": "kohtalainen",
    "rationale": "Parisuhteiden muodostumisen muutokset selittivät rekisteritutkimuksessa noin neljänneksen 2010-luvun ensisyntyvyyden laskusta. Yksin asuvien osuus 25–29-vuotiaista nousi 24,7 %:sta (2010) 33,7 %:iin (2025). Suurin osa laskusta tapahtui kuitenkin olemassa olevissa parisuhteissa." },
  { "from_id": "yksin-asumisen-yleistyminen", "to_id": "nuorten-yksin-asumisen-kiihtyminen-2017", "type": "accelerated", "rel_class": "kaari", "confidence": "vahva",
    "rationale": "Sama pitkä kehitys kiihtyi nuorilla aikuisilla vuosina 2017–2023: 20–24-vuotiaiden yksin asuminen nousi 27 %:sta 41 %:iin." },
  { "from_id": "opiskelijat-yleiseen-asumistukeen-2017", "to_id": "nuorten-yksin-asumisen-kiihtyminen-2017", "type": "contributed_to", "rel_class": "tapahtuma", "confidence": "heikko",
    "rationale": "Ajoitus osuu yhteen: kiihtyminen alkoi uudistusvuonna ja koski eniten opiskeluikäisiä. Mekanismi on tarkistettava; pienten asuntojen tuotanto oli samaan aikaan vilkasta." },
  { "from_id": "asuntopolitiikan-kriisi-1986", "to_id": "yksin-asumisen-yleistyminen", "type": "created_context_for", "rel_class": "rakenne", "confidence": "heikko",
    "rationale": "Asumisen kallistuminen ja vuokra-asumisen yleistyminen nuorilla muodostavat taloudellisen kehyksen yksin asumiselle; suora vaikutus yksin asumisen yleisyyteen on osoittamatta." }
]
```

## Ennen julkaisua tarkistettavaa

1. **Vuoden 2017 uudistuksen mekanismi.** Kirjattu luottamuksella `heikko`. Tarkista Kelan
   ja tutkimuksen arviot siitä, miten siirto yleiseen asumistukeen vaikutti asumismuodon valintaan.
2. **Vuoden 2024 asumistuen leikkaukset.** Kartalla ei ole niistä omaa ilmiötä. Jos sellainen
   lisätään, se ei voi kartan aikasäännön vuoksi olla vuonna 2017 alkavan ilmiön syy. Kirjaa
   laskun käänne silloin uuden ilmiön `long_effect`-kenttään tai omaksi ilmiökseen vuodelle 2024.
3. **Yksin asuminen ≠ yksinäisyys ≠ parisuhteettomuus.** Tilastokeskuksen luokka on
   "perheväestöön kuulumaton, asuu yksin"; osa yksin asuvista on etäsuhteessa.
