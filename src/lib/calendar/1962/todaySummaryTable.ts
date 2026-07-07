import type { TodaySummaryTable1962 } from "./todaySummaryLookup";

/**
 * Node-only: precomputes "what is today" (the temporal/moveable designation
 * and liturgical color) for the 1962 calendar by calling the Missale Meum
 * API (missalemeum.com, MIT licensed) at build time.
 *
 * Unlike the Sanctorale (saintsSeed.ts), this can't be fetched once and
 * vendored forever — the temporal designation for a given civil date
 * depends on where that year's Easter falls, so it must be regenerated
 * every build for whatever date range the picker currently covers.
 *
 * If a given year's request fails (the API is down, network issue), that
 * year is skipped with a logged warning rather than failing the whole
 * build — the "What Is Today" 1962 column just falls back to unavailable
 * for those dates instead of blocking deployment.
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

async function fetchYear(
  year: number,
  fetchImpl: typeof fetch,
): Promise<[year: number, days: MissaleMeumDay[]] | undefined> {
  try {
    const res = await fetchImpl(`https://www.missalemeum.com/en/api/v5/calendar/${year}`);
    if (!res.ok) {
      console.warn(`Missale Meum API returned ${res.status} for year ${year}; skipping.`);
      return undefined;
    }
    return [year, await res.json()];
  } catch (err) {
    console.warn(`Failed to fetch Missale Meum data for year ${year}; skipping.`, err);
    return undefined;
  }
}

export async function buildTodaySummaryTable1962(
  startYear: number,
  endYear: number,
  fetchImpl: typeof fetch = fetch,
): Promise<TodaySummaryTable1962> {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  const results = await Promise.all(years.map((year) => fetchYear(year, fetchImpl)));

  const table: TodaySummaryTable1962 = {};
  for (const result of results) {
    if (!result) continue;
    const [, days] = result;
    for (const day of days) {
      table[day.id] = { name: day.title, color: COLOR_NAMES[day.colors[0]] ?? day.colors[0] };
    }
  }
  return table;
}
