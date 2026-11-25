# Skanneri (/skanneri)

Skanneri tehostaa päätelmien tekemistä vertaamalla koko aineiston skannauksia keskenään. Se ei
tee päätelmiä itse, vaan rajaa, mitkä selitykset kannattaa testata.

## Mitä se tekee

1. **Seismografi:** koko aineiston poikkeamien tai käänteiden osuus vuosittain sekä sattuman raja.
   Elämänalueiden kaistat näyttävät, mihin kriisi osui.
2. **Kohdesarja:** valitulle ilmiölle haetaan sarjat, joiden muutos edeltää tai seuraa kohteen
   muutosta. Tapoja on kolme:
   - **Vuosimuutokset** (herkin): muutokset rajataan sarjan omaan 5–95 %:n väliin, sarjan oma
     jatkuvuus poistetaan AR(1)-suodatuksella, ja korrelaatiota verrataan viiveillä 1..w molempiin
     suuntiin (Fisherin z, Šidákin korjaus viiveille).
   - **Poikkeamat** ja **käänteet**: merkkitesti siitä, onko ehdokkaan tapahtuma useammin ennen kuin
     jälkeen kohteen tapahtuman. Samana vuonna sattuvat yhteiset shokit eivät vaikuta.
   - Monen testin korjaus: Benjamini–Hochberg. "Ehdokas" = q < 0,1.
   - Valinta "Ohita kriisivuodet" poistaa vuodet, joina poikkeamien osuus ylitti sattuman rajan.
3. **Kahden jakson vertailu:** elämänalueiden osuudet ja sarjat, jotka reagoivat vain toisessa
   jaksossa. Mukana vain sarjat, jotka kattavat molemmat jaksot.

Kaksoiskappaleet (vuosimuutosten korrelaatio > 0,97) jätetään pois: 112 sarjaa 511:stä.

## Esimerkkejä

- **Syntyvyys (TFR, Gapminder).** Kun kriisivuodet ohitetaan, ainoa ehdokas, joka muuttuu ennen
  syntyvyyttä, on 25–34-vuotiaiden naisten työttömyysaste: r = −0,66 kahden vuoden viiveellä
  (1995–2023). Työttömyyden nousua seuraa syntyvyyden lasku kahden vuoden päästä. Tämä on testattava
  hypoteesi, ei todiste: sarja on lyhyt ja molempiin voi vaikuttaa suhdanne.
- **Mekaaniset parit** nousevat myös esiin: esim. 0-vuotiaana kuolleet seuraavat syntyvyyttä
  (enemmän syntyneitä, enemmän kuolleita) ja 30–34-vuotiaiden hedelmällisyys "edeltää" kokonaislukua,
  koska se on sen osa. Siksi jokainen ehdokas tarkistetaan pariksi avaamalla.

## Päivitys

```bash
SKANNAUS_DIR=scan-data/ python3 scripts/skannauskoe/fetch.py
SKANNAUS_DIR=scan-data/ python3 scripts/skannauskoe/build-scanner.py
```

Tulos: `src/data/scanner.json`. Laskenta selaimessa: `src/lib/scanner.ts` (testit `scanner.test.ts`).
