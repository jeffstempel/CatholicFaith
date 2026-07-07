import { toISODate } from "./calendar/dateUtils";
import { getLiturgicalDay1962, getNextFeastDay } from "./calendar/1962";
import { getNextEmberDay } from "./calendar/1962/emberDays";
import { getFastingAbstinence1962, type FastingAbstinence as FastingAbstinence1962 } from "./calendar/1962/fastingAbstinence";
import { lookupTodaySummary1962, type TodaySummaryTable1962 } from "./calendar/1962/todaySummaryLookup";
import { lookupNextSolemnity, lookupNovusOrdoDay, type NovusOrdoTable } from "./calendar/novusOrdoLookup";
import { getFastingAbstinenceNovusOrdo, type FastingAbstinence as FastingAbstinenceNovusOrdo } from "./calendar/novusOrdoFastingAbstinence";
import type { Celebration } from "./calendar/types";

export interface ColumnViewModel {
  label: string;
  value: string;
  description?: string;
  footnote?: string;
  tone: "yes" | "no" | "neutral";
  highlighted: boolean;
}

export interface SectionViewModel {
  title: string;
  left: ColumnViewModel;
  right: ColumnViewModel;
  note?: string;
}

export interface PageViewModel {
  isoDate: string;
  dateLabel: string;
  sections: SectionViewModel[];
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: "UTC",
  year: "numeric",
  month: "long",
  day: "numeric",
};

function formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString("en-US", options);
}

function describeFasting1962(fa: FastingAbstinence1962): Pick<ColumnViewModel, "value" | "description" | "tone" | "highlighted"> {
  if (fa.fast && fa.abstinence === "full") {
    return {
      value: "Fast + Full Abstinence",
      description: "Fasting and complete abstinence from meat are both required today.",
      tone: "yes",
      highlighted: true,
    };
  }
  if (fa.fast && fa.abstinence === "partial") {
    return {
      value: "Fast + Partial Abstinence",
      description: "A fast day; meat is permitted once, at the principal meal.",
      tone: "yes",
      highlighted: true,
    };
  }
  if (fa.fast) {
    return { value: "Fast Day", description: "A day of fasting; no abstinence obligation.", tone: "yes", highlighted: false };
  }
  if (fa.abstinence === "full") {
    return { value: "Full Abstinence", description: "Complete abstinence from meat is required today.", tone: "yes", highlighted: false };
  }
  return { value: "No Obligation", description: "No fasting or abstinence obligation today.", tone: "no", highlighted: false };
}

function describeFastingNovusOrdo(fa: FastingAbstinenceNovusOrdo): Pick<ColumnViewModel, "value" | "description" | "tone" | "highlighted"> {
  if (fa.fast && fa.abstinence === "full") {
    return {
      value: "Fast + Full Abstinence",
      description: "Fasting and complete abstinence from meat are both required today.",
      tone: "yes",
      highlighted: true,
    };
  }
  if (fa.abstinence === "full") {
    return { value: "Full Abstinence", description: "Complete abstinence from meat is required today.", tone: "yes", highlighted: false };
  }
  if (fa.abstinence === "recommended") {
    return {
      value: "Abstinence Recommended",
      description: "Not obligatory, but abstinence (or another penitential act) is encouraged.",
      tone: "neutral",
      highlighted: false,
    };
  }
  return { value: "No Obligation", description: "No fasting or abstinence obligation today.", tone: "no", highlighted: false };
}

/**
 * Builds everything needed to render the page for a given date. Pure and
 * environment-agnostic (no DOM, no romcal, no network) so it runs
 * identically at build time (Node) and in the browser (client-side
 * recompute) — both the Novus Ordo side (novusOrdoTable.ts, via romcal) and
 * the 1962 "What Is Today" side (todaySummaryTable.ts, via the Missale Meum
 * API) are precomputed into plain data tables ahead of time, since neither
 * romcal nor a live network call can run in the browser.
 */
export function buildViewModel(date: Date, novusOrdoTable: NovusOrdoTable, todaySummaryTable1962: TodaySummaryTable1962): PageViewModel {
  const traditional = getLiturgicalDay1962(date);
  const novusOrdoToday = lookupNovusOrdoDay(novusOrdoTable, date);
  const traditionalToday = lookupTodaySummary1962(todaySummaryTable1962, date);

  const dateLabel = formatDate(date, { ...DATE_FORMAT_OPTIONS, weekday: "long" });

  const nextEmberDayLabel = formatDate(getNextEmberDay(date), DATE_FORMAT_OPTIONS);

  const nextFeastDay = getNextFeastDay(date);
  const nextFeastDayLabel = formatDate(nextFeastDay, DATE_FORMAT_OPTIONS);
  const nextFeastDayName = getLiturgicalDay1962(nextFeastDay).celebrations.find((c) => c.isSolemnity)?.name ?? "—";

  const nextSolemnityDate = lookupNextSolemnity(novusOrdoTable, date);
  const nextSolemnityLabel = nextSolemnityDate ? formatDate(nextSolemnityDate, DATE_FORMAT_OPTIONS) : "—";
  const nextSolemnityName = (nextSolemnityDate && lookupNovusOrdoDay(novusOrdoTable, nextSolemnityDate)?.name) ?? "—";

  const traditionalEmberDay = traditional.celebrations.find((c) => c.isEmberDay);
  const traditionalSolemnity = traditional.celebrations.find((c) => c.isSolemnity);
  const traditionalSaint = traditional.celebrations.find((c: Celebration) => !c.isSolemnity && !c.isEmberDay);

  const fasting1962 = describeFasting1962(getFastingAbstinence1962(date));
  const fastingNovusOrdo = describeFastingNovusOrdo(getFastingAbstinenceNovusOrdo(date));

  return {
    isoDate: toISODate(date),
    dateLabel,
    sections: [
      {
        title: "What Is Today in the Church Calendar?",
        left: {
          label: "1962 Calendar",
          value: traditionalToday?.name ?? "Unknown",
          description: `Liturgical Color: ${traditionalToday?.color ?? "Unknown"}`,
          tone: "neutral",
          highlighted: false,
        },
        right: {
          label: "Novus Ordo",
          value: novusOrdoToday?.todaySummaryName ?? "Unknown",
          description: `Liturgical Color: ${novusOrdoToday?.todaySummaryColor ?? "Unknown"}`,
          tone: "neutral",
          highlighted: false,
        },
      },
      {
        title: "Is Today an Ember Day?",
        left: {
          label: "1962 Calendar",
          value: traditionalEmberDay ? "Yes!" : "No",
          description: traditionalEmberDay?.name ?? "Not an Ember Day today.",
          tone: traditionalEmberDay ? "yes" : "no",
          highlighted: Boolean(traditionalEmberDay),
        },
        right: {
          label: "Novus Ordo",
          value: "No",
          description: "Ember Days are not observed in the current calendar.",
          tone: "no",
          highlighted: false,
        },
        note: `Next Ember Day: ${nextEmberDayLabel}`,
      },
      {
        title: "Is Today a Day of Fasting or Abstinence?",
        left: {
          label: "1962 Calendar",
          value: fasting1962.value,
          description: fasting1962.description,
          footnote: "Fasting is required on all Lenten weekdays and Ember Days. Abstinence is required every Friday of the year — partial on Ember Wednesdays/Saturdays, full otherwise.",
          tone: fasting1962.tone,
          highlighted: fasting1962.highlighted,
        },
        right: {
          label: "Novus Ordo",
          value: fastingNovusOrdo.value,
          description: fastingNovusOrdo.description,
          footnote: "Fasting is required only on Ash Wednesday and Good Friday. Abstinence is obligatory only on Fridays of Lent; recommended, not required, on other Fridays.",
          tone: fastingNovusOrdo.tone,
          highlighted: fastingNovusOrdo.highlighted,
        },
      },
      {
        title: "Is Today a Solemnity or Feast Day?",
        left: {
          label: "1962 Calendar",
          value: traditionalSolemnity ? "Yes!" : "No",
          description: traditionalSolemnity?.name ?? "No major feast today.",
          footnote: `Next Feast Day: ${nextFeastDayName} (${nextFeastDayLabel})`,
          tone: traditionalSolemnity ? "yes" : "no",
          highlighted: Boolean(traditionalSolemnity),
        },
        right: {
          label: "Novus Ordo",
          value: novusOrdoToday?.isSolemnity ? "Yes!" : "No",
          description: novusOrdoToday?.isSolemnity ? novusOrdoToday.name : "No solemnity today.",
          footnote: `Next Solemnity: ${nextSolemnityName} (${nextSolemnityLabel})`,
          tone: novusOrdoToday?.isSolemnity ? "yes" : "no",
          highlighted: Boolean(novusOrdoToday?.isSolemnity),
        },
      },
      {
        title: "Saint of the Day",
        left: {
          label: "1962 Calendar",
          value: traditionalSaint?.name ?? "Not yet recorded",
          description: traditionalSaint ? undefined : "Our traditional Saint-of-the-Day list is still growing.",
          tone: "neutral",
          highlighted: false,
        },
        right: {
          label: "Novus Ordo",
          value: novusOrdoToday && !novusOrdoToday.isSolemnity ? novusOrdoToday.name : "—",
          description: novusOrdoToday?.isSolemnity ? "Today's solemnity is shown above." : undefined,
          tone: "neutral",
          highlighted: false,
        },
      },
    ],
  };
}
