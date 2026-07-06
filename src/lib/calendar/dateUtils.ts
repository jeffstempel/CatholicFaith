/**
 * All liturgical date math in this app works in UTC-anchored dates (not local time),
 * so builds are reproducible regardless of the server's timezone.
 */

export function utcDate(year: number, month1to12: number, day: number): Date {
  return new Date(Date.UTC(year, month1to12 - 1, day));
}

export function toISODate(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toMonthDay(date: Date): string {
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** 0 = Sunday, ..., 6 = Saturday (UTC day-of-week). */
export function dayOfWeek(date: Date): number {
  return date.getUTCDay();
}

/** The next date on/after `date` that falls on the given UTC day-of-week (0=Sunday...6=Saturday). */
export function nextDayOfWeekOnOrAfter(date: Date, targetDow: number): Date {
  const diff = (targetDow - dayOfWeek(date) + 7) % 7;
  return addDays(date, diff);
}

/** Today's UTC calendar date, with the time-of-day zeroed out. */
export function todayUTC(): Date {
  const now = new Date();
  return utcDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
}
