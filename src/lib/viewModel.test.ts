import { describe, expect, it, beforeAll } from "vitest";
import { buildViewModel } from "./viewModel";
import { buildNovusOrdoTable } from "./calendar/novusOrdoTable";
import type { NovusOrdoTable } from "./calendar/novusOrdoLookup";

describe("buildViewModel", () => {
  let table: NovusOrdoTable;

  beforeAll(() => {
    table = buildNovusOrdoTable(2026, 2026);
  });

  it("produces the today-summary, ember day, solemnity/feast, and saint sections in order", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table);
    expect(vm.sections.map((s) => s.title)).toEqual([
      "What Is Today in the Church Calendar?",
      "Is Today an Ember Day?",
      "Is Today a Solemnity or Feast Day?",
      "Saint of the Day",
    ]);
  });

  it("reports the Novus Ordo ferial designation on an Optional Memorial day", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table);
    const todaySection = vm.sections[0];
    expect(todaySection.right.value).toBe("Monday of the 14th week of Ordinary Time");
    expect(todaySection.right.description).toBe("Liturgical Color: Green");
    expect(todaySection.left.value).toBe("Coming Soon");
  });

  it("shows Yes! and highlights the 1962 column on a real Ember Day", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 8, 23)), table); // Ember Wednesday of Michaelmas 2026
    const emberSection = vm.sections[1];
    expect(emberSection.left.value).toBe("Yes!");
    expect(emberSection.left.tone).toBe("yes");
    expect(emberSection.left.highlighted).toBe(true);
    expect(emberSection.left.description).toMatch(/Ember Wednesday/);
  });

  it("carries a next-feast-day footnote naming the correct upcoming solemnity", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table);
    const feastSection = vm.sections[2];
    expect(feastSection.left.footnote).toMatch(/Next Feast Day: Assumption of the Blessed Virgin Mary/);
    expect(feastSection.right.footnote).toMatch(/Next Solemnity: The Assumption of the Blessed Virgin Mary/);
  });

  it("shows the saint of the day on both calendars", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table);
    const saintSection = vm.sections[3];
    expect(saintSection.left.value).toBe("St. Maria Goretti");
    expect(saintSection.right.value).toMatch(/Maria Goretti/);
  });

  it("matches the ISO date and a human-readable date label", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table);
    expect(vm.isoDate).toBe("2026-07-06");
    expect(vm.dateLabel).toBe("Monday, July 6, 2026");
  });

  it("degrades gracefully for a date outside the supplied table's range", () => {
    const vm = buildViewModel(new Date(Date.UTC(2050, 0, 1)), table);
    const todaySection = vm.sections[0];
    expect(todaySection.right.value).toBe("Unknown");
  });
});
