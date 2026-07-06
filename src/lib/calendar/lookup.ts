import { getLiturgicalDay1962 } from "./1962";
import { getLiturgicalDayNovusOrdo } from "./novusOrdo";
import type { LiturgicalDay } from "./types";

export interface BothCalendars {
  traditional: LiturgicalDay;
  novusOrdo: LiturgicalDay;
}

export function getBothCalendars(date: Date): BothCalendars {
  return {
    traditional: getLiturgicalDay1962(date),
    novusOrdo: getLiturgicalDayNovusOrdo(date),
  };
}
