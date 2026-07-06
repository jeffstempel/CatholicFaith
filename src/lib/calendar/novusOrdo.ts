import { calendarFor, Seasons, type RomcalCelebration, type RomcalSeasonDay } from "romcal";
import { fromISODate, toISODate } from "./dateUtils";
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
// The raw romcal type per date, kept alongside yearCache (not part of the
// shared Celebration shape) so getTodaySummary can tell a Memorial/Optional
// Memorial — which doesn't override the day's own season/feria name — apart
// from a Solemnity/Feast/Sunday/Feria, which does.
const rawTypeCache = new Map<number, Map<string, string>>();

function getYearByDate(year: number): Map<string, Celebration> {
  const cached = yearCache.get(year);
  if (cached) return cached;

  const byDate = new Map<string, Celebration>();
  const typeByDate = new Map<string, string>();
  for (const day of calendarFor({ year, country: "unitedStates", locale: "en" })) {
    const iso = day.moment.slice(0, 10);
    byDate.set(iso, toCelebration(day));
    typeByDate.set(iso, day.type);
  }
  yearCache.set(year, byDate);
  rawTypeCache.set(year, typeByDate);
  return byDate;
}

// Seasons.* return the underlying ferial/Sunday skeleton for every day of a
// season, independent of whatever Memorial/Optional Memorial gets layered on
// top by calendarFor — exactly what's needed to answer "what is today"
// underneath a saint's day. christmastide spans year-end, so both the
// requested year and the prior year's christmastide are needed to cover
// early January.
const seasonCache = new Map<number, Map<string, { name: string; color: string }>>();

function getSeasonSkeletonByDate(year: number): Map<string, { name: string; color: string }> {
  const cached = seasonCache.get(year);
  if (cached) return cached;

  const byDate = new Map<string, { name: string; color: string }>();
  const seasons: RomcalSeasonDay[][] = [
    Seasons.earlyOrdinaryTime(year),
    Seasons.laterOrdinaryTime(year),
    Seasons.advent(year),
    Seasons.christmastide(year - 1),
    Seasons.christmastide(year),
    Seasons.lent(year),
    Seasons.eastertide(year),
    Seasons.easterOctave(year),
    Seasons.easterTriduum(year),
  ];
  for (const days of seasons) {
    for (const day of days) {
      byDate.set(day.moment.format("YYYY-MM-DD"), {
        name: day.name,
        color: day.data?.meta?.liturgicalColor?.key ?? "GREEN",
      });
    }
  }
  seasonCache.set(year, byDate);
  return byDate;
}

const NOT_OVERRIDING_TYPES = new Set(["MEMORIAL", "OPT_MEMORIAL", "COMMEMORATION"]);

function titleCase(word: string): string {
  return word.charAt(0) + word.slice(1).toLowerCase();
}

/**
 * What today is in the Novus Ordo calendar independent of any Memorial or
 * Optional Memorial superimposed on it (e.g. "Tuesday of the 14th week of
 * Ordinary Time", not the saint commemorated that day — that's shown
 * separately in the Saint of the Day section). Solemnities, Feasts, Sundays,
 * and plain ferias already are the day's own designation, so those are
 * reported as-is.
 */
export function getTodaySummaryNovusOrdo(date: Date): { name: string; color: string } {
  const iso = toISODate(date);
  const year = date.getUTCFullYear();
  const celebration = getYearByDate(year).get(iso);
  const rawType = rawTypeCache.get(year)?.get(iso);

  if (rawType && !NOT_OVERRIDING_TYPES.has(rawType) && celebration) {
    return { name: celebration.name, color: titleCase(celebration.liturgicalColor ?? "GREEN") };
  }

  const skeleton = getSeasonSkeletonByDate(year).get(iso);
  if (skeleton) return { name: skeleton.name, color: titleCase(skeleton.color) };

  // Should be unreachable — the season skeleton covers every day of the year.
  return { name: celebration?.name ?? "Feria", color: titleCase(celebration?.liturgicalColor ?? "GREEN") };
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

/** The next Novus Ordo Solemnity strictly after `from`. */
export function getNextSolemnity(from: Date): Date {
  const year = from.getUTCFullYear();
  const upcoming = [year, year + 1]
    .flatMap((y) => Array.from(getYearByDate(y).entries()))
    .filter(([, celebration]) => celebration.isSolemnity)
    .map(([iso]) => fromISODate(iso))
    .filter((date) => date.getTime() > from.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0];
}
