import { describe, expect, it } from "vitest";
import { lookupNextSolemnity, lookupNovusOrdoDay, type NovusOrdoTable } from "./lookup";
import { toISODate } from "../dateUtils";

const table: NovusOrdoTable = {
  "2025-12-01": { name: "1st Sunday of Advent", isSolemnity: false, todaySummaryName: "1st Sunday of Advent", todaySummaryColor: "Purple" },
  "2025-12-08": { name: "Immaculate Conception", isSolemnity: true, todaySummaryName: "Immaculate Conception", todaySummaryColor: "White" },
  "2025-12-25": { name: "Christmas", isSolemnity: true, todaySummaryName: "Christmas", todaySummaryColor: "White" },
  "2026-01-01": { name: "Mary, Mother of God", isSolemnity: true, todaySummaryName: "Mary, Mother of God", todaySummaryColor: "White" },
};

describe("lookupNovusOrdoDay", () => {
  it("finds an entry for a date present in the table", () => {
    const result = lookupNovusOrdoDay(table, new Date(Date.UTC(2025, 11, 8)));
    expect(result?.name).toBe("Immaculate Conception");
  });

  it("returns undefined for a date outside the table", () => {
    const result = lookupNovusOrdoDay(table, new Date(Date.UTC(2030, 0, 1)));
    expect(result).toBeUndefined();
  });
});

describe("lookupNextSolemnity", () => {
  it("finds the next Solemnity strictly after the given date", () => {
    const result = lookupNextSolemnity(table, new Date(Date.UTC(2025, 11, 1)));
    expect(result && toISODate(result)).toBe("2025-12-08");
  });

  it("rolls over to the next entry across a year boundary within the table", () => {
    const result = lookupNextSolemnity(table, new Date(Date.UTC(2025, 11, 26)));
    expect(result && toISODate(result)).toBe("2026-01-01");
  });

  it("returns undefined when no Solemnity exists after the date within the table", () => {
    const result = lookupNextSolemnity(table, new Date(Date.UTC(2026, 0, 1)));
    expect(result).toBeUndefined();
  });
});
