import { toISODate, toMonthDay } from "../dateUtils";
import type { Celebration, LiturgicalDay } from "../types";
import { findEmberDay } from "./emberDays";
import { findSaintOfTheDay1962 } from "./saintsSeed";
import { findSanctoraleCelebration } from "./sanctorale";
import { getTemporale } from "./temporale";

// getTemporale computes the whole year's movable solemnities at once; memoize
// per year so looking up many dates in the same year doesn't recompute Easter
// and friends every time.
const temporaleCache = new Map<number, Map<string, Celebration>>();

function getTemporaleByDate(year: number): Map<string, Celebration> {
  const cached = temporaleCache.get(year);
  if (cached) return cached;

  const byDate = new Map<string, Celebration>();
  for (const { date, celebration } of getTemporale(year)) {
    byDate.set(toISODate(date), celebration);
  }
  temporaleCache.set(year, byDate);
  return byDate;
}

export function getLiturgicalDay1962(date: Date): LiturgicalDay {
  const iso = toISODate(date);
  const monthDay = toMonthDay(date);

  const celebrations = [
    getTemporaleByDate(date.getUTCFullYear()).get(iso),
    findSanctoraleCelebration(monthDay),
    findEmberDay(date),
    findSaintOfTheDay1962(monthDay),
  ].filter((c): c is Celebration => c != null);

  return { date: iso, calendar: "1962", celebrations };
}
