import { describe, expect, it, vi } from "vitest";
import { buildTodaySummaryTable1962 } from "./todaySummaryTable";

function fakeResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

const SAMPLE_2026 = [
  { id: "2026-01-01", title: "Octave Day of Christmas", colors: ["w"], rank: 1, commemorations: [], displaced: [] },
  { id: "2026-01-02", title: "Feria", colors: ["w"], rank: 4, commemorations: [], displaced: [] },
  { id: "2026-04-03", title: "Good Friday", colors: ["b"], rank: 1, commemorations: [], displaced: [] },
];

describe("buildTodaySummaryTable1962", () => {
  it("maps title and the first color code to a full color name, keyed by ISO date", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(SAMPLE_2026));
    const table = await buildTodaySummaryTable1962(2026, 2026, fetchImpl);
    expect(table["2026-01-01"]).toEqual({ name: "Octave Day of Christmas", color: "White" });
    expect(table["2026-04-03"]).toEqual({ name: "Good Friday", color: "Black" });
    expect(fetchImpl).toHaveBeenCalledWith("https://www.missalemeum.com/en/api/v5/calendar/2026");
  });

  it("fetches each requested year", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(SAMPLE_2026));
    await buildTodaySummaryTable1962(2025, 2027, fetchImpl);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("skips a year gracefully on a non-OK response instead of throwing", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse(null, false, 500))
      .mockResolvedValueOnce(fakeResponse(SAMPLE_2026));
    const table = await buildTodaySummaryTable1962(2025, 2026, fetchImpl);
    expect(table["2026-01-01"]).toEqual({ name: "Octave Day of Christmas", color: "White" });
    expect(Object.keys(table)).toHaveLength(SAMPLE_2026.length);
  });

  it("skips a year gracefully when the request itself throws", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(fakeResponse(SAMPLE_2026));
    const table = await buildTodaySummaryTable1962(2025, 2026, fetchImpl);
    expect(Object.keys(table)).toHaveLength(SAMPLE_2026.length);
  });
});
