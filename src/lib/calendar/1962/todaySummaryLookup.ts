import { toISODate } from "../dateUtils";

/**
 * Pure, dependency-free lookup over a precomputed table (see
 * todaySummaryTable.ts for how it's built) — safe to ship to the browser for
 * the client-side date picker, same pattern as ../novusOrdo/lookup.ts.
 */
export interface TodaySummaryEntry1962 {
  name: string;
  color: string;
}

export type TodaySummaryTable1962 = Record<string, TodaySummaryEntry1962>;

export function lookupTodaySummary1962(table: TodaySummaryTable1962, date: Date): TodaySummaryEntry1962 | undefined {
  return table[toISODate(date)];
}
