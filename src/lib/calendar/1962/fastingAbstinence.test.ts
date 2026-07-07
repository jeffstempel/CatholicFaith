import { describe, expect, it } from "vitest";
import { getFastingAbstinence1962 } from "./fastingAbstinence";

describe("getFastingAbstinence1962", () => {
  it("Ash Wednesday: fast + full abstinence", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 1, 18)));
    expect(result).toEqual({ fast: true, abstinence: "full" });
  });

  it("an ordinary Friday outside Lent: full abstinence, no fast", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 6, 3)));
    expect(result).toEqual({ fast: false, abstinence: "full" });
  });

  it("Good Friday: fast + full abstinence (Lent fast + Friday abstinence)", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 3, 3)));
    expect(result).toEqual({ fast: true, abstinence: "full" });
  });

  it("Ember Wednesday of Lent: fast + partial abstinence", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 1, 25)));
    expect(result).toEqual({ fast: true, abstinence: "partial" });
  });

  it("Ember Friday of Lent: fast + full abstinence (Friday rule wins)", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 1, 27)));
    expect(result).toEqual({ fast: true, abstinence: "full" });
  });

  it("Ember Saturday of Lent: fast + partial abstinence", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 1, 28)));
    expect(result).toEqual({ fast: true, abstinence: "partial" });
  });

  it("Ember Wednesday of Michaelmas (outside Lent): fast + partial abstinence", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 8, 23)));
    expect(result).toEqual({ fast: true, abstinence: "partial" });
  });

  it("Ember Saturday of Michaelmas (outside Lent): fast + partial abstinence", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 8, 26)));
    expect(result).toEqual({ fast: true, abstinence: "partial" });
  });

  it("an ordinary Lenten Tuesday: fast only, no abstinence", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 1, 24)));
    expect(result).toEqual({ fast: true, abstinence: "none" });
  });

  it("a Sunday of Lent: no fast (Sundays are never fast days)", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 1, 22)));
    expect(result).toEqual({ fast: false, abstinence: "none" });
  });

  it("an ordinary Tuesday outside Lent: no obligation", () => {
    const result = getFastingAbstinence1962(new Date(Date.UTC(2026, 6, 7)));
    expect(result).toEqual({ fast: false, abstinence: "none" });
  });
});
