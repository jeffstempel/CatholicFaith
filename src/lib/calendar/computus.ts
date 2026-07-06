import { utcDate } from "./dateUtils";

/**
 * Date of Easter Sunday (Western/Gregorian computus) for a given year, via the
 * Anonymous Gregorian algorithm (Meeus/Jones/Butcher). Valid for any Gregorian
 * calendar year; the 1962 and Novus Ordo calendars use the same paschal
 * calculation, so this one function serves both.
 */
export function gregorianEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monthPlusDayEncoded = h + l - 7 * m + 114;
  const month = Math.floor(monthPlusDayEncoded / 31); // 3 = March, 4 = April
  const day = (monthPlusDayEncoded % 31) + 1;
  return utcDate(year, month, day);
}
