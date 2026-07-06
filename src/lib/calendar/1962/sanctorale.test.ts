import { describe, expect, it } from "vitest";
import { findSanctoraleCelebration, sanctorale } from "./sanctorale";

describe("sanctorale data integrity", () => {
  it("every entry has a valid MM-DD format", () => {
    for (const { monthDay } of sanctorale) {
      expect(monthDay).toMatch(/^\d{2}-\d{2}$/);
    }
  });

  it("every entry is a real calendar date (non-leap year safe)", () => {
    for (const { monthDay } of sanctorale) {
      const [month, day] = monthDay.split("-").map(Number);
      const date = new Date(Date.UTC(2001, month - 1, day));
      expect(date.getUTCMonth()).toBe(month - 1);
      expect(date.getUTCDate()).toBe(day);
    }
  });

  it("has no duplicate dates", () => {
    const monthDays = sanctorale.map((s) => s.monthDay);
    expect(new Set(monthDays).size).toBe(monthDays.length);
  });

  it("every entry is marked as a curated solemnity", () => {
    for (const { celebration } of sanctorale) {
      expect(celebration.isSolemnity).toBe(true);
      expect(celebration.source).toBe("curated");
    }
  });
});

describe("findSanctoraleCelebration", () => {
  it("finds Christmas on Dec 25", () => {
    expect(findSanctoraleCelebration("12-25")?.name).toMatch(/Nativity/);
  });

  it("returns null for a date with no fixed solemnity", () => {
    expect(findSanctoraleCelebration("02-14")).toBeNull();
  });
});
