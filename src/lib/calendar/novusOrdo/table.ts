import { toISODate } from "../dateUtils";
import { getLiturgicalDayNovusOrdo, getTodaySummaryNovusOrdo } from "./index";
import type { NovusOrdoTable } from "./lookup";

/**
 * Node-only: precomputes the Novus Ordo table for [startYear, endYear] by
 * calling romcal once at build time, so the browser never needs romcal at
 * all (see lookup.ts for why). Do not import this from client-side
 * code — it pulls in romcal/moment/lodash.
 */
export function buildNovusOrdoTable(startYear: number, endYear: number): NovusOrdoTable {
  const table: NovusOrdoTable = {};

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(year, month, day));
        const celebration = getLiturgicalDayNovusOrdo(date).celebrations[0];
        const summary = getTodaySummaryNovusOrdo(date);
        table[toISODate(date)] = {
          name: celebration?.name ?? summary.name,
          isSolemnity: Boolean(celebration?.isSolemnity),
          todaySummaryName: summary.name,
          todaySummaryColor: summary.color,
        };
      }
    }
  }

  return table;
}
