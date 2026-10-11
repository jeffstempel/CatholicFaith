import { describe, expect, it, vi } from "vitest";
import {
  fetchTodaySummaryTable1962,
  selectTodaySummaryYears1962,
  serializeTodaySummaryTable1962,
} from "./todaySummaryTable";
import type { TodaySummaryTable1962 } from "./todaySummaryLookup";
import savedTable from "./todaySummaryTable1962.json";

function fakeResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

const SAMPLE_2026 = [
  { id: "2026-01-01", title: "Octave Day of Christmas", colors: ["w"], rank: 1, commemorations: [], displaced: [] },
  { id: "2026-01-02", title: "Feria", colors: ["w"], rank: 4, commemorations: [], displaced: [] },
  { id: "2026-04-03", title: "Good Friday", colors: ["b"], rank: 1, commemorations: [], displaced: [] },
];

/** A complete year of placeholder entries, for the completeness checks. */
function fullYear(year: number): TodaySummaryTable1962 {
  const table: TodaySummaryTable1962 = {};
  for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) {
    table[d.toISOString().slice(0, 10)] = { name: "Feria", color: "Green" };
  }
  return table;
}

describe("fetchTodaySummaryTable1962", () => {
  it("maps title and the first color code to a full color name, keyed by ISO date", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(SAMPLE_2026));
    const table = await fetchTodaySummaryTable1962(2026, 2026, { fetchImpl });
    expect(table["2026-01-01"]).toEqual({ name: "Octave Day of Christmas", color: "White" });
    expect(table["2026-04-03"]).toEqual({ name: "Good Friday", color: "Black" });
    expect(fetchImpl).toHaveBeenCalledWith("https://www.missalemeum.com/en/api/v5/calendar/2026");
  });

  it("fetches each requested year", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(SAMPLE_2026));
    await fetchTodaySummaryTable1962(2025, 2027, { fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("retries a failed year and succeeds if a later attempt works", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(fakeResponse(null, false, 503))
      .mockResolvedValueOnce(fakeResponse(SAMPLE_2026));
    const table = await fetchTodaySummaryTable1962(2026, 2026, { fetchImpl, retryDelayMs: 0 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(Object.keys(table)).toHaveLength(SAMPLE_2026.length);
  });

  it("throws rather than skipping when a year keeps failing, so no partial table is written", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(null, false, 500));
    await expect(fetchTodaySummaryTable1962(2026, 2026, { fetchImpl, retryDelayMs: 0 })).rejects.toThrow(
      /Failed to fetch Missale Meum data for 2026 after 3 attempts: Error: HTTP 500/,
    );
  });
});

describe("serializeTodaySummaryTable1962", () => {
  it("writes one entry per line, sorted by date, and round-trips as JSON", () => {
    const table: TodaySummaryTable1962 = {
      "2026-04-03": { name: "Good Friday", color: "Black" },
      "2026-01-01": { name: "Octave Day of Christmas", color: "White" },
    };
    const text = serializeTodaySummaryTable1962(table);
    expect(text).toBe(
      '{\n  "2026-01-01": {"name":"Octave Day of Christmas","color":"White"},\n  "2026-04-03": {"name":"Good Friday","color":"Black"}\n}\n',
    );
    expect(JSON.parse(text)).toEqual(table);
  });
});

describe("selectTodaySummaryYears1962", () => {
  it("returns only the requested years", () => {
    const saved = { ...fullYear(2025), ...fullYear(2026), ...fullYear(2027) };
    const selected = selectTodaySummaryYears1962(saved, 2026, 2026);
    expect(Object.keys(selected)).toHaveLength(365);
    expect(Object.keys(selected).every((date) => date.startsWith("2026-"))).toBe(true);
  });

  it("throws, naming the years, when a requested year is missing or incomplete", () => {
    const partial2027 = fullYear(2027);
    delete partial2027["2027-06-01"];
    const saved = { ...fullYear(2026), ...partial2027 };
    expect(() => selectTodaySummaryYears1962(saved, 2026, 2028)).toThrow(/missing or incomplete for 2027, 2028.*npm run refresh:1962/);
  });
});

describe("saved todaySummaryTable1962.json", () => {
  it("has every day of 2000–2060, so builds through 2050 never need the API", () => {
    expect(() => selectTodaySummaryYears1962(savedTable, 2000, 2060)).not.toThrow();
  });

  it("matches known 1962 days", () => {
    expect(savedTable["2026-04-03"]).toEqual({ name: "Good Friday", color: "Black" });
    expect(savedTable["2026-12-25"]?.name).toMatch(/Nativity|Christmas/);
  });
});
