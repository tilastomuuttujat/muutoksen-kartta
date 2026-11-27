# Näyttöverkko: hypoteesirekisteri

Rekisteri kirjataan ja viedään repoon **ennen** testien ajamista. Muutokset tehdään uutena merkintänä,
vanhaa ei muokata. Tulokset: `src/data/naytto.json` (`scripts/naytto/build.py`), näkymä `/naytto`.

## H1. Nuorten naisten työttömyys → syntyvyys

- **Kirjattu:** 27.11.2026. **Kartassa:** finanssikriisi-2008 → historiallisen-matala-syntyvyys-2010
  (contributed_to, toimituksellinen arvio: heikko).
- **Väite:** 25–34-vuotiaiden naisten työttömyyden nousu laskee kokonaishedelmällisyyttä noin kahden
  vuoden viiveellä.
- **Lähtöhavainto (ei ennalta kirjattu):** skannerissa r = −0,66, viive 2 v, Suomi 1995–2023.

| Testi | Asetelma | Ennuste, jos väite pitää | Tukee / kumoaa |
|---|---|---|---|
| T1 Toisto | Sama laskenta Ruotsille, Norjalle ja Tanskalle (Turso: nordics.*, 1995–) ja yhdistettynä | Negatiivinen viivekorrelaatio (viive 1–2) muissakin maissa | Tukee: yhdistetty r < 0 ja p < 0,05. Kumoaa: yhdistetty r ≥ 0 |
| T2 Annos–vaste | 18 maakuntaa (12du ja 115w), naisten 25–34 rekisterityöttömyys, kiinteät alue- ja vuosivaikutukset, viive 2 v, 1992–2024 | Maakunnissa, joissa työttömyys nousi enemmän kuin muualla samana vuonna, syntyvyys laskee enemmän | Tukee: kerroin < 0 ja permutaatio-p < 0,05 (alueiden sarjojen sekoitus). Kumoaa: kerroin ≥ 0 |
| T3 Täsmällisyys | Sama kuin T1, miesten 25–34 työttömyys | Naisten yhteys vähintään yhtä vahva kuin miesten | Tukee: naisten yhdistetty r on negatiivisempi. Muuten: ei ratkea (yleinen nuorten epävarmuus) |
| E1 Ennuste | Pohjoismaiden yhdistetty malli: Δlog TFR(t) = a + b · ΔU(t−2) | TFR 2026 ja 2027 Suomessa, 80 %:n väli | Osuma: toteutunut arvo välillä |

## H1b. Kansallinen talousepävarmuus → syntyvyys (tarkennus)

- **Kirjattu:** 27.11.2026, H1:n testien jälkeen. Tämä merkintä ei siksi ole ennalta kirjattu suhteessa
  H1:n tuloksiin, vaan vain suhteessa alla oleviin ennusteisiin ja tuleviin testeihin.
- **Syy:** H1:n toisto Pohjoismaissa piti, mutta annos–vaste maakunnittain ei. Yhteys näyttää kulkevan
  koko maan tilanteen kautta, ei kunkin naisen tai alueen oman työttömyyden kautta.
- **Väite:** syntyvyys reagoi koko maan talousnäkymiin, joita nuorten aikuisten työttömyys mittaa,
  noin kahden vuoden viiveellä. Alueiden välisiä eroja se ei selitä.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| E1 Ennuste | TFR 2026 ja 2027 (H1:n Pohjoismaiden malli) | Osuma: toteutunut 80 %:n välillä |
| T4 Odotukset (ei vielä tehty) | Kuluttajien luottamus (Tilastokeskus) edeltää syntyvyyttä Pohjoismaissa | Tukee: viivekorrelaatio vahvempi kuin työttömyyden |

## H2. 1990-luvun lama osui teollisuusalueisiin

- **Kirjattu:** 25.11.2026 (`docs/skannauskoe.md`, koe 2). **Kartassa:** ei omaa yhteyttä.
- **Väite:** maakunnat, joissa teollisuuden ja rakentamisen osuus työllisistä oli 1989 suurempi,
  menettivät 1989–1993 enemmän työpaikkoja.

| Testi | Asetelma | Tulos |
|---|---|---|
| T1 Annos–vaste | 20 maakuntaa, Spearman, yksisuuntainen permutaatio | Tehty 25.11.: rho −0,07, p 0,39 |
| T2 Rakenneosuus | Shift-share-odotus vs. toteutunut | Tehty 25.11.: R² 0,28, ilman Ahvenanmaata 0,08 |

## H3. Kansanterveystyö 1972 → elinajanodote

- **Kirjattu:** 27.11.2026. **Kartassa:** solmu kansanterveyslaki-1972 (ei yhteyttä terveysvaikutuksiin).
- **Väite:** kansanterveyslaki ja Pohjois-Karjala-projekti (1972) nopeuttivat elinajanodotteen kasvua
  ennen kaikkea sydän- ja verisuonikuolleisuuden kautta.

| Testi | Asetelma | Ennuste, jos väite pitää | Tukee / kumoaa |
|---|---|---|---|
| T1 Luonnollinen koe | Mitä jos? -näkymä: synteettinen Suomi 1972 | Suomen ero kasvaa 1972 jälkeen | Tehty 26.11.: +1,2 v 1982, Suomi 2./15 |
| T2 Annos–vaste | Pohjois-Karjala vs. muut alueet (13u5, 1969–1986): verenkiertoelinten kuolleisuuden suhde muihin tauteihin, ennen (1969–71) ja jälkeen (1977–86) | Pohjois-Karjalassa suhde laskee enemmän kuin muualla, myös enemmän kuin vertailualueena olleessa Pohjois-Savossa | Tukee: Pohjois-Karjala sijalla 1–2 kaikista alueista. Kumoaa: Pohjois-Karjala alemmalla puoliskolla |
| T3 Täsmällisyys | Koko maa, 15–64-v. ikävakioitu kuolleisuus (11ay) 1972–1982 | Verenkiertoelinten kuolleisuus laskee selvästi nopeammin kuin muiden tautien | Tukee: lasku vähintään 1,5-kertainen. Kumoaa: hitaampi kuin muiden |

## Tilan säännöt

- **Asetelman vahvuus:** annos–vaste ja luonnollinen koe ovat vahvoja, toisto keskitasoa, ajoitus ja
  täsmällisyys heikkoja.
- **Kumottu:** yksi vahva asetelma kumoaa tai kaksi testiä kumoaa.
- **Vahvasti tuettu:** vähintään kaksi eri asetelmaa tukee, niistä yksi vahva, mikään ei kumoa, ja
  vähintään yksi ennuste on osunut.
- **Tuettu:** vähintään kaksi eri asetelmaa tukee, niistä yksi vahva, eikä mikään kumoa.
- **Ehdokas:** vähintään yksi testi tukee, eikä mikään kumoa.
- **Oletus:** ei testejä tai pelkkiä "ei ratkea" -tuloksia.

## H1b / T4 Odotustesti: tarkka määrittely

- **Kirjattu:** 27.11.2026, ennen laskentaa. Tarkentaa H1b:n testin T4.
- **Aineisto:**
  - Eurostat ei_bsco_m, kuluttajien luottamusindikaattori (BS-CSMCI), kausitasoitettu saldoluku,
    vuoden kuukausien keskiarvo.
  - Maat Suomi, Ruotsi ja Tanska. Norjan tieto ei ole Eurostatissa, eikä OECD:n rajapinta ole
    tavoitettavissa.
  - Syntyvyys ja työttömyys kuten H1:ssä.
- **Menetelmä:** sama kuin H1:n toistotestissä.
  - Vuosimuutokset rajataan 5–95 %:iin, ja sarjan oma jatkuvuus poistetaan AR(1)-suodatuksella.
  - Viive 1–2 vuotta, Šidákin korjaus.
  - Kolme maata yhdistetään.
- **Reilu vertailu:** luottamusta ja naisten 25–34 työttömyyttä verrataan samoissa maissa ja samoina
  vuosina (vuodet, joilta molemmat ovat saatavilla, 1995–).
- **Ennuste, jos H1b pitää:** luottamuksen nousua seuraa syntyvyyden nousu (r > 0). Yhteys on
  vähintään yhtä vahva kuin työttömyyden.
- **Tukee:** luottamuksen yhdistetty r > 0, p < 0,05 ja |r| ≥ työttömyyden |r|.
- **Kumoaa:** luottamuksen yhdistetty r ≤ 0.
- **Muuten:** ei ratkea.
- **Lisätieto, ei vaikuta tulokseen:** sama laskenta koko luottamussarjan ajalta (1985–) näytetään
  erikseen.

## Sääntölisäys: ristiriitainen näyttö

- **Kirjattu:** 27.11.2026, H1b:n odotustestin jälkeen. Alkuperäiset säännöt eivät määritelleet tätä
  tapausta.
- **Ristiriitainen:** vähintään yksi testi tukee ja yksi heikko testi kumoaa, mutta kumoavat eivät
  riitä kumoamaan (ei vahvaa asetelmaa eikä kahta kumoavaa testiä). Aiemmin tällainen yhteys olisi
  näkynyt tilana "oletus", mikä kertoisi virheellisesti, ettei sitä ole testattu.

## H1b / T4: tulos

- **Laskettu:** 27.11.2026.
- **Tulos:** kumoaa.
  - Luottamuksen yhdistetty r = −0,23 (viive 1 v, p = 0,08) eli väärä etumerkki.
  - Naisten 25–34 työttömyys samoissa maissa ja samoina vuosina: r = −0,41.
- **Tulkinta:** syntyvyys ei näytä seuraavan yleistä talousmielialaa vaan työmarkkinatilannetta.

## H1c. Nuorten aikuisten työn epävarmuus → syntyvyys (tarkennus)

- **Kirjattu:** 27.11.2026, H1:n ja H1b:n testien jälkeen ja ennen alla olevan testin laskentaa.
- **Syy:**
  - Syntyvyys seurasi koko maan nuorten naisten työttömyyttä (toisto), mutta ei alueen omaa
    työttömyyttä (H1, annos–vaste).
  - Se ei myöskään seurannut yleistä talousmielialaa (H1b, odotustesti).
- **Väite:** syntyvyys seuraa nuorten aikuisten työn epävarmuutta koko maassa. Määräaikaisuus mittaa
  epävarmuutta työttömyyttä suoremmin, koska se koskee myös niitä, joilla on työ.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T5 Määräaikaisuus | Eurostat lfsa_etpgan: määräaikaisten osuus palkansaajista, naiset 25–34, kaikki kansalaisuudet. Suomi, Ruotsi, Norja ja Tanska 1995–. Menetelmä kuten H1:n toistotestissä (rajaus, AR(1)-suodatus, viive 1–2 v, Šidák, maat yhdessä). Verrataan naisten 25–34 työttömyyteen samoissa maissa ja samoina vuosina. | Tukee: määräaikaisuuden yhdistetty r < 0, p < 0,05 ja \|r\| ≥ työttömyyden \|r\|. Kumoaa: r ≥ 0. Muuten: ei ratkea |

- **Lisätieto, ei vaikuta tulokseen:**
  - Tulokset maittain.
  - Määräaikaisuuden osittaiskorrelaatio, kun työttömyys on vakioitu.
- **Tunnettu rajoite:** työvoimatutkimuksen menetelmämuutokset (Suomessa 2021) voivat näkyä
  yksittäisen vuoden muutoksena. Rajaus 5–95 %:iin vaimentaa niitä.

## H1c / T5: tulos

- **Laskettu:** 27.11.2026.
- **Tulos:** ei ratkea.
  - Määräaikaisuuden yhdistetty r = −0,10 (viive 2 v, p = 0,52).
  - Naisten 25–34 työttömyys samoissa maissa ja samoina vuosina: r = −0,33 (p = 0,001).
  - Osittaiskorrelaatio, kun työttömyys on vakioitu: r = −0,08.
  - Maittain: Suomi −0,18, Ruotsi −0,13, Norja −0,26, Tanska +0,33. Mikään ei ole merkitsevä.
- **Tulkinta:** määräaikaisuus ei ennusta syntyvyyttä, eikä se lisää mitään työttömyyden lisäksi.
  Työn epävarmuus siinä muodossa kuin määräaikaisuus sitä mittaa ei selitä yhteyttä.

## H1d. Perheen perustamisen lykkääntyminen → syntyvyys (tarkennus)

- **Kirjattu:** 27.11.2026, H1:n, H1b:n ja H1c:n testien jälkeen ja ennen alla olevan testin laskentaa.
- **Väite:** koko maan nuorten naisten työttömyys kuvaa sitä, kuinka vaikeaa on vakiinnuttaa
  työura. Se siirtää perheen perustamista, joten vaikutus näkyy ennen kaikkea esikoisissa. Myöhempien
  lasten syntyvyys reagoi vähemmän.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T6 Esikoiset | Esikoisten kokonaishedelmällisyys ≈ TFR × esikoisten osuus syntyneistä, joiden järjestysluku tunnetaan (Eurostat demo_fordagec). Myöhemmät = TFR − esikoiset. Suomi, Ruotsi, Norja ja Tanska 1995–2024. Selittäjä naisten 25–34 työttömyys. Menetelmä kuten aiemmissa (log-muutokset, rajaus, AR(1), viive 1–2 v, Šidák, maat yhdessä). | Tukee: esikoisten r < 0, p < 0,05 ja \|r\| > myöhempien \|r\|. Kumoaa: esikoisten r ≥ 0, tai myöhempien r on negatiivisempi kuin esikoisten ja p < 0,05. Muuten: ei ratkea |

- **Aineiston tarkistus ennen tulosta:** Suomen likiarvoa verrataan tarkkaan esikoisten
  hedelmällisyyteen (12dm ja 12c6, `statfin.synt.tfr_order_1`). Jos vuosimuutosten korrelaatio on
  alle 0,9, testi tehdään vain Suomen tarkalla sarjalla ja tulos on enintään "ei ratkea".

## H1d / T6: tulos

- **Laskettu:** 27.11.2026.
- **Aineiston tarkistus:** likiarvon ja Suomen tarkan sarjan vuosimuutosten korrelaatio oli 0,996.
  Testi tehtiin siksi neljällä maalla.
- **Tulos:** tukee.
  - Esikoiset: r = −0,29 (viive 2 v, p = 0,009).
  - Myöhemmät lapset: r = −0,17 (viive 2 v, p = 0,20).
- **Varaukset:**
  - Esikoisten ja myöhempien lasten ero ei itsessään ole tilastollisesti merkitsevä.
  - Maittain kuva vaihtelee:
    - Suomi: esikoiset −0,55, myöhemmät −0,47.
    - Ruotsi: −0,42 ja −0,40.
    - Norja: −0,12 ja −0,26.
    - Tanska: +0,16 ja +0,24, ja vain 19 vuotta aineistoa.
  - Tulos on heikko asetelma (täsmällisyys), joka nostaa H1d:n enintään ehdokkaaksi.

## H1e. Nuorten aikuisten työllisyys → syntyvyys (seulan jyvä)

- **Kirjattu:** 27.11.2026, ennen alla olevien testien laskentaa.
- **Lähde:** seulan maajako (`docs/seula.md`).
  - Löytö Suomessa: työllisyysaste 30–34 → kokonaishedelmällisyys, viive 2 v, r = 0,65.
  - Vahvistus Ruotsissa, Norjassa ja Tanskassa: r = 0,38, p = 0,0003.
  - Seulan vahvistus on jo tehty, joten se ei ole tälle merkinnälle ennalta kirjattu.
- **Väite:** kun 30–34-vuotiaiden työllisyys paranee, syntyvyys nousee noin kahden vuoden päästä.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Toisto (seula) | Seulan maajako, ks. yllä | Tehty seulassa: tukee |
| T2 Annos–vaste | 18 maakuntaa: rekisteriperusteinen työllisyysaste 30–34 (115w: työlliset / koko väestö, molemmat sukupuolet) ja kokonaishedelmällisyys (12du). Kiinteät alue- ja vuosivaikutukset, log TFR, viive 2 v, 1992–2025. Permutaatio: maakuntien työllisyyssarjojen sekoitus 2 000 kertaa. Asetelma on sama kuin H1:n annos–vaste-testissä. | Tukee: kerroin > 0 ja p < 0,05. Kumoaa: kerroin ≤ 0. Muuten: ei ratkea |
| E2 Ennuste | Pohjoismaiden yhdistetty malli Δlog TFR(t) = a + b · ΔE(t−2), jossa E on Turson työllisyysaste 30–34, maat FI, SE, NO ja DK | TFR 2026 ja 2027 Suomessa, 80 %:n väli. Osuma: toteutunut arvo välillä |

## H1e: tulos

- **Laskettu:** 27.11.2026.
- **T2 Annos–vaste: ei ratkea.**
  - Kerroin +0,03 % syntyvyyttä työllisyysasteen prosenttiyksikköä kohden (p = 0,45, 18 maakuntaa,
    1992–2025).
  - Suunta oli ennustettu, mutta yhteys on käytännössä nolla.
- **E2 Ennusteet:** TFR 2026 = 1,27 (1,23–1,32) ja 2027 = 1,26 (1,19–1,33). Ne ovat lähes samat kuin
  H1:n työttömyysmallin ennusteet.
- **Tulkinta:**
  - Sama kuvio kuin H1:ssä: työmarkkinat ja syntyvyys liikkuvat yhdessä maiden tasolla, mutta eivät
    maakuntien välillä.
  - Yhteys ei siis näytä kulkevan oman alueen työtilanteen kautta.
  - Vaihtoehdot ovat koko maan tilanne (esim. ilmapiiri, asuntomarkkinat, politiikka) tai jokin
    kolmas kansallinen tekijä.
  - Muuttoliike voi myös hämärtää alue-eroja: ihmiset muuttavat töiden perässä ennen lasten
    saamista.

## H1f. Asuntomarkkinat → syntyvyys

- **Kirjattu:** 27.11.2026, ennen alla olevien testien laskentaa.
- **Syy:** H1 ja H1e osoittivat, että syntyvyys liikkuu koko maan työmarkkinoiden kanssa mutta ei
  alueiden välillä. Asuntomarkkinat ovat yksi koko maan tasolla vaikuttava reitti.
- **Väite:** perheasunnon hinta ratkaisee. Kun asuntojen reaalihinnat tai korot nousevat, syntyvyys
  laskee noin 1–2 vuoden päästä. Yhteys on vähintään yhtä vahva kuin työllisyyden.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Asuntojen hinnat | Eurostat prc_hpi_a (kaikki asunnot, 2015 = 100) deflatoituna kuluttajahinnoilla (prc_hicp_aind, CP00). Suomi, Ruotsi, Norja ja Tanska 2005–. Log-muutokset, rajaus, AR(1), viive 1–2 v, Šidák, maat yhdessä. Vertailu työllisyysasteeseen 30–34 (Turso) samoissa maissa ja samoina vuosina. | Tukee: r < 0, p < 0,05 ja \|r\| ≥ työllisyyden \|r\|. Kumoaa: r ≥ 0. Muuten: ei ratkea |
| T2 Korot | Eurostat irt_lt_mcby_a (pitkä korko). Suomi, Ruotsi ja Tanska 1990–, Norjan tieto puuttuu. Korkojen muutokset prosenttiyksikköinä, muuten kuten T1. Vertailu työllisyyteen samoissa maissa ja samoina vuosina. | Tukee: r < 0, p < 0,05 ja \|r\| ≥ työllisyyden \|r\|. Kumoaa: r ≥ 0. Muuten: ei ratkea |

- **Tunnettu ongelma:** asuntojen hinnat nousevat yleensä hyvinä aikoina. Positiivinen yhteys
  syntyvyyteen olisi siksi suhdanteen merkki, ei hintojen kustannusvaikutus. Se kumoaa väitteen, mutta
  sitä ei tulkita todisteeksi vauraudesta.

## H1f: tulos

- **Laskettu:** 27.11.2026.
- **T1 Asuntojen reaalihinnat: ei ratkea.**
  - r = −0,15 (viive 2 v, p = 0,42).
  - Työllisyys 30–34 samoina vuosina: r = +0,43 (p = 0,001).
  - Maittain: Suomi −0,41, Ruotsi −0,30, Norja −0,23, Tanska +0,16. Yksikään ei ole merkitsevä, ja
    vuosia on vain 17.
- **T2 Pitkä korko: ei ratkea.**
  - r = −0,12 (viive 1 v, p = 0,51).
  - Työllisyys samoina vuosina: r = +0,45 (p < 0,001).
  - Suomessa suunta oli päinvastainen (+0,39).
- **Tulkinta:**
  - Asuntojen hinnat ja korot liikkuvat odotettuun suuntaan, mutta ennustavat syntyvyyttä selvästi
    heikommin kuin työllisyys samoilla vuosilla ja samoissa maissa.
  - Asuntomarkkinat eivät näillä mittareilla selitä työllisyyden ja syntyvyyden yhteyttä.
  - Hintatesti on heikkovoimainen (2005–).

## H1g. Rahan riittävyys → syntyvyys

- **Kirjattu:** 27.11.2026, ennen alla olevien testien laskentaa.
- **Kysymys (käyttäjältä):** vähensikö finanssikriisi kotitalouksien käytössä olevaa rahaa, ja
  näkyykö se syntyvyydessä?
- **Väite:** kun kotitalouksien käytettävissä olevat reaalitulot tai luotonsaanti kasvavat, syntyvyys
  nousee noin 1–2 vuoden päästä. Yhteys on vähintään yhtä vahva kuin työllisyyden.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Reaalitulot | Eurostat nasa_10_ki B7G_R_HAB_GR (kotitalouksien oikaistu reaalinen käytettävissä oleva tulo asukasta kohti, vuosimuutos %, S14_S15). Suomi, Ruotsi ja Tanska 1996–, Norjan tieto puuttuu. Vuosimuutos on jo muutos, joten sitä käytetään sellaisenaan (rajaus, AR(1)). Viive 1–2 v, Šidák, maat yhdessä. Vertailu työllisyyteen 30–34 samoissa maissa ja samoina vuosina. | Tukee: r > 0, p < 0,05 ja \|r\| ≥ työllisyyden \|r\|. Kumoaa: r ≤ 0. Muuten: ei ratkea |
| T2 Luotto | Eurostat nasa_10_ki DIR_S14_S15 (kotitalouksien velka / tulot), muutos %-yks. Muuten kuten T1. | Kuten T1 |
| T3 Annos–vaste | 18 maakuntaa (ilman Ahvenanmaata): StatFin 14ww, käytettävissä oleva rahatulo kulutusyksikköä kohden, mediaani, log. Kiinteät alue- ja vuosivaikutukset (vuosivaikutus poistaa yhteisen hintatason), viive 2 v, syntyvyys 12du, 1997–2025. Permutaatio 2 000 kertaa. | Tukee: kerroin > 0 ja p < 0,05. Kumoaa: kerroin ≤ 0. Muuten: ei ratkea |

- **Kuvaileva osa (ei testi):** Suomen rahan määrä ja pankkiluotot (JST, –2020) sekä kotitalouksien
  reaalitulot asukasta kohti Suomessa, Ruotsissa ja Tanskassa vuoden 2008 tasoon verrattuna.
  Merkitään finanssikriisi (2008) ja EKP:n määrällisen keventämisen alku (3/2015).
- **Rajoite:** määrällisen keventämisen vaikutusta ei voi tällä aineistolla erottaa muista samaan
  aikaan tapahtuneista asioista. Se näytetään vain ajoituksena.
