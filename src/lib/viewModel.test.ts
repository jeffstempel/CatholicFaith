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

  it("produces the today-summary, ember day, fasting, holy day, solemnity/feast, and saint sections in order", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table, todaySummaryTable1962);
    expect(vm.sections.map((s) => s.title)).toEqual([
      "What Is Today in the Church Calendar?",
      "Is Today an Ember Day?",
      "Is Today a Day of Fasting or Abstinence?",
      "Is Today a Holy Day of Obligation?",
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
    const feastSection = vm.sections[4];
    expect(feastSection.left.footnote).toMatch(/Next Feast Day: Assumption of the Blessed Virgin Mary/);
    expect(feastSection.right.footnote).toMatch(/Next Solemnity: The Assumption of the Blessed Virgin Mary/);
  });

  it("keeps the Ascension on Thursday with a note that most US dioceses celebrate it Sunday", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 4, 14)), table, todaySummaryTable1962); // Thu, May 14
    const feastSection = vm.sections[4];
    expect(feastSection.right.description).toBe("Ascension of the Lord");
    expect(feastSection.note).toBe(
      "In most US dioceses, the Ascension is celebrated on Sunday, May 17, 2026. It stays on Thursday in the provinces of Boston, Hartford, New York, Omaha and Philadelphia.",
    );
  });

  it("notes on the following Sunday that most US dioceses celebrate Ascension Thursday today", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 4, 17)), table, todaySummaryTable1962); // Sun, May 17
    expect(vm.sections[4].note).toBe(
      "In most US dioceses, Ascension Thursday (May 14, 2026) is celebrated today. The provinces of Boston, Hartford, New York, Omaha and Philadelphia keep it on Thursday.",
    );
  });

  it("has no Ascension note on other days", () => {
    for (const day of [13, 15, 16, 18]) {
      const vm = buildViewModel(new Date(Date.UTC(2026, 4, day)), table, todaySummaryTable1962);
      expect(vm.sections[4].note).toBeUndefined();
    }
  });

  describe("holy day of obligation section", () => {
    const obligationOn = (y: number, m: number, d: number) =>
      buildViewModel(new Date(Date.UTC(y, m - 1, d)), table, todaySummaryTable1962).sections[3];

    it("labels the columns by code and always notes that current law binds everyone", () => {
      const section = obligationOn(2026, 10, 13);
      expect(section.left.label).toBe("1917 Code (historical)");
      expect(section.right.label).toBe("Current Law (US)");
      expect(section.note).toMatch(/current Code of Canon Law \(1983\) binds all Catholics/);
      expect(section.left).toMatchObject({ value: "No", tone: "no", highlighted: false });
      expect(section.right).toMatchObject({ value: "No", tone: "no", highlighted: false });
    });

    it("says yes on both sides for an ordinary Sunday", () => {
      const section = obligationOn(2026, 10, 11);
      expect(section.left).toMatchObject({ value: "Yes!", description: "Every Sunday is a day of obligation.", highlighted: true });
      expect(section.right).toMatchObject({ value: "Yes!", description: "Every Sunday is a day of obligation.", highlighted: true });
    });

    it("shows the Saturday exemption for the Assumption on Saturday, August 15, 2026", () => {
      const section = obligationOn(2026, 8, 15);
      expect(section.left).toMatchObject({ value: "Yes!", description: "Assumption of the Blessed Virgin Mary" });
      expect(section.left.footnote).toBeUndefined();
      expect(section.right).toMatchObject({
        value: "No",
        description: "Assumption of the Blessed Virgin Mary falls on a Saturday this year, so the obligation is lifted.",
      });
    });

    it("footnotes a 1917 holy day the US didn't keep", () => {
      const section = obligationOn(2026, 1, 6);
      expect(section.left).toMatchObject({ value: "Yes!", description: "Epiphany of Our Lord" });
      expect(section.left.footnote).toBe("In the US, this was not kept as a holy day under the 1917 Code.");
      expect(section.right.value).toBe("No");
    });

    it("notes Honolulu on a mainland-only holy day", () => {
      const section = obligationOn(2026, 1, 1);
      expect(section.right).toMatchObject({ value: "Yes!", description: "Mary, Mother of God" });
      expect(section.right.footnote).toMatch(/Diocese of Honolulu/);
    });

    it("names the provinces on Ascension Thursday and the Sunday it moves to", () => {
      const section = obligationOn(2026, 5, 14);
      expect(section.left).toMatchObject({ value: "Yes!", description: "Ascension of the Lord" });
      expect(section.right.value).toBe("Only in Some Provinces");
      expect(section.right.description).toBe(
        "Ascension of the Lord: a holy day only in the provinces of Boston, Hartford, New York, Omaha and Philadelphia. Elsewhere it moves to Sunday, May 17, 2026.",
      );
      expect(obligationOn(2026, 5, 17).right.description).toBe("Sunday, and in most US dioceses also the Ascension of the Lord");
    });

    it("moves the Immaculate Conception's obligation to Monday when Dec 8 is a Sunday", () => {
      expect(obligationOn(2024, 12, 8).right.description).toBe(
        "Sunday. The Immaculate Conception of the Blessed Virgin Mary moves to Monday this year, and is also a day of obligation.",
      );
      expect(obligationOn(2024, 12, 9).right).toMatchObject({
        value: "Yes!",
        description: "Immaculate Conception of the Blessed Virgin Mary, moved from Sunday",
      });
    });
  });

  it("shows the saint of the day on both calendars", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table, todaySummaryTable1962);
    const saintSection = vm.sections[5];
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
    const saintSection = vm.sections[5];
    expect(saintSection.left.value).toBe("St. Nicholas");
    expect(saintSection.left.footnote).toBe("Patron of: Children and sailors");
    expect(saintSection.right.value).toMatch(/Nicholas/);
    expect(saintSection.right.footnote).toBe("Patron of: Children and sailors");
  });

  it("omits the patron-of footnote for the ambiguous 1962 St. Boniface but shows it for Novus Ordo", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 5, 5)), table, todaySummaryTable1962); // June 5
    const saintSection = vm.sections[5];
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
