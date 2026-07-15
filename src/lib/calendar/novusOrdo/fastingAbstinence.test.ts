import { describe, expect, it } from "vitest";
import { getFastingAbstinenceNovusOrdo } from "./fastingAbstinence";

describe("getFastingAbstinenceNovusOrdo", () => {
  it("Ash Wednesday: fast + full abstinence", () => {
    const result = getFastingAbstinenceNovusOrdo(new Date(Date.UTC(2026, 1, 18)));
    expect(result).toEqual({ fast: true, abstinence: "full" });
  });

  it("Good Friday: fast + full abstinence", () => {
    const result = getFastingAbstinenceNovusOrdo(new Date(Date.UTC(2026, 3, 3)));
    expect(result).toEqual({ fast: true, abstinence: "full" });
  });

  it("a Friday of Lent (not Ash Wed/Good Friday): full abstinence, no fast", () => {
    const result = getFastingAbstinenceNovusOrdo(new Date(Date.UTC(2026, 1, 27)));
    expect(result).toEqual({ fast: false, abstinence: "full" });
  });

  it("a Friday outside Lent: abstinence recommended, not obligatory", () => {
    const result = getFastingAbstinenceNovusOrdo(new Date(Date.UTC(2026, 6, 3)));
    expect(result).toEqual({ fast: false, abstinence: "recommended" });
  });

  it("an ordinary Lenten Tuesday: no obligation (unlike the 1962 calendar)", () => {
    const result = getFastingAbstinenceNovusOrdo(new Date(Date.UTC(2026, 1, 24)));
    expect(result).toEqual({ fast: false, abstinence: "none" });
  });

  it("an Ember Saturday: no obligation (Ember Days aren't observed)", () => {
    const result = getFastingAbstinenceNovusOrdo(new Date(Date.UTC(2026, 8, 26)));
    expect(result).toEqual({ fast: false, abstinence: "none" });
  });

  it("an ordinary Tuesday: no obligation", () => {
    const result = getFastingAbstinenceNovusOrdo(new Date(Date.UTC(2026, 6, 7)));
    expect(result).toEqual({ fast: false, abstinence: "none" });
  });
});
