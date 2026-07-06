import { describe, expect, it } from "vitest";
import { getBothCalendars } from "./lookup";

describe("getBothCalendars", () => {
  it("returns both calendars for a known solemnity date without throwing", () => {
    const { traditional, novusOrdo } = getBothCalendars(new Date(Date.UTC(2024, 11, 25)));
    expect(traditional.date).toBe("2024-12-25");
    expect(novusOrdo.date).toBe("2024-12-25");
    expect(traditional.celebrations[0].name).toMatch(/Nativity/);
    expect(novusOrdo.celebrations[0].name).toMatch(/Christmas/);
  });

  it("never throws and always returns both calendars across a full year", () => {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(Date.UTC(2024, month + 1, 0)).getUTCDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(2024, month, day));
        const result = getBothCalendars(date);
        expect(result.traditional).toBeDefined();
        expect(result.novusOrdo).toBeDefined();
        expect(result.novusOrdo.celebrations.length).toBeGreaterThan(0);
      }
    }
  });

  it("surfaces an Ember Day on the traditional side only", () => {
    const { traditional, novusOrdo } = getBothCalendars(new Date(Date.UTC(2023, 11, 20)));
    expect(traditional.celebrations.some((c) => c.isEmberDay)).toBe(true);
    expect(novusOrdo.celebrations.some((c) => c.isEmberDay)).toBe(false);
  });
});
