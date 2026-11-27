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
