import { describe, expect, it } from "vitest";
import { gregorianEaster } from "./computus";
import { toISODate } from "./dateUtils";

describe("gregorianEaster", () => {
  const knownEasterDates: Record<number, string> = {
    1962: "1962-04-22",
    2000: "2000-04-23",
    2018: "2018-04-01",
    2021: "2021-04-04",
    2022: "2022-04-17",
    2023: "2023-04-09",
    2024: "2024-03-31",
    2025: "2025-04-20",
    2026: "2026-04-05",
  };

  for (const [year, expected] of Object.entries(knownEasterDates)) {
    it(`computes Easter ${expected} for ${year}`, () => {
      expect(toISODate(gregorianEaster(Number(year)))).toBe(expected);
    });
  }

  it("always falls on a Sunday", () => {
    for (let year = 1950; year <= 2050; year++) {
      expect(gregorianEaster(year).getUTCDay()).toBe(0);
    }
  });

  it("always falls between March 22 and April 25 inclusive", () => {
    for (let year = 1950; year <= 2050; year++) {
      const easter = gregorianEaster(year);
      const month = easter.getUTCMonth() + 1;
      const day = easter.getUTCDate();
      const isInRange = (month === 3 && day >= 22) || (month === 4 && day <= 25);
      expect(isInRange).toBe(true);
    }
  });
});
