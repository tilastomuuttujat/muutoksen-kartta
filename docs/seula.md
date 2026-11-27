# Seula: jyvät akanoista

Kirjattu 27.11.2026 ennen ensimmäistä ajoa. Seulan säännöt ovat kiinteät. Jos niitä muutetaan,
muutos kirjataan tähän uutena merkintänä ja vanhat tulokset säilytetään.

**Tarkoitus:** käydä läpi kaikki sarjaparit X → Y ja nostaa esiin ne harvat yhteydet, jotka kestävät
erillisen vahvistuksen. Löydökset ovat ehdokkaita Näyttöverkon hypoteesirekisteriin, eivät
syy-yhteyksiä.

## Kaksi asetelmaa

1. **Aikajako (Suomi):**
   - Aineisto: skannerin aineiston kansalliset sarjat (`src/data/scanner.json`, ilman
     kaksoiskappaleita), joissa on vähintään 20 vuosimuutosta sekä vuoteen 2000 asti että sen
     jälkeen.
   - Löytö tehdään vuosilta ≤ 2000 ja vahvistus vuosilta 2001–2025.
2. **Maajako (Pohjoismaat):**
   - Aineisto: Turson sarjat, joissa on vähintään 15 vuotta Suomesta, Ruotsista, Norjasta ja
     Tanskasta.
   - Löytö tehdään Suomen aineistolla ja vahvistus Ruotsin, Norjan ja Tanskan aineistolla yhdessä.

## Menetelmä

- **Vuosimuutokset:** logaritminen, jos sarja on aina positiivinen, muuten erotus.
- **Muutosten käsittely:** muutokset rajataan 5–95 %:iin ja sarjan oma jatkuvuus poistetaan
  AR(1)-suodatuksella. Molemmat tehdään erikseen löytö- ja vahvistusosassa.
- **Tunnusluku:** korrelaatio X(t − k) ja Y(t), viive k = 1 tai 2. Löydössä valitaan vahvempi viive
  ja tehdään Šidákin korjaus.

## Seulan portaat

Pari on **jyvä** vain, jos se läpäisee kaikki portaat.

1. **Ei mekaaninen:** samanaikainen korrelaatio löytöosassa |r| ≤ 0,8. Muuten pari on saman ilmiön
   kaksi mittaria.
2. **Löytö:** vähintään 15 havaintoparia ja Benjamini–Hochberg q < 0,1 kaikkien testattujen parien
   joukossa.
3. **Vahvistus:**
   - sama viive ja sama etumerkki
   - yksisuuntainen p < 0,05
   - vähintään 12 havaintoparia.
4. **Suunta:** vahvistusosassa käänteinen yhteys Y → X samalla viiveellä on heikompi kuin X → Y.

## Sattuman kalibrointi

- Koko seula ajetaan 50 kertaa aineistolla, jossa jokaisen sarjan suodatetut muutokset on siirretty
  satunnaisen määrän kehämäisesti, erikseen löytö- ja vahvistusosassa. Siirto säilyttää sarjojen oman
  vaihtelun, mutta katkaisee yhteydet sarjojen välillä.
- Sattuman tuottamien jyvien keskiarvo ja 95. persentiili raportoidaan oikean ajon rinnalla.
- Jos oikea ajo ei ylitä 95. persentiiliä, seulan tulosta ei pidetä parempana kuin sattumaa.

## Rajoitukset

- Pohjoismaat eivät ole toisistaan riippumattomia, koska niillä on yhteinen suhdanne.
- Aikajaossa sama yhteys voi muuttua ajan myötä, jolloin aito yhteys voi jäädä vahvistumatta.
- Seula ei tunnista kolmatta tekijää.
- Jyvä on ehdokas, joka kirjataan rekisteriin ja testataan vahvemmilla asetelmilla.
