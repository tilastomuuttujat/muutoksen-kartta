# Kriisin jälki (trendikorjattu)

Näkymä: `/skanneri?nakyma=jalki`. Laskenta: `src/lib/crisis-trace.ts`, testit `crisis-trace.test.ts`.
Erillinen, korjattu versio perintöskannerista (`?nakyma=perinto`), joka jätettiin ennalleen.

## Miksi uusi versio

Perintöskanneri vertaa kriisin jälkeistä tasoa lähtötasoon. Silloin kasvava sarja "etääntyy lisää"
aina. Tarkistus: 1990-luvun laman luokkajakauma (43 % etääntyi, 13 % osa jäi, 6 % palasi, 14 % ylitti)
oli lähes sama kuin tavallisella jaksolla 1997–2001–2015 (48 / 12 / 5 / 11 %).

## Menetelmä

1. Aina positiiviset sarjat logaritmeina.
2. Trendi: suora 12 kriisiä edeltävälle vuodelle (≥ 8 havaintoa).
3. Isku: suurin poikkeama trendistä kriisivuosina; vähintään kaksi tavallista vuosimuutosta (mediaani).
4. Jälki: poikkeama 3, 5 tai 10 vuotta kriisin jälkeen. Sama seuranta kaikille kriiseille.
5. Luokat: palasi trendiin (< 1/3 iskusta), pysyvä jälki, syveni (> 1,2 ×), kääntyi yli (< −1/3).
6. Tavalliset vuodet: kaikki samanpituiset jaksot, joiden trendijakso, iskuväli ja seuranta eivät
   osu kriisiin. Kriisin jakaumaa verrataan niiden 5–95 %:n vaihteluväliin.
7. Harvinaisen suuri jälki: sarjan jäännös suurempi kuin 95 %:ssa sen omista tavallisista jaksoista
   (vähintään 19 jaksoa). Sattumalta 5 %.

## Tulokset (5 vuoden seuranta)

| Kriisi | Palasi trendiin | Tavallisesti | Harvinaisen suuri jälki | Sattumalta |
|---|---|---|---|---|
| Nälkävuodet 1866–68 | 50 % ▲ | 4–22 % | 0 / 10 | 0,5 |
| Sisällissota 1917–19 | 26 % ▲ | 4–22 % | 13 / 49 | 2,5 |
| 1930-luvun lama | 5 % ▼ | 6–18 % | 22 / 50 | 2,5 |
| Sodat 1939–45 | 27 % ▲ | 5–20 % | 20 / 70 | 3,5 |
| 1990-luvun lama | 12 % | 6–18 % | 11 / 45 | 2,3 |
| Finanssikriisi 2008–10 | 5 % | 4–22 % | 8 / 31 | 1,6 |

- Fyysiset katastrofit (nälkä, sodat) palautuivat trendiin tavallista useammin.
- Talouskriisit jättivät useammin harvinaisen suuria jälkiä kuin sattumalta odottaisi. 1930-luvun
  lamassa myös paluu trendiin oli tavallista harvinaisempaa.
- Tavallisinakin vuosina vain noin 12 % iskuista palaa trendiin viidessä vuodessa: useimmat sarjat
  käyttäytyvät kuin satunnaiskulku. Siksi pelkkä "pysyvä jälki" ei vielä kerro kriisistä mitään.
- Sarjat eivät ole toisistaan riippumattomia, joten harvinaisten määrää kannattaa lukea suuruusluokkana.
- Pandemiasta on vasta kolmen vuoden seuranta (0 / 5 vertailukelpoista sarjaa).
