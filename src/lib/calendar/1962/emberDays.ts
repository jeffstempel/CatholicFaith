import { gregorianEaster } from "../computus";
import { addDays, nextDayOfWeekOnOrAfter, toISODate, utcDate } from "../dateUtils";
import type { Celebration, DatedCelebration } from "../types";

const WEDNESDAY = 3;

/**
 * The four Embertides of the 1962 (Pian/Johannine) rubrics, each the Wednesday,
 * Friday, and Saturday anchored to a fixed liturgical marker:
 *   - Advent: after the feast of St. Lucy (Dec 13)
 *   - Lent: after the First Sunday of Lent (Easter - 42 days)
 *   - Whitsun: after Pentecost (Easter + 49 days)
 *   - Michaelmas: after the Exaltation of the Holy Cross (Sept 14)
 */
export function getEmberDays(year: number): DatedCelebration[] {
  const easter = gregorianEaster(year);
  const firstSundayOfLent = addDays(easter, -42);
  const pentecost = addDays(easter, 49);
  const dayAfterStLucy = utcDate(year, 12, 14);
  const dayAfterHolyCross = utcDate(year, 9, 15);

  const adventEmberWednesday = nextDayOfWeekOnOrAfter(dayAfterStLucy, WEDNESDAY);
  const michaelmasEmberWednesday = nextDayOfWeekOnOrAfter(dayAfterHolyCross, WEDNESDAY);

  return [
    ...emberTriduum(adventEmberWednesday, "Ember Wednesday of Advent", "Ember Friday of Advent", "Ember Saturday of Advent"),
    ...emberTriduum(addDays(firstSundayOfLent, 3), "Ember Wednesday of Lent", "Ember Friday of Lent", "Ember Saturday of Lent"),
    ...emberTriduum(addDays(pentecost, 3), "Ember Wednesday of Whitsun", "Ember Friday of Whitsun", "Ember Saturday of Whitsun"),
    ...emberTriduum(michaelmasEmberWednesday, "Ember Wednesday of Michaelmas", "Ember Friday of Michaelmas", "Ember Saturday of Michaelmas"),
  ];
}

function emberTriduum(wednesday: Date, wedName: string, friName: string, satName: string): DatedCelebration[] {
  return [
    { date: wednesday, celebration: emberCelebration(wedName) },
    { date: addDays(wednesday, 2), celebration: emberCelebration(friName) },
    { date: addDays(wednesday, 3), celebration: emberCelebration(satName) },
  ];
}

function emberCelebration(name: string): Celebration {
  return { name, rank: "ember", isEmberDay: true, source: "curated" };
}

export function findEmberDay(date: Date): Celebration | null {
  const match = getEmberDays(date.getUTCFullYear()).find((d) => toISODate(d.date) === toISODate(date));
  return match ? match.celebration : null;
}
