/**
 * `npm run refresh:1962` — re-downloads the 1962 "what is today" data from
 * the Missale Meum API and rewrites todaySummaryTable1962.json, which the
 * build reads instead of calling the API. Commit the result; the git diff
 * shows exactly which days changed (normally none, unless Missale Meum
 * corrected something or the range below was widened).
 *
 * Runs with Node's built-in TypeScript support (Node 22.18+), so it can
 * only import modules that have no runtime imports of their own.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fetchTodaySummaryTable1962, serializeTodaySummaryTable1962 } from "../src/lib/calendar/1962/todaySummaryTable.ts";

// The date picker covers 10 years either side of the build year, so this
// lasts until a build in 2050; widen END_YEAR before then.
const START_YEAR = 2000;
const END_YEAR = 2060;

const outputPath = join(import.meta.dirname, "../src/lib/calendar/1962/todaySummaryTable1962.json");

console.log(`Fetching 1962 data for ${START_YEAR}–${END_YEAR} from Missale Meum...`);
const table = await fetchTodaySummaryTable1962(START_YEAR, END_YEAR);
writeFileSync(outputPath, serializeTodaySummaryTable1962(table));
console.log(`Wrote ${Object.keys(table).length} days to ${outputPath}`);
