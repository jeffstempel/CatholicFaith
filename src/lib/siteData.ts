import { todayUTC } from "./calendar/dateUtils";
import { selectTodaySummaryYears1962 } from "./calendar/1962/todaySummaryTable";
import savedTodaySummaryTable1962 from "./calendar/1962/todaySummaryTable1962.json";
import type { TodaySummaryTable1962 } from "./calendar/1962/todaySummaryLookup";
import type { NovusOrdoTable } from "./calendar/novusOrdo/lookup";
import { buildNovusOrdoTable } from "./calendar/novusOrdo/table";

/**
 * Node-only (pulls in romcal): the data tables behind the date picker,
 * covering TABLE_YEARS_BEFORE/AFTER years either side of the build year.
 * Built once per build and shared by the home page (for its initial,
 * build-day render) and the /data/*.json endpoints the browser fetches for
 * every other date. Serving them as separate files, rather than inline in
 * the page, keeps the home page small for visitors and search engines.
 */
const TABLE_YEARS_BEFORE = 10;
const TABLE_YEARS_AFTER = 10;

export interface SiteTables {
  minYear: number;
  maxYear: number;
  novusOrdoTable: NovusOrdoTable;
  todaySummaryTable1962: TodaySummaryTable1962;
}

let cached: SiteTables | undefined;

export function getSiteTables(): SiteTables {
  if (!cached) {
    const buildYear = todayUTC().getUTCFullYear();
    const minYear = buildYear - TABLE_YEARS_BEFORE;
    const maxYear = buildYear + TABLE_YEARS_AFTER;
    cached = {
      minYear,
      maxYear,
      novusOrdoTable: buildNovusOrdoTable(minYear, maxYear),
      todaySummaryTable1962: selectTodaySummaryYears1962(savedTodaySummaryTable1962, minYear, maxYear),
    };
  }
  return cached;
}
