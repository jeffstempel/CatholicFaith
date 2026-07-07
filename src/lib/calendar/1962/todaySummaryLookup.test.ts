import { describe, expect, it } from "vitest";
import { lookupTodaySummary1962, type TodaySummaryTable1962 } from "./todaySummaryLookup";

const table: TodaySummaryTable1962 = {
  "2026-02-18": { name: "Ash Wednesday", color: "Purple" },
  "2026-03-15": { name: "IV Sunday of Lent", color: "Rose" },
  "2026-04-03": { name: "Good Friday", color: "Black" },
};

describe("lookupTodaySummary1962", () => {
  it("finds an entry for a date present in the table", () => {
    const result = lookupTodaySummary1962(table, new Date(Date.UTC(2026, 1, 18)));
    expect(result).toEqual({ name: "Ash Wednesday", color: "Purple" });
  });

  it("returns undefined for a date outside the table", () => {
    const result = lookupTodaySummary1962(table, new Date(Date.UTC(2030, 0, 1)));
    expect(result).toBeUndefined();
  });
});
