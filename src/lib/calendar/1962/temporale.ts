import { gregorianEaster } from "../computus";
import { addDays, dayOfWeek, utcDate } from "../dateUtils";
import type { Celebration, DatedCelebration } from "../types";

function lastSundayOfOctober(year: number): Date {
  const oct31 = utcDate(year, 10, 31);
  return addDays(oct31, -dayOfWeek(oct31));
}

function solemnity(name: string): Celebration {
  return { name, rank: "solemnity", isSolemnity: true, source: "curated" };
}

/**
 * Major movable (Easter-dependent) solemnities of the 1962 calendar.
 * This is the phase-1 subset (Class I feasts); the full Temporale (Septuagesima,
 * Palm Sunday, the Sundays after Pentecost, etc.) is a later phase.
 */
export function getTemporale(year: number): DatedCelebration[] {
  const easter = gregorianEaster(year);
  return [
    { date: easter, celebration: solemnity("Easter Sunday of the Resurrection") },
    { date: addDays(easter, 39), celebration: solemnity("Ascension of the Lord") },
    { date: addDays(easter, 49), celebration: solemnity("Pentecost Sunday") },
    { date: addDays(easter, 56), celebration: solemnity("Trinity Sunday") },
    { date: addDays(easter, 60), celebration: solemnity("Corpus Christi") },
    { date: addDays(easter, 68), celebration: solemnity("Most Sacred Heart of Jesus") },
    { date: lastSundayOfOctober(year), celebration: solemnity("Christ the King") },
  ];
}
