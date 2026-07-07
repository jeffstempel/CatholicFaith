import { gregorianEaster } from "../computus";
import { addDays, dayOfWeek } from "../dateUtils";
import { findEmberDay } from "./emberDays";

export type AbstinenceLevel = "none" | "partial" | "full";

export interface FastingAbstinence {
  fast: boolean;
  abstinence: AbstinenceLevel;
}

const SUNDAY = 0;
const FRIDAY = 5;

/**
 * The pre-1966 (1917 Code, canns. 1250-1254) fasting/abstinence discipline
 * still followed alongside the 1962 Missal:
 *   - Fasting (one full meal, two smaller): every weekday of Lent, all Ember
 *     Days, and Ash Wednesday.
 *   - Full abstinence from meat: every Friday of the year, and Ash Wednesday.
 *   - Partial abstinence (meat once at the main meal): Ember Wednesdays and
 *     Ember Saturdays.
 * Deliberately not modeled here (lower confidence on the exact historical
 * scope): the vigil fasts of Pentecost, the Assumption, All Saints, and
 * Christmas.
 */
export function getFastingAbstinence1962(date: Date): FastingAbstinence {
  const year = date.getUTCFullYear();
  const easter = gregorianEaster(year);
  const ashWednesday = addDays(easter, -46);
  const holySaturday = addDays(easter, -1);

  const isFriday = dayOfWeek(date) === FRIDAY;
  const isSunday = dayOfWeek(date) === SUNDAY;
  const isAshWednesday = date.getTime() === ashWednesday.getTime();
  const inLent = date.getTime() >= ashWednesday.getTime() && date.getTime() <= holySaturday.getTime();
  const emberDay = findEmberDay(date);

  const fast = isAshWednesday || (inLent && !isSunday) || emberDay !== null;

  let abstinence: AbstinenceLevel = "none";
  if (isFriday || isAshWednesday) {
    abstinence = "full";
  } else if (emberDay && (emberDay.name.includes("Wednesday") || emberDay.name.includes("Saturday"))) {
    abstinence = "partial";
  }

  return { fast, abstinence };
}
