"""Erkaantumiskartan lukittu sarjajoukko (docs/erkaantuminen.md). Älä lisää sarjoja tulosten nähtyä."""

# Global Macro Database 2026_09: (tunnus, muuttuja, log, napaisuus, elämänalue, nimi)
GMD = [
    ("G1", "rGDP_pc", True, 1, "Talous", "BKT asukasta kohden (kiintein hinnoin)"),
    ("G2", "unemp", False, -1, "Työ", "Työttömyysaste"),
    ("G3", "inv_GDP", False, 1, "Talous", "Investoinnit / BKT"),
    ("G4", "exports_GDP", False, 1, "Talous", "Vienti / BKT"),
    ("G5", "REER", True, 0, "Talous", "Reaalinen efektiivinen valuuttakurssi"),
    ("G6", "CA_GDP", False, 1, "Talous", "Vaihtotase / BKT"),
    ("G7", "gen_govexp_GDP", False, 0, "Julkinen talous", "Julkiset menot / BKT"),
    ("G8", "gen_govdebt_GDP", False, -1, "Julkinen talous", "Julkinen velka / BKT"),
    ("G9", "rHPI", True, 0, "Asuminen ja velka", "Asuntojen reaalihinnat"),
]

# Eurostat: (tunnus, taulu, parametrit, log, napaisuus, elämänalue, nimi)
EUROSTAT = [
    ("E1", "lfsa_ergan", "age=Y20-64&sex=T&citizen=TOTAL&unit=PC", False, 1, "Työ", "Työllisyysaste 20–64"),
    ("E2", "lfsa_ergan", "age=Y55-64&sex=T&citizen=TOTAL&unit=PC", False, 1, "Työ", "Työllisyysaste 55–64"),
    ("E3", "lfsa_urgan", "age=Y15-24&sex=T&citizen=TOTAL&unit=PC", False, -1, "Työ", "Nuorisotyöttömyys 15–24"),
    ("E4", "une_ltu_a", "indic_em=LTU&age=Y15-74&sex=T&unit=PC_ACT", False, -1, "Työ", "Pitkäaikaistyöttömyys"),
    ("E5", "nama_10_lp_ulc", "na_item=RLPR_HW&unit=I15", True, 1, "Talous", "Työn tuottavuus tuntia kohden"),
    ("E6", "rd_e_gerdtot", "sectperf=TOTAL&unit=PC_GDP", False, 1, "Talous", "T&K-menot / BKT"),
    ("E7", "demo_find", "indic_de=TOTFERRT", False, 1, "Väestö ja perhe", "Kokonaishedelmällisyys"),
    ("E8", "demo_find", "indic_de=AGEMOTH1", False, 0, "Väestö ja perhe", "Esikoisäidin keski-ikä"),
    ("E9", "demo_nind", "indic_de=GNUPRT", False, 0, "Väestö ja perhe", "Avioliittoon vihityt / 1000"),
    ("E10", "demo_gind", "indic_de=CNMIGRATRT", False, 0, "Väestö ja perhe", "Nettomuutto / 1000"),
    ("E11", "demo_mlexpec", "sex=T&age=Y_LT1&unit=YR", False, 1, "Terveys", "Elinajanodote syntyessä"),
    ("E12", "hlth_silc_08", "reason=WLIST&quant_inc=TOTAL&age=Y_GE16&sex=T&unit=PC", False, -1, "Terveys", "Jonon vuoksi saamatta jäänyt hoito"),
    ("E13", "hlth_silc_02", "levels=VG_G&isced11=TOTAL&age=Y_GE16&sex=T&unit=PC", False, 1, "Terveys", "Koettu terveys hyvä"),
    ("E14", "ilc_li02", "statinfo=MED_EI&rskpovth=B_60&sex=T&age=TOTAL&unit=PC", False, -1, "Toimeentulo", "Köyhyysriskiaste"),
    ("E15", "ilc_di12", "statinfo=GINI_HND&age=TOTAL", False, -1, "Toimeentulo", "Tuloerot (Gini)"),
    ("E16", "ilc_lvho07a", "rskpovth=TOTAL&age=TOTAL&sex=T&unit=PC", False, -1, "Toimeentulo", "Asumismenorasite"),
    ("E17", "lfsi_jhh_a", "indic_em=SC072&unit=PC", False, -1, "Toimeentulo", "Työttömissä kotitalouksissa 18–59"),
    ("E18", "edat_lfse_14", "age=Y18-24&sex=T&wstatus=POP&unit=PC", False, -1, "Koulutus", "Koulutuksen keskeyttäneet 18–24"),
    ("E19", "ilc_mdes03", "hhcomp=TOTAL&rskpovth=TOTAL&unit=PC", False, -1, "Toimeentulo", "Ei varaa kunnolliseen ateriaan"),
    ("E20", "edat_lfse_03", "isced11=ED5-8&age=Y25-34&sex=T&unit=PC", False, 1, "Koulutus", "Korkea-asteen tutkinto 25–34"),
    ("E21", "nasa_10_ki", "sector=S14_S15&na_item=DIR_S14_S15&unit=PC", False, -1, "Asuminen ja velka", "Kotitalouksien velkaantumisaste"),
    ("E22", "nasa_10_ki", "sector=S14_S15&na_item=SRG_S14_S15&unit=PC", False, 1, "Asuminen ja velka", "Kotitalouksien säästämisaste"),
    ("E23", "nasa_10_ki", "sector=S14_S15&na_item=P51G_RAT_GDP_S14_S15&unit=PC", False, 0, "Asuminen ja velka", "Kotitalouksien investoinnit / BKT"),
    ("E24", "gov_10dd_edpt1", "na_item=B9&sector=S13&unit=PC_GDP", False, 1, "Julkinen talous", "Julkisen talouden rahoitusjäämä"),
    ("E25", "gov_10a_main", "na_item=TR&sector=S13&unit=PC_GDP", False, 0, "Julkinen talous", "Julkiset tulot / BKT"),
    ("E26", "gov_10a_exp", "na_item=TE&sector=S13&unit=PC_GDP&cofog99=GF02", False, 0, "Julkinen talous", "Puolustusmenot / BKT"),
]

# Turso: avain → napaisuus (luettelo docs/erkaantuminen.md:ssä)
TURSO = {'eurostat.nordics.edat_lfse_24.recent_graduates': 1, 'eurostat.nordics.lfsa_ergan.y25_29': 1, 'eurostat.nordics.lfsa_ergan.y30_34': 1, 'nordics.health_nurses_per100k_2000_2023': 1, 'nordics.health_physicians_per100k_2000_2023': 1, 'nordics.pisa_math_2003_2025': 1, 'nordics.pisa_reading_2000_2025': 1, 'nordics.pisa_science_2006_2025': 1, 'nordics.tfr_1950_2024': 1, 'nordics2.daycare_3_5_1990_2024': 1, 'nordics2.tertiary_attainment_1998_2024': 1, 'safe_corridor.employment_rate_25_29': 1, 'safe_corridor.employment_rate_30_34': 1, 'safe_corridor.fertility_rate_25_29': 1, 'safe_corridor.fertility_rate_30_34': 1, 'eurostat.nordics.edat_lfse_20': -1, 'eurostat.nordics.ilc_lvho07c': -1, 'eurostat.nordics.lfsa_etpgan': -1, 'eurostat.nordics.lfsa_urgan': -1, 'eurostat.nordics.lfsa_urgan.y30_34': -1, 'nordics.debt_gdp_1995_2024': -1, 'nordics.unemployment_rate_25_34_men_1990_2024': -1, 'nordics.unemployment_rate_25_34_women_1990_2024': -1, 'nordics2.alcohol_sales_1960_2024': -1, 'safe_corridor.housing_cost_overburden_25_29': -1, 'safe_corridor.housing_cost_overburden_25_29_above60': -1, 'safe_corridor.housing_cost_overburden_25_29_below60': -1, 'safe_corridor.long_term_unemployment_share_25_29': -1, 'safe_corridor.long_term_unemployment_share_30_34': -1, 'safe_corridor.unemployment_rate_25_29': -1, 'safe_corridor.unemployment_rate_30_34': -1, 'nordics.antidepressants_2000_2023': 0, 'nordics.govexp_social_protection_gdp_1995_2024': 0, 'nordics.health_expenditure_gdp_1990_2024': 0, 'nordics2.education_expenditure_gdp_1995_2024': 0, 'nordics2.family_children_expenditure_gdp_1995_2024': 0, 'nordics2.old_age_expenditure_gdp_1995_2024': 0, 'safe_corridor.leaving_parental_home_age': 0, 'safe_corridor.living_with_parents_25_29': 0, 'safe_corridor.living_with_parents_25_34': 0}
