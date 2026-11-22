# Ehdotus: perhepolitiikka ja syntyvyys kartalle

Kartalla on perhepoliittiset uudistukset (äitiysavustus 1937, lapsilisä 1948, äitiysraha 1964,
päivähoitolaki 1973, lasten kotihoidon tuki 1985), mutta yksikään niistä ei ole kytketty
syntyvyysilmiöihin. Vuoden 2010 jälkeiselle laskulle kartta kirjaa vain kaksi syytä: aiemman trendin
ja heikoksi merkityn finanssikriisin. Tämä ehdotus lisää yhden ilmiön, viisi kytkentää ja päivittää
yhden olemassa olevan ilmiön Tilastokeskuksen datalla.

Vie ehdotus Lovablen kautta Supabasen `items`- ja `relations`-tauluihin (kentät kuten olemassa
olevissa riveissä, `unpublished: false`) ja aja kartan generointi uudelleen. Katso myös
`docs/ehdotus-yksin-asuminen.md`.

## Näyttö

Tilastokeskus, StatFin: [12dm](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__synt/statfin_synt_pxt_12dm.px/)
(syntyneet järjestysluvun ja äidin iän mukaan), [12dt](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__synt/statfin_synt_pxt_12dt.px/)
(kokonaishedelmällisyysluku), [14lg](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__synt/statfin_synt_pxt_14lg.px/)
(esikoisen saaneiden keski-ikä), [12dk](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__synt/statfin_synt_pxt_12dk.px/)
(avioliiton ulkopuolella syntyneet), haettu 22.11.2026. Järjestysluvun mukaiset luvut on laskettu
naisten keskiväkiluvusta (12c6); niiden summa vastaa virallista lukua joka vuosi 1993–2025.
Samat sarjat ovat poikkeamanäkymässä (`/poikkeamat`).

| | 1973 | 1990 | 2010 | 2024 | 2025 |
| --- | --- | --- | --- | --- | --- |
| Kokonaishedelmällisyysluku | 1,50 | 1,78 | 1,87 | 1,25 | 1,30 |
| – esikoiset | – | – | 0,78 | 0,55 | 0,59 |
| – toiset lapset | – | – | 0,63 | 0,43 | 0,44 |
| – kolmannet ja myöhemmät | – | – | 0,46 | 0,27 | 0,28 |
| Esikoisen saaneiden äitien keski-ikä, v | – | 26,8 | 28,3 | 30,4 | 30,5 |
| Avioliiton ulkopuolella syntyneet, % | 5,5 (1971) | 25,2 | 41,1 | 48,0 | 47,8 |

Vuosien 2010–2024 laskusta (0,62 lasta naista kohden) esikoiset selittävät 37 %, toiset lapset
32 % ja kolmannet ja myöhemmät 31 %. Jako on laskettu kaikista naisista. FLUXin mukaan 82 % laskusta
liittyy siihen, että harvempi nainen saa ensimmäisen lapsen: siinä myös myöhempien lasten väheneminen
luetaan esikoisten ansioksi, kun se johtuu äidiksi tulevien vähenemisestä. Luvut eivät ole ristiriidassa
(ks. `docs/lahteet-lapsettomuus.md`).

Tutkimus:
- Erlandsson, A. (2017). [Child Home Care Allowance and the Transition to Second- and Third-Order Births in Finland](https://pmc.ncbi.nlm.nih.gov/articles/PMC5511342/). *Population Research and Policy Review* 36(4). Kotihoidon tukea käyttäneillä naisilla suurempi todennäköisyys toiseen ja kolmanteen lapseen, rekisteriaineisto 1992–2007.
- Rønsen, M. (2004). [Fertility and Public Policies – Evidence from Norway and Finland](https://www.demographic-research.org/articles/volume/10/6). *Demographic Research* 10(6). Äitiysvapaan pidennykset nostivat syntyvyyttä, lähinnä toisia ja myöhempiä lapsia ja lähinnä Suomessa.
- Vikat, A. (2004). [Women's Labor Force Attachment and Childbearing in Finland](https://www.demographic-research.org/special/3/8/s3-8.pdf). *Demographic Research* SC3. Työssäkäynti ja tulot yhteydessä äidiksi tulemiseen.

## Uusi ilmiö (`items`)

```json
{
  "id": "syntyvyyden-vakaus-1975",
  "title": "Syntyvyyden vakaantuminen pohjoismaisella tasolla",
  "type": "väestömuutos",
  "subtype": "väestöllinen murros",
  "year_start": 1975,
  "year_end": 2010,
  "phase": "1975–1989",
  "domains": ["väestö", "perhe", "hyvinvointivaltio"],
  "importance": 3,
  "problem": "Vuoden 1973 pohjan (1,50) jälkeen syntyvyys ei jatkanut laskuaan, vaan vakiintui 1,6–1,9 lapseen naista kohden 35 vuodeksi, myös 1990-luvun laman yli.",
  "mechanism": "Ajanjakso osuu perhevapaiden, päivähoidon ja kotihoidon tuen rakentamiseen. Tutkimus liittää äitiysvapaan pidennykset ja kotihoidon tuen käytön toisiin ja myöhempiin lapsiin, mutta vaikutukset ovat maltillisia eikä vakaata tasoa voi selittää perhepolitiikalla yksin.",
  "long_effect": "Vakaa taso päättyi vuoden 2010 jälkeen, jolloin syntyvyys laski kaikissa Pohjoismaissa samanaikaisesti perhepolitiikasta huolimatta.",
  "current_relevance": "Kysymys siitä, mitä perhepolitiikka voi syntyvyydelle tehdä, on noussut uudelleen esiin vuoden 2010 jälkeisen laskun myötä.",
  "effects": ["kokonaishedelmällisyysluku 1,50 (1973) → 1,6–1,9 (1975–2010)", "huippu 1,87 vuonna 2010"],
  "sources": ["Tilastokeskus: StatFin 12dt", "Rønsen 2004, Demographic Research 10(6)", "Erlandsson 2017, Population Research and Policy Review 36(4)"],
  "confidence": "kohtalainen",
  "evidence_confidence": "vahva",
  "interpretation_confidence": "heikko"
}
```

## Kytkennät (`relations`)

Kaikki kulkevat ajassa eteenpäin (`isCausal`, `src/lib/system-map.ts`).

```json
[
  { "from_id": "syntyvyyden-rakennemuutos-1969", "to_id": "syntyvyyden-vakaus-1975", "type": "evolved_into", "rel_class": "kaari", "confidence": "vahva",
    "rationale": "1960-luvulla alkanut lasku pysähtyi vuoden 1973 pohjaan (1,50) ja vaihtui vakaaseen 1,6–1,9 lapsen tasoon." },
  { "from_id": "aitiysraha-1964", "to_id": "syntyvyyden-vakaus-1975", "type": "contributed_to", "rel_class": "tulkinta", "confidence": "heikko",
    "rationale": "Rønsenin (2004) mukaan äitiysvapaan pidennykset nostivat Suomessa syntyvyyttä, lähinnä toisia ja myöhempiä lapsia. Vaikutus on maltillinen." },
  { "from_id": "paivahoitolaki-1973", "to_id": "syntyvyyden-vakaus-1975", "type": "contributed_to", "rel_class": "tulkinta", "confidence": "heikko",
    "rationale": "Päivähoito helpotti työn ja perheen yhdistämistä samaan aikaan, kun syntyvyys vakiintui. Suoraa suomalaista tutkimusnäyttöä päivähoidon vaikutuksesta syntyvyyteen ei löytynyt." },
  { "from_id": "lasten-kotihoidontuki-1985", "to_id": "syntyvyyden-vakaus-1975", "type": "supported", "rel_class": "tulkinta", "confidence": "kohtalainen",
    "rationale": "Erlandssonin (2017) rekisteritutkimuksessa kotihoidon tukea käyttäneet saivat todennäköisemmin toisen ja kolmannen lapsen (1992–2007). Yhteys voi osin johtua siitä, keitä tuen käyttäjiksi valikoituu." },
  { "from_id": "syntyvyyden-vakaus-1975", "to_id": "historiallisen-matala-syntyvyys-2010", "type": "structural_precursor", "rel_class": "kaari", "confidence": "kohtalainen",
    "rationale": "Vakaa taso oli lähtökohta vuoden 2010 jälkeiselle laskulle, joka tapahtui kaikissa Pohjoismaissa samanaikaisesti ja perhepolitiikasta huolimatta." }
]
```

## Päivitys olemassa olevaan ilmiöön `historiallisen-matala-syntyvyys-2010`

Lisää `effects`-kenttään mitatut luvut ja tarkenna `mechanism`:

```json
{
  "mechanism": "Ratkaisevaa oli, että harvempi nainen sai ensimmäisen lapsen: FLUXin mukaan siihen liittyy 82 % vuosien 2010–2024 laskusta, sillä myös toisten ja myöhempien lasten väheneminen johtuu pääosin äidiksi tulevien vähenemisestä. Kaikista naisista laskettuna lasku näkyy kaikissa järjestysluvuissa (esikoiset 37 %, toiset 32 %, kolmannet ja myöhemmät 31 %). Samaan aikaan esikoisen saaneiden äitien keski-ikä nousi 28,3 vuodesta 30,4 vuoteen. Lasku oli pohjoismainen ilmiö, eikä talouden elpyminen 2015–2019 pysäyttänyt sitä.",
  "effects": [
    "kokonaishedelmällisyysluku 1,87 (2010) → 1,25 (2024) → 1,30 (2025)",
    "esikoisten hedelmällisyys 0,78 → 0,55, toisten 0,63 → 0,43, kolmansien ja myöhempien 0,46 → 0,27 (2010–2024)",
    "esikoisen saaneiden äitien keski-ikä 28,3 → 30,5 vuotta (2010–2025)",
    "avioliiton ulkopuolella syntyneet 41 % → 48 % (2010–2025)",
    "huoltosuhde heikkeni", "työikäinen väestö pieneni", "alueellinen eriytyminen kiihtyi", "työvoimapula kasvoi", "maahanmuuton merkitys korostui"
  ]
}
```

## Ei ehdoteta vielä

- **Perhevapaauudistus 2022** (kummallekin vanhemmalle 160 päivän kiintiö). Vaikutuksesta syntyvyyteen ei ole vielä tutkimusta. Uudistuksen voi lisätä kartalle ilmiönä, mutta kytkentää syntyvyyteen ei kannata tehdä ennen näyttöä. Kartan aikasäännön vuoksi se ei myöskään voisi olla vuonna 2010 alkavan ilmiön syy.
- **Äitiysavustus 1937 ja lapsilisä 1948 → suuret ikäluokat.** Sodanjälkeinen huippu selittyy pääosin sodan päättymisellä (kartalla jo vahvana kytkentänä), ja lapsilisä alkoi vasta huipun aikana. Ilman tutkimusnäyttöä kytkentä olisi arvaus.
