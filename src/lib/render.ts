import type { ColumnViewModel, PageViewModel, SectionViewModel } from "./viewModel";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderColumn(column: ColumnViewModel): string {
  const toneClass = column.tone === "yes" ? " is-yes" : column.tone === "no" ? " is-no" : "";
  const highlightedClass = column.highlighted ? " is-highlighted" : "";
  return `<div class="calendar-column${highlightedClass}">
    <p class="column-label">${escapeHtml(column.label)}</p>
    <p class="column-value${toneClass}">${escapeHtml(column.value)}</p>
    ${column.description ? `<p class="column-desc">${escapeHtml(column.description)}</p>` : ""}
    ${column.footnote ? `<p class="column-footnote">${escapeHtml(column.footnote)}</p>` : ""}
  </div>`;
}

function renderSection(section: SectionViewModel): string {
  return `<section class="compare-row">
    <h2>${escapeHtml(section.title)}</h2>
    <div class="columns">
      ${renderColumn(section.left)}
      ${renderColumn(section.right)}
    </div>
    ${section.note ? `<p class="section-note">${escapeHtml(section.note)}</p>` : ""}
  </section>`;
}

/** Renders the same markup CompareRow/CalendarColumn produce, as a plain
 * HTML string, so it can be regenerated client-side (Astro components can't
 * be invoked outside the Astro build pipeline). */
export function renderSections(vm: PageViewModel): string {
  return vm.sections.map(renderSection).join("\n");
}
