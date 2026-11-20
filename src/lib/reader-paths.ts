export const READER_PATHS = [
  {
    id: "peruskoulu",
    title: "Mitä peruskoulu-uudistus muutti?",
    stops: ["oppivelvollisuus-1921", "peruskoulu-1968", "keskiasteen-koulutusjarjestelma-1971"],
    takeaway: "Yhteinen peruskoulu uudisti oppivelvollisuuden toteutusta ja lisäsi tarvetta jatko-opintoväylille, jotka palvelisivat koko ikäluokkaa.",
    openQuestion: "Miten jatko-opintojen saavutettavuus muuttui eri alueilla ja eri taustoista tuleville nuorille?",
  },
  {
    id: "kaupungistuminen",
    title: "Miksi Suomi muutti kaupunkeihin?",
    stops: ["maatalouden-rakennemuutos-1959", "kaupungistuminen", "lahiot"],
    takeaway: "Maataloustyön väheneminen vauhditti muuttoa kaupunkeihin. Kasvava asuntotarve lisäsi painetta rakentaa uusia asuinalueita.",
    openQuestion: "Kuinka paljon eri alueiden muuttoa selittivät työpaikat, asuntotarjonta tai muut tekijät?",
  },
  {
    id: "lama",
    title: "Miten 1990-luvun lama muutti valtion rahankäyttöä?",
    stops: ["pankkikriisi", "1990-luvun-lama", "kehysmenettely"],
    takeaway: "Pankkikriisi syvensi lamaa. Lama ja velkaantuminen vahvistivat tarvetta ohjata valtion menoja kehyksillä.",
    openQuestion: "Miten menokehykset vaikuttivat eri palveluihin ja ihmisryhmiin?",
  },
] as const;
