import { describe, expect, it, beforeAll } from "vitest";
import { buildNovusOrdoTable } from "./novusOrdoTable";
import { getLiturgicalDayNovusOrdo, getTodaySummaryNovusOrdo } from "./novusOrdo";
import type { NovusOrdoTable } from "./novusOrdoLookup";

describe("buildNovusOrdoTable", () => {
  let table: NovusOrdoTable;

  beforeAll(() => {
    table = buildNovusOrdoTable(2026, 2026);
  });

  it("covers every day of the requested year(s)", () => {
    expect(Object.keys(table)).toHaveLength(365);
  });

  it("matches getLiturgicalDayNovusOrdo/getTodaySummaryNovusOrdo for a spot-checked date", () => {
    const date = new Date(Date.UTC(2026, 6, 6));
    const entry = table["2026-07-06"];
    const celebration = getLiturgicalDayNovusOrdo(date).celebrations[0];
    const summary = getTodaySummaryNovusOrdo(date);
    expect(entry.name).toBe(celebration.name);
    expect(entry.isSolemnity).toBe(celebration.isSolemnity);
    expect(entry.todaySummaryName).toBe(summary.name);
    expect(entry.todaySummaryColor).toBe(summary.color);
  });

  it("marks Christmas as a Solemnity", () => {
    expect(table["2026-12-25"].isSolemnity).toBe(true);
  });
});
