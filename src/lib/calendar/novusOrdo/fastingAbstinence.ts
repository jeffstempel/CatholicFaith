import { gregorianEaster } from "../computus";
import { addDays, dayOfWeek } from "../dateUtils";

export type AbstinenceLevel = "none" | "recommended" | "full";

export interface FastingAbstinence {
  fast: boolean;
  abstinence: AbstinenceLevel;
}

const FRIDAY = 5;

/**
 * The modern (post-1966 Paenitemini, per the US bishops' norms) discipline:
 *   - Fasting (one full meal, two smaller): Ash Wednesday and Good Friday only.
 *   - Full abstinence from meat, obligatory: Ash Wednesday, Good Friday, and
 *     every Friday of Lent.
 *   - Abstinence on Fridays outside Lent is no longer obligatory in the US —
 *     the bishops permit substituting another penitential act — but is still
 *     recommended.
 * Pure Easter-relative math, no romcal dependency, so this runs identically
 * server- and client-side.
 */
export function getFastingAbstinenceNovusOrdo(date: Date): FastingAbstinence {
  const year = date.getUTCFullYear();
  const easter = gregorianEaster(year);
  const ashWednesday = addDays(easter, -46);
  const goodFriday = addDays(easter, -2);

  const isFriday = dayOfWeek(date) === FRIDAY;
  const isAshWednesday = date.getTime() === ashWednesday.getTime();
  const isGoodFriday = date.getTime() === goodFriday.getTime();
  const inLent = date.getTime() >= ashWednesday.getTime() && date.getTime() <= goodFriday.getTime();

  const fast = isAshWednesday || isGoodFriday;

  let abstinence: AbstinenceLevel = "none";
  if (isAshWednesday || isGoodFriday || (isFriday && inLent)) {
    abstinence = "full";
  } else if (isFriday) {
    abstinence = "recommended";
  }

  return { fast, abstinence };
}
