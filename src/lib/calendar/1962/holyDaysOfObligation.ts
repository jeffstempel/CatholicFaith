import { gregorianEaster } from "../computus";
import { addDays, dayOfWeek, toMonthDay } from "../dateUtils";

export interface HolyDayOfObligation1917 {
  isSunday: boolean;
  /** The holy day of obligation falling today, if any (besides Sunday itself). */
  feast: string | null;
  /** One of the four universal holy days the US didn't keep (see below). */
  notKeptInUS: boolean;
  /** March 19 on a Sunday or in Holy Week, when the 1962 calendar moves St. Joseph's feast. */
  stJosephFeastMoved: boolean;
}

const SUNDAY = 0;

const FIXED_FEASTS: Record<string, string> = {
  "01-01": "Circumcision of Our Lord",
  "01-06": "Epiphany of Our Lord",
  "03-19": "Saint Joseph, Spouse of the Blessed Virgin Mary",
  "06-29": "Saints Peter and Paul, Apostles",
  "08-15": "Assumption of the Blessed Virgin Mary",
  "11-01": "All Saints",
  "12-08": "Immaculate Conception of the Blessed Virgin Mary",
  "12-25": "The Nativity of Our Lord Jesus Christ",
};

/**
 * Holy days of obligation under the 1917 Code (canon 1247 §1): every
 * Sunday, plus Christmas, the Circumcision, Epiphany, Ascension, Corpus
 * Christi, the Immaculate Conception, the Assumption, St. Joseph, Sts.
 * Peter and Paul, and All Saints. Shown as history only — the 1983 Code
 * binds everyone today, whichever form of the Mass they attend.
 *
 * The US kept only six of those ten (set by the Third Plenary Council of
 * Baltimore in 1884 and continued under the 1917 Code); `notKeptInUS` marks
 * the other four: Epiphany, Corpus Christi, St. Joseph, and Sts. Peter and
 * Paul.
 *
 * Not modeled (unverified): whether the obligation moved along with St.
 * Joseph's feast when the 1962 calendar transfers it off a Sunday or out
 * of Holy Week. The obligation is shown on March 19, flagged by
 * `stJosephFeastMoved`.
 */
export function getHolyDayOfObligation1917(date: Date): HolyDayOfObligation1917 {
  const easter = gregorianEaster(date.getUTCFullYear());
  const isSunday = dayOfWeek(date) === SUNDAY;
  const monthDay = toMonthDay(date);

  let feast: string | null = FIXED_FEASTS[monthDay] ?? null;
  if (date.getTime() === addDays(easter, 39).getTime()) feast = "Ascension of the Lord";
  if (date.getTime() === addDays(easter, 60).getTime()) feast = "Corpus Christi";

  const notKeptInUS =
    monthDay === "01-06" || monthDay === "03-19" || monthDay === "06-29" || feast === "Corpus Christi";

  const palmSunday = addDays(easter, -7);
  const holySaturday = addDays(easter, -1);
  const inHolyWeek = date.getTime() >= palmSunday.getTime() && date.getTime() <= holySaturday.getTime();
  const stJosephFeastMoved = monthDay === "03-19" && (isSunday || inHolyWeek);

  return { isSunday, feast, notKeptInUS, stJosephFeastMoved };
}
