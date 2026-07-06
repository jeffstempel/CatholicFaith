import { describe, expect, it } from "vitest";
import { getLiturgicalDayNovusOrdo, getNextSolemnity, getTodaySummaryNovusOrdo } from "./novusOrdo";
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

describe("getTodaySummaryNovusOrdo", () => {
  it("reports the underlying ferial day, not the saint, on an Optional Memorial", () => {
    // 2026-07-06 is Saint Maria Goretti (Optional Memorial), which shouldn't
    // override the day's own Ordinary Time designation.
    const result = getTodaySummaryNovusOrdo(new Date(Date.UTC(2026, 6, 6)));
    expect(result.name).toBe("Monday of the 14th week of Ordinary Time");
    expect(result.color).toBe("Green");
  });

  it("reports a plain feria's own name directly", () => {
    const result = getTodaySummaryNovusOrdo(new Date(Date.UTC(2026, 6, 7)));
    expect(result.name).toBe("Tuesday of the 14th week of Ordinary Time");
    expect(result.color).toBe("Green");
  });

  it("reports a Solemnity's own name, not a generic season placeholder", () => {
    const result = getTodaySummaryNovusOrdo(new Date(Date.UTC(2026, 11, 25)));
    expect(result.name).toMatch(/Christmas/);
    expect(result.color).toBe("White");
  });

  it("reports a Feast's own name, not deferred to the season skeleton", () => {
    const result = getTodaySummaryNovusOrdo(new Date(Date.UTC(2026, 11, 28)));
    expect(result.name).toMatch(/Holy Innocents/);
    expect(result.color).toBe("Red");
  });

  it("reports a Sunday's own ordinal name", () => {
    const result = getTodaySummaryNovusOrdo(new Date(Date.UTC(2026, 0, 18)));
    expect(result.name).toMatch(/Sunday of Ordinary Time/);
    expect(result.color).toBe("Green");
  });

  it("covers every day of a full year with no gaps", () => {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(Date.UTC(2026, month + 1, 0)).getUTCDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const result = getTodaySummaryNovusOrdo(new Date(Date.UTC(2026, month, day)));
        expect(result.name).toBeTruthy();
        expect(result.color).toBeTruthy();
      }
    }
  });
});
