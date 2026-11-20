// Statistics shown next to a phenomenon on the front-page map.
//
// Each link is chosen by hand and only where the series directly MEASURES the phenomenon itself
// (e.g. the 1990s recession → GDP volume and employment). A series describes what happened; it does
// not prove a cause. The automatic text-matched links in murros-data.json (via conclusions) are NOT used
// here: they paired e.g. "Kaupungistuminen" and "Suomen itsenäistyminen" with nuclear power output.
//
// Editors: extend this list by checking that the series measures the phenomenon named in the key.
export const NODE_SERIES: Record<string, string[]> = {
  "1990-luvun-lama": [
    "broad.statfin.ntp.15a9.ef505a3d7024", // BKT, volyymisarja
    "broad.statfin.ntp.15ab.490a683429e3", // Työlliset (1000 henkeä)
  ],
  kehysmenettely: [
    "broad.statfin.ntp.15ah.55f68a3e4033", // Valtionhallinnon menot, suhde BKT:hen
    "broad.statfin.jali.122g.2e76437d2eb5", // Julkisyhteisöjen EDP-velka, suhde BKT:hen
  ],
  "julkisen-talouden-kestavyysvaje-2020": [
    "broad.statfin.jali.122g.2e76437d2eb5", // EDP-velka, suhde BKT:hen
    "broad.statfin.jali.122g.fcc04ee88cbb", // EDP-alijäämä/-ylijäämä, suhde BKT:hen
  ],
  "huoltosuhde-1950-2050": [
    "broad.population.dependency", // Väestöllinen huoltosuhde
    "broad.population.older_share", // 65 vuotta täyttäneiden osuus
  ],
  "vaeston-ikaantyminen": ["broad.population.older_share", "broad.population.children_share"],
  "vaeston-ikaantyminen-1975": ["broad.population.older_share", "broad.population.children_share"],
  "elakejarjestelman-kestavyys-1990": ["broad.population.dependency"],
  "aanioikeus-1906": [
    "broad.statfin.evaa.12i9.3e2ef8b782bd", // Äänestysprosentti, miehet
    "broad.statfin.evaa.12i9.107403beaddc", // Äänestysprosentti, naiset
  ],
  "internet-murros": ["broad.statfin.sutivi.13ud.b54eed22b2be"], // Internetiä käyttäneiden osuus
  "ilmasto-vihrea-siirtyma": ["broad.statfin.khki.138v.46d237aa6b0a"], // Kasvihuonekaasupäästöt
  "olkiluoto-3-2002": ["broad.statfin.ehk.12sv.5648533e546e"], // Ydinvoiman tuotanto (GWh)
  "tuottavuuden-pysahtyminen-2008": ["broad.productivity.gdp_per_hour_index2008"], // BKT per työtunti
};
