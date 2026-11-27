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

## H1g: tulos

- **Laskettu:** 27.11.2026.
- **T1 Reaalitulot: ei ratkea.**
  - r = +0,37 (viive 2 v, p = 0,002). Suomi +0,52, Ruotsi +0,41, Tanska +0,13.
  - Yhteys on merkitsevä, mutta heikompi kuin työllisyyden samoina vuosina (r = +0,45), joten
    kirjattu ehto ei täyty.
- **T2 Luotto: ei ratkea.**
  - Yhdistetty r = +0,30 (viive 1 v, p = 0,01), mutta heikompi kuin työllisyyden.
  - Maittain vahvin viive (2 v) antaa päinvastaisen suunnan Suomessa (−0,40) ja Ruotsissa (−0,57).
    Yhteys ei ole vakaa.
- **T3 Annos–vaste: kumoaa.** 10 % muita suurempi tulojen nousu → syntyvyys −1,2 % (p = 0,64, 18
  maakuntaa). Suunta on väärä.
- **Tila:** kumottu, koska vahva asetelma kumoaa.
- **Kuvaileva osa** (ei testi, eikä tämä aineisto erota määrällisen keventämisen vaikutusta muista
  syistä):
  - Suomen lavea rahamäärä kasvoi 2007–2008 13–16 % vuodessa ja 2009 vain 0,5 %. Pankkiluotot
    kasvoivat 2008 11,6 % ja 2009 1,1 %.
  - Vuonna 2015 rahamäärä kasvoi 10 %, mutta luotot vain 3,9 %.
  - Kotitalouksien reaalitulot asukasta kohti kasvoivat 2008–2015:
    - Suomessa +2,2 %: huippu 2011, sen jälkeen laskua ja paluu vuoden 2011 tasolle vasta 2016.
    - Ruotsissa +10,3 %.
    - Tanskassa +8,4 %.
  - Vuosina 2015–2019 tulot kasvoivat Suomessa +6,8 %, Ruotsissa +3,2 % ja Tanskassa +7,5 %.
- **Toistuva kuvio:** kolmas kerta, kun koko maan taso ennustaa syntyvyyttä mutta maakuntien väliset
  erot eivät: työttömyys (H1), työllisyys (H1e) ja tulot (H1g).

## H4. Työttömyys → julkisten palvelujen kasvu hidastuu (seulan jyvä)

- **Kirjattu:** 27.11.2026, ennen T2:n ja T3:n laskentaa.
- **Lähde:** seulan aikajako. Työttömyysaste → kotitalouksien luontoismuotoiset sosiaaliset
  tulonsiirrot (D63), viive 1 v.
  - Löytö ≤ 2000: r = −0,72.
  - Vahvistus 2001–2025: r = −0,49, p = 0,009.
- **Väite:** kun työttömyys nousee, julkisten palvelujen (D63: julkisyhteisöjen maksamat palvelut,
  kuten terveys, koulutus ja hoiva) reaalikasvu hidastuu 1–2 vuoden päästä. Rahaetuudet (D62)
  sen sijaan kasvavat, koska ne joustavat automaattisesti.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Toisto ajassa (seula) | ks. yllä | Tehty: tukee |
| T2 Toisto maissa | Ruotsi ja Tanska 1996–2025 (Norjan D63 puuttuu): Eurostat lfsa_urgan (työttömyys 15–74, %, muutos %-yks.) → nasa_10_nf_tr D63 (S13, PAID, käyvin hinnoin) deflatoituna BKT:n hintaindeksillä (nama_10_gdp PD15_NAC), log-muutos. Rajaus, AR(1), viive 1–2, Šidák, maat yhdessä. | Tukee: r < 0 ja p < 0,05. Kumoaa: r ≥ 0 |
| T3 Täsmällisyys | Suomi, Ruotsi ja Tanska yhdessä, sama menetelmä. D62 (rahaetuudet) verrattuna D63:een. | Tukee: D63:n r < 0 ja D62:n r > D63:n r. Kumoaa: D62:n r ≤ D63:n r. Muuten: ei ratkea |

## H5. Nuorten aikuisten työttömyys pitkittyy (seulan jyvä)

- **Kirjattu:** 27.11.2026, ennen T2:n laskentaa.
- **Lähde:** seulan maajako. Naisten 25–34 työttömyys → pitkäaikaistyöttömien osuus työttömistä
  30–34, viive 1 v.
  - Löytö Suomessa: r = 0,63.
  - Vahvistus Ruotsissa, Norjassa ja Tanskassa: r = 0,51, p = 0,0003.
- **Väite:** työttömyysaalto jättää jäljen. Pitkäaikaistyöttömien osuus nousee ja on vielä kolmen
  vuoden päästä koholla. Pelkkä yhden vuoden nousu syntyy mekaanisesti, koska työttömyysjaksot
  pitenevät, joten se ei vielä riitä.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Toisto maissa (seula) | ks. yllä | Tehty: tukee |
| T2 Pysyvyys | Suomi, Ruotsi, Norja ja Tanska (Turso, 1995–). Naisten 25–34 työttömyyden muutos vuonna t ja pitkäaikaistyöttömien osuuden (30–34) muutos vuodesta t vuoteen t + 3. Korrelaatio maat yhdessä. p lasketaan efektiivisellä otoskoolla n / 3, koska kolmen vuoden jaksot menevät päällekkäin. | Tukee: r > 0 ja p < 0,05. Kumoaa: r ≤ 0 |

## H4: tulos

- **Laskettu:** 27.11.2026.
- **T2 Toisto maissa: ei ratkea.**
  - Ruotsi ja Tanska yhdessä r = −0,14 (viive 2 v, p = 0,53).
  - Maittain (vahvin viive): Ruotsi −0,10, Tanska −0,34. Suomi samalla Eurostat-aineistolla −0,20.
- **T3 Täsmällisyys: kumoaa.**
  - Rahaetuudet (D62) r = −0,25, palvelut (D63) r = −0,16.
  - Rahaetuuksien kasvu ei kiihtynyt vaan hidastui 1–2 vuotta työttömyyden nousun jälkeen, jopa
    enemmän kuin palvelujen.
- **Tila:** ristiriitainen. Seulan aikajako tukee, täsmällisyys kumoaa (heikko asetelma) ja toisto
  muissa maissa jää ratkaisematta.
- **Tulkinta:** työttömyyden nousua seuraa julkisten menojen kasvun yleinen hidastuminen, ei
  palveluihin kohdistuva leikkaus. Suomen löydös ei toistu Ruotsissa ja Tanskassa.

## H5: tulos

- **Laskettu:** 27.11.2026.
- **T2 Pysyvyys: tukee.**
  - r = +0,39 (n = 71, efektiivinen 23, yksisuuntainen p = 0,03).
  - Maittain: Suomi +0,31, Ruotsi +0,45, Norja +0,50, Tanska +0,46, eli sama suunta kaikissa.
- **Tila:** ehdokas, koska kaksi eri asetelmaa tukee, mutta kumpikaan ei ole vahva.
- **Seuraava vahva asetelma:** annos–vaste kohorteittain tai alueittain. Ikäluokat, jotka tulivat
  työmarkkinoille laman aikana, verrattuna muihin.

## H5 / T3 Ikäluokkatesti (annos–vaste kohorteittain)

- **Kirjattu:** 27.11.2026, ennen laskentaa.
- **Väite:** ikäluokat, jotka tulivat työmarkkinoille huonona aikana, ovat 33–37-vuotiaina muita
  harvemmin töissä.
- **Aineisto:** StatFin 115c (väestö pääasiallisen toiminnan, iän ja vuoden mukaan 1987–2024, molemmat
  sukupuolet).
- **Altistus:** 25–54-vuotiaiden työttömyysaste (työttömät / työvoima) keskimäärin niinä vuosina, kun
  ikäluokka oli 21–24-vuotias. Altistus mittaa koko maan työmarkkinatilannetta eikä ikäluokan omaa
  tilannetta.
- **Seuraus:** ikäluokan työllisyysaste (työlliset / väestö) 33–37-vuotiaana keskimäärin, josta on
  vähennetty 30–44-vuotiaiden työllisyysaste samoina vuosina. Erotus poistaa vuoden suhdanteen.
- **Ikäluokat:** syntyneet 1966–1987, eli ne, joilla on havainto kaikista ikävuosista 21–24 ja 33–37.
- **Menetelmä:**
  - Molemmista poistetaan lineaarinen trendi syntymävuoden suhteen, jotta esimerkiksi koulutuksen
    pidentyminen ei näy vaikutuksena.
  - Tunnusluku on Pearsonin r ikäluokkien yli.
  - p-arvo saadaan permutaatiotestillä, jossa altistusta siirretään kehämäisesti ikäluokkien yli
    kaikilla mahdollisilla siirroilla. Siirto säilyttää altistuksen sujuvan vaihtelun.
- **Tukee:** r < 0 ja yksisuuntainen p < 0,05. **Kumoaa:** r ≥ 0. Muuten: ei ratkea.
- **Lisätieto, ei vaikuta tulokseen:**
  - Tulos naisille ja miehille erikseen.
  - Ennustettu ero ikäluokkien välillä: työllisyys 33–37-vuotiaana prosenttiyksikköinä, kun
    altistuksen ero on 5 prosenttiyksikköä.

## H5 / T3: tulos

- **Laskettu:** 27.11.2026.
- **Tulos:** kumoaa.
  - r = +0,42 (permutaatio-p yksisuuntaisesti = 0,77, 22 ikäluokkaa, syntyneet 1966–1987).
  - 5 %-yksikköä huonompi tulovaihe vastasi +0,3 %-yksikköä työllisyyttä 33–37-vuotiaana, eli
    vaikutus on käytännössä nolla ja väärän suuntainen.
  - Naiset r = +0,42 ja miehet r = +0,43.
  - Laman aikana 21–24-vuotiaat (syntyneet 1969–1975, altistus 12,6–17,7 %) olivat 33–37-vuotiaina
    työllisyydeltään samalla tasolla kuin muut ikäluokat.
- **Tila:** H5 kumottu, koska vahva asetelma kumoaa.
- **Tulkinta:**
  - Pitkäaikaistyöttömyyden kasvu kesti noin kolme vuotta (T2).
  - Laman ikäluokat olivat kuitenkin kymmenen vuoden päästä työllisyydeltään muiden tasolla.
  - Työllisyydessä mitattuna jälki haalistui, eikä se jäänyt pysyväksi.
  - Muita seurauksia (tulot, terveys, perheen perustaminen) tämä testi ei mittaa.

## H1d / T7 Esikoisikä ikäluokittain (annos–vaste)

- **Kirjattu:** 27.11.2026, ennen laskentaa. Tämä on H1d:n vahva asetelma.
- **Väite:** ikäluokat, jotka tulivat työmarkkinoille huonona aikana, saavat esikoisensa myöhemmin.
  30 ikävuoteen mennessä niistä harvempi on saanut esikoisen.
- **Aineisto:**
  - Esikoiset äidin iän mukaan: StatFin 12dm, 1990–2025.
  - Naiset ikävuosittain: StatFin 115c, 1987–2024. Keskiväkiluku on edellisen ja kuluvan vuoden
    lopun keskiarvo, ja vuodelle 2025 käytetään vuoden 2024 loppua.
- **Seuraus:** esikoisten kumulatiivinen hedelmällisyys 20–29-vuotiaana, eli esikoisten määrä naista
  kohden 30 ikävuoteen mennessä. Alle 20-vuotiaiden synnytykset puuttuvat, koska aineisto alkaa 1990,
  mutta niiden osuus on pieni.
- **Altistus:** sama kuin H5:n ikäluokkatestissä, eli 25–54-vuotiaiden työttömyysaste (115c) niinä
  vuosina, kun ikäluokka oli 21–24-vuotias.
- **Ikäluokat:** syntyneet 1970–1996.
- **Menetelmä:** sama kuin H5:n ikäluokkatestissä (lineaarinen trendi pois, Pearson r, kehämäinen
  permutaatio).
- **Tukee:** r < 0 ja yksisuuntainen p < 0,05. **Kumoaa:** r ≥ 0. Muuten: ei ratkea.
- **Lisätieto, ei vaikuta tulokseen:** esikoiset 20–39-vuotiaana (syntyneet 1970–1986). Jos kyse on
  pelkästä lykkäämisestä, ero tasoittuu 40 ikävuoteen mennessä. Jos ei tasoitu, osa esikoisista jää
  kokonaan syntymättä.

## H1d / T7: tulos

- **Laskettu:** 27.11.2026.
- **Tulos:** ei ratkea.
  - Trendikorjattu r = −0,88 (ennustettu suunta), mutta permutaatio-p = 0,11 (27 ikäluokkaa, syntyneet
    1970–1996). 5 %-yks. huonompi tulovaihe → −4,5 esikoista 100 naista kohden.
- **Miksi vahva korrelaatio ei riitä:**
  - Sekä altistus että esikoisosuus muuttuvat ikäluokasta toiseen hitaasti.
  - Altistus on korkea alussa (lama) ja lopussa (finanssikriisi), ja esikoisosuus laskee kiihtyen.
  - Trendin poiston jälkeen kahden tällaisen käyrän muodot osuvat yhteen usein myös sattumalta.
    Kehämäinen permutaatio ottaa tämän huomioon.
- **Raakaluvut:**
  - Laman ikäluokista (syntyneet 1970–1975) 47–50 % oli saanut esikoisen 30 ikävuoteen mennessä.
    Se on enemmän kuin 1980-luvulla syntyneillä (39–46 %).
  - Ikäluokkien pitkä lasku (syntyneet 1996: 30 %) peittää mahdollisen tulovaiheen vaikutuksen.
- **Lisätieto, esikoiset 40 ikävuoteen mennessä:** r = −0,60 (p = 0,06, 17 ikäluokkaa).
- **Tila:** H1d pysyy ehdokkaana. Täsmällisyys tukee, annos–vaste ei ratkea.

## H6. Alkoholiveron alennus 2004 → alkoholikuolleisuus

- **Kirjattu:** 27.11.2026, ennen laskentaa.
- **Tausta:** alkoholivero alennettiin 1.3.2004 keskimäärin noin kolmanneksella. Samaan aikaan Viro
  liittyi EU:hun ja tuontikiintiöt poistuivat.
- **Väite:** alennus nosti alkoholiperäistä kuolleisuutta. Muihin kuolinsyihin se ei vaikuttanut.
- **Aineisto:** StatFin 11ay, ikävakioitu kuolleisuusluku koko väestössä 1971–2025. Alkoholi = koodi
  41 (alkoholiperäiset taudit ja tapaturmainen alkoholimyrkytys). Muut taudit = 00-41 miinus 41.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Luonnollinen koe | Log-kuolleisuuden lineaarinen trendi 1992–2003, poikkeama siitä keskimäärin 2004–2007. Vertailuna lumejaksot: kaikki nelivuotisjaksot, joiden alkuvuosi on 1983–2022 ja joille on 12 vuoden esijakso, ja jotka eivät osu vuosiin 2004–2007 (esijakso mukaan lukien). | Tukee: poikkeama > 0 ja suurempi kuin 95 %:ssa lumejaksoista. Kumoaa: poikkeama ≤ 0. Muuten: ei ratkea |
| T2 Negatiivinen kontrolli | Sama laskenta muille taudeille | Tukee: alkoholi on yli 95. persentiilin ja muut taudit eivät ole. Kumoaa: muiden tautien poikkeama ≥ alkoholin poikkeama. Muuten: ei ratkea |
| T3 Ajoitus | Alkoholin myynti 15 vuotta täyttäneille (Turso, l / hlö) ja alkoholikuolleisuus 1972–2024. Log-muutokset, rajaus, AR(1), viive 0–1 v, Šidák. | Tukee: r > 0 ja p < 0,05. Kumoaa: r ≤ 0. Muuten: ei ratkea |

- **Lisätieto, ei vaikuta tulokseen:** sama T1-laskenta henkirikoksille (koodi 51) sekä miehille ja
  naisille erikseen.

## H6: tulos

- **Laskettu:** 27.11.2026.
- **T1 Luonnollinen koe: ei ratkea.**
  - Alkoholikuolleisuus oli 2004–2007 keskimäärin +15 % vuosien 1992–2003 trendistä.
  - Se on suurempi kuin 19:ssä 21 lumejaksosta (90 %), kun kirjattu raja oli 95 %.
  - Kuolleisuus nousi jo ennen alennusta (22 → 30 / 100 000 vuosina 1994–2003), mikä vaikeuttaa
    katkoksen erottamista.
  - Raakaluvut: 2003: 30,2 → 2004: 35,4 → 2007: 40,2.
- **T2 Negatiivinen kontrolli: ei ratkea.** Muut taudet −5 % trendistä (persentiili 5). Kontrolli
  käyttäytyi ennustetusti, mutta tukeminen edellytti, että alkoholi ylittää 95. persentiilin.
- **T3 Ajoitus: tukee.** Myynnin muutos → alkoholikuolleisuuden muutos r = +0,34 (viive 1 v,
  p = 0,03, n = 52).
- **Lisätieto:**
  - Miehet +16 % (persentiili 95), naiset +10 % (persentiili 86).
  - Henkirikokset +3 % (persentiili 52), eli henkirikoksissa ei näy katkosta.
- **Tila:** ehdokas, koska yksi heikko testi tukee eikä mikään kumoa.

## H6 / T4–T5 Hinta-annos ja korotusvuodet

- **Kirjattu:** 27.11.2026, ennen laskentaa.
- **Miksi hinta eikä verokalenteri:** kattavaa virallista luetteloa veronmuutoksista ei löytynyt.
  Annos mitataan siksi alkoholijuomien reaalihinnan muutoksena, jota verotus pääosin ohjaa.
- **Aineisto:**
  - StatFin 15b5, kuluttajahintaindeksi kuukausittain 1995–: 02.1 Alkoholijuomat ja 0 Yhteensä.
  - Vuoden reaalihinta = alkoholijuomien vuosikeskiarvo / kokonaisindeksin vuosikeskiarvo.
  - Kuolleisuus kuten T1:ssä (11ay, koodi 41, ikävakioitu).

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T4 Hinta-annos | Reaalihinnan log-muutos ja alkoholikuolleisuuden log-muutos 1996–2025. Rajaus, AR(1), viive 0–1 v, Šidák. | Tukee: r < 0 ja p < 0,05. Kumoaa: r ≥ 0. Muuten: ei ratkea |
| T5 Korotusvuodet | Vuodet 2005–2024, joina reaalihinta nousi vähintään 3 % (määräytyy aineistosta). Verrataan alkoholikuolleisuuden log-muutoksen keskiarvoa seuraavana vuonna (t + 1) korotusvuosien ja muiden vuosien välillä. Permutaatiotesti: korotusvuosien leimat sekoitetaan 5 000 kertaa. | Tukee: korotusvuosien jälkeen kuolleisuus laskee enemmän ja yksisuuntainen p < 0,05. Kumoaa: ei laske enemmän. Muuten: ei ratkea |

- **Lisätieto, ei vaikuta tulokseen:**
  - T4 ilman vuotta 2004, jolloin jäljelle jäävät korotukset ja pienet muutokset.
  - Myynnin vaste samalla asetelmalla.

## H6 / T4–T5: tulos

- **Laskettu:** 27.11.2026.
- **T4 Hinta-annos: ei ratkea.**
  - r = −0,35 (viive 0 v, p = 0,12, n = 29).
  - Ilman vuotta 2004: r = −0,20 (p = 0,51).
  - Myynti samalla asetelmalla: r = −0,35 (p = 0,13).
- **T5 Korotusvuodet: ei ratkea.**
  - Aineistosta tunnistuneet vuodet: 2008, 2009, 2012 ja 2018.
  - Kuolleisuus muuttui seuraavana vuonna −2,8 %, muina vuosina −1,4 % (p = 0,31).
- **Reaalihinta:**
  - 2003: 110 → 2004: 94 → 2007: 87.
  - Nousu 2008–2014 takaisin tasolle 101.
- **Tulkinta:**
  - Järjestys sopii väitteeseen: hinta laski 2004 ja kuolleisuus nousi, ja kun hinta nousi
    2008–2014, kuolleisuus kääntyi laskuun.
  - Vuositason aineisto (alle 30 vuotta) ei kuitenkaan riitä erottamaan vaikutusta muusta
    vaihtelusta.
- **Tila:** ehdokas ennallaan.

## H7. Työttömyys → itsemurhat

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Tausta:** Suomen itsemurhakuolleisuus oli huipussaan 1990, juuri ennen lamaa, ja laski laman
  aikana. Vaikutuksen suunta on siksi kiistanalainen.
- **Väite:** työttömyyden nousu lisää itsemurhia.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Annos–vaste | 18 maakuntaa ilman Ahvenanmaata. Itsemurhat: StatFin 13u5, koodi 50, kaikki iät; hyvinvointialueet yhdistetään maakunniksi, Uusimaa = HVA01–04 + Helsinki. Väestö ja työttömyysaste (työttömät / työvoima, kaikki iät): StatFin 115w. Malli log(itsemurhat / 100 000)(t) ~ työttömyysaste(t − 1), kiinteät alue- ja vuosivaikutukset, 1988–2024. Permutaatio: maakuntien työttömyyssarjojen sekoitus 2 000 kertaa. | Tukee: kerroin > 0 ja p < 0,05. Kumoaa: kerroin ≤ 0. Muuten: ei ratkea |
| T2 Ajoitus koko maassa | Itsemurhat 25–64-vuotiailla (StatFin 11by: 25–44 + 45–64, lukumäärä) ja työttömyysaste (Turso: työvoimatutkimuksen historiallinen sarja), 1960–2018. Log-muutos ja muutos %-yks., rajaus, AR(1), viive 0–1 v, Šidák. | Tukee: r > 0 ja p < 0,05. Kumoaa: r ≤ 0. Muuten: ei ratkea |

- **Lisätieto, ei vaikuta tulokseen:** T1 miehille ja naisille erikseen, jos aineisto sen sallii.
  Lisäksi itsemurhat 1980–2005 laman ajoituksen näyttämiseksi.

## H7: tulos

- **Laskettu:** 27.11.2026.
- **T1 Annos–vaste: kumoaa.** 1 %-yks. muita suurempi työttömyys → itsemurhat −0,3 % seuraavana
  vuonna (p = 0,63, 18 maakuntaa, 1988–2024).
- **T2 Ajoitus koko maassa: ei ratkea.**
  - r = +0,12 (viive 1 v, p = 0,60, n = 57).
  - Miehet +0,17, naiset +0,26 (p = 0,09).
- **Korjaus taustatietoon:** 25–64-vuotiaiden itsemurhat eivät laskeneet laman aikana. Lukumäärä
  oli korkeimmillaan 1990–1993 (huippu 1992: 1 138) ja kääntyi laskuun vasta 1994–1996. Merkinnän
  tausta koski koko väestön kuolleisuuslukua, ja se oli epätarkka.
- **Tila:** kumottu, koska vahva asetelma kumoaa.
- **Tulkinta:** maakuntien väliset työttömyyserot eivät ennusta itsemurhien eroja. Koko maan
  tasollakin yhteys on heikko. Itsemurhien nousu 1980-luvun lopulla alkoi ennen lamaa, ja niiden
  pitkä lasku 1990-luvun puolivälistä alkaen tapahtui työttömyyden ollessa yhä korkea.

## H8. Alkoholi → itsemurhat

- **Kirjattu:** 27.11.2026, ennen laskentaa. H7:n testaamaton selitys.
- **Väite:** alkoholinkäytön kasvu lisää itsemurhia.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Ajoitus Suomessa | Alkoholin myynti 15 vuotta täyttäneille (Turso) → itsemurhat 25–64-vuotiailla (StatFin 11by), 1961–2024. Log-muutokset, rajaus, AR(1), viive 0–1 v, Šidák. | Tukee: r > 0 ja p < 0,05. Kumoaa: r ≤ 0. Muuten: ei ratkea |
| T2 Toisto Pohjoismaissa | Ruotsi, Norja ja Tanska: alkoholin myynti (Turso) → ikävakioitu itsemurhakuolleisuus (Eurostat hlth_cd_asdr 1994–2010 ja hlth_cd_asdr2 2011–2023, sauman yli ei lasketa muutosta). Menetelmä kuten T1, maat yhdessä. | Kuten T1 |
| T3 Luonnollinen koe 2004 | Itsemurhien ikävakioitu kuolleisuus (StatFin 11ay, koodi 50). Menetelmä kuten H6:n T1:ssä (trendi 1992–2003, poikkeama 2004–2007, samat lumejaksot). | Tukee: poikkeama > 0 ja suurempi kuin 95 %:ssa lumejaksoista. Kumoaa: poikkeama ≤ 0. Muuten: ei ratkea |

## H9. Masennuslääkkeet → itsemurhat

- **Kirjattu:** 27.11.2026, ennen laskentaa. H7:n testaamaton selitys.
- **Väite:** masennuslääkkeiden käytön kasvu vähentää itsemurhia.
- **Rajoite:** Suomen itsemurhien suurin lasku (1990–2000) on ennen lääkeaineiston alkua.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Toisto Pohjoismaissa | Suomi, Ruotsi, Norja ja Tanska 2000–2023: masennuslääkkeiden käyttö (Turso: N06A, DDD / 1 000 as. / vrk) → ikävakioitu itsemurhakuolleisuus (Eurostat, kuten H8:n T2). Log-muutokset, rajaus, AR(1), viive 0–1 v, Šidák, maat yhdessä. | Tukee: r < 0 ja p < 0,05. Kumoaa: r ≥ 0. Muuten: ei ratkea |

## H8: tulos

- **Laskettu:** 27.11.2026.
- **T1 Ajoitus Suomessa: tukee.** r = +0,35 (viive 0 v, p = 0,009, n = 63).
- **T2 Toisto Pohjoismaissa: kumoaa.**
  - Ruotsi, Norja ja Tanska yhdessä r = −0,17 (p = 0,28).
  - Maittain: Ruotsi −0,39, Norja −0,30, Tanska −0,33. Suomi samalla Eurostat-aineistolla 1995–2023:
    +0,28.
- **T3 Luonnollinen koe 2004: ei ratkea.** Itsemurhat 2004–2007 +1 % trendistä, suurempi kuin
  11:ssä 21 lumejaksosta.
- **Tila:** ristiriitainen. Tukeva ajoitus Suomessa, kumoava toisto muissa maissa (keskitason
  asetelma).
- **Tulkinta:** alkoholin ja itsemurhien yhteys näkyy Suomessa, mutta ei muissa Pohjoismaissa. Se
  sopii ajatukseen suomalaisen humalahakuisen juomatavan erityispiirteestä, mutta sitä ei ole
  testattu. Veronalennus 2004 ei näy itsemurhissa, vaikka se näkyi alkoholikuolleisuudessa (H6).

## H9: tulos

- **Laskettu:** 27.11.2026.
- **T1 Toisto Pohjoismaissa: tukee.**
  - Neljä maata yhdessä r = −0,27 (viive 0 v, p = 0,03, n = 79).
  - Maittain: Norja −0,56 (p = 0,02), Ruotsi −0,33, Tanska −0,30, Suomi +0,23.
- **Tila:** ehdokas.
- **Varaukset:**
  - Samanaikainen yhteys (viive 0) ei kerro suuntaa.
  - Suomessa yhteys on päinvastainen.
  - Suomen itsemurhien suurin lasku (1990–2000) on ennen lääkeaineiston alkua.

## H10. Oppivelvollisuuden laajennus 2021 → nuorten syrjäytyminen koulutuksesta ja työstä

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Tausta:** oppivelvollisuus laajeni 18 ikävuoteen ikäluokasta 2005 alkaen (peruskoulun päättäneet
  keväällä 2021). Ikäluokka 2005 täytti 18 vuotta 2023, ikäluokka 2006 vuonna 2024.
- **Väite:** laajennus vähensi niiden 18-vuotiaiden osuutta, jotka eivät opiskele eivätkä ole töissä.
- **Aineisto:** StatFin 115c, väestö pääasiallisen toiminnan mukaan ikävuosittain 31.12., 1987–2024.
  - Mittari: (työttömät + muut työvoiman ulkopuolella olevat) / koko ikäluokka, %.
  - Alle 18-vuotiaat on luokiteltu opiskelijoiksi vuodesta 2005, joten testi tehdään 18-vuotiailla.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Luonnollinen koe | 18-vuotiaat: osuuden lineaarinen trendi 2011–2022, poikkeama siitä keskimäärin 2023–2024 (%-yks.). Lumejaksot: kaikki kaksivuotiset jaksot, joiden alkuvuosi on 1999–2021 ja joilla on 12 vuoden esijakso, laskettuina samoin. | Tukee: poikkeama < 0 ja pienempi kuin 95 %:ssa lumejaksoista. Kumoaa: poikkeama ≥ 0. Muuten: ei ratkea |
| T2 Vertailuryhmä | 21-vuotiaat (ikäluokat 2002–2003, eivät laajennuksen piirissä), sama laskenta | Tukee: T1 tukee ja 21-vuotiaiden poikkeama ei ole lumejaksojen alimman 5 %:n joukossa. Kumoaa: 21-vuotiaiden poikkeama on yhtä suuri tai suurempi lasku kuin 18-vuotiaiden. Muuten: ei ratkea |

- **Lisätieto, ei vaikuta tulokseen:** opiskelijoiden osuus 18-vuotiaista, tytöt ja pojat
  erikseen, sekä 19-vuotiaat vuonna 2024 (ikäluokka 2005).

## H10: tulos

- **Laskettu:** 27.11.2026.
- **T1 Luonnollinen koe: kumoaa.**
  - 18-vuotiaat, jotka eivät opiskele eivätkä ole töissä: 2023–2024 +0,5 %-yks. vuosien 2011–2022
    trendistä.
  - Osuus 2022: 4,9 % → 2023: 5,9 % → 2024: 4,9 %.
- **T2 Vertailuryhmä: ei ratkea.** 21-vuotiaat +0,6 %-yks. trendistä.
- **Lisätieto:**
  - Opiskelijoiden osuus 18-vuotiaista +2,0 %-yks. trendistä (suurempi kuin 18:ssa 23
    lumejaksosta, ei poikkeuksellinen).
  - Pojat +0,7 ja tytöt +0,3 %-yks.
  - 19-vuotiaiden osuus laski 2024 (20,4 → 17,1 %), mutta samankokoiset vuosimuutokset ovat
    tavallisia (esim. 2021: −5,1).
- **Tila:** kumottu, koska vahva asetelma kumoaa.
- **Rajoite, joka rajaa tulkintaa:**
  - Tilasto mitataan 31.12. Silloin koko ikäluokka on jo täyttänyt 18, ja oppivelvollisuus on
    päättynyt.
  - Testi mittaa siksi, jatkuuko vaikutus oppivelvollisuuden päättymisen jälkeen. Sitä, pysyivätkö
    nuoret koulussa oppivelvollisuuden aikana, se ei mittaa, koska alle 18-vuotiaat on luokiteltu
    opiskelijoiksi.
  - Kumottu koskee siis vain kirjattua väitettä 18-vuotiaiden tilanteesta.

## H11. Ulkomaan kansalaisten osuus → Suomen kansalaisten työllisyys

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema. Väite esiintyy usein julkisessa
  keskustelussa.
- **Väite:** kun ulkomaan kansalaisten osuus työikäisistä kasvaa, Suomen kansalaisten työllisyys
  heikkenee.
- **Aineisto:** StatFin 115f, väestö pääasiallisen toiminnan ja kansalaisuuden mukaan maakunnittain
  2000–2024. Ikäryhmä 18–64, nuorempaa ryhmää ei ole saatavilla. 18 maakuntaa ilman Ahvenanmaata.
- **Tunnettu vinouma:**
  - Maahanmuuttajat muuttavat alueille, joilla työpaikat lisääntyvät. Se vinouttaa tulosta
    myönteiseen suuntaan.
  - Kumoava tulos (kerroin ≥ 0) ei siksi todista myönteistä vaikutusta. Se kertoo vain, ettei
    väitettyä heikkenemistä näy.
  - Vinouma ei voi tuottaa väitteen suuntaista tulosta, joten tukeva tulos olisi merkittävä.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Annos–vaste | Suomen kansalaisten työllisyysaste 18–64 (työlliset / väestö, %) vuonna t vs. ulkomaan kansalaisten osuus 18–64-vuotiaista (%) vuonna t − 1. Kiinteät alue- ja vuosivaikutukset, 2001–2024. Permutaatio: maakuntien osuussarjojen sekoitus 2 000 kertaa. | Tukee: kerroin < 0 ja yksisuuntainen p < 0,05. Kumoaa: kerroin ≥ 0. Muuten: ei ratkea |
| T2 Täsmällisyys | Sama asetelma, seurauksena Suomen kansalaisten työttömyysaste 18–64 (työttömät / työvoima) | Tukee: kerroin > 0 ja p < 0,05. Kumoaa: kerroin ≤ 0. Muuten: ei ratkea |

## H11: päätestien tulos ja tarkistukset

- **Laskettu:** 27.11.2026.
- **T1: tukee.** Kerroin −0,99 %-yks. (p = 0,003).
- **T2: tukee.** Kerroin +0,78 %-yks. (p = 0,003).
- **Tarkistukset:** kirjattu päätestien jälkeen ja ennen tarkistusten laskentaa. Vaikutus on
  epätavallisen suuri (lähes prosenttiyksikkö työllisyyttä osuuden prosenttiyksikköä kohden), ja
  tunnetaan kaksi syytä, jotka voivat tuottaa saman tuloksen ilman vaikutusta.

| Tarkistus | Asetelma | Seuraus |
|---|---|---|
| R1 Ennakkotesti | Selittäjänä osuus vuonna t + 2. Tulevaisuuden osuus ei voi vaikuttaa nykyiseen työllisyyteen. | Jos kerroin on samaa merkkiä, p < 0,05 ja vähintään puolet T1:n kertoimesta, yhteys johtuu alueiden pitkistä kehityssuunnista. T1 ja T2 merkitään "ei ratkea" |
| R2 Aluekohtaiset trendit | T1:n malliin lisätään kunkin maakunnan oma lineaarinen trendi | Jos kerroin ei ole enää negatiivinen yksisuuntaisella p < 0,05, T1 merkitään "ei ratkea" |
| R3 Poikkeusvuodet pois | T1 ilman vuosia 2015–2017 (turvapaikanhakijat) ja 2022–2024 (Ukrainan tilapäinen suojelu) | Lisätieto, ei muuta tulosta |
| R4 Kansalaisuuden saaminen | Ei voi testata tällä aineistolla, koska alueittaista syntyperää tai kieltä ei ole | Kirjataan rajoitteeksi |
