import { fromISODate, toISODate } from "./dateUtils";

/**
 * Deliberately dependency-free (no romcal/moment/lodash): `romcal`'s
 * `moment-recur` dependency fails to register its plugin when bundled for
 * the browser ("Cannot set properties of undefined (setting 'recur')"),
 * confirmed against a real production build, not just a dev-server quirk.
 * So romcal only ever runs in Node (see novusOrdoTable.ts) and its output is
 * precomputed once into a plain data table that this pure lookup operates on
 * — safe to ship to the browser for the client-side date picker.
 */
export interface NovusOrdoDayEntry {
  name: string;
  isSolemnity: boolean;
  todaySummaryName: string;
  todaySummaryColor: string;
}

export type NovusOrdoTable = Record<string, NovusOrdoDayEntry>;

export function lookupNovusOrdoDay(table: NovusOrdoTable, date: Date): NovusOrdoDayEntry | undefined {
  return table[toISODate(date)];
}

/** The next Novus Ordo Solemnity strictly after `from`, within the table's range. */
export function lookupNextSolemnity(table: NovusOrdoTable, from: Date): Date | undefined {
  const fromIso = toISODate(from);
  const nextIso = Object.keys(table)
    .filter((iso) => table[iso].isSolemnity && iso > fromIso)
    .sort()[0];
  return nextIso ? fromISODate(nextIso) : undefined;
}
