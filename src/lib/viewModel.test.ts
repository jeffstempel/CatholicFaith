import { describe, expect, it, beforeAll } from "vitest";
import { buildViewModel } from "./viewModel";
import { buildNovusOrdoTable } from "./calendar/novusOrdo/table";
import type { NovusOrdoTable } from "./calendar/novusOrdo/lookup";
import type { TodaySummaryTable1962 } from "./calendar/1962/todaySummaryLookup";

const todaySummaryTable1962: TodaySummaryTable1962 = {
  "2026-07-06": { name: "Feria", color: "Green" },
  "2026-08-23": { name: "Ember Wednesday of Michaelmas", color: "Purple" },
  "2026-07-03": { name: "Feria", color: "Green" },
  "2026-02-18": { name: "Ash Wednesday", color: "Purple" },
};

describe("buildViewModel", () => {
  let table: NovusOrdoTable;

  beforeAll(() => {
    table = buildNovusOrdoTable(2025, 2026);
  });

  it("produces the today-summary, ember day, fasting, solemnity/feast, and saint sections in order", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table, todaySummaryTable1962);
    expect(vm.sections.map((s) => s.title)).toEqual([
      "What Is Today in the Church Calendar?",
      "Is Today an Ember Day?",
      "Is Today a Day of Fasting or Abstinence?",
      "Is Today a Solemnity or Feast Day?",
      "Saint of the Day",
    ]);
  });

  it("reports each calendar's own today-summary from its precomputed table", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table, todaySummaryTable1962);
    const todaySection = vm.sections[0];
    expect(todaySection.left.value).toBe("Feria");
    expect(todaySection.left.description).toBe("Liturgical Color: Green");
    expect(todaySection.right.value).toBe("Monday of the 14th week of Ordinary Time");
    expect(todaySection.right.description).toBe("Liturgical Color: Green");
  });

  it("shows Yes! and highlights the 1962 column on a real Ember Day", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 8, 23)), table, todaySummaryTable1962); // Ember Wednesday of Michaelmas 2026
    const emberSection = vm.sections[1];
    expect(emberSection.left.value).toBe("Yes!");
    expect(emberSection.left.tone).toBe("yes");
    expect(emberSection.left.highlighted).toBe(true);
    expect(emberSection.left.description).toMatch(/Ember Wednesday/);
  });

  it("carries a next-feast-day footnote naming the correct upcoming solemnity", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table, todaySummaryTable1962);
    const feastSection = vm.sections[3];
    expect(feastSection.left.footnote).toMatch(/Next Feast Day: Assumption of the Blessed Virgin Mary/);
    expect(feastSection.right.footnote).toMatch(/Next Solemnity: The Assumption of the Blessed Virgin Mary/);
  });

  it("keeps the Ascension on Thursday with a note that most US dioceses celebrate it Sunday", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 4, 14)), table, todaySummaryTable1962); // Thu, May 14
    const feastSection = vm.sections[3];
    expect(feastSection.right.description).toBe("Ascension of the Lord");
    expect(feastSection.note).toBe(
      "In most US dioceses, the Ascension is celebrated on Sunday, May 17, 2026. It stays on Thursday in the provinces of Boston, Hartford, New York, Newark, Omaha and Philadelphia.",
    );
  });

  it("notes on the following Sunday that most US dioceses celebrate Ascension Thursday today", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 4, 17)), table, todaySummaryTable1962); // Sun, May 17
    expect(vm.sections[3].note).toBe(
      "In most US dioceses, Ascension Thursday (May 14, 2026) is celebrated today. The provinces of Boston, Hartford, New York, Newark, Omaha and Philadelphia keep it on Thursday.",
    );
  });

  it("has no Ascension note on other days", () => {
    for (const day of [13, 15, 16, 18]) {
      const vm = buildViewModel(new Date(Date.UTC(2026, 4, day)), table, todaySummaryTable1962);
      expect(vm.sections[3].note).toBeUndefined();
    }
  });

  it("shows the saint of the day on both calendars", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table, todaySummaryTable1962);
    const saintSection = vm.sections[4];
    expect(saintSection.left.value).toBe("St. Maria Goretti");
    expect(saintSection.right.value).toMatch(/Maria Goretti/);
  });

  it("shows a Friday's full abstinence status on both calendars", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 3)), table, todaySummaryTable1962); // Friday
    const fastingSection = vm.sections[2];
    expect(fastingSection.left.value).toBe("Full Abstinence");
    expect(fastingSection.right.value).toBe("Abstinence Recommended");
  });

  it("shows Ash Wednesday's fast + full abstinence status on both calendars", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 1, 18)), table, todaySummaryTable1962); // Ash Wednesday 2026
    const fastingSection = vm.sections[2];
    expect(fastingSection.left.value).toBe("Fast + Full Abstinence");
    expect(fastingSection.left.highlighted).toBe(true);
    expect(fastingSection.right.value).toBe("Fast + Full Abstinence");
    expect(fastingSection.right.highlighted).toBe(true);
  });

  it("shows Ember Wednesday's 1962 partial abstinence vs. Novus Ordo's no obligation", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 8, 23)), table, todaySummaryTable1962); // Ember Wednesday of Michaelmas 2026
    const fastingSection = vm.sections[2];
    expect(fastingSection.left.value).toBe("Fast + Partial Abstinence");
    expect(fastingSection.right.value).toBe("No Obligation");
  });

  it("carries each calendar's own fasting/abstinence rules as a per-column footnote", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table, todaySummaryTable1962);
    const fastingSection = vm.sections[2];
    expect(fastingSection.left.footnote).toMatch(/Lenten weekdays and Ember Days/);
    expect(fastingSection.right.footnote).toMatch(/Ash Wednesday and Good Friday/);
    expect(fastingSection.note).toBeUndefined();
  });

  it("matches the ISO date and a human-readable date label", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table, todaySummaryTable1962);
    expect(vm.isoDate).toBe("2026-07-06");
    expect(vm.dateLabel).toBe("Monday, July 6, 2026");
  });

  it("shows a patron-of footnote on both calendars for a curated saint", () => {
    const vm = buildViewModel(new Date(Date.UTC(2025, 11, 6)), table, todaySummaryTable1962); // St. Nicholas (Sat, not overridden by a Sunday)
    const saintSection = vm.sections[4];
    expect(saintSection.left.value).toBe("St. Nicholas");
    expect(saintSection.left.footnote).toBe("Patron of: Children and sailors");
    expect(saintSection.right.value).toMatch(/Nicholas/);
    expect(saintSection.right.footnote).toBe("Patron of: Children and sailors");
  });

  it("omits the patron-of footnote for the ambiguous 1962 St. Boniface but shows it for Novus Ordo", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 5, 5)), table, todaySummaryTable1962); // June 5
    const saintSection = vm.sections[4];
    expect(saintSection.left.value).toBe("St. Boniface");
    expect(saintSection.left.footnote).toBeUndefined();
    expect(saintSection.right.footnote).toBe("Patron of: Germany");
  });

  it("degrades gracefully for a date outside either supplied table's range", () => {
    const vm = buildViewModel(new Date(Date.UTC(2050, 0, 1)), table, todaySummaryTable1962);
    const todaySection = vm.sections[0];
    expect(todaySection.left.value).toBe("Unknown");
    expect(todaySection.right.value).toBe("Unknown");
  });
});
