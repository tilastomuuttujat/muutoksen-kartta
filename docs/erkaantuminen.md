# Erkaantumiskartta: missä Suomen polku erkani muista Pohjoismaista

Kirjattu 28.11.2026 ennen ensimmäistä laskentaa. Myöhemmät muutokset ja tulokset lisätään loppuun
päivättyinä merkintöinä. Vanhoja merkintöjä ei muokata.

## Kysymys

Ranking-vertailu kertoo, missä Suomi on nyt. Tämä kartta kysyy kolmea asiaa:

1. Missä vaiheessa kunkin ilmiön kehitys Suomessa erkani Ruotsin, Norjan ja Tanskan kehityksestä?
2. Kasautuvatko erkaantumiset samoille vuosille?
3. Missä järjestyksessä eri elämänalueet erkanivat?

Samanaikaiset erkaantumiset viittaavat yhteiseen juureen. Järjestys kertoo, mikä tuli ensin. Kartta
ei osoita syitä. Se tuottaa ehdokkaita Näyttöverkon testattaviksi.

## Aineisto

### Sarjajoukko

Sarjajoukko on lukittu tässä. Sarjoja ei lisätä tulosten nähtyä.

1. **Turso:** kaikki indikaattorisarjat, joissa on vuosiarvot Suomelle ja vähintään kahdelle maista
   Ruotsi, Norja ja Tanska sekä vähintään 20 Suomen vuotta vuodesta 1990 alkaen. Poiminta tehtiin
   28.11.2026, ja sarjoja oli 40. Ne on lueteltu alla napaisuuksineen.
2. **Eurostat:** maat FI, SE, NO ja DK. Jokaisesta taulusta käytetään yhtä ulottuvuusyhdistelmää,
   joka on merkitty alla.
3. **Global Macro Database 2026_09:** maat FIN, SWE, NOR ja DNK, vuodet 1980–2024.

### Kaksoiskappaleet

Jos kahden sarjan Suomen vuosimuutosten korrelaatio on yli 0,97, myöhemmin luettelossa oleva
jätetään pois (sama sääntö kuin Skannerissa). Luettelon järjestys on: GMD, Eurostat, Turso.

### Napaisuus

- **+** = korkeampi on Suomelle parempi.
- **−** = matalampi on parempi.
- **0** = ei yksiselitteistä suuntaa.

Napaisuus vaikuttaa vain siihen, luokitellaanko erkaantuminen huonompaan tai parempaan suuntaan.
Kasautumistestiin se ei vaikuta.

### Global Macro Database (G)

| Tunnus | Muuttuja | Log | Napaisuus |
|---|---|---|---|
| G1 | rGDP_pc | log | + |
| G2 | unemp | | − |
| G3 | inv_GDP | | + |
| G4 | exports_GDP | | + |
| G5 | REER | log | 0 |
| G6 | CA_GDP | | + |
| G7 | gen_govexp_GDP | | 0 |
| G8 | gen_govdebt_GDP | | − |
| G9 | rHPI | log | 0 |

### Eurostat (E)

| Tunnus | Taulu ja valinta | Log | Napaisuus |
|---|---|---|---|
| E1 | lfsa_ergan, Y20-64, T, citizen TOTAL, PC | | + |
| E2 | lfsa_ergan, Y55-64, T, TOTAL, PC | | + |
| E3 | lfsa_urgan, Y15-24, T, TOTAL, PC | | − |
| E4 | une_ltu_a, LTU, Y15-74, T, PC_ACT | | − |
| E5 | nama_10_lp_ulc, RLPR_HW, I15 | log | + |
| E6 | rd_e_gerdtot, TOTAL, PC_GDP | | + |
| E7 | demo_find, TOTFERRT | | + |
| E8 | demo_find, AGEMOTH1 | | 0 |
| E9 | demo_nind, GNUPRT | | 0 |
| E10 | demo_gind, CNMIGRATRT | | 0 |
| E11 | demo_mlexpec, T, Y_LT1, YR | | + |
| E12 | hlth_silc_08, WLIST, quant_inc TOTAL, Y_GE16, T | | − |
| E13 | hlth_silc_02, VG_G, isced11 TOTAL, Y_GE16, T | | + |
| E14 | ilc_li02, MED_EI, B_60, T, TOTAL, PC | | − |
| E15 | ilc_di12, GINI_HND, TOTAL | | − |
| E16 | ilc_lvho07a, rskpovth TOTAL, TOTAL, T | | − |
| E17 | lfsi_jhh_a, SC072 | | − |
| E18 | edat_lfse_14, Y18-24, T, POP, PC | | − |
| E19 | ilc_mdes03, hhcomp TOTAL, rskpovth TOTAL | | − |
| E20 | edat_lfse_03, ED5-8, Y25-34, T | | + |
| E21 | nasa_10_ki, DIR_S14_S15 | | − |
| E22 | nasa_10_ki, SRG_S14_S15 | | + |
| E23 | nasa_10_ki, P51G_RAT_GDP_S14_S15 | | 0 |
| E24 | gov_10dd_edpt1, B9, S13, PC_GDP | | + |
| E25 | gov_10a_main, TR, S13, PC_GDP | | 0 |
| E26 | gov_10a_exp, GF02, TE, S13, PC_GDP | | 0 |

### Turso (T): 40 sarjaa

**Napaisuus +:**
- eurostat.nordics.edat_lfse_24.recent_graduates
- eurostat.nordics.lfsa_ergan.y25_29
- eurostat.nordics.lfsa_ergan.y30_34
- nordics.health_nurses_per100k_2000_2023
- nordics.health_physicians_per100k_2000_2023
- nordics.pisa_math_2003_2025
- nordics.pisa_reading_2000_2025
- nordics.pisa_science_2006_2025
- nordics.tfr_1950_2024
- nordics2.daycare_3_5_1990_2024
- nordics2.tertiary_attainment_1998_2024
- safe_corridor.employment_rate_25_29
- safe_corridor.employment_rate_30_34
- safe_corridor.fertility_rate_25_29
- safe_corridor.fertility_rate_30_34

**Napaisuus −:**
- eurostat.nordics.edat_lfse_20
- eurostat.nordics.ilc_lvho07c
- eurostat.nordics.lfsa_etpgan
- eurostat.nordics.lfsa_urgan
- eurostat.nordics.lfsa_urgan.y30_34
- nordics.debt_gdp_1995_2024
- nordics.unemployment_rate_25_34_men_1990_2024
- nordics.unemployment_rate_25_34_women_1990_2024
- nordics2.alcohol_sales_1960_2024
- safe_corridor.housing_cost_overburden_25_29
- safe_corridor.housing_cost_overburden_25_29_above60
- safe_corridor.housing_cost_overburden_25_29_below60
- safe_corridor.long_term_unemployment_share_25_29
- safe_corridor.long_term_unemployment_share_30_34
- safe_corridor.unemployment_rate_25_29
- safe_corridor.unemployment_rate_30_34

**Napaisuus 0:**
- nordics.antidepressants_2000_2023
- nordics.govexp_social_protection_gdp_1995_2024
- nordics.health_expenditure_gdp_1990_2024
- nordics2.education_expenditure_gdp_1995_2024
- nordics2.family_children_expenditure_gdp_1995_2024
- nordics2.old_age_expenditure_gdp_1995_2024
- safe_corridor.leaving_parental_home_age
- safe_corridor.living_with_parents_25_29
- safe_corridor.living_with_parents_25_34

## Menetelmä

1. **Ero muihin.** Kullekin sarjalle ja maalle c ∈ {FI, SE, NO, DK}:
   - ero_c(t) = x_c(t) − muiden saatavilla olevien maiden keskiarvo samana vuonna.
   - Vähintään kahden muun maan arvot vaaditaan.
   - Log-sarjoissa x on luonnollinen logaritmi.
   - Vuodet ovat 1980–2025. Vähintään 15 vuotta vaaditaan.
2. **Katkos.** Erolle sovitetaan suora sekä suora, jonka kulmakerroin muuttuu vuonna τ (jatkuva
   saranamalli).
   - τ ∈ [ensimmäinen vuosi + 4, viimeinen vuosi − 3].
   - Valitaan τ, joka minimoi neliösumman.
   - F = (SSE_suora − SSE_sarana) / (SSE_sarana / (n − 3)).
3. **Merkitsevyys** (parametrinen bootstrap ilman katkosta):
   - Erosta sovitetaan suora. Jäännösten AR(1)-kerroin rajataan välille [0, 0,95], ja keskihajonta
     estimoidaan.
   - Simuloidaan 999 sarjaa (siemen 1), ja kustakin lasketaan sama suurin F.
   - p = (1 + simulaatioita, joissa F ≥ havaittu) / 1000.
   - Katkos hyväksytään, jos p < 0,05.
4. **Erkaantuminen vai lähentyminen:**
   - Erkaantuminen: katkon jälkeinen kulmakerroin (b + d) ja sovitettu ero viimeisenä vuonna ovat
     samanmerkkisiä, ja sovitetun eron itseisarvo kasvaa τ:sta viimeiseen vuoteen.
   - Muuten kyse on lähentymisestä, eikä sitä lasketa erkaantumiseksi.
5. **Suunta:**
   - Erkaantuminen on huonompaan, jos sign(b + d) × napaisuus < 0.
   - Parempaan, jos tulo > 0.
   - Napaisuus 0 tarkoittaa neutraalia.
6. **Kasautuminen.**
   - K = suurin erkaantumisten määrä viiden vuoden ikkunassa [y, y + 4], y = 1980–2021.
   - Nollamalli: jokaisen erkaantuneen sarjan τ arvotaan tasaisesti sen sallitulta väliltä
     (10 000 simulaatiota, siemen 1). p = osuus simulaatioista, joissa K ≥ havaittu.
   - Suomen erkaantumiset kasautuvat, jos p < 0,05.
   - Sama testi tehdään erikseen huonompaan suuntaan erkaantuneille sekä vertailuksi Ruotsille,
     Norjalle ja Tanskalle.
7. **Järjestys.** Ruuhkaikkunan sisällä sarjat järjestetään τ:n mukaan. Elämänalueittain
   raportoidaan τ:n mediaani. Elämänalue tulee Turson teemasta, ja G- ja E-sarjoille se on kirjattu
   laskentaskriptiin. Tämä osa on kuvaileva.

## Mitä tulos ei tarkoita

- Samanaikaisuus ei todista yhteistä syytä. Usea sokki voi osua samoille vuosille.
- Katkos erossa voi johtua myös muiden maiden muutoksesta. Kartta raportoi siksi myös, liikkuiko
  Suomi vai muut: Suomen oma kulmakertoimen muutos samana vuonna verrattuna muiden keskiarvon
  muutokseen (kuvaileva).
- Lyhyissä sarjoissa (15–20 vuotta) katkoksen ajoitus on epätarkka.

## Tulokset 28.11.2026

### Aineisto

- 75 sarjaa. Kaksoiskappaleina pudotettiin 6:
  - Turson TFR (= E7)
  - Turson julkinen velka (= G8)
  - kaksi Turson työllisyysastetta ja kaksi työttömyysastetta 25–34-vuotiaista (= Eurostat-versiot).
- Jäljelle jäi 69 sarjaa.
- Suomelle analysoitiin 66. PISA-sarjoissa on vain neljä mittauskertaa, joten niissä ei ole 15
  vuotta.

### Erkaantumiset maittain

| Maa | Erkaantumisia | Sarjoja |
|---|---|---|
| Suomi | 10 | 66 |
| Tanska | 7 | 66 |
| Ruotsi | 2 | 66 |
| Norja | 1 | 51 |

- Suomen erkaantumisista 9 oli huonompaan suuntaan ja 1 neutraali (sosiaaliturvamenot).

### Kasautuminen

- **Suomi: ei kasaudu** (p = 0,83). Ruuhkaisin ikkuna oli 2011–2015 (4 erkaantumista), mutta
  nollamallin keskiarvo oli 4,3.
- **Huonompaan suuntaan erkaantuneet: ei kasaudu** (p = 0,67).
- **Muut maat:** ei kasautumista. Tanska p = 0,94, Ruotsi ja Norja p = 1.

### Suomen erkaantumiset aikajärjestyksessä

| Vuosi | Sarja | Muutos (ero muihin) | Kuka muuttui (kuvaileva) |
|---|---|---|---|
| 1999 | Korkea-asteen tutkinto 25–34 | +5,0 → −13,2 %-yks. | Suomi |
| 2000 | Julkisen talouden rahoitusjäämä | +3,2 → −5,1 %-yks. BKT:sta | Suomi |
| 2002 | Sosiaaliturvamenot / BKT (neutraali) | −1,9 → +7,1 | Suomi |
| 2008 | Työttömyys, miehet 25–34 | +0,6 → +3,0 | Suomi |
| 2009 | Elinajanodote | −0,3 → −0,9 vuotta | Suomi |
| 2010 | Työttömyys 25–29 | −0,5 → +1,1 | Suomi |
| 2011 | Työllisyys 25–29 | +0,5 → −3,5 | Suomi |
| 2014 | Pitkäaikaistyöttömien osuus 25–29 | −3,5 → +5,9 | Suomi |
| 2015 | Pitkäaikaistyöttömien osuus 30–34 | −2,5 → +4,4 | Suomi |
| 2015 | Määräaikaiset 25–34 | +2,8 → +4,6 | muut (vähensivät) |

### Tulkinta

- **Ei yhtä juurta:** erkaantumiset eivät kasaudu yhdelle jaksolle.
- **Suomi erkani eniten:** Suomi erkani muista Pohjoismaista useammin kuin yksikään vertailumaa
  (10 vs. 7, 2 ja 1), ja lähes aina huonompaan suuntaan. Muutos lähti 9 tapauksessa 10:stä Suomesta.
- **Kaksi kerrosta:**
  1. 1999–2002: nuorten aikuisten koulutustaso ja julkinen talous.
  2. 2008–2015: nuorten aikuisten työmarkkinat ketjuna: työttömyys → työllisyys →
     pitkäaikaistyöttömyys.
- **Uusi hypoteesi Näyttöverkkoon** (ei testattu, muotoiltu tästä aineistosta):
  - Nuorten aikuisten koulutustason jääminen jälkeen (1999–) edelsi heidän työmarkkina-asemansa
    erkaantumista (2008–).
  - Testi muulla aineistolla: ikäluokittain tai alueittain Suomessa.
- **Huomio luonteesta:** kaikki erkaantumiset eivät ole yhtä jyrkkiä.
  - Jyrkkiä: korkea-asteen tutkinnot, julkinen talous ja pitkäaikaistyöttömyys.
  - Osa on aiemman lähentymisen pysähtymistä ja loivaa erkanemista. Esimerkiksi 25–29-vuotiaiden
    työttömyysero kaventui 1990-luvun lamasta vuoteen 2010 ja kääntyi sitten loivaan kasvuun
    (−0,5 → +1,1 %-yks.).
  - Sääntö kohtelee molempia erkaantumisina, joten luonne näytetään kunkin sarjan kaaviossa.

## Erkaantumisten luonne: kirjattu 28.11.2026 ennen tapausten tarkastelua

**Kysymys:** kun Suomen oma kehitys taittui, mikä sen taittoi: päätöksenteko, Suomeen kohdistunut
ulkoinen isku, tilaston mittausmuutos vai jokin, jolle ei löydy laukaisijaa? Luokittelu koskee
Suomen kymmentä erkaantumista. Se on kuvaileva, eikä se osoita syytä.

### Lähteet

- **Hallituksen esitykset:** Finlexin avoin rajapinta (opendata.finlex.fi). Mukana ovat kaikkien
  vuosien 1996–2019 suomenkielisten esitysten nimet ja antopäivät. Nimet tallennetaan otteeksi.
- **Ulkoisten iskujen lista:** kirjattu alla ennen tapausten tarkastelua.
- **Eurostatin tilastomerkinnät:** katkosmerkintä "b" E-sarjoille.

### Hakusanat sarjoittain

Hallituksen esitys osuu sarjaan, jos sen nimessä on jokin sarjan hakusanoista (kirjainkoolla ei
väliä).

| Sarja | Hakusanat |
|---|---|
| E20 Korkea-asteen tutkinto | yliopisto, ammattikorkeakoulu, korkeakoulu, opintotu, opiskelijavalin, tutkinto |
| E24 Julkisen talouden rahoitusjäämä | tulovero, veroasteikko, arvonlisävero, valtionosuu, valmistevero, verotus |
| Sosiaaliturvamenot / BKT | eläke, työttömyysturva, sairausvakuutus, toimeentulotu, asumistu, lapsilisä, vammaisetuu |
| Työmarkkinasarjat (työttömyys, työllisyys, pitkäaikaistyöttömyys, määräaikaiset) | työttömyysturva, työsopimus, työvoimapalvelu, työmarkkinatu, palkkatu, työllisyy, työllistämi |
| E11 Elinajanodote | alkoholi, tupakka, terveydenhuol, kansanterveys, päihde |

### Luokat

1. **Päätöksenteko (ehdokas):** sarjaan osuvia hallituksen esityksiä on taitevuotta τ edeltävinä
   vuosina τ − 3 … τ enemmän kuin 90 %:ssa saman sarjan tavallisista neljän vuoden jaksoista.
   - Tavalliset jaksot ovat kaikki neljän vuoden jaksot, jotka päättyvät vuosina 1999–2019.
   - Pelkkä osuva esitys ei riitä, koska työ- ja sosiaaliturvalakeja muutetaan lähes vuosittain.
     Näyttöä on vasta poikkeuksellinen lainsäädäntöaktiivisuus.
2. **Ulkoinen isku (ehdokas):** taitevuosi osuu iskun vuosiin tai seuraavaan vuoteen, ja sarjan
   elämänalue on iskun alueilla.
   - **I1 Nokian matkapuhelinliiketoiminnan alamäki 2008–2012:** Työ, Talous.
   - **I2 Metsäteollisuuden kapasiteetin supistukset 2006–2009:** Työ, Talous.
   - **I3 Venäjän kaupan romahdus 2014–2015:** Työ, Talous.
   - **I4 IT-kuplan puhkeaminen 2000–2001:** Talous, Julkinen talous.
   - Finanssikriisi 2008–2009 osui kaikkiin Pohjoismaihin, joten sitä ei käytetä Suomen omien
     erkaantumisten selityksenä.
3. **Mittaus (mahdollinen):** sarjan lähdetiedoissa on katkosmerkintä vuosina τ − 1 … τ + 1.
4. **Lopullinen luokka:**
   - Jos ehdot täyttyvät yhdessä luokassa, tapaus saa sen luokan.
   - Jos useammassa, luokka on "useita".
   - Jos ei missään, luokka on "ei laukaisijaa".
   - Mittausehdokas mainitaan aina.
5. **Kuvaileva tieto** kustakin tapauksesta: taitevuotta edeltäneet osuvat hallituksen esitykset
   nimineen ja antopäivineen.
   - Lista ei väitä yksittäisen esityksen aiheuttaneen muutosta.
   - Sanallinen arvio mekanismin suunnasta merkitään arvioksi.
