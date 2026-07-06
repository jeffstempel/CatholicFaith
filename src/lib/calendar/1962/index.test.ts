import { describe, expect, it } from "vitest";
import { getNextFeastDay } from "./index";
import { toISODate } from "../dateUtils";

describe("getNextFeastDay", () => {
  it("finds the next fixed Sanctorale Feast Day within the same year", () => {
    const result = getNextFeastDay(new Date(Date.UTC(2025, 0, 2)));
    expect(toISODate(result)).toBe("2025-01-06");
  });

  it("finds a movable Temporale Feast Day (Easter) when it's the nearest", () => {
    const result = getNextFeastDay(new Date(Date.UTC(2025, 2, 26)));
    expect(toISODate(result)).toBe("2025-04-20");
  });

  it("rolls over into next year's Circumcision after Christmas has passed", () => {
    const result = getNextFeastDay(new Date(Date.UTC(2025, 11, 26)));
    expect(toISODate(result)).toBe("2026-01-01");
  });
});
