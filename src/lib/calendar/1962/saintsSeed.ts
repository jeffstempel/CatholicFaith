import type { Celebration } from "../types";
import type { FixedCelebration } from "./sanctorale";

function feast(name: string): Celebration {
  return { name, rank: "feast", isSolemnity: false, source: "curated" };
}

/**
 * PHASE-1 SEED DATA ONLY. This is a small, illustrative set of well-known
 * Saint-of-the-Day entries from the 1962 Sanctorale, not a complete 365-day
 * calendar. Phase 2 replaces this with the full traditional Martyrology/Missal
 * saint list, keyed the same way (`monthDay` -> `Celebration`) so nothing else
 * needs to change.
 */
export const saintsSeed: FixedCelebration[] = [
  { monthDay: "01-24", celebration: feast("Saint Timothy, Bishop and Martyr") },
  { monthDay: "01-25", celebration: feast("Conversion of Saint Paul, Apostle") },
  { monthDay: "03-17", celebration: feast("Saint Patrick, Bishop and Confessor") },
  { monthDay: "04-23", celebration: feast("Saint George, Martyr") },
  { monthDay: "05-30", celebration: feast("Saint Joan of Arc, Virgin") },
  { monthDay: "07-06", celebration: feast("Saint Maria Goretti, Virgin and Martyr") },
  { monthDay: "07-31", celebration: feast("Saint Ignatius of Loyola, Confessor") },
  { monthDay: "09-29", celebration: feast("Dedication of Saint Michael the Archangel") },
  { monthDay: "10-01", celebration: feast("Saint Thérèse of the Child Jesus, Virgin") },
  { monthDay: "10-04", celebration: feast("Saint Francis of Assisi, Confessor") },
  { monthDay: "11-13", celebration: feast("Saint Stanislaus Kostka, Confessor") },
  { monthDay: "11-22", celebration: feast("Saint Cecilia, Virgin and Martyr") },
  { monthDay: "12-06", celebration: feast("Saint Nicholas of Myra, Bishop and Confessor") },
  { monthDay: "12-13", celebration: feast("Saint Lucy, Virgin and Martyr") },
];

export function findSaintOfTheDay1962(monthDay: string): Celebration | null {
  const match = saintsSeed.find((entry) => entry.monthDay === monthDay);
  return match ? match.celebration : null;
}
