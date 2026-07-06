import { describe, expect, it } from "vitest";
import { getTemporale } from "./temporale";
import { toISODate } from "../dateUtils";

function byName(year: number, nameFragment: string): string {
  const match = getTemporale(year).find((d) => d.celebration.name.includes(nameFragment));
  if (!match) throw new Error(`No temporale entry matching "${nameFragment}" in ${year}`);
  return toISODate(match.date);
}

describe("getTemporale (1962)", () => {
  it("matches known 2023 movable solemnity dates", () => {
    expect(byName(2023, "Easter")).toBe("2023-04-09");
    expect(byName(2023, "Ascension")).toBe("2023-05-18");
    expect(byName(2023, "Pentecost")).toBe("2023-05-28");
    expect(byName(2023, "Trinity")).toBe("2023-06-04");
    expect(byName(2023, "Corpus Christi")).toBe("2023-06-08");
    expect(byName(2023, "Sacred Heart")).toBe("2023-06-16");
    expect(byName(2023, "Christ the King")).toBe("2023-10-29");
  });

  it("matches known 2024 movable solemnity dates", () => {
    expect(byName(2024, "Easter")).toBe("2024-03-31");
    expect(byName(2024, "Ascension")).toBe("2024-05-09");
    expect(byName(2024, "Pentecost")).toBe("2024-05-19");
    expect(byName(2024, "Trinity")).toBe("2024-05-26");
    expect(byName(2024, "Corpus Christi")).toBe("2024-05-30");
    expect(byName(2024, "Sacred Heart")).toBe("2024-06-07");
    expect(byName(2024, "Christ the King")).toBe("2024-10-27");
  });

  it("all entries fall on the expected day of the week", () => {
    for (const year of [1962, 2000, 2023, 2024, 2025]) {
      for (const { date, celebration } of getTemporale(year)) {
        const dow = date.getUTCDay();
        if (celebration.name.includes("Ascension") || celebration.name.includes("Corpus Christi")) {
          expect(dow).toBe(4); // Thursday
        } else if (celebration.name.includes("Sacred Heart")) {
          expect(dow).toBe(5); // Friday
        } else {
          expect(dow).toBe(0); // Sunday
        }
      }
    }
  });

  it("returns 7 entries every year, all marked as curated solemnities", () => {
    for (const year of [1962, 2024]) {
      const entries = getTemporale(year);
      expect(entries).toHaveLength(7);
      for (const { celebration } of entries) {
        expect(celebration.isSolemnity).toBe(true);
        expect(celebration.source).toBe("curated");
      }
    }
  });
});
