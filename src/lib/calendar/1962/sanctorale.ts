import type { Celebration } from "../types";

export interface FixedCelebration {
  /** MM-DD */
  monthDay: string;
  celebration: Celebration;
}

function solemnity(name: string): Celebration {
  return { name, rank: "solemnity", isSolemnity: true, source: "curated" };
}

/**
 * Major fixed-date solemnities of the 1962 calendar (phase-1 subset).
 * Movable solemnities (Easter, Ascension, etc.) live in temporale.ts instead.
 */
export const sanctorale: FixedCelebration[] = [
  { monthDay: "01-01", celebration: solemnity("Circumcision of Our Lord") },
  { monthDay: "01-06", celebration: solemnity("Epiphany of Our Lord") },
  { monthDay: "03-19", celebration: solemnity("Saint Joseph, Spouse of the Blessed Virgin Mary") },
  { monthDay: "03-25", celebration: solemnity("The Annunciation of the Blessed Virgin Mary") },
  { monthDay: "06-24", celebration: solemnity("Nativity of Saint John the Baptist") },
  { monthDay: "06-29", celebration: solemnity("Saints Peter and Paul, Apostles") },
  { monthDay: "08-15", celebration: solemnity("Assumption of the Blessed Virgin Mary") },
  { monthDay: "11-01", celebration: solemnity("All Saints") },
  { monthDay: "12-08", celebration: solemnity("Immaculate Conception of the Blessed Virgin Mary") },
  { monthDay: "12-25", celebration: solemnity("The Nativity of Our Lord Jesus Christ") },
];

export function findSanctoraleCelebration(monthDay: string): Celebration | null {
  const match = sanctorale.find((entry) => entry.monthDay === monthDay);
  return match ? match.celebration : null;
}
