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
