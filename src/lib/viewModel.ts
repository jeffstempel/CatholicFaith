import { gregorianEaster } from "./calendar/computus";
import { addDays, toISODate } from "./calendar/dateUtils";
import { getLiturgicalDay1962, getNextFeastDay } from "./calendar/1962";
import { getNextEmberDay } from "./calendar/1962/emberDays";
import { getFastingAbstinence1962, type FastingAbstinence as FastingAbstinence1962 } from "./calendar/1962/fastingAbstinence";
import { getHolyDayOfObligation1917, type HolyDayOfObligation1917 } from "./calendar/1962/holyDaysOfObligation";
import { lookupTodaySummary1962, type TodaySummaryTable1962 } from "./calendar/1962/todaySummaryLookup";
import { lookupNextSolemnity, lookupNovusOrdoDay, type NovusOrdoTable } from "./calendar/novusOrdo/lookup";
import { getFastingAbstinenceNovusOrdo, type FastingAbstinence as FastingAbstinenceNovusOrdo } from "./calendar/novusOrdo/fastingAbstinence";
import { getHolyDayOfObligationUS, type HolyDayOfObligationUS } from "./calendar/novusOrdo/holyDaysOfObligation";
import { findPatronage } from "./calendar/patronage";
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

const ASCENSION_THURSDAY_PROVINCES = "Boston, Hartford, New York, Omaha and Philadelphia";

/**
 * romcal's US calendar keeps the Ascension on Thursday, 39 days after
 * Easter, and so does this site. Most US dioceses, though, transfer it to
 * the following Sunday; only the five ecclesiastical provinces above keep
 * Thursday (per the USCCB's annual liturgical calendar, e.g.
 * usccb.org/resources/2026cal.pdf). This note says so on both days.
 */
function ascensionTransferNote(date: Date): string | undefined {
  const ascensionThursday = addDays(gregorianEaster(date.getUTCFullYear()), 39);
  const ascensionSunday = addDays(ascensionThursday, 3);
  const isoDate = toISODate(date);
  if (isoDate === toISODate(ascensionThursday)) {
    return `In most US dioceses, the Ascension is celebrated on Sunday, ${formatDate(ascensionSunday, DATE_FORMAT_OPTIONS)}. It stays on Thursday in the provinces of ${ASCENSION_THURSDAY_PROVINCES}.`;
  }
  if (isoDate === toISODate(ascensionSunday)) {
    return `In most US dioceses, Ascension Thursday (${formatDate(ascensionThursday, DATE_FORMAT_OPTIONS)}) is celebrated today. The provinces of ${ASCENSION_THURSDAY_PROVINCES} keep it on Thursday.`;
  }
  return undefined;
}

type ObligationColumn = Pick<ColumnViewModel, "value" | "description" | "footnote" | "tone" | "highlighted">;

const OBLIGATORY = { value: "Yes!", tone: "yes", highlighted: true } as const;
const NOT_OBLIGATORY = { value: "No", description: "Not a holy day of obligation.", tone: "no", highlighted: false } as const;
const EVERY_SUNDAY = "Every Sunday is a day of obligation.";

function describeObligation1917(h: HolyDayOfObligation1917): ObligationColumn {
  const footnotes = [
    h.notKeptInUS ? "In the US, this was not kept as a holy day under the 1917 Code." : undefined,
    h.stJosephFeastMoved
      ? "When March 19 is a Sunday or in Holy Week, the 1962 calendar moves the feast itself; the obligation is shown on March 19."
      : undefined,
  ].filter(Boolean);
  const footnote = footnotes.length > 0 ? footnotes.join(" ") : undefined;

  if (h.feast) return { ...OBLIGATORY, description: h.isSunday ? `${h.feast} (also a Sunday)` : h.feast, footnote };
  if (h.isSunday) return { ...OBLIGATORY, description: EVERY_SUNDAY };
  return NOT_OBLIGATORY;
}

function describeObligationUS(h: HolyDayOfObligationUS, date: Date): ObligationColumn {
  const footnote = h.notObligatoryInHonolulu
    ? "Not a holy day in the Diocese of Honolulu, which keeps only Christmas and the Immaculate Conception."
    : undefined;

  switch (h.status) {
    case "abrogated":
      return {
        value: "No",
        description: `${h.feast} falls on a ${h.abrogatedOn} this year, so the obligation is lifted.`,
        tone: "no",
        highlighted: false,
      };
    case "provincesOnly":
      return {
        value: "Only in Some Provinces",
        description: `${h.feast}: a holy day only in the provinces of ${ASCENSION_THURSDAY_PROVINCES}. Elsewhere it moves to Sunday, ${formatDate(addDays(date, 3), DATE_FORMAT_OPTIONS)}.`,
        tone: "neutral",
        highlighted: false,
      };
    case "none":
      return NOT_OBLIGATORY;
    case "obligatory":
      if (h.transfer === "toMonday") {
        return { ...OBLIGATORY, description: `Sunday. The ${h.feast} moves to Monday this year, and is also a day of obligation.` };
      }
      if (h.transfer === "fromSunday") return { ...OBLIGATORY, description: `${h.feast}, moved from Sunday` };
      if (h.transfer === "fromThursday") return { ...OBLIGATORY, description: `Sunday, and in most US dioceses also the ${h.feast}` };
      if (h.feast) return { ...OBLIGATORY, description: h.isSunday ? `${h.feast} (also a Sunday)` : h.feast, footnote };
      return { ...OBLIGATORY, description: EVERY_SUNDAY };
  }
}

function patronageFootnote(celebrationName: string): string | undefined {
  const patronOf = findPatronage(celebrationName);
  return patronOf ? `Patron of: ${patronOf}` : undefined;
}

/**
 * Builds everything needed to render the page for a given date. Pure and
 * environment-agnostic (no DOM, no romcal, no network) so it runs
 * identically at build time (Node) and in the browser (client-side
 * recompute) — both the Novus Ordo side (calendar/novusOrdo/table.ts, via
 * romcal) and the 1962 "What Is Today" side (calendar/1962/todaySummaryTable.ts,
 * via the Missale Meum API) are precomputed into plain data tables ahead of
 * time, since neither romcal nor a live network call can run in the browser.
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
  const obligation1917 = describeObligation1917(getHolyDayOfObligation1917(date));
  const obligationUS = describeObligationUS(getHolyDayOfObligationUS(date), date);

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
        title: "Is Today a Holy Day of Obligation?",
        left: { label: "1917 Code (historical)", ...obligation1917 },
        right: { label: "Current Law (US)", ...obligationUS },
        note: "The current Code of Canon Law (1983) binds all Catholics, whichever form of the Mass they attend. The 1917 column is shown for reference.",
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
        note: ascensionTransferNote(date),
      },
      {
        title: "Saint of the Day",
        left: {
          label: "1962 Calendar",
          value: traditionalSaint?.name ?? "Not yet recorded",
          description: traditionalSaint ? undefined : "Our traditional Saint-of-the-Day list is still growing.",
          footnote: traditionalSaint ? patronageFootnote(traditionalSaint.name) : undefined,
          tone: "neutral",
          highlighted: false,
        },
        right: {
          label: "Novus Ordo",
          value: novusOrdoToday && !novusOrdoToday.isSolemnity ? novusOrdoToday.name : "—",
          description: novusOrdoToday?.isSolemnity ? "Today's solemnity is shown above." : undefined,
          footnote: novusOrdoToday && !novusOrdoToday.isSolemnity ? patronageFootnote(novusOrdoToday.name) : undefined,
          tone: "neutral",
          highlighted: false,
        },
      },
    ],
  };
}
