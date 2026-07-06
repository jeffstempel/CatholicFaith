import { describe, expect, it } from "vitest";
import { findEmberDay, getEmberDays, getNextEmberDay } from "./emberDays";
import { toISODate } from "../dateUtils";

describe("getEmberDays", () => {
  it("returns exactly 12 Ember Days per year", () => {
    expect(getEmberDays(2024)).toHaveLength(12);
  });

  it("every Ember Day falls on Wednesday, Friday, or Saturday", () => {
    for (const year of [1962, 2000, 2023, 2024, 2025]) {
      for (const { date } of getEmberDays(year)) {
        expect([3, 5, 6]).toContain(date.getUTCDay());
      }
    }
  });

  it("matches known 2023 Advent Embertide dates (Dec 20, 22, 23)", () => {
    const dates = getEmberDays(2023).map((d) => toISODate(d.date));
    expect(dates).toEqual(
      expect.arrayContaining(["2023-12-20", "2023-12-22", "2023-12-23"]),
    );
  });

  it("matches known 2024 Advent Embertide dates (Dec 18, 20, 21)", () => {
    const dates = getEmberDays(2024).map((d) => toISODate(d.date));
    expect(dates).toEqual(
      expect.arrayContaining(["2024-12-18", "2024-12-20", "2024-12-21"]),
    );
  });

  it("matches known 2023 Michaelmas Embertide dates (Sept 20, 22, 23)", () => {
    const dates = getEmberDays(2023).map((d) => toISODate(d.date));
    expect(dates).toEqual(
      expect.arrayContaining(["2023-09-20", "2023-09-22", "2023-09-23"]),
    );
  });

  it("matches known 2023 Lenten Embertide dates (Mar 1, 3, 4)", () => {
    const dates = getEmberDays(2023).map((d) => toISODate(d.date));
    expect(dates).toEqual(
      expect.arrayContaining(["2023-03-01", "2023-03-03", "2023-03-04"]),
    );
  });

  it("matches known 2023 Whitsun Embertide dates (May 31, Jun 2, Jun 3)", () => {
    const dates = getEmberDays(2023).map((d) => toISODate(d.date));
    expect(dates).toEqual(
      expect.arrayContaining(["2023-05-31", "2023-06-02", "2023-06-03"]),
    );
  });

  it("Advent Embertide always falls strictly after Dec 13", () => {
    for (const year of [1962, 2020, 2021, 2022, 2023, 2024, 2025]) {
      const adventDays = getEmberDays(year).filter((d) => d.celebration.name.includes("Advent"));
      for (const { date } of adventDays) {
        expect(date.getTime()).toBeGreaterThan(Date.UTC(year, 11, 13));
      }
    }
  });

  it("matches known 2026 Michaelmas Embertide dates (Sept 23, 25, 26)", () => {
    // Regression test: Sept 14, 2026 is a Monday, so the "Wednesday after Sept 14"
    // mnemonic would wrongly land on Sept 16. The real rubric (Wednesday after the
    // third Sunday of September) gives Sept 23 instead.
    const dates = getEmberDays(2026).map((d) => toISODate(d.date));
    expect(dates).toEqual(
      expect.arrayContaining(["2026-09-23", "2026-09-25", "2026-09-26"]),
    );
  });

  it("Michaelmas Embertide always falls strictly after Sept 14", () => {
    for (const year of [1962, 2020, 2021, 2022, 2023, 2024, 2025]) {
      const michaelmasDays = getEmberDays(year).filter((d) => d.celebration.name.includes("Michaelmas"));
      for (const { date } of michaelmasDays) {
        expect(date.getTime()).toBeGreaterThan(Date.UTC(year, 8, 14));
      }
    }
  });
});

describe("findEmberDay", () => {
  it("identifies a known Ember Day", () => {
    const result = findEmberDay(new Date(Date.UTC(2023, 11, 20)));
    expect(result?.name).toBe("Ember Wednesday of Advent");
    expect(result?.isEmberDay).toBe(true);
  });

  it("returns null for a non-Ember Day", () => {
    expect(findEmberDay(new Date(Date.UTC(2023, 11, 21)))).toBeNull();
  });
});

describe("getNextEmberDay", () => {
  it("finds the next Embertide within the same year", () => {
    const result = getNextEmberDay(new Date(Date.UTC(2023, 0, 1)));
    expect(toISODate(result)).toBe("2023-03-01");
  });

  it("advances to the next Ember Day within the same triduum", () => {
    const result = getNextEmberDay(new Date(Date.UTC(2023, 2, 1)));
    expect(toISODate(result)).toBe("2023-03-03");
  });

  it("rolls over into next year's Lenten Embertide after Advent Embertide has passed", () => {
    const result = getNextEmberDay(new Date(Date.UTC(2023, 11, 23)));
    expect(toISODate(result)).toBe("2024-02-21");
  });

  it("finds Michaelmas Embertide 2026 as Sept 23, not the Sept-14 mnemonic's Sept 16", () => {
    const result = getNextEmberDay(new Date(Date.UTC(2026, 6, 6)));
    expect(toISODate(result)).toBe("2026-09-23");
  });
});
