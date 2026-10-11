import { describe, expect, it } from "vitest";
import { getHolyDayOfObligationUS, getNextHolyDayOfObligationUS } from "./holyDaysOfObligation";

const on = (y: number, m: number, d: number) => getHolyDayOfObligationUS(new Date(Date.UTC(y, m - 1, d)));

describe("getHolyDayOfObligationUS", () => {
  it("every Sunday is a day of obligation", () => {
    expect(on(2026, 10, 11)).toMatchObject({ status: "obligatory", isSunday: true, feast: null });
  });

  it("an ordinary weekday is not", () => {
    expect(on(2026, 10, 13)).toMatchObject({ status: "none", feast: null });
  });

  it("binds on Jan 1, Aug 15 and Nov 1 midweek, except in Honolulu", () => {
    expect(on(2026, 1, 1)).toMatchObject({ status: "obligatory", feast: "Mary, Mother of God", notObligatoryInHonolulu: true }); // Thursday
    expect(on(2025, 8, 15)).toMatchObject({ status: "obligatory", notObligatoryInHonolulu: true }); // Friday
  });

  it("lifts Jan 1, Aug 15 and Nov 1 when they fall on a Saturday or Monday", () => {
    expect(on(2026, 8, 15)).toMatchObject({ status: "abrogated", abrogatedOn: "Saturday", feast: "Assumption of the Blessed Virgin Mary" });
    expect(on(2025, 11, 1)).toMatchObject({ status: "abrogated", abrogatedOn: "Saturday", feast: "All Saints" });
    expect(on(2024, 1, 1)).toMatchObject({ status: "abrogated", abrogatedOn: "Monday", feast: "Mary, Mother of God" });
  });

  it("treats one of those on a Sunday as an ordinary Sunday obligation", () => {
    expect(on(2026, 11, 1)).toMatchObject({ status: "obligatory", isSunday: true, feast: "All Saints", notObligatoryInHonolulu: false });
  });

  it("never lifts Dec 8 or Christmas, and Honolulu keeps both", () => {
    expect(on(2029, 12, 8)).toMatchObject({ status: "obligatory", feast: "Immaculate Conception of the Blessed Virgin Mary", notObligatoryInHonolulu: false }); // Saturday
    expect(on(2025, 12, 8)).toMatchObject({ status: "obligatory", notObligatoryInHonolulu: false }); // Monday
    expect(on(2027, 12, 25)).toMatchObject({ status: "obligatory", feast: "Christmas", notObligatoryInHonolulu: false }); // Saturday
  });

  it("moves the Immaculate Conception and its obligation to Monday when Dec 8 is a Sunday (2024)", () => {
    expect(on(2024, 12, 8)).toMatchObject({ status: "obligatory", isSunday: true, transfer: "toMonday" });
    expect(on(2024, 12, 9)).toMatchObject({ status: "obligatory", transfer: "fromSunday", feast: "Immaculate Conception of the Blessed Virgin Mary" });
    expect(on(2025, 12, 9)).toMatchObject({ status: "none" }); // Tuesday after a Monday Dec 8
  });

  it("binds Ascension Thursday only in some provinces, and marks the Sunday most dioceses keep", () => {
    expect(on(2026, 5, 14)).toMatchObject({ status: "provincesOnly", feast: "Ascension of the Lord" });
    expect(on(2026, 5, 17)).toMatchObject({ status: "obligatory", isSunday: true, transfer: "fromThursday" });
  });

  it("has none of the four 1917-only holy days", () => {
    for (const [m, d] of [[1, 6], [3, 19], [6, 4], [6, 29]]) {
      expect(on(2026, m, d)).toMatchObject({ status: "none", feast: null });
    }
  });
});

describe("getNextHolyDayOfObligationUS", () => {
  const next = (y: number, m: number, d: number) => getNextHolyDayOfObligationUS(new Date(Date.UTC(y, m - 1, d)));
  const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

  it("finds the next holy day strictly after the given date, skipping ordinary Sundays", () => {
    expect(next(2026, 11, 1)).toEqual({ date: utc(2026, 12, 8), feast: "Immaculate Conception of the Blessed Virgin Mary", ascensionTransferred: false });
    expect(next(2026, 12, 25)).toEqual({ date: utc(2027, 1, 1), feast: "Mary, Mother of God", ascensionTransferred: false });
  });

  it("skips a holy day lifted that year", () => {
    expect(next(2026, 8, 1).date).toEqual(utc(2026, 11, 1)); // Aug 15, 2026 is a Saturday
  });

  it("skips Dec 8 on a Sunday in favor of Monday", () => {
    expect(next(2024, 12, 1).date).toEqual(utc(2024, 12, 9));
  });

  it("gives the Ascension Sunday rather than Thursday", () => {
    expect(next(2026, 5, 1)).toEqual({ date: utc(2026, 5, 17), feast: "Ascension of the Lord", ascensionTransferred: true });
  });
});
