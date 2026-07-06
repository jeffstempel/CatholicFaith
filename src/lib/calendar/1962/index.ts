import { toISODate, toMonthDay, utcDate } from "../dateUtils";
import type { Celebration, LiturgicalDay } from "../types";
import { findEmberDay } from "./emberDays";
import { findSaintOfTheDay1962 } from "./saintsSeed";
import { findSanctoraleCelebration, sanctorale } from "./sanctorale";
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

/**
 * The next 1962 Feast Day strictly after `from`. The 1962 calendar has no
 * "Solemnity" rank of its own — the major days modeled in sanctorale.ts and
 * temporale.ts (Christmas, Easter, Assumption, etc.) are themselves Feasts of
 * the highest class, so both are the correct source for this, not the curated
 * Saint-of-the-Day seed list.
 */
export function getNextFeastDay(from: Date): Date {
  const year = from.getUTCFullYear();
  const movable = [...getTemporale(year), ...getTemporale(year + 1)].map((d) => d.date);
  const fixed = [year, year + 1].flatMap((y) =>
    sanctorale.map(({ monthDay }) => {
      const [month, day] = monthDay.split("-").map(Number);
      return utcDate(y, month, day);
    }),
  );

  const upcoming = [...movable, ...fixed]
    .filter((date) => date.getTime() > from.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0];
}
