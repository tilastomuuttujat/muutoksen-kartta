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

Kaksoiskappaleet (vuosimuutosten korrelaatio > 0,97) jätetään pois: 115 sarjaa 520:stä. Viisivuotiset havaintopisteet näkyvät aikajanalla.

## Esimerkkejä

- **Syntyvyys (historiallinen Gapminder-sarja, jatkettu StatFinillä).** Kun kriisivuodet ohitetaan,
  25–34-vuotiaiden naisten työttömyysasteen ja syntyvyyden vuosimuutosten yhteys on
  r = −0,58 kahden vuoden viiveellä. Tulos luokitellaan heikoksi useiden vertailujen korjauksen jälkeen.
- **Mekaaniset parit** nousevat myös esiin: esim. 0-vuotiaana kuolleet seuraavat syntyvyyttä
  (enemmän syntyneitä, enemmän kuolleita) ja 30–34-vuotiaiden hedelmällisyys "edeltää" kokonaislukua,
  koska se on sen osa. Siksi jokainen ehdokas tarkistetaan pariksi avaamalla.

## Päivitys

```bash
SKANNAUS_DIR=scan-data/ python3 scripts/skannauskoe/fetch.py
SKANNAUS_DIR=scan-data/ python3 scripts/skannauskoe/build-scanner.py
```

Tulos: `src/data/scanner.json`. Laskenta selaimessa: `src/lib/scanner.ts` (testit `scanner.test.ts`).
