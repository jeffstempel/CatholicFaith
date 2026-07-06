/**
 * `romcal` ships no TypeScript types. This is a minimal ambient declaration
 * covering only the surface `novusOrdo.ts` actually uses.
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
}
