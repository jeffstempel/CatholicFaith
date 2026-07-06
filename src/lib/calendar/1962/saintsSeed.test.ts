import { describe, expect, it } from "vitest";
import { findSaintOfTheDay1962, saintsSeed } from "./saintsSeed";
import { sanctorale } from "./sanctorale";

describe("saintsSeed data integrity", () => {
  it("every entry has a valid MM-DD format", () => {
    for (const { monthDay } of saintsSeed) {
      expect(monthDay).toMatch(/^\d{2}-\d{2}$/);
    }
  });

  it("every entry is a real calendar date (non-leap year safe)", () => {
    for (const { monthDay } of saintsSeed) {
      const [month, day] = monthDay.split("-").map(Number);
      const date = new Date(Date.UTC(2001, month - 1, day));
      expect(date.getUTCMonth()).toBe(month - 1);
      expect(date.getUTCDate()).toBe(day);
    }
  });

  it("has no duplicate dates", () => {
    const monthDays = saintsSeed.map((s) => s.monthDay);
    expect(new Set(monthDays).size).toBe(monthDays.length);
  });

  it("does not collide with a fixed Sanctorale solemnity date", () => {
    const solemnityDates = new Set(sanctorale.map((s) => s.monthDay));
    for (const { monthDay } of saintsSeed) {
      expect(solemnityDates.has(monthDay)).toBe(false);
    }
  });

  it("every entry is a curated feast, not a solemnity", () => {
    for (const { celebration } of saintsSeed) {
      expect(celebration.isSolemnity).toBe(false);
      expect(celebration.source).toBe("curated");
    }
  });
});

describe("findSaintOfTheDay1962", () => {
  it("finds Saint Patrick on March 17", () => {
    expect(findSaintOfTheDay1962("03-17")?.name).toMatch(/Patrick/);
  });

  it("returns null for a date with no seeded saint", () => {
    expect(findSaintOfTheDay1962("02-14")).toBeNull();
  });
});
