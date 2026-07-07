import { describe, expect, it, beforeAll } from "vitest";
import { renderSections } from "./render";
import { buildViewModel } from "./viewModel";
import { buildNovusOrdoTable } from "./calendar/novusOrdoTable";
import type { NovusOrdoTable } from "./calendar/novusOrdoLookup";
import type { PageViewModel } from "./viewModel";

describe("renderSections", () => {
  let table: NovusOrdoTable;

  beforeAll(() => {
    table = buildNovusOrdoTable(2026, 2026);
  });

  it("renders every section with its title, columns, and values", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table);
    const html = renderSections(vm);
    expect(html).toContain("What Is Today in the Church Calendar?");
    expect(html).toContain("Is Today an Ember Day?");
    expect(html).toContain("Is Today a Day of Fasting or Abstinence?");
    expect(html).toContain("Is Today a Solemnity or Feast Day?");
    expect(html).toContain("Saint of the Day");
    expect(html).toContain("St. Maria Goretti");
    expect((html.match(/calendar-column/g) ?? []).length).toBe(10); // 5 sections x 2 columns
  });

  it("applies tone and highlighted classes correctly", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 8, 23)), table); // a real Ember Day
    const html = renderSections(vm);
    expect(html).toContain('calendar-column is-highlighted');
    expect(html).toContain('column-value is-yes');
  });

  it("renders a note and footnote where present", () => {
    const vm = buildViewModel(new Date(Date.UTC(2026, 6, 6)), table);
    const html = renderSections(vm);
    expect(html).toContain('class="section-note"');
    expect(html).toMatch(/class="column-footnote">Next Feast Day:/);
  });

  it("HTML-escapes dynamic text so ampersands don't break markup", () => {
    const vm: PageViewModel = {
      isoDate: "2026-01-20",
      dateLabel: "Tuesday, January 20, 2026",
      sections: [
        {
          title: "Test & Section",
          left: { label: "1962 Calendar", value: "Sts. Fabian & Sebastian", tone: "neutral", highlighted: false },
          right: { label: "Novus Ordo", value: "<script>alert(1)</script>", tone: "neutral", highlighted: false },
        },
      ],
    };
    const html = renderSections(vm);
    expect(html).toContain("Sts. Fabian &amp; Sebastian");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
