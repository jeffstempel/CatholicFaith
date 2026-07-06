import { calendarFor, type RomcalCelebration } from "romcal";
import { toISODate } from "./dateUtils";
import type { Celebration, LiturgicalDay } from "./types";

const RANK_BY_ROMCAL_TYPE: Record<string, string> = {
  SOLEMNITY: "solemnity",
  FEAST: "feast",
  MEMORIAL: "memorial",
  OPT_MEMORIAL: "optional memorial",
  SUNDAY: "sunday",
  FERIA: "feria",
  COMMEMORATION: "commemoration",
  HOLY_WEEK: "holy week",
  TRIDUUM: "triduum",
};

function toCelebration(day: RomcalCelebration): Celebration {
  return {
    name: day.name,
    rank: RANK_BY_ROMCAL_TYPE[day.type] ?? day.type.toLowerCase(),
    isSolemnity: day.type === "SOLEMNITY",
    liturgicalColor: day.data?.meta?.liturgicalColor?.key,
    season: day.data?.season?.value,
    source: "romcal",
  };
}

// romcal.calendarFor computes an entire year at once; memoize per year so a
// month/year view doesn't recompute it once per day looked up.
const yearCache = new Map<number, Map<string, Celebration>>();

function getYearByDate(year: number): Map<string, Celebration> {
  const cached = yearCache.get(year);
  if (cached) return cached;

  const byDate = new Map<string, Celebration>();
  for (const day of calendarFor({ year, country: "unitedStates", locale: "en" })) {
    byDate.set(day.moment.slice(0, 10), toCelebration(day));
  }
  yearCache.set(year, byDate);
  return byDate;
}

export function getLiturgicalDayNovusOrdo(date: Date): LiturgicalDay {
  const iso = toISODate(date);
  const celebration = getYearByDate(date.getUTCFullYear()).get(iso);
  return {
    date: iso,
    calendar: "novusOrdo",
    celebrations: celebration ? [celebration] : [],
  };
}
