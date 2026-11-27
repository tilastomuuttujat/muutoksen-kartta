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

## H11: tarkistusten tulos

- **Laskettu:** 27.11.2026.
- **R1 Ennakkotesti: ei läpäise.** Osuus vuonna t + 2 → työllisyys vuonna t: −0,83 (p = 0,003), eli
  lähes yhtä suuri kuin T1:n −0,99.
- **R2 Aluekohtaiset trendit: ei läpäise.** Kerroin −0,16 (p = 0,32).
- **R3 Poikkeusvuodet pois:** −1,08 (p = 0,002). Tulos ei johdu vuosista 2015–2017 tai 2022–2024.
- **Seuraus kirjattujen sääntöjen mukaan:** T1 ja T2 merkitään "ei ratkea". H11:n tila on oletus.
- **Tulkinta:**
  - Ulkomaan kansalaisten osuus on kasvanut eniten maakunnissa, joiden Suomen kansalaisten
    työllisyys on kehittynyt muita heikommin.
  - Yhteys syntyy alueiden pitkistä kehityssuunnista. Aineisto ei osoita, että osuuden kasvu olisi
    heikentänyt työllisyyttä vuodesta toiseen.
  - Kansalaisuuden saamisen vaikutusta Suomen kansalaisten ryhmän koostumukseen ei voitu testata.

## Sääntölisäys: maakuntatestien vakiotarkistukset

- **Kirjattu:** 27.11.2026, H11:n tarkistusten jälkeen ja ennen kuin aiemmat maakuntatestit ajetaan
  uudelleen.
- **Koskee:** kaikkia maakuntapaneelitestejä (kiinteät alue- ja vuosivaikutukset):
  - H1 / T2
  - H1e / T2
  - H1g / T3
  - H7 / T1
  - jatkossa kaikkia uusia.
- H11 noudattaa jo samoja tarkistuksia.

**Tarkistukset:**

1. **Ennakkotesti:** selittäjä vuonna t + 2 samassa mallissa.
   - Epäonnistuu, jos kerroin on samaa merkkiä kuin päätestissä, p < 0,05 ja vähintään puolet
     päätestin kertoimesta.
2. **Aluekohtaiset trendit:** päätestin malliin lisätään kunkin maakunnan oma lineaarinen trendi.
   - Tukee, jos kerroin on ennustettua merkkiä ja yksisuuntainen p < 0,05.

**Seuraukset:**

- **Jos päätesti tukee:** tulos muuttuu "ei ratkea", jos ennakkotesti epäonnistuu tai trendimalli ei
  tue.
- **Jos päätesti kumoaa:** tulos muuttuu "ei ratkea", jos trendimalli tukee. Silloin alueiden pitkät
  kehityssuunnat ovat voineet peittää vaikutuksen.
- **Jos päätesti ei ratkea:** tulos ei muutu.
- Kaikkien tarkistusten luvut näytetään aina. Permutaatiot tehdään 1 000 kertaa.

## Vakiotarkistukset: tulos

- **Laskettu:** 27.11.2026. Yksikään tulos ei muuttunut.

| Testi | Päätesti | Ennakkotesti (t + 2) | Aluekohtaiset trendit |
|---|---|---|---|
| H1 / T2 | kumoaa | −0,09 % (p = 0,32) | +0,26 % (ennustettu −, p = 0,94) |
| H1e / T2 | ei ratkea | +0,09 % (p = 0,33) | −0,27 % (ennustettu +, p = 0,89) |
| H1g / T3 | kumoaa | 10 % → −3,1 % (p = 0,19) | 10 % → −4,4 % (ennustettu +, p = 0,95) |
| H7 / T1 | kumoaa | +0,4 % (p = 0,35) | +0,7 % (ennustettu +, p = 0,18) |

- **Tulkinta:**
  - Toisin kuin H11:ssä, näissä testeissä alueiden pitkät kehityssuunnat eivät selitä tuloksia eivätkä
    peitä vaikutuksia.
  - H7:ssä trendimallin suunta on ennustettu, mutta ei merkitsevä. Kumoava tulos jää voimaan.

## H12. Taantuma → vähemmän liikennekuolemia

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** kun työttömyys nousee, liikennekuolemat vähenevät, koska työmatkoja ja muuta ajoa on
  vähemmän.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Ajoitus Suomessa | Työttömyysaste (Turso: työvoimatutkimuksen historiallinen sarja) → maaliikennetapaturmien ikävakioitu kuolleisuus (StatFin 11ay, koodi 42), 1972–2018. Muutos %-yks. ja log-muutos, rajaus, AR(1), viive 0–1 v, Šidák. | Tukee: r < 0 ja p < 0,05. Kumoaa: r ≥ 0. Muuten: ei ratkea |
| T2 Toisto Pohjoismaissa | Ruotsi, Norja ja Tanska 2000–2024: työttömyys 15–74 (Eurostat lfsa_urgan) → tieliikennekuolemat miljoonaa asukasta kohden (Eurostat tran_sf_roadus). Menetelmä kuten T1, maat yhdessä. | Kuten T1 |
| T3 Annos–vaste | 18 maakuntaa 1988–2024. Liikennekuolemat (StatFin 13u5, koodi 42, hyvinvointialueet yhdistettyinä maakunniksi kuten H7:ssä), log((kuolleet + 1) / väestö · 100 000). Työttömyysaste (115w) samana vuonna. Kiinteät alue- ja vuosivaikutukset, permutaatio 2 000 kertaa, vakiotarkistukset. | Tukee: kerroin < 0 ja p < 0,05. Kumoaa: kerroin ≥ 0. Muuten: ei ratkea |

## H12: tulos

- **Laskettu:** 27.11.2026.
- **T1 Ajoitus Suomessa: ei ratkea.** r = −0,28 (viive 0 v, p = 0,12, n = 46).
- **T2 Toisto Pohjoismaissa: tukee.**
  - Ruotsi, Norja ja Tanska yhdessä r = −0,43 (viive 1 v, p < 0,001, n = 72).
  - Maittain: Ruotsi −0,54, Tanska −0,50, Norja −0,37. Suomi samalla Eurostat-aineistolla
    2000–2024: +0,34.
- **T3 Annos–vaste: ei ratkea (vakiotarkistus muutti).**
  - Päätesti −2,6 % työttömyyden prosenttiyksikköä kohden (p = 0,02), eli tukee.
  - Ennakkotesti −1,4 % (p = 0,17), ei epäonnistu.
  - Aluekohtaiset trendit −0,3 % (p = 0,41), eivät tue, joten tulos muuttui "ei ratkea".
- **Tila:** ehdokas, koska toisto tukee eikä mikään kumoa.
- **Tulkinta:**
  - Muissa Pohjoismaissa liikennekuolemat ovat vähentyneet työttömyyden noustessa, kuten
    taantumahypoteesi ennustaa.
  - Suomessa yhteys on heikompi, ja 2000-luvulla jopa päinvastainen.
  - Maakuntien välinen yhteys selittyy alueiden pitkillä kehityssuunnilla: liikennekuolemat ovat
    vähentyneet eniten maakunnissa, joissa työttömyys on kehittynyt muita heikommin.

## H13. Talouskasvun ja päästöjen irtikytkentä 2000-luvulla

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** talouskasvu ja päästöt kulkivat ennen tiiviisti yhdessä, mutta vuodesta 2005 alkaen
  yhteys heikkeni. Päästöjen jousto BKT:n suhteen on pienempi kuin ennen, ja päästöt laskevat
  vaikka talous kasvaa.
- **Jousto:** kulmakerroin, kun päästöjen log-muutosta selitetään BKT:n log-muutoksella samana vuonna.
  Muutoksia ei suodateta.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Suomi pitkällä aikavälillä | OWID: alueperusteiset CO₂-päästöt ja Maddison: BKT yhteensä (Turso), jousto 1961–2004 vs. 2005–2022. Ero testataan lohkobootstrapilla (3 vuoden lohkot, 5 000 toistoa). | Tukee: jousto pienempi 2005– ja yksisuuntainen p < 0,05. Kumoaa: jousto ei pienempi. Muuten: ei ratkea |
| T2 Toisto Pohjoismaissa | Ruotsi, Norja ja Tanska: kasvihuonekaasupäästöt ilman maankäyttösektoria (Eurostat env_air_gge, TOTX4_MEMO) ja kiinteähintainen BKT (nama_10_gdp CLV10_MNAC). Jousto 1996–2004 vs. 2005–2024, maakohtaiset vakiot, lohkobootstrap kuten T1. | Kuten T1 |
| T3 Absoluuttinen irtikytkentä | Suomi, Ruotsi, Norja ja Tanska: BKT:n ja kasvihuonekaasupäästöjen kokonaismuutos 2005 → 2024 | Tukee: kaikissa neljässä BKT kasvoi ja päästöt laskivat. Kumoaa: vähintään kahdessa päästöt kasvoivat. Muuten: ei ratkea |

## H13: tulos

- **Laskettu:** 27.11.2026.
- **T1 Suomi: kumoaa.** Jousto 1961–2004 0,39, 2005–2022 0,86 (p = 0,83).
- **T2 Toisto Pohjoismaissa: kumoaa.** Jousto 1996–2004 −0,95, 2005–2024 0,99.
- **T3 Absoluuttinen irtikytkentä: tukee.** 2005 → 2024 BKT kasvoi ja päästöt laskivat kaikissa
  neljässä maassa:

  | Maa | BKT | Päästöt |
  |---|---|---|
  | Suomi | +14 % | −44 % |
  | Ruotsi | +39 % | −28 % |
  | Norja | +36 % | −18 % |
  | Tanska | +30 % | −46 % |

- **Tila:** kumottu, koska kaksi testiä kumoaa.
- **Operationalisoinnin virhe (kirjattu tuloksen jälkeen):**
  - Vuosimuutosten jousto mittaa sitä, miten päästöt reagoivat suhdanteisiin. Se ei mittaa pitkää
    kehityssuuntaa.
  - Väitteen ydin, eli päästöt laskevat talouden kasvaessa, näkyy jouston sijaan vakiotermissä:
    päästöjen muutos nollakasvun vuonna.
  - Päästöt reagoivat suhdanteisiin edelleen voimakkaasti, mutta niiden pitkä kehityssuunta irtosi
    kasvusta.
  - Kirjattua tulosta ei muuteta. Oikealla mittarilla kirjattava tarkennus H13b ei olisi ennalta
    kirjattu suhteessa näihin lukuihin.

## H14. Avioerolain uudistus 1988 → avioerot

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Tausta:** 1.1.1988 voimaan tullut avioliittolain uudistus poisti syyllisyysperusteet. Avioeron sai
  puolen vuoden harkinta-ajan jälkeen tai kahden vuoden erillään asumisen perusteella.
- **Väite:** uudistus lisäsi avioeroja.
- **Aineisto:** StatFin 121v, avioerot, solmitut avioliitot ja väkiluku vuosittain. Mittari on
  tapahtumat 1 000 asukasta kohden (log).

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Luonnollinen koe | Avioerot: lineaarinen trendi 1976–1987, poikkeama keskimäärin 1988–1991. Lumejaksot: kaikki nelivuotiset jaksot, joiden alkuvuosi on 1960–2021 ja joilla on 12 vuoden esijakso, eikä jakso tai esijakso osu vuosiin 1988–1991. | Tukee: poikkeama > 0 ja suurempi kuin 95 %:ssa lumejaksoista. Kumoaa: poikkeama ≤ 0. Muuten: ei ratkea |
| T2 Negatiivinen kontrolli | Solmitut avioliitot, sama laskenta | Tukee: T1 tukee ja avioliitot eivät ylitä 95 %:a. Kumoaa: avioliittojen poikkeama ≥ avioerojen poikkeama. Muuten: ei ratkea |

- **Lisätieto, ei vaikuta tulokseen:** poikkeama 1992–1999 (pysyikö taso koholla vai purkautuiko
  vain kasautunut jono).

## H14: tulos

- **Laskettu:** 27.11.2026.
- **T1 Luonnollinen koe: tukee.**
  - Avioerot 1988–1991 +39 % vuosien 1976–1987 trendistä.
  - Poikkeama on suurempi kuin kaikissa 43 lumejaksossa.
  - Avioeroja 1 000 asukasta kohden: 1987: 2,05 → 1988: 2,45 → 1989: 2,89.
- **T2 Negatiivinen kontrolli: tukee.** Solmitut avioliitot +1 % trendistä (suurempi kuin 28:ssa 43
  lumejaksosta).
- **Lisätieto:** 1992–1999 avioeroja oli edelleen +50 % vanhan trendin yläpuolella. Uudistus nosti
  tasoa pysyvästi, eikä se vain purkanut kasautuneita eroja.
- **Tila:** tuettu, koska kaksi eri asetelmaa tukee, niistä yksi vahva, eikä mikään kumoa.

## H15. Euron käyttöönotto 2002 → hinnat

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** euron käyttöönotto käteisenä tammikuussa 2002 nosti hintoja Suomessa, koska hintoja
  pyöristettiin ylöspäin. Vaikutus näkyy eniten pienissä ostoksissa, kuten ravintoloissa ja
  kahviloissa.
- **Aineisto:** Eurostat prc_hicp_aind, yhdenmukaistettu kuluttajahintaindeksi, vuosimuutos %
  (RCH_A_AVG). Vertailuryhmä on Ruotsi, Tanska ja Norja, joissa euroa ei otettu käyttöön.
- **Tunnusluku:** Suomen inflaatio miinus vertailumaiden keskiarvo samana vuonna.
- **Lumevuodet:** 1997–2019 ilman vuosia 2001–2003. Vuodet 2020– jätetään pois, koska pandemia ja
  energiakriisi osuivat maihin eri tavoin.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Kokonaisindeksi | CP00, vuosi 2002 | Tukee: ero > 0 ja suurempi kuin 95 %:ssa lumevuosista. Kumoaa: ero ≤ 0. Muuten: ei ratkea |
| T2 Täsmällisyys | CP111 ravintolat ja kahvilat, vuosi 2002 | Kuten T1 |

- **Lisätieto:** samat erot vuosina 2001 ja 2003.

## H15: tulos

- **Laskettu:** 27.11.2026.
- **T1 Kokonaisindeksi: ei ratkea.**
  - Suomi 2,0 %, vertailumaat keskimäärin 1,7 % (Ruotsi 1,9, Tanska 2,4, Norja 0,8).
  - Ero +0,3 %-yks., suurempi kuin 14:ssä 20 lumevuodesta (suurin lumevuosien ero +2,0).
  - Ero oli 2001 +0,2 ja 2003 −0,8 %-yks.
- **T2 Ravintolat ja kahvilat: kumoaa.**
  - Suomi 3,0 %, vertailumaat keskimäärin 3,5 % (Ruotsi 4,3, Tanska 2,1, Norja 4,1).
  - Ero −0,5 %-yks.
- **Tila:** oletus. Tukevia testejä ei ole, ja kumoava testi on heikko asetelma.
- **Tulkinta:**
  - Euron käyttöönotto ei näy Suomen vuosi-inflaatiossa vertailumaihin nähden. Mahdollinen vaikutus
    on pienempi kuin tavallinen vuosivaihtelu (noin ±1 %-yks.).
  - Ravintoloiden ja kahviloiden hinnat, joissa pyöristyksen pitäisi näkyä selvimmin, nousivat
    Suomessa vähemmän kuin vertailumaissa.
  - Testi mittaa tilastoitua hintatasoa, ei koettua inflaatiota.

## H16. Kieltolain kumoaminen 1932 → henkirikokset

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Tausta:** kieltolaki oli voimassa 1.6.1919–5.4.1932. Sen aikana salakauppa ja trokaus
  yleistyivät.
- **Väite:** kieltolain kumoaminen vähensi henkirikoksia, koska laittomien alkoholimarkkinoiden
  väkivalta väheni.
- **Aineisto:** poliisin tietoon tulleet tapot ja murhat (Turso: Vuorela, historiallinen
  rikostilasto, 1927–2022, lukumäärät) ja väkiluku (StatFin 121v). Mittari on rikokset 100 000
  asukasta kohden.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Luonnollinen koe | Log-muutos viiden vuoden keskiarvosta 1927–1931 keskiarvoon 1933–1937. Lumejaksot: sama tunnusluku jokaiselle vuodelle t, jolla jaksot t − 5 … t + 4 ovat vuosien 1949–2022 sisällä (sotavuodet ja niiden jälkeinen aika pois). | Tukee: muutos < 0 ja jyrkempi kuin 95 %:ssa lumejaksoista. Kumoaa: muutos ≥ 0. Muuten: ei ratkea |
| T2 Täsmällisyys | Poliisin tietoon tulleet pahoinpitelyt, sama laskenta | Kuten T1 |

- **Rajoitteet:**
  - 1930-luvun lama (1929–1933) osuu samaan aikaan.
  - Ennen kumoamista on vain viisi vuotta aineistoa, joten trendiä ei voi sovittaa.

## H16: tulos

- **Laskettu:** 27.11.2026.
- **T1 Luonnollinen koe: tukee.**
  - Tapot ja murhat 100 000 asukasta kohden laskivat 1927–1931 → 1933–1937 −35 %.
  - Lasku on jyrkempi kuin kaikissa 65 lumejaksossa (jyrkin −25 %).
  - Tasot: 1929: 10,4 → 1932: 9,5 → 1937: 5,3.
- **T2 Täsmällisyys: kumoaa.** Pahoinpitelyt +7 % (1929: 132 → 1937: 131 / 100 000).
- **Tila:** ristiriitainen, koska vahva asetelma tukee ja heikko kumoaa.
- **Tulkinta:**
  - Kieltolain kumoamisen jälkeen vähenivät tapot ja murhat, mutta eivät pahoinpitelyt.
  - Tämä sopii ajatukseen, että kuolemaan johtanut väkivalta liittyi laittomiin
    alkoholimarkkinoihin eikä alkoholinkäyttöön yleensä, mutta tätä ei ole testattu.
  - Henkirikokset olivat huipussaan jo 1929, joten lama ja muut 1930-luvun muutokset voivat selittää
    osan laskusta.

## H17. Neuvolalaki 1944 → imeväis- ja äitiyskuolleisuus

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Kartassa:** solmu neuvolalaki-1944 ("Kunnallinen äitiys- ja lastenneuvola", ongelma: äitiys- ja
  lapsikuolleisuus).
- **Väite:** kunnallisten äitiys- ja lastenneuvoloiden perustaminen vähensi imeväis- ja
  äitiyskuolleisuutta enemmän kuin aiempi kehitys ja sodan jälkeinen yleinen terveyden paraneminen
  selittävät.
- **Aineisto:**
  - Imeväiskuolleisuus ‰: StatFin 12aq, Turso.
  - Äitiyskuolleisuus / 100 000 synnytystä: OWID, Turso.
  - Kuolleet, elävänä syntyneet ja väkiluku: StatFin 121v.
- **Asetelma:**
  - Log-trendi 1927–1938, joten sotavuodet eivät ole mukana.
  - Poikkeama keskimäärin 1946–1951, välissä seitsemän vuoden aukko.
  - Lumejaksot: sama rakenne (12 vuoden trendi, 7 vuoden aukko, 6 vuoden jakso) kaikille
    alkuvuosille 1880–2010. Jakso ei saa osua vuosiin 1914–1922 tai 1939–1951.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Luonnollinen koe | Imeväiskuolleisuus | Tukee: poikkeama < 0 ja jyrkempi kuin 95 %:ssa lumejaksoista. Kumoaa: poikkeama ≥ 0. Muuten: ei ratkea |
| T2 Täsmällisyys | Äitiyskuolleisuus | Kuten T1 |
| T3 Negatiivinen kontrolli | Muun väestön kuolleisuus: (kuolleet − imeväiskuolleet) / väkiluku. Imeväiskuolleet = imeväiskuolleisuus × elävänä syntyneet. | Tukee: T1 tukee ja kontrollin poikkeama on loivempi kuin imeväiskuolleisuuden ja alle 95 %:n. Kumoaa: kontrollin poikkeama on yhtä jyrkkä tai jyrkempi kuin imeväiskuolleisuuden. Muuten: ei ratkea |

- **Rajoite:** antibiootit (penisilliini 1940-luvulla) ja sodan päättyminen osuvat samaan aikaan. T3
  erottaa vain sen, mikä koski kaikkia ikäryhmiä.

## H17: tulos

- **Laskettu:** 27.11.2026.
- **T1 Imeväiskuolleisuus: kumoaa.** 1946–1951 +6 % vuosien 1927–1938 trendistä, jyrkempi kuin
  32:ssa 69 lumejaksosta. Imeväiskuolleisuus palasi sodan jälkeen suunnilleen sotaa edeltäneelle
  uralleen, mutta ei laskenut sitä nopeammin.
- **T2 Äitiyskuolleisuus: tukee.** −68 % trendistä, jyrkempi kuin kaikissa 69 lumejaksossa. Tasot:
  1944: 443 → 1947: 214 → 1950: 146 / 100 000.
- **T3 Negatiivinen kontrolli: kumoaa (sääntö).** Muun väestön kuolleisuus −2 % trendistä. Sääntö
  merkitsee kumoavaksi, koska kontrollin poikkeama (−2 %) on jyrkempi kuin imeväiskuolleisuuden
  (+6 %). Kontrolli ei kuitenkaan laskenut poikkeuksellisesti (persentiili 41/69).
- **Tila:** kumottu, koska vahva asetelma (T1) kumoaa.
- **Tulkinta:**
  - Neuvolalain jälkeen imeväiskuolleisuus ei laskenut sotaa edeltänyttä kehitystä nopeammin.
  - Äitiyskuolleisuus sen sijaan romahti, ja parannus koski nimenomaan äitejä.
  - Äitien kohdalla neuvolat, antibiootit (lapsivuodekuume) ja sairaalasynnytysten yleistyminen
    osuvat samaan aikaan, eikä tämä asetelma erota niitä.
- **Huomio kuvaajasta (kirjattu tuloksen jälkeen):**
  - Äitiyskuolleisuuden trendi 1927–1938 oli nouseva, joten trendiin verrattu −68 % liioittelee
    muutosta.
  - Tasoihin verrattuna äitiyskuolleisuus oli 1946–1951 keskimäärin 179 / 100 000, kun se 1927–1938
    oli 340. Lasku on −47 %, edelleen suuri.
  - Kirjattua tulosta ei muuteta.

## H18. Muutto Ruotsiin seurasi työmarkkinoita

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** suuren Ruotsiin muuton vaihtelua 1960–1992 selittivät Suomen työttömyys (työntö) ja
  Ruotsin talouskasvu (veto). Paluumuutto Suomeen reagoi päinvastoin.
- **Aineisto:**
  - Suomesta Ruotsiin ja Ruotsista Suomeen muuttaneet (Turso: Korkiasaari 1993, taulu 3, 1945–1992).
  - Suomen työttömyysaste (Turso: työvoimatutkimuksen historiallinen sarja, 1959–).
  - Ruotsin BKT asukasta kohden (Gapminder fasttrack, kuten Mitä jos? -näkymässä).
- **Menetelmä:** vuosimuutokset (log tai %-yks.), rajaus 5–95 %, AR(1)-suodatus, viive 0–1 v,
  Šidák, 1961–1992.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Työntö | Suomen työttömyyden muutos → muutto Ruotsiin | Tukee: r > 0 ja p < 0,05. Kumoaa: r ≤ 0. Muuten: ei ratkea |
| T2 Veto | Ruotsin BKT:n kasvu asukasta kohden → muutto Ruotsiin | Tukee: r > 0 ja p < 0,05. Kumoaa: r ≤ 0. Muuten: ei ratkea |
| T3 Täsmällisyys | Suomen työttömyyden muutos → paluumuutto Ruotsista | Tukee: r < 0 ja p < 0,05. Kumoaa: r ≥ 0. Muuten: ei ratkea |

## H18: tulos

- **Laskettu:** 27.11.2026.
- **T1 Työntö: kumoaa.** r = −0,30 (viive 0 v, p = 0,18, n = 32), eli suunta oli päinvastainen.
- **T2 Veto: ei ratkea.** r = +0,25 (p = 0,31).
- **T3 Paluumuutto: ei ratkea.** r = −0,39 (viive 1 v, p = 0,06).
- **Tila:** oletus. Tukevia testejä ei ole, ja kumoava testi on heikko asetelma.
- **Tulkinta:**
  - Suomen työttömyyden nousu ei lisännyt muuttoa Ruotsiin samana tai seuraavana vuonna.
  - Todennäköinen syy, jota ei ole testattu: Suomen ja Ruotsin suhdanteet kulkevat yhdessä, joten
    kun Suomen työttömyys nousee, Ruotsin veto heikkenee samaan aikaan.
  - Oikea mittari olisi maiden välinen ero, eli Ruotsin ja Suomen työmarkkinatilanteen erotus.

## H19. Nopeusrajoitukset käänsivät liikennekuolemat

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** liikennekuolemat kääntyivät laskuun vuonna 1973, kun yleinen nopeusrajoitus vakinaistettiin.
  Seuraavina vuosina tulivat lisäksi turvavyöpakko (1975) ja muut toimet. Pelkkä liikenteen
  väheneminen öljykriisissä 1973–1974 ei selitä käännettä.
- **Mekanismi:** nopeuden lasku vähentää kuolemia selvästi enemmän kuin loukkaantumisia, koska
  kuolemanriski kasvaa nopeuden noin neljännessä potenssissa ja loukkaantumisriski noin toisessa
  (Nilssonin potenssimalli). Liikenteen väheneminen pienentäisi kuolemia ja loukkaantumisia samassa
  suhteessa.
- **Aineisto:** tieliikenteessä kuolleet ja loukkaantuneet (StatFin 11bh, 1931–).
- **Menetelmä:**
  - Kuten H14: poikkeama log-lineaarisesta trendistä 12 vuoden esijaksolla (1961–1972), keskiarvona
    jaksolta 1973–1976.
  - Lumejaksot ovat kaikki muut 4 vuoden jaksot vuodesta 1960 alkaen, jotka eivät osu vuosiin
    1961–1976.
  - Persentiili tarkoittaa niiden lumejaksojen osuutta, joiden poikkeama oli tätä pienempi.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Katkos | Kuolleet 1973–1976 vs. trendi | Tukee: poikkeama < 0 ja alempi kuin 95 %:ssa lumejaksoista. Kumoaa: poikkeama ≥ 0. Muuten: ei ratkea |
| T2 Täsmällisyys | Kuolleisuus loukkaantuneisiin suhteutettuna (kuolleet / loukkaantuneet) 1973–1976 vs. trendi | Tukee: poikkeama < 0 ja alempi kuin 95 %:ssa lumejaksoista. Kumoaa: poikkeama ≥ 0. Muuten: ei ratkea |

- **Rajaus:** testit eivät erottele nopeusrajoitusta ja turvavyötä toisistaan.
  - Molemmat vähentävät vammojen vakavuutta.
  - Tuettu tulos tarkoittaa, että vakavuutta vähentävät toimet selittävät käänteen paremmin kuin
    liikenteen määrä.

## H19: tulos

- **Laskettu:** 27.11.2026.
- **T1 Katkos: ei ratkea.** Kuolleita oli 1973–1976 keskimäärin 26 % vähemmän kuin vuosien 1961–1972
  trendi ennusti.
  - Poikkeama oli pienempi kuin 30:ssä 33 lumejaksosta (persentiili 9 %).
  - Kirjattu raja oli 95 %, joten sitä ei aivan saavutettu.
- **T2 Täsmällisyys: ei ratkea.** Kuolleita sataa loukkaantunutta kohden oli vain 4 % trendiä vähemmän.
  Tämä on tavallista vaihtelua: poikkeama oli pienempi kuin 25:ssä 33 lumejaksosta.
- **Tila:** oletus. Testit eivät tue eivätkä kumoa väitettä.
- **Tulkinta:**
  - Kuolemat kääntyivät laskuun vuoden 1972 huipun (1 156) jälkeen. Käänne oli suuri mutta ei
    poikkeuksellinen verrattuna 1990-luvun laman ja 2000-luvun jaksoihin.
  - Ennustettua vakavuuden laskua ei näkynyt: loukkaantumiset vähenivät lähes samassa suhteessa kuin
    kuolemat. Se sopii yhtä hyvin liikenteen vähenemiseen öljykriisissä kuin nopeuden laskuun.
  - Kansallinen aikasarja ei siksi erota näitä selityksiä toisistaan.

## H20. Keskiolut ruokakauppoihin 1969

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** vuoden 1969 alkoholilaki lisäsi alkoholin kulutusta ja alkoholiin liittyvää väkivaltaa.
  - Keskiolut tuli ruokakauppoihin ja kahviloihin 1.1.1969.
  - Alkoholiliikkeitä sai perustaa myös maaseudulle.
- **Aineisto:**
  - Alkoholin myynti asukasta kohden Suomessa, Ruotsissa, Norjassa ja Tanskassa (Turso, 1960–).
  - Poliisin tietoon tulleet pahoinpitelyt ja petokset (Turso: HCS-sarjat, 1927–2022).
  - Väkiluku (StatFin 121v).
- **Menetelmä:**
  - Muutos on log-muutos vuodesta 1968 vuoteen 1969.
  - Lumevuodet ovat sarjan kaikki muut vuosimuutokset: myynnissä 1961–2024, rikoksissa 1950–2022.
  - Vuotta 2004 ei poisteta lumevuosista.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Luonnollinen koe | Suomen myynnin muutos miinus Ruotsin, Norjan ja Tanskan keskimääräinen muutos 1968→1969, verrattuna saman erotuksen lumevuosiin | Tukee: ero > 0 ja suurempi kuin 95 %:ssa lumevuosista. Kumoaa: ero ≤ 0. Muuten: ei ratkea |
| T2 Täsmällisyys | Pahoinpitelyt 100 000 asukasta kohden, muutos 1968→1969 verrattuna lumevuosiin | Tukee: muutos > 0 ja suurempi kuin 95 %:ssa lumevuosista. Kumoaa: muutos ≤ 0. Muuten: ei ratkea |
| T3 Kontrolli | Petokset samalla tavalla. Niiden ei pitäisi reagoida alkoholiin. | Kumoaa: petosten muutos ≥ pahoinpitelyjen muutos, jolloin kyse voi olla kirjaamisesta. Tukee: T2 tukee ja petosten muutos jää alle 95 %:n. Muuten: ei ratkea |

## H20: tulos

- **Laskettu:** 27.11.2026.
- **T1 Luonnollinen koe: tukee.**
  - Alkoholin myynti asukasta kohden kasvoi 1968→1969 Suomessa 46 % (3,9 → 5,7 litraa).
  - Ruotsissa kasvu oli 6 %, Norjassa 2 % ja Tanskassa 7 %.
  - Suomen ja vertailumaiden ero oli suurempi kuin yhdessäkään 58 lumevuodesta.
- **T2 Täsmällisyys: tukee.** Pahoinpitelyt 100 000 asukasta kohden kasvoivat 38 %. Kasvu oli
  suurempi kuin yhdessäkään 72 lumevuodesta.
- **T3 Kontrolli: tukee.** Petokset kasvoivat 8 %, mikä on tavallista vaihtelua (persentiili 60 %).
  Pahoinpitelyjen hyppy ei siis johdu yleisestä kirjaamisen muutoksesta.
- **Tila:** tuettu. Vahva asetelma (luonnollinen koe) ja täsmällisyystesti tukevat.
- **Rajaus:**
  - Pahoinpitelyt jatkoivat kasvuaan 1970-luvulla, joten testi osoittaa vain hypyn vuonna 1969, ei
    koko myöhempää kasvua.
  - Testit eivät myöskään erottele keskiolutta ja maaseudun uusia alkoholiliikkeitä toisistaan.

## H21. Vankiluvun lasku lisäsi rikollisuutta

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** kun vankiluku laski 1970-luvulta 1990-luvulle kriminaalipolitiikan muutosten myötä,
  rikollisuus kasvoi, koska vankilassa olevat eivät voi tehdä rikoksia (eristysvaikutus).
  - Väite ennustaa, että vankiluvun muutosta seuraa vastakkaissuuntainen muutos rikoksissa.
- **Aineisto:**
  - Vankeja keskimäärin päivässä (Turso: HCS, 1886–2022).
  - Poliisin tietoon tulleet ryöstöt ja pahoinpitelyt (Turso: HCS, 1927–2022).
  - Väkiluku (StatFin 121v).
  - Kaikki sarjat 100 000 asukasta kohden.
- **Menetelmä:** log-vuosimuutokset, rajaus 5–95 %, AR(1)-suodatus, viive 1–2 v, Šidák, 1950–2019.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Ajoitus | Vankiluvun muutos → ryöstöjen muutos | Tukee: r < 0 ja p < 0,05. Kumoaa: r ≥ 0. Muuten: ei ratkea |
| T2 Ajoitus | Vankiluvun muutos → pahoinpitelyjen muutos | Sama sääntö |

- **Rajaus:**
  - Rikokset voivat vaikuttaa myös vankilukuun, eli kausaalisuus voi kulkea toiseen suuntaan. Siksi
    testissä käytetään viivettä 1–2 vuotta eikä samaa vuotta.
  - Testi on heikko asetelma, joten tulos voi korkeintaan nostaa hypoteesin ehdokkaaksi tai pitää
    sen oletuksena.

## H21: tulos

- **Laskettu:** 27.11.2026.
- **T1 Ryöstöt: ei ratkea.** r = −0,18 (viive 1 v, p = 0,27, n = 69).
- **T2 Pahoinpitelyt: ei ratkea.** r = −0,12 (viive 1 v, p = 0,53, n = 69).
- **Tila:** oletus. Testit eivät tue eivätkä kumoa väitettä.
- **Tulkinta:**
  - Suunta oli väitteen mukainen, mutta vuosimuutosten yhteys oli heikko ja satunnaisvaihtelun
    rajoissa.
  - Pitkän aikavälin kuva on kaksijakoinen:
    - Vankiluku puolittui vuodesta 1965 vuoteen 1995 (146 → 64 / 100 000), ja samaan aikaan ryöstöt ja
      pahoinpitelyt kasvoivat.
    - Suuri osa kasvusta tapahtui kuitenkin jo 1965–1975, kun vankiluku oli vasta alkanut laskea.
    - Vuoden 2000 jälkeen ryöstöt vähenivät, vaikka vankiluku pysyi lähes ennallaan.
  - Yhteisiä pitkiä trendejä ei testattu, koska ne eivät erota syitä toisistaan.

## H22. EU-jäsenyys laski ruoan hintaa

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** EU-jäsenyys 1.1.1995 laski ruoan suhteellista hintaa Suomessa pysyvästi.
  - Maatalouden rajasuoja purkautui ja tuottajahinnat laskivat EU:n tasolle.
- **Aineisto:** kotitalouksien kulutusmenot käyvin hinnoin ja kiintein hinnoin (Eurostat
  nama_10_co3_p3).
  - Ruoka (CP011) ja kaikki kulutus (TOTAL).
  - Suomi 1980–, Tanska ja Norja 1975–.
- **Mittari:** ruoan suhteellinen hinta, eli ruoan hintaindeksin ja kaikkien kulutusmenojen
  hintaindeksin suhde (log). Hintaindeksi = käypä hinta / kiinteä hinta.
- **Vertailumaat:** Tanska (EU-jäsen jo 1973) ja Norja (ei jäsen).
  - Ruotsi liittyi samaan aikaan, ja sen tiedot alkavat vasta 1993, joten se esitetään vain
    kuvailevasti.
- **Lumevuodet:** kaikki muut vuodet, joilta kaikkien maiden tiedot ovat saatavilla.
  - Ruoan arvonlisäverojen muutokset (2009, 2010, 2012, 2013) jätetään lumevuosiin, mikä tekee
    testistä tiukemman.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Luonnollinen koe | Suomen suhteellisen ruoanhinnan muutos 1994→1995 miinus Tanskan ja Norjan keskiarvo, verrattuna saman erotuksen lumevuosiin | Tukee: ero < 0 ja pienempi kuin 95 %:ssa lumevuosista. Kumoaa: ero ≥ 0. Muuten: ei ratkea |
| T2 Pysyvyys | Sama erotus 1994→1999 (viisi vuotta), verrattuna kaikkiin muihin viiden vuoden jaksoihin, jotka eivät sisällä vuotta 1995 | Tukee: ero < 0 ja pienempi kuin 95 %:ssa lumejaksoista. Kumoaa: ero ≥ 0, eli lasku palautui. Muuten: ei ratkea |

- **Rajaus:** vuoden 1994 liikevaihtoverosta arvonlisäveroon siirtyminen osuu edeltävään vuoteen.
  Ruoan verokanta pysyi tiettävästi ennallaan, mutta tätä ei ole tarkistettu aineistosta.

## H22: tulos

- **Laskettu:** 27.11.2026.
- **T1 Luonnollinen koe: tukee.** Ruoan suhteellinen hinta muuttui 1994→1995 seuraavasti:

  | Maa | Muutos |
  |---|---|
  | Suomi | −9,6 % |
  | Tanska | −1,3 % |
  | Norja | −1,5 % |
  | Ruotsi | −1,7 % |

  - Suomen ero vertailumaihin oli −8,3 %.
  - Ero oli suurempi kuin yhdessäkään 40 lumevuodesta. Suurin lumevuoden lasku oli −3,4 %.
- **T2 Pysyvyys: tukee.** Ero 1994→1999 oli −12,2 %, eli lasku ei palautunut vaan syveni.
  - Ero oli suurempi kuin yhdessäkään 32 viiden vuoden lumejaksosta. Suurin lumejakson lasku oli
    −8,0 %.
- **Tila:** ehdokas. Molemmat tukevat testit ovat samaa asetelmaa (luonnollinen koe), ja tuettu-tila
  vaatii kaksi eri asetelmaa.
- **Huomio:** Ruotsi liittyi EU:hun samaan aikaan, mutta sen ruoan suhteellinen hinta laski vasta
  1996 ja vähemmän (noin −10 % vuoteen 1997).
  - Tämä sopii siihen, että Ruotsi oli purkanut maatalouden sääntelyä jo vuosina 1990–1991.
  - Selitystä ei ole testattu.
- **Seuraava testi:** täsmällisyys.
  - Lasku pitäisi näkyä maataloustuotteissa, kuten viljassa, lihassa ja maitotaloustuotteissa.
  - Tuontiruoassa, kuten hedelmissä, kahvissa ja teessä, sitä ei pitäisi näkyä.

## H23. Eläkeiän nosto piti 63–64-vuotiaat työssä

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** vuoden 2017 eläkeuudistus nosti 63–65-vuotiaiden työllisyyttä juuri niissä ikä- ja
  vuosiryhmissä, joita alimman vanhuuseläkeiän nousu koski.
  - Uudistus nosti alinta vanhuuseläkeikää 3 kuukaudella syntymävuotta kohden: vuonna 1954 ja
    aiemmin syntyneillä se oli 63 v, vuonna 1955 syntyneillä 63 v 3 kk ja niin edelleen, ja
    vuosina 1962–1964 syntyneillä 65 v.
- **Aineisto:** väestö pääasiallisen toiminnan ja yksivuotisiän mukaan 31.12. (StatFin 115c).
  - Työlliset ja eläkeläiset osuutena ikäryhmästä.
  - Iät 60–67, vuodet 2010–2024.
- **Annos:** se osuus ikäryhmästä, joka ei vuoden lopussa vielä uuden säännön mukaan olisi päässyt
  eläkkeelle mutta olisi päässyt vanhan säännön mukaan.
  - Kaava: annos(a, t) = rajaa(E(t−a) − a, 0, 1) − rajaa(63 − a, 0, 1), missä E(c) on syntymävuoden c
    alin eläkeikä vuosina.
  - Oletus: syntymäpäivät jakautuvat tasaisesti vuoden ympäri.
  - Annos on nolla vuoteen 2017 asti ja kaikilla alle 63-vuotiailla.
- **Malli:** kaksisuuntainen kiinteä vaikutus (ikä ja vuosi), pienimmän neliösumman menetelmä,
  heteroskedastisuuden kestävät keskivirheet (HC1).

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Annos | Työllisten osuus ~ annos + ikä + vuosi | Tukee: b > 0, p < 0,05 ja esitrenditarkistus läpäisty. Kumoaa: b ≤ 0. Muuten: ei ratkea |
| T2 Täsmällisyys | Eläkeläisten osuus ~ annos + ikä + vuosi | Tukee: b < 0 ja p < 0,05. Kumoaa: b ≥ 0. Muuten: ei ratkea |

- **Esitrenditarkistus (osa T1:tä):**
  - Vuodet 2010–2017, joilla todellinen annos on nolla.
  - Selittäjänä on kolmen vuoden päähän siirretty annos, annos(a, t + 3).
  - Jos sen kerroin on positiivinen ja p < 0,05, T1 on enintään "ei ratkea".
- **Rajaus:**
  - Samaan uudistukseen kuuluivat osittainen varhennettu vanhuuseläke (61-vuotiaasta) ja
    työttömyysturvan lisäpäivien ikärajan nosto. Ne vaikuttavat myös 61–64-vuotiaisiin.
  - Annos kohdistuu kuitenkin vain eläkeiän nousun mukaisiin solmuihin.

## H23: tulos

- **Laskettu:** 27.11.2026.
- **Laskentatapa:** p-arvo on laskettu normaaliapproksimaatiolla, koska scipy ei ollut käytössä.
  Vapausasteita oli noin 100, joten ero t-jakaumaan on merkityksetön.
- **T1 Annos: tukee.** Täysi annos eli se, että koko ikäryhmä ei vielä ole eläkeiässä, nosti
  työllisten osuutta 19,3 prosenttiyksikköä (p < 0,0001, 120 ikä–vuosi-solua).
  - Esitrenditarkistus läpäistiin: b = −1,9 (p = 0,07), eli suunta oli väärä eikä merkitsevä.
- **T2 Täsmällisyys: tukee.** Eläkeläisten osuus pieneni 32,2 prosenttiyksikköä täyttä annosta kohden
  (p < 0,0001).
- **Tila:** tuettu. Vahva annosasetelma ja täsmällisyystesti tukevat.
- **Kuvaus:**
  - 63-vuotiaiden työllisyysaste nousi vuoden 2017 32,3 prosentista vuoden 2024 61,4 prosenttiin.
  - 64-vuotiaiden työllisyys nousi jo 2017–2022 (21,1 → 31,8 %), vaikka heidän annoksensa oli nolla.
    Tämä viittaa siihen, että 63-vuotiaina työssä pysyneet jatkoivat osin myös 64-vuotiaina.
  - Kun eläkeiän nousu ehti 64-vuotiaiden ikään, nousu kiihtyi: 47,8 % vuonna 2024.
  - Tämä jatkuminen ei kuulu annokseen, joten malli aliarvioi vaikutusta pikemmin kuin yliarvioi
    sitä.
  - 60–62-vuotiaiden työllisyys nousi samaan aikaan noin 10 prosenttiyksikköä.
  - Ikä- ja vuosivaikutukset poistavat tämän yleisen nousun mallista.
- **Rajaus:**
  - Malli olettaa, että eläkeiän vaikutus on sama kaikille annoksille.
  - Osa 63-vuotiaista on työttömiä tai muuten työvoiman ulkopuolella. Eläkeläisten osuuden lasku
    (32 prosenttiyksikköä) on suurempi kuin työllisten osuuden nousu (19 prosenttiyksikköä), joten
    osa siirtyi muuhun tilaan kuin työhön, esimerkiksi työttömäksi.

## H23: ennuste vuodelle 2025

- **Kirjattu:** 27.11.2026. Vuoden 2025 työssäkäyntitietoja ei ole julkaistu: StatFin 115c päättyy
  vuoteen 2024, ja tieto päivitettiin 1.7.2026.
- **Korjaus edelliseen merkintään:** H23:n seuraava askel -kohdassa sivulla luki, että
  65-vuotiaiden annos vuonna 2025 on 0,25.
  - Oikea arvo on 0. Vuonna 2025 65 vuotta täyttävät ovat syntyneet 1960, ja heidän alin eläkeikänsä
    on 64 v 6 kk.
  - 65-vuotiaiden annos nousee nollasta vasta vuonna 2030 (syntyneet 1965).
- **Kohde:** 64-vuotiaiden työllisten osuus 31.12.2025 (StatFin 115c). Annos nousee 0,50:stä
  0,75:een, koska vuonna 1961 syntyneiden alin eläkeikä on 64 v 9 kk.
- **Menetelmä:**
  - Ennuste = vuoden 2024 arvo + b · (annoksen muutos) + yhteinen trendi.
  - b on H23 T1:n kerroin (19,3).
  - Yhteinen trendi on 60–62-vuotiaiden työllisyysasteen keskimääräinen vuosimuutos 2015–2024
    (+1,46 %-yks.).
  - 80 %:n väli saadaan samalla menetelmällä laskettujen yhden vuoden ennusteiden virheiden 10. ja 90.
    persentiilistä: iät 60–67, vuodet 2011–2024, 112 ennustetta, yhteisenä trendinä edellisten
    enintään 10 vuoden keskiarvo.
  - Menetelmä käyttää koko aineistosta estimoitua b:tä myös takautuvissa ennusteissa. Tämä on pieni
    vuoto, joka tekee välistä hieman liian kapean.
- **E1:** 64-vuotiaiden työllisyysaste 2025 = 54,1 % (80 %:n väli 52,6–55,3).
  - Jos uudistuksella ei olisi vaikutusta (b = 0), ennuste olisi 49,3 %, mikä on välin ulkopuolella.
- **Osuma:** toteutunut arvo on välillä. Toteutunut arvo täytetään vasta, kun virallinen luku on
  julkaistu, eikä väliä siirretä.

## H24. Devalvaatiot lisäsivät vientiä

- **Kirjattu:** 27.11.2026, ennen laskentaa. Uusi teema.
- **Väite:** markan devalvaatiot paransivat vientiteollisuuden kilpailukykyä, jolloin viennin osuus
  taloudesta kasvoi ja tuonti suhteessa vientiin väheni kahden vuoden kuluessa.
- **Tapahtumat** (vuosi t0, kirjattu ennen laskentaa):
  - 1957: syyskuu, noin 39 %.
  - 1967: lokakuu, noin 31 %.
  - 1977: huhtikuu ja syyskuu sekä helmikuu 1978.
  - 1982: lokakuu, noin 10 %.
  - 1991: marraskuu, noin 12 %, sekä kellutus syyskuussa 1992.
  - Vuoden 1931 kultakannasta luopumista ei voida testata, koska vientisarjat alkavat vuodesta 1948.
- **Aineisto:** StatFin 15ai (kansantalouden tilinpidon historialliset sarjat).
  - Vienti (P6K), tuonti (P7R) ja BKT (B1GMH) käyvin hinnoin 1948–.
  - Samat viitevuoden 2015 hinnoin 1976–.
- **Ikkuna:** muutos vuodesta t0 vuoteen t0 + 2. Devalvaatiot tehtiin useimmiten loppuvuodesta.
- **Lumeikkunat:**
  - Kaikki kahden vuoden ikkunat, jotka eivät leikkaa yhdenkään tapahtuman ikkunaa.
  - Ikkunan alkuvuosi on 1953 tai myöhemmin, jolloin sotakorvausvuodet jäävät pois.
  - Testisuure on tapahtumien keskiarvo. Sitä verrataan 20 000 satunnaisen, samankokoisen
    lumeikkunajoukon keskiarvoon (siemenluku 1).

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Luonnollinen koe | Viennin BKT-osuuden (käyvin hinnoin, log) muutos, viiden tapahtuman keskiarvo, verrattuna lumeikkunoihin | Tukee: > 0 ja suurempi kuin 95 %:ssa lumejoukoista. Kumoaa: ≤ 0. Muuten: ei ratkea |
| T2 Toisto | Kuinka monessa viidestä tapahtumasta T1:n muutos ylitti lumeikkunoiden mediaanin | Tukee: 5/5 (yksisuuntainen p = 0,03). Kumoaa: enintään 2/5. Muuten: ei ratkea |
| T3 Täsmällisyys | Viennin määrän kasvu miinus tuonnin määrän kasvu (kiintein hinnoin, log), tapahtumat 1977, 1982 ja 1991, lumeikkunat 1976– | Tukee: > 0 ja suurempi kuin 95 %:ssa lumejoukoista. Kumoaa: ≤ 0. Muuten: ei ratkea |

- **Rajaus:**
  - Käyvin hinnoin mitattu osuus kasvaa myös pelkästä vientihintojen noususta markoissa. Siksi T3
    mittaa määriä.
  - Vuoden 1991 ikkunaan osuvat myös Neuvostoliiton kaupan romahdus ja lama.
  - Vuoden 1977 ikkunaan osuu öljykriisin jälkeinen elpyminen.

## H24: tulos

- **Laskettu:** 27.11.2026.
- **Aineistotarkennus:** BKT käyvin hinnoin vuosilta 1948–1959 on taulukossa eri sarjakoodilla
  (ntp-CP1860, milj. mk) kuin vienti (ntp-CP1948, milj. mk).
  - Yksikkö on sama, joten osuus lasketaan niiden suhteena.
  - Vuodesta 1960 alkaen kummallakin on sama sarjakoodi.
- **T1 Luonnollinen koe: tukee.** Viennin BKT-osuus kasvoi kahdessa vuodessa devalvaatiosta
  keskimäärin 16,3 %. Tämä on suurempi kuin yhdessäkään 20 000 lumejoukosta (46 lumeikkunaa).

  | Tapahtuma | Viennin BKT-osuuden muutos |
  |---|---|
  | 1957 | +5 % |
  | 1967 | +23 % |
  | 1977 | +10 % |
  | 1982 | +2 % |
  | 1991 | +48 % |

- **T2 Toisto: tukee.** Kaikki 5 devalvaatiota ylittivät lumeikkunoiden mediaanin (−1,0 %).
- **T3 Täsmällisyys: tukee.** Viennin määrä suhteessa tuonnin määrään kasvoi keskimäärin 11,5 %
  (1977 +4 %, 1982 +6 %, 1991 +26 %). Kasvu oli suurempi kuin kaikissa lumejoukoissa (34
  lumeikkunaa).
- **Tila:** tuettu. Kolme asetelmaa tukee, ja niistä yksi on vahva.
- **Jälkikäteinen herkkyystarkistus** (ei rekisteröity, ei vaikuta tilaan): ilman vuotta 1991
  - T1:n muutos on +9,5 % (persentiili 98,8 %).
  - T3:n muutos on +4,8 % (persentiili 97,2 %).
  - Tulos ei siis nojaa pelkästään vuoden 1991 kriisiin ja kellutukseen.
- **Rajaus:**
  - Vaikutuksen kesto testattiin vain kahden vuoden ikkunassa. Myöhempi kehitys, kuten palkkojen ja
    hintojen nousu, joka söi kilpailukykyetua, jää testin ulkopuolelle.
  - Vuoden 1982 vaikutus oli pieni (+2 %).

## H24b. Devalvaatioiden vientietu säilyi viisi vuotta

- **Kirjattu:** 27.11.2026, ennen laskentaa. Jatkoa H24:lle.
  - H24 kattoi vain kaksi vuotta. Tämä on eri väite, eikä sen tulos muuta H24:n tilaa.
- **Väite:** devalvaation jälkeen viennin BKT-osuus pysyi koholla vielä viiden vuoden päästä.
  Kotimaiset palkat ja hinnat eivät siis syöneet etua kolmessa vuodessa (devalvaatiokierre).
- **Aineisto ja tapahtumat:** samat kuin H24:ssä.
  - Viennin osuus BKT:sta käyvin hinnoin, StatFin 15ai, 1948–.
  - Tapahtumat 1957, 1967, 1977, 1982 ja 1991.
  - Vuoden 1977 viiden vuoden ikkuna päättyy vuoteen 1982, jolloin tehtiin seuraava devalvaatio
    (lokakuussa).
- **Lumeikkunat:**
  - H24:n tapa (ei päällekkäisyyttä tapahtumaikkunoiden kanssa) jättäisi viiden vuoden ikkunoille
    lumeiksi vain vuoden 1997 jälkeiset jaksot. Siksi lumeikkunoiksi hyväksytään kaikki ikkunat
    [t, t + k], joiden sisällä (alku mukaan lukien) ei ole devalvaatiovuotta. Alkuvuosi on
    1953–2020.
  - Devalvaation jälkeen alkavat ikkunat ovat siis mukana. Jos etu kului niissä, lumejakauma
    madaltuu ja T1:stä tulee helpompi läpäistä. T2 mittaa kulumista suoraan.
- **Testisuure:** tapahtumien keskiarvo verrattuna 20 000 samankokoisen satunnaisen lumejoukon
  keskiarvoon (siemenluku 1).

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Kesto | Viennin BKT-osuuden log-muutos t0 → t0 + 5, viiden tapahtuman keskiarvo, lumeikkunat k = 5 | Tukee: > 0 ja suurempi kuin 95 %:ssa lumejoukoista. Kumoaa: ≤ 0. Muuten: ei ratkea |
| T2 Kuluminen | Log-muutos t0 + 2 → t0 + 5, viiden tapahtuman keskiarvo, lumeikkunat k = 3 | Tukee: ≥ 0, eli etu ei kulunut. Kumoaa: < 0 ja pienempi kuin 95 %:ssa lumejoukoista, eli etu kului poikkeuksellisen nopeasti. Muuten: ei ratkea, eli etu kului jonkin verran mutta tavanomaisen vaihtelun rajoissa |

## H24b: tulos

- **Laskettu:** 27.11.2026.
- **T1 Kesto: tukee.** Viennin BKT-osuus oli viiden vuoden päästä keskimäärin 15,4 % korkeampi kuin
  devalvaatiovuonna.
  - Tämä on suurempi kuin 99 %:ssa lumejoukoista (40 lumeikkunaa, mediaani +1,6 %).
- **T2 Kuluminen: ei ratkea.** Vuodesta t0 + 2 vuoteen t0 + 5 muutos oli keskimäärin −0,8 %.
  - Tämä on tavallista vaihtelua (persentiili 40 %, 48 lumeikkunaa).

  | Tapahtuma | Muutos t0 → t0 + 5 | Muutos t0 + 2 → t0 + 5 |
  |---|---|---|
  | 1957 | −0 % | −5 % |
  | 1967 | +29 % | +6 % |
  | 1977 | +7 % | −3 % |
  | 1982 | −13 % | −15 % |
  | 1991 | +71 % | +16 % |

- **Tila:** ehdokas. Tukeva testi on yksi asetelma.
- **Jälkikäteinen herkkyystarkistus** (ei rekisteröity, ei vaikuta tilaan): ilman vuotta 1991
  viiden vuoden muutos on +4,6 % (persentiili 71 %).
  - Kestotulos nojaa siis pääosin vuoteen 1991. Vain vuosien 1967 ja 1991 etu säilyi selvästi.
  - Vuosien 1957 ja 1982 etu hävisi viidessä vuodessa. Vuoden 1982 jälkeiseen jaksoon osui myös
    idänkaupan supistuminen öljyn hinnan laskiessa 1986, mitä ei ole testattu.
- **Tulkinta:** kahden vuoden vaikutus (H24) oli johdonmukainen. Kesto vaihteli tapauksittain, eikä
  aineisto riitä erottamaan devalvaatiokierrettä muista syistä.

## H24c. Inflaatio ja palkat söivät devalvaation edun

- **Kirjattu:** 27.11.2026, ennen laskentaa. Jatkoa H24b:lle.
- **Väite:** devalvaation vientietu kului niissä tapauksissa, joissa hinnat ja palkat nousivat
  devalvaation jälkeen nopeimmin (devalvaatiokierre).
  - H24b:ssä etu säilyi 1967 ja 1991 mutta hävisi 1957 ja 1982.
- **Aineisto:**
  - Elinkustannusindeksi, vuosikeskiarvot (StatFin 11xp, 1939–).
  - Nimellinen palkkaindeksi (Turso: JST-makrohistoria, wage, 1870–2020).
  - Kulumisen mittari on H24b:n T2-suure, eli viennin BKT-osuuden log-muutos t0 + 2 → t0 + 5.
- **Altiste:**
  - Hintojen log-muutos t0 → t0 + 3 (T1).
  - Palkkojen log-muutos t0 → t0 + 3 (T2).
- **Menetelmä:** Spearmanin järjestyskorrelaatio viiden tapahtuman välillä (1957, 1967, 1977, 1982,
  1991). Yksisuuntainen tarkka p lasketaan kaikista 120 järjestyksestä.
  - Viidellä tapauksella p ≤ 0,05 vaatii rho ≤ −0,9.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Annos | Inflaatio t0 → t0 + 3 vs. kuluminen | Tukee: rho ≤ −0,9 (p ≤ 0,05). Kumoaa: rho ≥ 0. Muuten: ei ratkea |
| T2 Annos | Palkkojen nousu t0 → t0 + 3 vs. kuluminen | Sama sääntö |

- **Rajaus:**
  - Kotimaista inflaatiota ja palkkoja ei verrata kauppakumppaneiden vastaaviin, koska
    kauppakumppanien sarjoja ei ole aineistossa. 1970-luvun inflaatio oli korkeaa kaikkialla, joten
    mittari on karkea.
  - Viidellä havainnolla testi on hyvin heikko. Tulos voi korkeintaan nostaa hypoteesin
    ehdokkaaksi.

## H24c: tulos

- **Laskettu:** 27.11.2026.

  | Tapahtuma | Hinnat t0 → t0 + 3 | Palkat t0 → t0 + 3 | Kuluminen t0 + 2 → t0 + 5 |
  |---|---|---|---|
  | 1957 | +14 % | +16 % | −5 % |
  | 1967 | +14 % | +29 % | +6 % |
  | 1977 | +29 % | +33 % | −3 % |
  | 1982 | +23 % | +31 % | −15 % |
  | 1991 | +6 % | +4 % | +16 % |

- **T1 Inflaatio: ei ratkea.** rho = −0,70 (tarkka p = 0,12, n = 5). Suunta oli ennustettu, mutta
  rajaa −0,9 ei saavutettu.
- **T2 Palkat: ei ratkea.** rho = −0,50 (p = 0,23).
- **Tila:** oletus.
- **Tulkinta:**
  - Ääripäät sopivat kierreselitykseen:
    - Vuonna 1991 hinnat (+6 %) ja palkat (+4 %) nousivat vähiten, ja etu kasvoi eniten.
    - Vuonna 1982 hinnat ja palkat nousivat nopeasti, ja etu kului eniten.
  - Vuosi 1967 ei sovi palkkaselitykseen: palkat nousivat 29 %, mutta etu säilyi.
  - Viisi tapausta ei riitä erottamaan kierrettä muista syistä, kuten idänkaupasta tai
    maailmankaupan suhdanteista.

## H24d. Reaalinen valuuttakurssi ratkaisi vientiedun keston

- **Kirjattu:** 27.11.2026, ennen laskentaa. Jatkoa H24c:lle.
  - H24c:n mittari oli kotimainen inflaatio ilman vertailua kauppakumppaneihin. Tämä testi käyttää
    reaalista efektiivistä valuuttakurssia.
- **Väite:** devalvaation vientietu säilyi niin kauan kuin reaalinen valuuttakurssi pysyi
  heikentyneenä. Kun Suomen hinnat kurottivat kauppakumppaneiden hintojen edelle, eli reaalinen
  kurssi vahvistui, etu kului.
- **Aineisto:** Global Macro Database, julkaisu 2026_09 (Müller ym.).
  - Lähde: gmd-releases.s3.ap-southeast-2.amazonaws.com, distribute/GMD_2026_09.dta.
  - Suomen REER: reaalinen efektiivinen valuuttakurssi, jossa nousu tarkoittaa vahvistumista.
  - Viennin osuus BKT:sta on edelleen StatFin 15ai -sarjasta, kuten H24:ssä.
  - GMD ketjuttaa useita lähteitä, eikä tämän testin yhteydessä ole tarkistettu, miten REER on
    muodostettu ennen vuotta 1960.
- **Tapahtumat:** 1957, 1967, 1977, 1982, 1991. Spearmanin tarkka yksisuuntainen p, kuten H24c:ssä.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Annos | REER:n log-muutos t0 + 2 → t0 + 5 (reaalinen vahvistuminen) vs. viennin osuuden kuluminen t0 + 2 → t0 + 5 | Tukee: rho ≤ −0,9. Kumoaa: rho ≥ 0. Muuten: ei ratkea |
| T2 Annos | REER:n log-muutos t0 − 1 → t0 + 5 (jäljelle jäänyt reaalinen heikkeneminen) vs. viennin osuuden muutos t0 → t0 + 5 | Tukee: rho ≤ −0,9. Kumoaa: rho ≥ 0. Muuten: ei ratkea |
| T3 Ajoitus | Kaikki vuodet 1951–2020: REER:n log-vuosimuutos → viennin osuuden log-vuosimuutos, viive 1–2 v. Rajaus 5–95 %, AR(1)-suodatus, Šidák | Tukee: r < 0 ja p < 0,05. Kumoaa: r ≥ 0. Muuten: ei ratkea |

- **Kuvaileva tarkistus** (ei testi): REER:n muutos t0 − 1 → t0 + 1 kertoo, heikkenikö reaalinen
  kurssi ylipäätään kussakin devalvaatiossa.

## H24d: tulos

- **Laskettu:** 27.11.2026.

  | Tapahtuma | REER t0−1 → t0+1 | REER t0+2 → t0+5 | REER t0−1 → t0+5 | Vienti t0 → t0+5 | Kuluminen t0+2 → t0+5 |
  |---|---|---|---|---|---|
  | 1957 | +2 % | +3 % | +6 % | −0 % | −5 % |
  | 1967 | −16 % | −6 % | −22 % | +29 % | +6 % |
  | 1977 | −18 % | +10 % | −19 % | +7 % | −3 % |
  | 1982 | −0 % | +3 % | +6 % | −13 % | −15 % |
  | 1991 | −17 % | +11 % | −22 % | +71 % | +16 % |

- **T1 Kuluminen: kumoaa.** rho = +0,40 (p = 0,78).
  - Reaalisen kurssin vahvistuminen vuosina 2–5 ei liittynyt viennin edun kulumiseen.
  - Vuosina 1991 ja 1977 kurssi vahvistui eniten, mutta etu kului vähän tai jopa kasvoi.
- **T2 Kokonais: tukee.** rho = −1,00 (tarkka p = 0,008).
  - Mitä enemmän reaalista heikkenemistä jäi jäljelle viiden vuoden päähän, sitä enemmän viennin
    osuus kasvoi. Järjestys oli täydellinen.
- **T3 Vuosittain: ei ratkea.** r = −0,24 (viive 2 v, p = 0,10, n = 67). Suunta oli ennustettu.
- **Kuvaileva tarkistus:**
  - Vuosien 1957 ja 1982 devalvaatiot eivät heikentäneet reaalista efektiivistä kurssia juuri
    lainkaan (+2 % ja −0 %).
  - Muut kolme heikensivät sitä 16–18 %.
- **Tila:** kumottu. Sääntö: vahva asetelma (annos, T1) kumoaa.
  - Väitteen mekanismi eli kuluminen reaalisen vahvistumisen kautta ei saanut tukea.
- **Tulkinta** (ei testattu, uusi hypoteesi vaatii oman kirjauksen):
  - Ratkaisevaa näyttää olleen se, heikensikö devalvaatio reaalista kurssia alun perin, eikä se,
    kuinka paljon kurssi myöhemmin vahvistui.
  - Vuosien 1957 ja 1982 nimellinen devalvaatio ei muuttunut reaaliseksi. Syy voi olla
    kauppakumppanien samanaikaiset devalvaatiot (Ruotsi 1982) tai GMD:n REER-sarjan muodostus ennen
    vuotta 1960.
  - Tämä selittäisi myös, miksi juuri näiden kahden tapauksen etu hävisi.
  - Selitys on muotoiltu tämän aineiston perusteella, joten se pitää testata muulla aineistolla,
    esimerkiksi muiden maiden devalvaatioilla.

## H24e. Devalvaatio lisää vientiä vain, jos se heikentää reaalista kurssia

- **Kirjattu:** 27.11.2026, ennen laskentaa.
  - Väite muotoiltiin H24d:n tuloksesta Suomen aineistolla. Siksi se testataan muiden maiden
    tapauksilla, ja Suomi jätetään pois.
- **Väite:** nimellinen devalvaatio kasvattaa viennin osuutta taloudesta vain siinä määrin kuin se
  heikentää reaalista efektiivistä valuuttakurssia. Devalvaatio, joka ei muutu reaaliseksi, ei lisää
  vientiä.
- **Aineisto:** Global Macro Database 2026_09.
  - CurrencyCrisis-merkintä, REER, exports_GDP ja infl.
- **Tapahtumat:**
  - Valuuttakriisin ensimmäinen vuosi t0 1960–2015: merkintä on 1, edellisenä vuonna 0, eikä
    merkintää ole viiteen edeltävään vuoteen.
  - Kaikki maat paitsi Suomi.
  - REER ja exports_GDP on saatavilla vuosilta t0 − 1 … t0 + 5.
  - Inflaatio on alle 25 % jokaisena vuonna t0 − 1 … t0 + 5. Tämä rajaa pois korkean inflaation
    tapaukset, joissa vertailu Suomeen ei ole mielekäs.
  - Tämän rajauksen jälkeen tapahtumia on 78–80; lopullinen määrä kirjataan tuloksen yhteydessä.
- **Mittarit:**
  - x = REER:n log-muutos t0 − 1 → t0 + 5 (jäljelle jäänyt reaalinen muutos).
  - y = viennin BKT-osuuden log-muutos t0 → t0 + 5.
  - i = REER:n log-muutos t0 − 1 → t0 + 1 (välitön reaalinen muutos).

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Annos | Spearmanin rho(x, y) tapahtumien yli. Yksisuuntainen permutaatio-p, 10 000 permutaatiota, siemenluku 1 | Tukee: rho < 0 ja p < 0,05. Kumoaa: rho ≥ 0. Muuten: ei ratkea |
| T2 Täsmällisyys ("vain jos") | Reaalinen ryhmä: i ≤ log 0,90. Pelkästään nimellinen ryhmä: i > log 0,95. Väliin jäävät jätetään pois. Verrataan y:n mediaaneja; yksisuuntainen permutaatiotesti ryhmämerkinnöillä, 10 000 permutaatiota | Tukee: reaalisen ryhmän mediaani on suurempi ja p < 0,05. Kumoaa: reaalisen ryhmän mediaani on enintään nimellisen ryhmän mediaani. Muuten: ei ratkea |

- **Rajaus:**
  - Valuuttakriisimerkintä perustuu kurssin heikkenemiseen suhteessa Yhdysvaltain dollariin. Siksi
    osa tapahtumista on dollarin vahvistumista eikä oman valuutan devalvaatiota. Tällaiset tapaukset
    näkyvät pieninä REER-muutoksina, joten ne kuuluvat testin vertailuryhmään.

## H24e: tulos

- **Laskettu:** 27.11.2026.
- **Aineisto rajausten jälkeen:** 78 valuuttakriisiä 60 maassa, Suomi pois lukien.
- **T1 Annos: tukee.** rho = −0,31 (permutaatio-p = 0,003).
  - Mitä enemmän reaalista heikkenemistä jäi viiden vuoden päähän, sitä enemmän viennin BKT-osuus
    kasvoi.
  - Suomen viiden tapauksen järjestys (H24d) toistui siis muiden maiden aineistossa. Yhteys on
    kuitenkin paljon heikompi kuin Suomen täydellinen järjestys.
- **T2 Täsmällisyys ("vain jos"): ei ratkea.**
  - Viennin osuuden mediaanimuutos oli +9,4 % niissä tapauksissa, joissa reaalinen kurssi heikkeni
    vähintään 10 % (n = 46).
  - Vertailuryhmässä, jossa reaalinen heikkeneminen oli alle 5 % (n = 16), mediaanimuutos oli +8,3 %
    (p = 0,41).
  - Vientiosuus kasvoi siis tyypillisesti myös silloin, kun reaalinen kurssi ei heikentynyt.
- **Tila:** ehdokas. Yksi asetelma tukee.
- **Tulkinta:**
  - Annos–vaste-yhteys on yleinen: suurempi reaalinen heikkeneminen tarkoittaa suurempaa
    vientiosuuden kasvua.
  - Väitteen jyrkkä muoto ei saanut tukea: ei voida sanoa, että devalvaatio auttaisi *vain*
    reaalisen heikkenemisen kautta.
  - Valuuttakriisin jälkeen vientiosuus kasvoi tyypillisesti myös muista syistä, esimerkiksi koska
    kotimainen kysyntä ja tuonti supistuivat kriisissä ja BKT laski.
  - Suomen 1957- ja 1982-tapausten ilman reaalista heikkenemistä ei siis tarvitse olla yleinen sääntö.

## H24f. Kriisin jälkeen vienti kasvoi, eikä vain BKT supistunut

- **Kirjattu:** 27.11.2026, ennen laskentaa. Jatkoa H24e:lle.
  - H24e:ssä viennin osuus kasvoi kriisin jälkeen myös ilman reaalista heikkenemistä. Yksi selitys
    on, että osuus kasvoi vain siksi, että BKT supistui.
- **Väite:** valuuttakriisin jälkeinen viennin BKT-osuuden nousu johtui pääosin viennin kasvusta
  eikä BKT:n heikosta kehityksestä.
- **Hajotelma:**
  - Viennin osuuden log-muutos = E − G.
  - E = log-muutos luvussa vienti / BKT-deflaattori, eli viennin arvo kotimaisina hyödykkeinä.
  - G = reaalisen BKT:n log-muutos (rGDP).
  - Jakso on t0 → t0 + 5.
- **Aineisto:** Global Macro Database 2026_09 (exports, deflator, rGDP, CurrencyCrisis, infl).
  - Tapahtumat ovat samat kuin H24e:ssä: 78 kriisiä, ei Suomea.
- **Normaali taso:**
  - Kullekin maalle lasketaan saman maan tavallisten viiden vuoden jaksojen E:n ja G:n mediaanit.
  - Tavallisen jakson alkuvuosi s on 1960–2015, jaksolla s − 1 … s + 5 ei ole kriisimerkintää,
    kaikki sarjat ovat saatavilla, ja inflaatio on alle 25 %.
  - Tapahtuma otetaan mukaan, jos maalla on vähintään 5 tavallista jaksoa.
  - Poikkeamat ovat E_dev = E − maan normaali E ja G_dev = G − maan normaali G.

| Testi | Asetelma | Tukee / kumoaa |
|---|---|---|
| T1 Luonnollinen koe | E_dev tapahtumien yli: kasvoiko vienti tavallista enemmän? Merkkitesti, yksisuuntainen | Tukee: mediaani > 0 ja p < 0,05. Kumoaa: mediaani ≤ 0. Muuten: ei ratkea |
| T2 Täsmällisyys | E_dev + G_dev tapahtumien yli: ylittikö viennin lisäkasvu BKT:n vajeen? Merkkitesti | Tukee: mediaani > 0 ja p < 0,05. Kumoaa: mediaani ≤ 0, eli BKT:n vaje oli vähintään yhtä suuri. Muuten: ei ratkea |

- **Rajaus:**
  - BKT-deflaattorilla deflatoitu vienti sisältää myös vientihintojen nousun suhteessa kotimaisiin
    hintoihin, mikä on devalvaation välitön hintavaikutus. Se ei siis ole puhdas määrämittari.
  - Tulosta luetaan muodossa: kasvoiko viennin arvo kotimaisina hyödykkeinä tavallista enemmän.
