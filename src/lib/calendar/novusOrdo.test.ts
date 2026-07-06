import { describe, expect, it } from "vitest";
import { getLiturgicalDayNovusOrdo, getNextSolemnity } from "./novusOrdo";
import { toISODate } from "./dateUtils";

describe("getLiturgicalDayNovusOrdo", () => {
  it("identifies Christmas as a Solemnity", () => {
    const day = getLiturgicalDayNovusOrdo(new Date(Date.UTC(2024, 11, 25)));
    expect(day.date).toBe("2024-12-25");
    expect(day.calendar).toBe("novusOrdo");
    expect(day.celebrations).toHaveLength(1);
    expect(day.celebrations[0].name).toMatch(/Christmas/);
    expect(day.celebrations[0].isSolemnity).toBe(true);
    expect(day.celebrations[0].source).toBe("romcal");
  });

  it("identifies Easter Sunday as a Solemnity", () => {
    const day = getLiturgicalDayNovusOrdo(new Date(Date.UTC(2024, 2, 31)));
    expect(day.celebrations[0].name).toMatch(/Easter/);
    expect(day.celebrations[0].isSolemnity).toBe(true);
  });

  it("returns a celebration for every day of a full (leap) year", () => {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(Date.UTC(2024, month + 1, 0)).getUTCDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const result = getLiturgicalDayNovusOrdo(new Date(Date.UTC(2024, month, day)));
        expect(result.celebrations.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("getNextSolemnity", () => {
  it("finds the next Solemnity within the same year", () => {
    const result = getNextSolemnity(new Date(Date.UTC(2025, 11, 1)));
    expect(toISODate(result)).toBe("2025-12-08");
  });

  it("rolls over into next year's Mary, Mother of God after Christmas has passed", () => {
    const result = getNextSolemnity(new Date(Date.UTC(2025, 11, 26)));
    expect(toISODate(result)).toBe("2026-01-01");
  });
});
