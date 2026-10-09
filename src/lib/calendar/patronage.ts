/**
 * A deliberately small, curated set of patron-saint facts — not comprehensive.
 *
 * There's no reliable bulk data source for this: romcal has no patronage
 * field at all, and Wikidata's "patron saint of" property (P2925) is too
 * sparse to trust — spot-checking it even for extremely famous patronages
 * (St. Patrick/Ireland, St. Christopher/travelers, St. Jude/desperate
 * causes) came back with zero claims for most of them. So this list is
 * hand-verified via web search against multiple sources, one saint at a
 * time, covering only patronages that are widely documented and undisputed.
 *
 * Matching is by EXACT celebration name, not substring — this codebase's
 * data has real name collisions that make substring matching unsafe (e.g.
 * "St. Boniface" appears on two different 1962 dates for two different
 * people; "St. Lawrence" is a prefix of the unrelated "St. Lawrence
 * Justinian"; there are four different "Anthony"s and seven "Francis"es
 * across the 1962 saint list alone). Each entry below lists the exact
 * strings both calendars are confirmed to use for that specific person.
 * Where a celebration names more than one saint but only one is the patron
 * (e.g. Novus Ordo's "Saint George, Martyr/Saint Adalbert..."), the
 * patronage text names which one, so it doesn't read as applying to both.
 */
export const PATRONAGES: { names: string[]; patronOf: string }[] = [
  { names: ["St. Anthony of Padua", "Saint Anthony of Padua, Priest and Doctor"], patronOf: "Lost articles and things" },
  { names: ["St. Patrick", "Saint Patrick, Bishop"], patronOf: "Ireland" },
  { names: ["St. Francis de Sales", "Saint Francis de Sales, Bishop and Doctor"], patronOf: "Writers and journalists" },
  { names: ["St. Blaise"], patronOf: "Throat ailments" },
  { names: ["Saint Blase, Bishop Martyr and Saint Ansgar, Bishop"], patronOf: "Throat ailments (St. Blaise)" },
  { names: ["St. Valentine"], patronOf: "Engaged couples and love" },
  { names: ["St. Thomas Aquinas", "Saint Thomas Aquinas, Priest and Doctor"], patronOf: "Catholic schools and students" },
  { names: ["St. Benedict", "Saint Benedict of Nursia, Abbot, Patron of Europe"], patronOf: "Europe" },
  { names: ["St. George"], patronOf: "England and soldiers" },
  { names: ["Saint George, Martyr/Saint Adalbert, Bishop and Martyr"], patronOf: "England and soldiers (St. George)" },
  { names: ["St. Mark", "Saint Mark the Evangelist"], patronOf: "Notaries" },
  { names: ["St. James the Greater", "Saint James, Apostle"], patronOf: "Spain and pilgrims" },
  { names: ["St. Anne, Mother of the Blessed Virgin"], patronOf: "Mothers and grandmothers" },
  { names: ["Saints Joachim and Anne"], patronOf: "Mothers and grandmothers (St. Anne)" },
  { names: ["St. Martha", "Saint Martha"], patronOf: "Cooks and homemakers" },
  { names: ["St. Ignatius Loyola", "Saint Ignatius of Loyola, Priest"], patronOf: "Jesuits and soldiers" },
  { names: ["St. Dominic", "Saint Dominic, Priest"], patronOf: "Astronomers" },
  { names: ["St. Lawrence", "Saint Lawrence of Rome, Deacon and Martyr"], patronOf: "Cooks and comedians" },
  { names: ["St. Giles"], patronOf: "The disabled and beggars" },
  { names: ["St. Matthew", "Saint Matthew, Apostle and Evangelist"], patronOf: "Accountants and tax collectors" },
  { names: ["Sts. Cosmas & Damian", "Saints Cosmas and Damian, Martyrs"], patronOf: "Physicians and surgeons" },
  { names: ["St. Wenceslaus"], patronOf: "The Czech Republic" },
  { names: ["Saint Wenceslaus, Martyr/Saints Lawrence Ruiz and Companions, Martyrs"], patronOf: "The Czech Republic (St. Wenceslaus)" },
  { names: ["St. Jerome", "Saint Jerome, Priest and Doctor"], patronOf: "Translators and librarians" },
  { names: ["St. Francis of Assisi", "Saint Francis of Assisi"], patronOf: "Animals and ecology" },
  { names: ["St. Teresa of Avila", "Saint Teresa of Jesus, Virgin and Doctor"], patronOf: "Spain and headache sufferers" },
  { names: ["St. Luke the Evangelist", "Saint Luke the Evangelist"], patronOf: "Physicians and artists" },
  { names: ["Sts. Simon & Jude", "Saints Simon and Jude, Apostles"], patronOf: "Desperate and lost causes (St. Jude)" },
  { names: ["St. Charles Borromeo", "Saint Charles Borromeo, Bishop"], patronOf: "Catechists and seminarians" },
  { names: ["St. Martin of Tours", "Saint Martin of Tours, Bishop"], patronOf: "Soldiers and France" },
  { names: ["St. Elizabeth of Hungary", "Saint Elizabeth of Hungary"], patronOf: "Bakers and the homeless" },
  { names: ["St. Cecilia", "Saint Cecilia, Virgin and Martyr"], patronOf: "Musicians" },
  { names: ["St. John of the Cross", "Saint John of the Cross, Priest and Doctor"], patronOf: "Mystics and Spanish poets" },
  { names: ["St. Andrew", "Saint Andrew the Apostle"], patronOf: "Scotland and fishermen" },
  { names: ["St. Nicholas", "Saint Nicholas, Bishop"], patronOf: "Children and sailors" },
  { names: ["St. Lucy", "Saint Lucy of Syracuse, Virgin and Martyr"], patronOf: "The blind" },
  { names: ["St. Stephen", "Saint Stephen, The First Martyr"], patronOf: "Deacons and stonemasons" },
  { names: ["St. Francis Xavier", "Saint Francis Xavier, Priest"], patronOf: "Missionaries" },
  { names: ["St. Clare", "Saint Clare, Virgin"], patronOf: "Television" },
  { names: ["St. Bartholomew", "Saint Bartholomew the Apostle"], patronOf: "Tanners and leatherworkers" },
  { names: ["St. Augustine", "Saint Augustine of Hippo, Bishop and Doctor of the Church"], patronOf: "Theologians and brewers" },
  { names: ["St. Rose of Lima", "Saint Rose of Lima, Virgin"], patronOf: "Latin America and florists" },
  { names: ["St. Bernard of Clairvaux", "Saint Bernard of Clairvaux, Abbot and Doctor of the Church"], patronOf: "Beekeepers" },
  { names: ["St. John the Evangelist", "Saint John the Apostle and Evangelist"], patronOf: "Authors and friendship" },
  // Novus-Ordo-only: the 1962 side has two different people both named
  // "St. Boniface" on two different dates with identical text, so name-based
  // matching can't safely distinguish them there — deliberately omitted from
  // the 1962 side rather than risk attributing this to the wrong one.
  { names: ["Saint Boniface, Bishop and Martyr"], patronOf: "Germany" },
];

const PATRONAGE_BY_NAME = new Map<string, string>();
for (const entry of PATRONAGES) {
  for (const name of entry.names) PATRONAGE_BY_NAME.set(name, entry.patronOf);
}

export function findPatronage(celebrationName: string): string | undefined {
  return PATRONAGE_BY_NAME.get(celebrationName);
}
