import { gregorianEaster } from "../computus";
import { addDays, dayOfWeek, toMonthDay } from "../dateUtils";

export type ObligationStatusUS =
  /** Sunday, or a holy day that binds today. */
  | "obligatory"
  /** A holy day whose obligation is lifted this year (Saturday/Monday rule). */
  | "abrogated"
  /** Ascension Thursday: binding only in the provinces that keep it on Thursday. */
  | "provincesOnly"
  | "none";

export interface HolyDayOfObligationUS {
  status: ObligationStatusUS;
  isSunday: boolean;
  /** The holy day falling (or transferred) today, if any, besides Sunday itself. */
  feast: string | null;
  /**
   * "toMonday": Dec 8 is a Sunday, so the Immaculate Conception moves to Monday.
   * "fromSunday": that Monday.
   * "fromThursday": the Sunday most US dioceses celebrate the Ascension.
   */
  transfer: "toMonday" | "fromSunday" | "fromThursday" | null;
  /** Abrogated because the holy day falls on this weekday. */
  abrogatedOn: "Saturday" | "Monday" | null;
  /** Binding on the mainland but not in the Diocese of Honolulu. */
  notObligatoryInHonolulu: boolean;
}

const SUNDAY = 0;
const MONDAY = 1;
const SATURDAY = 6;

const IMMACULATE_CONCEPTION = "Immaculate Conception of the Blessed Virgin Mary";
const ASCENSION = "Ascension of the Lord";

/** Lifted when they fall on a Saturday or Monday. */
const ABROGABLE_FEASTS: Record<string, string> = {
  "01-01": "Mary, Mother of God",
  "08-15": "Assumption of the Blessed Virgin Mary",
  "11-01": "All Saints",
};

/**
 * Holy days of obligation under current law (1983 Code, canon 1246) as
 * set for the US by the USCCB's complementary norm to canon 1246 §2:
 *   - Every Sunday.
 *   - Jan 1, Ascension, Aug 15, Nov 1, Dec 8, and Christmas.
 *   - When Jan 1, Aug 15, or Nov 1 falls on a Saturday or Monday, the
 *     obligation is abrogated (1991 decree). Dec 8 and Christmas never are.
 *   - Ascension binds on Thursday only in the provinces of Boston,
 *     Hartford, New York, Omaha, and Philadelphia; the rest transfer it
 *     to the following Sunday (1999 decree).
 *   - When Dec 8 is a Sunday, the Immaculate Conception moves to Monday and
 *     the obligation moves with it (Dicastery for Legislative Texts, 2024).
 *   - The Diocese of Honolulu keeps only Dec 8 and Christmas (since 1992).
 */
export function getHolyDayOfObligationUS(date: Date): HolyDayOfObligationUS {
  const easter = gregorianEaster(date.getUTCFullYear());
  const weekday = dayOfWeek(date);
  const isSunday = weekday === SUNDAY;
  const monthDay = toMonthDay(date);
  const result: HolyDayOfObligationUS = {
    status: isSunday ? "obligatory" : "none",
    isSunday,
    feast: null,
    transfer: null,
    abrogatedOn: null,
    notObligatoryInHonolulu: false,
  };

  const abrogable = ABROGABLE_FEASTS[monthDay];
  if (abrogable) {
    result.feast = abrogable;
    if (weekday === SATURDAY || weekday === MONDAY) {
      result.status = "abrogated";
      result.abrogatedOn = weekday === SATURDAY ? "Saturday" : "Monday";
    } else {
      result.status = "obligatory";
      result.notObligatoryInHonolulu = !isSunday;
    }
  } else if (monthDay === "12-25") {
    result.feast = "Christmas";
    result.status = "obligatory";
  } else if (monthDay === "12-08") {
    result.feast = IMMACULATE_CONCEPTION;
    if (isSunday) result.transfer = "toMonday";
    else result.status = "obligatory";
  } else if (monthDay === "12-09" && weekday === MONDAY) {
    result.feast = IMMACULATE_CONCEPTION;
    result.transfer = "fromSunday";
    result.status = "obligatory";
  } else if (date.getTime() === addDays(easter, 39).getTime()) {
    result.feast = ASCENSION;
    result.status = "provincesOnly";
  } else if (date.getTime() === addDays(easter, 42).getTime()) {
    result.feast = ASCENSION;
    result.transfer = "fromThursday";
  }

  return result;
}

/**
 * The next holy day strictly after `from`, not counting ordinary Sundays.
 * Skips holy days lifted that year, and Dec 8 on a Sunday (it's kept the
 * next day). For the Ascension it gives the Sunday most US dioceses keep,
 * not Thursday. Christmas guarantees one within a year.
 */
export function getNextHolyDayOfObligationUS(from: Date): { date: Date; feast: string; ascensionTransferred: boolean } {
  for (let date = addDays(from, 1); ; date = addDays(date, 1)) {
    const { status, feast, transfer } = getHolyDayOfObligationUS(date);
    if (feast && status === "obligatory" && transfer !== "toMonday") {
      return { date, feast, ascensionTransferred: transfer === "fromThursday" };
    }
  }
}
