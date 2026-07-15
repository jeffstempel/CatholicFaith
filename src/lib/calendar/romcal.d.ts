/**
 * `romcal` ships no TypeScript types. This is a minimal ambient declaration
 * covering only the surface `novusOrdo/index.ts` actually uses.
 */
declare module "romcal" {
  export interface RomcalCelebration {
    moment: string;
    type: string;
    name: string;
    key: string;
    source: string;
    data?: {
      season?: { key: string; value: string };
      meta?: {
        liturgicalColor?: { key: string; value: string };
        titles?: string[];
      };
    };
  }

  export interface CalendarForOptions {
    year?: number;
    country?: string;
    locale?: string;
  }

  export function calendarFor(options: CalendarForOptions): RomcalCelebration[];

  export interface RomcalSeasonDay {
    moment: { format(pattern: string): string };
    type: string;
    name: string;
    data?: {
      season?: { key: string; value: string };
      meta?: {
        liturgicalColor?: { key: string; value: string };
      };
    };
  }

  export const Seasons: {
    advent(year: number): RomcalSeasonDay[];
    christmastide(year: number): RomcalSeasonDay[];
    earlyOrdinaryTime(year: number): RomcalSeasonDay[];
    lent(year: number): RomcalSeasonDay[];
    easterTriduum(year: number): RomcalSeasonDay[];
    easterOctave(year: number): RomcalSeasonDay[];
    eastertide(year: number): RomcalSeasonDay[];
    laterOrdinaryTime(year: number): RomcalSeasonDay[];
  };
}
