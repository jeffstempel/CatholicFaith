import type { TodaySummaryTable1962 } from "./todaySummaryLookup";

/**
 * Node-only: "what is today" (the temporal/moveable designation and
 * liturgical color) for the 1962 calendar, from the Missale Meum API
 * (missalemeum.com, MIT licensed).
 *
 * The answer for any given year never changes — the 1962 rubrics are a
 * closed historical document — so rather than calling the API on every
 * build, a wide range of years is fetched once by `npm run refresh:1962`
 * (scripts/refresh1962.ts) and committed as todaySummaryTable1962.json.
 * The build only reads that file (selectTodaySummaryYears1962), so it never
 * depends on the API being up, and fails loudly if a year it needs isn't
 * in the file rather than deploying with gaps.
 */
const COLOR_NAMES: Record<string, string> = {
  w: "White",
  r: "Red",
  g: "Green",
  v: "Purple",
  p: "Rose",
  b: "Black",
};

interface MissaleMeumDay {
  id: string;
  title: string;
  colors: string[];
}

export interface FetchOptions {
  fetchImpl?: typeof fetch;
  attempts?: number;
  retryDelayMs?: number;
}

async function fetchYear(year: number, { fetchImpl = fetch, attempts = 3, retryDelayMs = 1000 }: FetchOptions): Promise<MissaleMeumDay[]> {
  const url = `https://www.missalemeum.com/en/api/v5/calendar/${year}`;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetchImpl(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
    }
  }
  throw new Error(`Failed to fetch Missale Meum data for ${year} after ${attempts} attempts: ${lastError}`);
}

/**
 * Fetches [startYear, endYear] one year at a time (it's a small free
 * service, so no parallel burst), retrying each year a few times. Throws if
 * any year still fails, so a refresh never writes a partial table.
 */
export async function fetchTodaySummaryTable1962(
  startYear: number,
  endYear: number,
  options: FetchOptions = {},
): Promise<TodaySummaryTable1962> {
  const table: TodaySummaryTable1962 = {};
  for (let year = startYear; year <= endYear; year++) {
    for (const day of await fetchYear(year, options)) {
      table[day.id] = { name: day.title, color: COLOR_NAMES[day.colors[0]] ?? day.colors[0] };
    }
  }
  return table;
}

/** One entry per line, sorted by date, so a refresh's git diff shows exactly which days changed. */
export function serializeTodaySummaryTable1962(table: TodaySummaryTable1962): string {
  const lines = Object.keys(table)
    .sort()
    .map((date) => `  ${JSON.stringify(date)}: ${JSON.stringify(table[date])}`);
  return `{\n${lines.join(",\n")}\n}\n`;
}

function daysInYear(year: number): number {
  return new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1 ? 366 : 365;
}

/**
 * The slice of the saved table covering [startYear, endYear]. Throws if any
 * of those years is missing or incomplete, so the build stops instead of
 * the site silently showing "Unknown" for those dates.
 */
export function selectTodaySummaryYears1962(saved: TodaySummaryTable1962, startYear: number, endYear: number): TodaySummaryTable1962 {
  const selected: TodaySummaryTable1962 = {};
  const incomplete: number[] = [];
  for (let year = startYear; year <= endYear; year++) {
    const dates = Object.keys(saved).filter((date) => date.startsWith(`${year}-`));
    if (dates.length !== daysInYear(year)) incomplete.push(year);
    for (const date of dates) selected[date] = saved[date];
  }
  if (incomplete.length > 0) {
    throw new Error(
      `Saved 1962 data (todaySummaryTable1962.json) is missing or incomplete for ${incomplete.join(", ")}. ` +
        "Widen the range in scripts/refresh1962.ts, run `npm run refresh:1962`, and commit the result.",
    );
  }
  return selected;
}
