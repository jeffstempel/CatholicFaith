import { describe, expect, it } from "vitest";
import { getHolyDayOfObligation1917, getNextHolyDayOfObligation1917 } from "./holyDaysOfObligation";

const on = (y: number, m: number, d: number) => getHolyDayOfObligation1917(new Date(Date.UTC(y, m - 1, d)));

describe("getHolyDayOfObligation1917", () => {
  it("every Sunday is a day of obligation", () => {
    expect(on(2026, 10, 11)).toEqual({ isSunday: true, feast: null, notKeptInUS: false, stJosephFeastMoved: false });
  });

  it("an ordinary weekday is not", () => {
    expect(on(2026, 10, 13)).toEqual({ isSunday: false, feast: null, notKeptInUS: false, stJosephFeastMoved: false });
  });

  it("includes all ten universal holy days of canon 1247 §1", () => {
    // 2026: Easter is April 5, so Ascension is May 14 and Corpus Christi June 4.
    expect(on(2026, 12, 25).feast).toBe("The Nativity of Our Lord Jesus Christ");
    expect(on(2026, 1, 1).feast).toBe("Circumcision of Our Lord");
    expect(on(2026, 1, 6).feast).toBe("Epiphany of Our Lord");
    expect(on(2026, 5, 14).feast).toBe("Ascension of the Lord");
    expect(on(2026, 6, 4).feast).toBe("Corpus Christi");
    expect(on(2026, 12, 8).feast).toBe("Immaculate Conception of the Blessed Virgin Mary");
    expect(on(2026, 8, 15).feast).toBe("Assumption of the Blessed Virgin Mary");
    expect(on(2026, 3, 19).feast).toBe("Saint Joseph, Spouse of the Blessed Virgin Mary");
    expect(on(2026, 6, 29).feast).toBe("Saints Peter and Paul, Apostles");
    expect(on(2026, 11, 1).feast).toBe("All Saints");
  });

  it("keeps the Ascension on Thursday (no Sunday transfer before 1999)", () => {
    expect(on(2026, 5, 17).feast).toBeNull();
  });

  it("has no Saturday/Monday exemption: Saturday, August 15, 2026 still binds", () => {
    expect(on(2026, 8, 15).feast).toBe("Assumption of the Blessed Virgin Mary");
  });

  it("flags only the four days the US did not keep (Third Plenary Council of Baltimore)", () => {
    expect(on(2026, 1, 6).notKeptInUS).toBe(true);
    expect(on(2026, 6, 4).notKeptInUS).toBe(true);
    expect(on(2026, 3, 19).notKeptInUS).toBe(true);
    expect(on(2026, 6, 29).notKeptInUS).toBe(true);
    for (const [m, d] of [[1, 1], [5, 14], [8, 15], [11, 1], [12, 8], [12, 25]]) {
      expect(on(2026, m, d).notKeptInUS).toBe(false);
    }
  });

  it("flags St. Joseph on a Sunday (2028) or in Holy Week (2035), but not otherwise", () => {
    expect(on(2028, 3, 19)).toMatchObject({ isSunday: true, stJosephFeastMoved: true });
    expect(on(2035, 3, 19)).toMatchObject({ isSunday: false, stJosephFeastMoved: true });
    expect(on(2026, 3, 19).stJosephFeastMoved).toBe(false);
  });
});

describe("getNextHolyDayOfObligation1917", () => {
  const next = (y: number, m: number, d: number) => getNextHolyDayOfObligation1917(new Date(Date.UTC(y, m - 1, d)));

  it("finds the next holy day strictly after the given date, skipping ordinary Sundays", () => {
    expect(next(2026, 10, 10)).toEqual({ date: new Date(Date.UTC(2026, 10, 1)), feast: "All Saints" });
    expect(next(2026, 11, 1)).toEqual({ date: new Date(Date.UTC(2026, 11, 8)), feast: "Immaculate Conception of the Blessed Virgin Mary" });
  });

  it("crosses into the next year", () => {
    expect(next(2026, 12, 25)).toEqual({ date: new Date(Date.UTC(2027, 0, 1)), feast: "Circumcision of Our Lord" });
  });
});
