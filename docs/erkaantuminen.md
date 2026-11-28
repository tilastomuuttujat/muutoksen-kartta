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
