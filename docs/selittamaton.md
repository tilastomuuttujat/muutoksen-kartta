# Selittämätön: missä tunnetut selitykset eivät riitä

Kirjattu 28.11.2026 ennen ensimmäistä laskentaa. Myöhemmät muutokset lisätään loppuun päivättyinä
merkintöinä. Vanhoja merkintöjä ei muokata.

## Ajatus

Seula ja Näyttöverkko testaavat, pitääkö tunnettu väite. Tämä näkymä kääntää kysymyksen ympäri. Se
mittaa, kuinka paljon ilmiöstä *jää selittämättä*, kun kaikki vakiintuneet selitykset on otettu
huomioon, ja missä maissa aukko on suurin. Selittämätön osa on aineisto uusille hypoteeseille.

## Yhteinen menetelmä

1. **Ilmiö (Y):** kunkin maan muutos määritellyllä jaksolla.
2. **Tunnetut selitykset (K):** kirjallisuudessa ja julkisessa keskustelussa vakiintuneet
   selitykset. Kullekin on kiinnitetty mittari ja jakso tässä dokumentissa.
3. **Malli:** pienimmän neliösumman regressio Y ~ K maiden välillä. Selittäjät standardoidaan.
4. **Ennusteet:** jokaisen maan ennuste lasketaan mallista, joka on estimoitu ilman kyseistä maata
   (leave-one-out, LOO). Jäännös on havaittu miinus LOO-ennuste.
5. **Tunnusluvut:**
   - **Selittämätön osuus** = 1 − LOO-R², jossa LOO-R² = 1 − Σ(y − ŷ_LOO)² / Σ(y − ȳ)².
     - Jos LOO-R² < 0, tunnetut selitykset ennustavat maita huonommin kuin pelkkä keskiarvo.
   - **Yhteinen aukko** (kun K-mittarit ovat muutoksia): mallin vakiotermi. Se on se muutos, joka
     olisi tapahtunut, vaikka mikään tunnettu tekijä ei olisi muuttunut.
     - Vakiotermi lasketaan standardoimattomilla K-muutoksilla.
     - 90 %:n luottamusväli saadaan bootstrapilla maiden yli (2 000 toistoa, siemen 1).
   - **Suomen poikkeama:** Suomen LOO-jäännös, sen sija maiden joukossa ja z-luku (jäännös jaettuna
     LOO-jäännösten keskihajonnalla).
6. **Uudet selitysehdokkaat (C):** julkisessa keskustelussa esitettyjä, vähemmän vakiintuneita
   selityksiä. Kullekin on kirjattu ennustettu suunta.
   - Ehdokasta verrataan LOO-jäännöksiin Spearmanin korrelaatiolla.
   - p-arvo on kaksisuuntainen permutaatiotesti (10 000 permutaatiota, siemen 1).
   - Benjamini–Hochberg-korjaus tehdään arvoituksen ehdokkaiden kesken.
   - Ehdokkaan luokitus:
     - **"Jäljellä"**, jos q < 0,1 ja suunta on ennustettu.
     - **"Väärä suunta"**, jos q < 0,1 ja suunta on vastakkainen.
     - **"Ei yhteyttä"** muuten.
   - "Jäljellä" tarkoittaa vain, että ehdokas selittää sitä, mitä tunnetut selitykset eivät
     selittäneet. Se on uusi hypoteesi, jota ei ole testattu, eikä syy. Se kirjataan Näyttöverkkoon
     testattavaksi muulla aineistolla tai myöhemmillä vuosilla.
7. **Maat:**
   - Eurostat-arvoituksissa EU27 sekä Norja, Islanti, Sveitsi ja Iso-Britannia.
   - Työttömyysarvoituksessa Global Macro Databasen korkean tulotason maat.
   - Maa jätetään pois, jos siltä puuttuu Y, jokin K tai jokin vaadittu vuosi. Pois jätettyjen
     määrä kirjataan.
   - Ehdokastesteissä käytetään ne maat, joilla ehdokkaan arvo on saatavilla.
8. **Lähteet:**
   - Eurostatin julkinen rajapinta (ec.europa.eu/eurostat/api).
   - Global Macro Database 2026_09.

## A1. Syntyvyyden romahdus 2010-luvulla

- **Y:** log(TFR 2023 / TFR 2010). Lähde: Eurostat demo_find, TOTFERRT.
- **Tunnetut selitykset (K):**

| K | Selitys | Mittari |
|---|---|---|
| K1 | Talous | BKT asukasta kohden kiintein hinnoin, log-muutos 2010 → 2019 (nama_10_pc, CLV10_EUR_HAB, B1GQ) |
| K2 | Nuorten aikuisten työmarkkinat | 25–29-vuotiaiden työttömyysaste, keskiarvo 2010–2019 miinus keskiarvo 2002–2008 (lfsa_urgan) |
| K3 | Asumisen hinta | Asuntojen reaalihinnat, log-muutos 2010 → 2019 (prc_hpi_a TOTAL deflatoituna prc_hicp_aind CP00) |
| K4 | Lykkääminen (tempo) | Esikoisäidin keski-iän muutos 2010 → 2022 (demo_find AGEMOTH1) |
| K5 | Koulutus | Korkea-asteen tutkinnon suorittaneiden 25–34-vuotiaiden naisten osuuden muutos 2010 → 2023, %-yks. (edat_lfse_03) |
| K6 | Luottamus | Kuluttajien luottamus, keskiarvo 2010–2019 miinus keskiarvo 2000–2009 (ei_bsco_m, BS-CSMCI, SA) |

- **Uudet ehdokkaat (C):**

| C | Ehdokas | Mittari | Ennuste jäännökseen |
|---|---|---|---|
| C1 | Nuoret aikuiset asuvat pidempään vanhempien luona | 25–34-vuotiaiden vanhempien luona asuvien osuuden muutos 2010 → 2023 (ilc_lvps08) | − |
| C2 | Jatkuva verkkoyhteys (älypuhelin) | Päivittäin internetiä käyttävien osuuden muutos 2010 → 2019 (isoc_ci_ifp_fu, I_IDAY) | − |
| C3 | Parinmuodostuksen epäsuhta | Korkea-asteen koulutuksen sukupuoliero 25–34-vuotiailla (naiset miinus miehet), muutos 2010 → 2023 | − |

## A2. Pysyvästi korkea työttömyys

- **Y:** työttömyysasteen keskiarvo 2000–2019 miinus keskiarvo 1980–1989, %-yks. Lähde: Global Macro
  Database, unemp.
- **Maat:** income_group = "High income". Kaikkien vuosien 1980–2019 työttömyystiedot vaaditaan.
- **Tunnetut selitykset (K):**

| K | Selitys | Mittari |
|---|---|---|
| K1 | Kasvu (Okunin laki) | Reaalisen BKT:n keskimääräinen vuosikasvu 2000–2019, log (rGDP) |
| K2 | Hystereesi: 1990-luvun kriisin syvyys | Työttömyyden huippu 1990–1999 miinus keskiarvo 1980–1989 |
| K3 | Julkisen sektorin koko (etuuksien ja verojen taso) | Julkiset menot / BKT, keskiarvo 2000–2019 (gen_govexp_GDP; puuttuessa govexp_GDP) |

- **Uudet ehdokkaat (C):**

| C | Ehdokas | Mittari | Ennuste jäännökseen |
|---|---|---|---|
| C1 | Investointien heikkous | Investoinnit / BKT, keskiarvo 2000–2019 (inv_GDP) | − |
| C2 | Kustannuskilpailukyky | REER, log-muutos 1990 → 2019 | + |
| C3 | Vientisektorin koko | Viennin BKT-osuuden muutos 1990 → 2019, %-yks. (exports_GDP) | − |

## A3. Kotitalouksien velkaantuminen

- **Y:** kotitalouksien velkaantumisaste (velka / käytettävissä olevat tulot, %) 2023 miinus 2008,
  %-yks. Lähde: Eurostat nasa_10_ki, DIR_S14_S15.
- **Tunnetut selitykset (K):**

| K | Selitys | Mittari |
|---|---|---|
| K1 | Korot | Pitkä korko, keskiarvo 2015–2021 miinus keskiarvo 2003–2007 (irt_lt_mcby_a, EMU-konvergenssikorko) |
| K2 | Asuntojen hinnat | Asuntojen reaalihinnat, log-muutos 2008 → 2023 (kuten A1:n K3) |
| K3 | Tulot | Kotitalouksien reaaliset käytettävissä olevat tulot per asukas, log-muutos 2008 → 2023 (nasa_10_ki, B7G_R_HAB_2010) |
| K4 | Lähtötaso (velan purku) | Velkaantumisaste 2008 |

- **Uudet ehdokkaat (C):**

| C | Ehdokas | Mittari | Ennuste jäännökseen |
|---|---|---|---|
| C1 | Omistusasumisen yleistyminen | Omistusasunnossa asuvien osuuden muutos 2010 → 2023, %-yks. (ilc_lvho02, OWN, TOTAL) | + |
| C2 | Kotitalouksien asuntoinvestoinnit | Kotitalouksien investoinnit / BKT, keskiarvo 2008–2023 (nasa_10_ki, P51G_RAT_GDP_S14_S15) | + |
| C3 | Säästämisen väheneminen | Kotitalouksien säästämisasteen muutos 2008 → 2023 (nasa_10_ki, SRG_S14_S15) | − |

## Mitä tulos ei tarkoita

- Suuri jäännös ei todista, että ilmiöllä olisi uusi syy. Mittarit voivat olla epätarkkoja, ja
  tunnettu tekijä voi vaikuttaa epälineaarisesti tai viiveellä.
- Pieni jäännös ei todista, että tunnetut selitykset olisivat syitä. Se tarkoittaa vain, että ne
  riittävät ennustamaan maiden eroja.
- Maiden määrä (noin 25–35) rajaa, kuinka monta selittäjää malli kestää. Siksi selittäjät on
  rajattu ennalta, eikä niitä lisätä tulosten nähtyä.

## Tulokset 28.11.2026

### Laskennan tarkennukset (eivät muuta menetelmää)

- **A3 C1:** taulukon ilc_lvho02 tulotasoulottuvuuden nimi on rskpovth eikä incgrp. Käytetään arvoa
  TOTAL.
- **A3 K3:** taulukon nasa_10_ki tulosarjan B7G_R_HAB_2010 yksikkökoodi on PC.
  - Sarja on indeksi 2010 = 100.
  - Muutosta laskettaessa käytetään log-suhdetta, joten yksikön nimi ei vaikuta tulokseen.

### A1 Syntyvyys

- **Aineisto:** 16 maata.
  - Pois jäi 14 maata. Niistä 12 karsiutui K6:n (kuluttajien luottamus) vertailujakson 2000–2009
    vuoksi.
  - Muut pois jääneet: Tanska ja Ranska (K4), Kreikka ja Sveitsi (K3).
- **Selittämätön osuus:** LOO-R² = −1,15 ja sovitteen R² = 0,54.
  - Tunnetut selitykset sopivat aineistoon jälkikäteen, mutta ne ennustavat pois jätettyä maata
    huonommin kuin pelkkä keskiarvo.
- **Yhteinen aukko:** −13 % (90 %:n väli −45 … +39 %). Väli on niin leveä, ettei aukon kokoa voida
  määrittää.
- **Suomi:**
  - Havaittu muutos −33 % oli 16 maan suurin; TFR laski 1,87:stä 1,26:een.
  - LOO-ennuste oli −18 %, ja jäännös −0,20 oli neljänneksi alhaisin.
  - z = −0,85. Suomen poikkeama ei siis erotu, koska malli epäonnistuu kaikissa maissa.
- **Ehdokkaat:** kaikki "ei yhteyttä".
  - C1 vanhempien luona asuminen: rho −0,35 (q = 0,33).
  - C2 internet: rho +0,26.
  - C3 koulutusero: rho +0,32.
- **Jälkikäteinen herkkyystarkistus** (ei rekisteröity, ei korvaa päätulosta): ilman K6:ta mukana on
  24 maata.
  - LOO-R² = −0,09, eli tunnetut selitykset eivät edelleenkään ennusta.
  - Suomen jäännös on −0,22, kolmanneksi alhaisin 24 maasta (z = −1,37).
  - C2 (internetin käytön kasvu) on "väärä suunta" (rho +0,48, q = 0,056): mitä enemmän käyttö
    kasvoi, sitä *vähemmän* syntyvyys laski selitettyä enemmän. Tämä on vastoin älypuhelinselitystä.

### A2 Työttömyys

- **Aineisto:** 36 korkean tulotason maata.
  - Joukossa on myös muita kuin Euroopan ja OECD:n maita, esimerkiksi Barbados ja Panama, koska
    rajaus tehtiin GMD:n tuloluokan mukaan.
- **Selittämätön osuus:** LOO-R² = −0,18 ja sovitteen R² = 0,18.
- **Suomi:** työttömyys nousi 2,9 %-yks., ja ennuste oli 2,8 %-yks. Jäännös on +0,10 (z = 0,02),
  sija 19/36.
  - Suomen pysyvä työttömyys ei ole poikkeama korkean tulotason maiden joukossa.
  - Tunnetut selitykset eivät myöskään selitä maiden välisiä eroja.
- **Ehdokkaat:** kaikki "ei yhteyttä".

### A3 Velkaantuminen

- **Aineisto:** 19 maata, 9 jäi pois puuttuvien tietojen vuoksi.
- **Selittämätön osuus:** LOO-R² = 0,16, eli 84 % jää selittämättä. Sovitteen R² = 0,60.
- **Suomi:** velkaantumisaste nousi 2008–2023 +15,9 %-yks., ja ennuste oli −20,9 %-yks.
  - Jäännös +36,8 %-yks. oli kolmanneksi suurin Maltan (+74) ja Luxemburgin (+41) jälkeen.
  - z = 0,99.
- **Ehdokkaat:**
  - **C2 kotitalouksien investoinnit / BKT: "jäljellä"** (rho +0,52, p = 0,024, q = 0,072, n = 19).
    - Maissa, joissa kotitaloudet investoivat paljon (lähinnä uusiin asuntoihin), velka kasvoi
      enemmän kuin korot, hinnat ja tulot selittävät.
    - Tämä on uusi hypoteesi, ei testattu syy. Se pitää testata muulla aineistolla, esimerkiksi
      vuosien 1995–2008 jaksolla tai maiden alueilla.
  - C1 omistusasuminen ja C3 säästämisaste: "ei yhteyttä".

## Toinen erä: kirjattu 28.11.2026 ennen laskentaa

Menetelmä on sama kuin yllä. Arvoitukset A4–A7 käyttävät maiden tasoja eivätkä muutoksia, joten
yhteistä aukkoa ei lasketa niille.

### A4. Ruoka-avun tarve ("leipäjonot")

- **Y:** köyhyysrajan (60 % mediaanista) alapuolella elävistä niiden osuus, joilla ei ole varaa
  liha-, kana- tai kalaruokaan (tai kasvisvastineeseen) joka toinen päivä.
  - Keskiarvo 2019–2023. Lähde: ilc_mdes03, hhcomp TOTAL, rskpovth B_60.
  - Leipäjonoista ei ole vertailukelpoista kansainvälistä tilastoa. Tämä on lähin mittari ruoan
    puutteesta köyhien keskuudessa.

| K | Selitys | Mittari (keskiarvo 2019–2023) |
|---|---|---|
| K1 | Tulotaso | Ekvivalentin nettotulon mediaani, PPS (ilc_di03, MED_EI) |
| K2 | Köyhyyden syvyys | Köyhyysvaje, B_60 (ilc_li11, MED_EI, TOTAL) |
| K3 | Asumismenot | Asumismenorasite köyhillä, B_60 (ilc_lvho07a) |
| K4 | Tulonsiirtojen teho | Köyhyysaste ennen tulonsiirtoja (pl. eläkkeet) miinus sen jälkeen (ilc_li10 − ilc_li02, B_60, %-yks.) |

| C | Ehdokas | Mittari (keskiarvo 2019–2023) | Ennuste |
|---|---|---|---|
| C1 | Yksin asuminen | Yhden aikuisen kotitalouksien osuus kaikista kotitalouksista (lfst_hhnhtych, A1 / TOTAL) | + |
| C2 | Työttömyys | Työttömyysaste 15–74 (une_rt_a) | + |
| C3 | Velkaantuminen | Kotitalouksien velkaantumisaste (nasa_10_ki, DIR_S14_S15) | + |

### A5. Terveydenhuollon jonot

- **Y:** niiden 16 vuotta täyttäneiden osuus, jotka jättivät tarvitsemansa lääkärinhoidon saamatta
  jonon vuoksi.
  - Keskiarvo 2019–2023 miinus keskiarvo 2008–2012, %-yks.
  - Lähde: hlth_silc_08, reason WLIST, quant_inc TOTAL.

| K | Selitys | Mittari |
|---|---|---|
| K1 | Terveysmenot | Terveydenhuollon menot asukasta kohden kiintein hinnoin, log-muutos 2012 → 2022 (hlth_sha11_hf, TOT_HF, EUR_HAB_KP15) |
| K2 | Lääkärit | Toimivia lääkäreitä / 100 000, muutos 2010 → 2021 (hlth_rs_prs2, PRACT, PHYS) |
| K3 | Ikääntyminen | Vanhushuoltosuhde, muutos 2010 → 2023 (demo_pjanind, OLDDEP1) |
| K4 | Talous | BKT asukasta kohden, log-muutos 2010 → 2019 |

| C | Ehdokas | Mittari | Ennuste |
|---|---|---|---|
| C1 | Hoitajat | Toimivia sairaanhoitajia / 100 000, muutos 2010 → 2021 (hlth_rs_prs2, PRACT, NRS) | − |
| C2 | Julkisen rahoituksen osuus | HF1 / TOT_HF, muutos 2012 → 2022, %-yks. | − |
| C3 | Vapaaehtoiset vakuutukset ja omamaksut | HF2 / TOT_HF, muutos 2012 → 2022, %-yks. | + |

### A6. Tukiriippuvuus

- **Y:** 18–59-vuotiaista niiden osuus, jotka asuvat kotitaloudessa, jossa kukaan ei käy töissä.
  - Keskiarvo 2015–2019, ennen pandemiaa.
  - Lähde: lfsi_jhh_a, SC072.

| K | Selitys | Mittari (keskiarvo 2015–2019) |
|---|---|---|
| K1 | Työttömyys | Työttömyysaste 15–74 (une_rt_a) |
| K2 | Matala koulutus | Enintään perusasteen koulutuksen suorittaneiden osuus 25–64-vuotiaista (edat_lfse_03, ED0-2) |
| K3 | Yksinhuoltajuus | Yksinhuoltajakotitalouksien osuus kaikista kotitalouksista (lfst_hhnhtych, A1_CH / TOTAL) |

| C | Ehdokas | Mittari (keskiarvo 2015–2019) | Ennuste |
|---|---|---|---|
| C1 | Sosiaaliturvan taso | Sosiaaliturvamenot pl. vanhuus / BKT (gov_10a_exp, GF10 − GF1002) | + |
| C2 | Asumismenot | Asumismenorasite koko väestössä (ilc_lvho07a, TOTAL) | + |

### A7. Puolustusmenot

- **Y:** julkiset puolustusmenot / BKT, keskiarvo 2015–2023.
  - Lähde: gov_10a_exp, GF02 (COFOG-luokitus, joka poikkeaa Naton määritelmästä).
- **Maat:** Eurostat-maat, joilta Y löytyy.

| K | Selitys | Mittari |
|---|---|---|
| K1 | Uhka | Pääkaupungin etäisyys Moskovaan, log km (isoympyrä; pääkaupunkien koordinaatit kirjattu laskentaskriptiin) |
| K2 | Liittouma | Nato-jäsenyys (osuus vuosista 2015–2023, jolloin maa oli jäsen) |
| K3 | Polkuriippuvuus | Puolustusmenot / BKT, keskiarvo 2001–2005 |

| C | Ehdokas | Mittari | Ennuste |
|---|---|---|---|
| C1 | Asevelvollisuus | Asevelvollisuus voimassa 2019: Itävalta, Kypros, Tanska, Viro, Suomi, Kreikka, Liettua, Norja, Ruotsi, Sveitsi (0/1) | + |
| C2 | Yhteinen maaraja Venäjän kanssa | Suomi, Viro, Latvia, Liettua, Puola, Norja (0/1) | + |
| C3 | Julkisen sektorin koko | Julkiset menot / BKT, keskiarvo 2015–2023 (gov_10a_main, TE) | + |

### Ei tähän menetelmään

| Ilmiö | Syy | Mihin |
|---|---|---|
| Mielenterveysongelmien nousu | Eurostatin EHIS mittaa masennusoireita vain vuosina 2014 ja 2019. Kansalliset mittarit (työkyvyttömyys, kouluterveyskysely) eivät ole vertailukelpoisia maiden välillä | Suomen sisäinen analyysi (alueet, ikäryhmät, kohortit) |
| PISA-tulosten heikkeneminen | OECD:n ja Our World in Datan rajapinnat eivät ole tämän ympäristön verkkorajauksen sisällä | Lisätään, kun aineisto saadaan |
| Menoleikkauskierre ja veroalet | Kyse on syyväitteistä (leikkaus → kasvu → velka) eikä selittämättömästä ilmiöstä | Näyttöverkon hypoteeseiksi |
| Valtion rooli työmarkkinoilla | Sopimuskattavuus ja järjestäytymisaste (OECD/ICTWSS) eivät ole saatavilla | Lisätään, kun aineisto saadaan |

## Toisen erän tulokset 28.11.2026

### A4 Ruoka-avun tarve

- **Aineisto:** 28 maata. Ranska jäi pois.
- **Selitysaste:** LOO-R² = 0,49. Tunnetut selitykset ennustavat noin puolet maiden eroista.
  - Tulotaso on vahvin selittäjä (standardoitu kerroin −0,60).
- **Suomi:**
  - Köyhistä 8,0 %:lla ei ollut varaa riittävään ruokaan; ennuste oli 6,0 %.
  - Jäännös +2,1 %-yks. (z = 0,24), sija 18/28.
  - Suomi ei ole poikkeama. Leipäjonojen olemassaolo ei siis näy köyhien ruoan puutteena
    tavallista enemmän tällä mittarilla.
- **Ehdokkaat:** kaikki "ei yhteyttä".

### A5 Terveydenhuollon jonot

- **Aineisto:** 18 maata, 9 jäi pois.
- **Selitysaste:** LOO-R² = −1,0. Terveysmenot, lääkärimäärä, ikääntyminen ja talous eivät ennusta
  jonojen muutosta lainkaan.
- **Suomi:**
  - Jonon vuoksi saamatta jäänyt hoito lisääntyi +2,4 %-yks. Tämä oli toiseksi suurin nousu Viron
    (+6,3) jälkeen.
  - Ennuste oli +0,6 %-yks.
  - Jäännös +1,8 %-yks. oli kolmanneksi suurin (Viro +6,3, Kypros +4,9), z = 0,77.
- **Ehdokkaat:** kaikki "ei yhteyttä".

### A6 Tukiriippuvuus

- **Aineisto:** 27 maata.
- **Selitysaste:** LOO-R² = 0,44. Työttömyys selittää valtaosan (kerroin +0,82).
- **Suomi:**
  - Työttömissä kotitalouksissa asui 9,8 % 18–59-vuotiaista; ennuste oli 8,7 %.
  - Jäännös +1,1 %-yks. (z = 0,64), sija 20/27.
  - Hieman ennustettua korkeampi, mutta ei poikkeama.
- **Ehdokkaat:** "ei yhteyttä".
  - Asumismenorasite oli lähimpänä rajaa (rho +0,38, q = 0,11).

### A7 Puolustusmenot

- **Aineisto:** 29 maata.
- **Selitysaste:** LOO-R² = 0,62. Etäisyys Moskovaan ja aiempi menotaso selittävät suurimman osan.
- **Suomi:**
  - Puolustusmenot 2015–2023 olivat COFOG-luokituksella 1,27 % BKT:sta; ennuste oli 1,54 %.
  - Jäännös −0,27 %-yks. oli neljänneksi alhaisin (z = −0,80).
  - Suomi käytti siis puolustukseen *vähemmän* kuin uhka ja historia ennustavat.
  - COFOG-luokitus poikkeaa Naton määritelmästä, eikä vuonna 2022 alkanut menojen nousu näy vielä
    kokonaisuudessaan keskiarvossa.
- **Ehdokkaat:** kaikki "ei yhteyttä".

## Kolmas erä: Suomen sisältä, kirjattu 28.11.2026 ennen laskentaa

Maiden välinen malli näytti aukot. Nämä kolme tarkastelua kysyvät aukon *muotoa* Suomen sisältä tai
Pohjoismaiden kesken: alkoiko muutos kaikkialla yhtä aikaa, seurasiko se suhdannetta, ja onko se
Suomen oma vai yhteinen. Jokaiselle on kirjattu luokittelusääntö ennen laskentaa.

- **Aineisto:** Turso-tietokannan sarjat, poimittu tiedostoon skriptillä
  scripts/selittamaton/fetch_turso.py.

### S1. Hoitojonot tuloryhmittäin

- **Sarjat:**
  - Jonon vuoksi saamatta jäänyt lääkärinhoito (fi.eusilc.unmet08.wlist) tuloviidenneksittäin
    QU1–QU5, sukupuolet yhteensä, 2008–2025.
  - Toistona hammashoito (fi.eusilc.unmet09.wlist).
- **Muutos:** keskiarvo 2019–2023 miinus keskiarvo 2008–2012, %-yks., kullekin viidennekselle.
- **Ajankohta:** ensimmäinen vuosi vuodesta 2011 alkaen, jolloin edellisten kolmen vuoden keskiarvo
  ylittää viidenneksen oman perustason (keskiarvo 2008–2012) yli 1 %-yksiköllä.
- **Luokitus** (sovelletaan järjestyksessä):
  1. **Järjestelmätaso:** kaikki viidennekset nousivat (muutos > 0), suurin nousu on enintään kaksi
     kertaa pienin, ja nousuajankohdat osuvat enintään kahden vuoden sisään.
  2. **Pienituloisten jonot:** QU1:n nousu on vähintään kaksi kertaa QU5:n nousu, ja QU1 nousi.
  3. **Suurituloisten jonot:** QU5:n nousu on vähintään kaksi kertaa QU1:n nousu, ja QU5 nousi.
  4. **Sekamuoto:** muut tapaukset.

### S2. Ruoka-apu: suhdanne vai pysyvä

- **Sarjat:**
  - Elintarvikeapu kiloina yhteensä (foodaid_hist_tvy_history_food_kg_13, 2000–2011).
  - Ruoka-apua jakaneiden seurakuntien osuus (foodaid_hist_church_share, 2000–2010).
  - Työttömyysaste (fi.histlabour.lfs2019.unemployment_rate).
- **Vertailu:** työttömyys laski 2000 → 2008. Jos ruoka-apu seurasi suhdannetta, sen pitäisi laskea
  samassa suhteessa (jousto 1).
- **Luokitus kullekin sarjalle**, kun log-muutos 2000 → 2008 = m ja työttömyyden log-muutos = u:
  - **Pysyvä:** m > −0,10, eli ruoka-apu ei laskenut, vaikka työttömyys laski.
  - **Suhdanne:** m ≤ u / 2, eli ruoka-apu laski vähintään puolet työttömyyden suhteellisesta
    laskusta.
  - **Välimuoto:** muut tapaukset.
- **Kuvaileva:** muutos 2008 → 2010 finanssikriisissä.
- **Rajaus:**
  - EU:n ruoka-avun määrä riippuu myös EU:n jakamasta määrästä, eli tarjonnasta.
  - Seurakuntien osuus mittaa toimintaa eikä asiakkaita.
  - Vuoden 2011 jälkeisiä sarjoja ei ole tietokannassa.

### S3. Mielenterveys: Suomen oma vai yhteinen

- **Sarja:** masennuslääkkeiden käyttö (N06A, nordics.antidepressants_2000_2023) Suomessa, Ruotsissa,
  Norjassa ja Tanskassa.
- **Kasvuvauhti:** keskimääräinen vuotuinen log-kasvu jaksoilla 2000–2010 (g1), 2010–2019 (g2) ja
  2019–2023 (g3).
- **Kiihtyminen:** g2 > g1 + 0,01, eli vähintään 1 %-yks. nopeampaa vuosikasvua.
- **Luokitus:**
  - **Yhteinen:** Suomi ja vähintään kaksi muuta maata kiihtyivät.
  - **Suomen oma:** Suomi kiihtyi, mutta enintään yksi muu maa kiihtyi.
  - **Ei kiihtymistä Suomessa:** Suomi ei kiihtynyt.
- **Kuvaileva:** pandemiajakso (g3 verrattuna g2:een) sekä nuorten sarjat Suomessa:
  - Kelan mielenterveyskuntoutujat 0–24 v.
  - Kuntoutuspsykoterapia 18–24 v.
  - Psykiatriseen hoitoon yli 3 kk odottaneet alle 23 v.
  - Näille raportoidaan vuosikasvu 2010–2019 ja 2019–viimeisin vuosi.
- **Tunnettu katkos:** kuntoutuspsykoterapia siirtyi Kelan lakisääteiseksi etuudeksi vuonna 2011.
  Psykoterapiasarjan nousua ei tulkita ilman tätä tietoa.

## Kolmannen erän tulokset 28.11.2026

### S1 Hoitojonot tuloryhmittäin

- **Luokka: pienituloisten jonot.** Sama luokka sekä lääkärin- että hammashoidossa.

  | Tuloviidennes | Lääkärinhoito: muutos | Lääkärinhoito: nousu alkoi | Hammashoito: muutos | Hammashoito: nousu alkoi |
  |---|---|---|---|---|
  | QU1 (pienituloisin) | +3,0 %-yks. | 2012 | +2,8 %-yks. | 2011 |
  | QU2 | +3,5 | 2016 | +3,1 | 2017 |
  | QU3 | +2,8 | 2016 | +2,9 | 2016 |
  | QU4 | +1,2 | 2012 | +1,2 | 2019 |
  | QU5 (suurituloisin) | +1,4 | 2022 | +0,9 | 2023 |

- **Kuvio rekisteröidyllä perustasolla:** nousu näytti alkavan pienituloisimmista 2012, levinneen
  keskituloisiin 2016 ja suurituloisimpiin vasta 2020-luvulla.
- **Jälkikäteinen herkkyystarkistus (ei rekisteröity, muuttaa tulkintaa):**
  - Vuoden 2008 arvo (0,2–0,5 % kaikissa ryhmissä, vuonna 2009 3,4 %) on mittauskatko. Se painaa
    rekisteröityä perustasoa 2008–2012 alas.
  - Perustasolla 2009–2012 luokka säilyy niukasti: lääkärinhoidossa QU1 +2,0 ja QU5 +1,0 %-yks.
    (raja 2 × 0,97 = 1,94). Hammashoidossa QU1 +1,9 ja QU5 +0,2.
  - Ajoituskuvio kuitenkin katoaa. Nousu alkoi vasta 2019–2020 keskituloisissa (QU2 2020, QU3 2019)
    ja muualla 2022–2024 (QU1 2022, QU5 2023, QU4 2024).
- **Tulkinta:**
  - Jonojen kasvu on 2020-luvun ilmiö, joka painottuu alempiin ja keskituloisiin viidenneksiin.
  - Neljäs ja suurituloisin viidennes säästyivät eniten.
  - Väite, että nousu olisi alkanut pienituloisista jo 2010-luvun alussa, johtui mittauskatkosta.
  - Mahdollinen selitys (ei testattu): suurituloisilla on enemmän vaihtoehtoja julkiselle hoidolle,
    esimerkiksi työterveyshuolto ja yksityinen hoito.

### S2 Ruoka-apu

- **Työttömyys** laski 2000 → 2008 9,8 %:sta 6,4 %:iin (−35 %).
- **Elintarvikeapu kiloina: pysyvä.** Määrä kasvoi 2000 → 2008 +135 %.
  - Vuoden 2000 arvo (189 000 kg) on alle puolet vuoden 2001 arvosta, joten ohjelma oli
    todennäköisesti vasta käynnistymässä.
  - Jälkikäteinen tarkistus vuodesta 2001: −3 % (log −0,03), mikä on edelleen luokassa "pysyvä".
- **Seurakuntien osuus: välimuoto.** Osuus laski −19 % (log −0,210). Suhdanneraja oli −0,213, joten
  tulos jäi niukasti suhdanneluokan ulkopuolelle.
- **Finanssikriisi 2008 → 2010:** työttömyys nousi 8,4 %:iin, elintarvikeapu kasvoi +36 % ja
  seurakuntien osuus +46 %.
- **Kuvio (kuvaileva):** ruoka-apu kasvoi laskusuhdanteessa mutta ei palannut ennalleen
  noususuhdanteessa. Se kasvoi siis vaiheittain, räikän tavoin.

### S3 Mielenterveys

- Kasvuluvut ovat todellisia vuosikasvuja (exp(g) − 1); luokitus käyttää kirjattua log-kasvua g.

- **Luokka: ei kiihtymistä Suomessa.**
  - Masennuslääkkeiden käytön vuosikasvu Suomessa oli 6,9 % vuosina 2000–2010 ja 1,4 % vuosina
    2010–2019, eli kasvu hidastui.
  - Yksikään Pohjoismaa ei kiihtynyt 2010–2019. Ruotsi 5,4 → 3,4 %, Norja 3,3 → 0,2 %, Tanska
    9,1 → −0,8 %.
- **Pandemiajakso 2019–2023:** kasvu kiihtyi kaikissa neljässä maassa. Suomi 4,3 %, Tanska 4,2 %,
  Ruotsi 3,5 % ja Norja 2,6 % vuodessa.
- **Nuoret Suomessa:**

  | Sarja | Vuosikasvu 2010–2019 | Vuosikasvu 2019–2025 |
  |---|---|---|
  | Kelan mielenterveyskuntoutujat 0–24 v | 11,6 % | 7,0 % |
  | Kuntoutuspsykoterapia 18–24 v | 11,0 % | 6,0 % |
  | Yli 3 kk psykiatrista hoitoa odottaneet alle 23 v | — | 13,5 % |

  - Psykoterapian kasvussa on mukana vuoden 2011 lakimuutos, jolla kuntoutuspsykoterapia siirtyi
    Kelan lakisääteiseksi etuudeksi.
  - Odottaneiden osuus oli 6,6 % vuonna 2014, 31,3 % vuonna 2023 ja 17,7 % vuonna 2025.
- **Tulkinta:**
  - 2010-luvulla mielenterveysongelmien nousu ei näy koko väestön masennuslääkkeiden käytössä vaan
    nuorten palveluiden käytössä.
  - Nuorten palveluiden käytön kasvu voi kertoa tarpeen kasvusta, palvelujen laajenemisesta tai
    kummastakin. Tämä aineisto ei erota niitä toisistaan.
