export type Calendar = "1962" | "novusOrdo";

export interface Celebration {
  name: string;
  /** Liturgical rank, e.g. "solemnity" | "feast" | "memorial" | "ember" | "sunday" */
  rank?: string;
  isEmberDay?: boolean;
  isSolemnity?: boolean;
  /** Phase 2 attribute: reserved for future use, not populated in phase 1. */
  liturgicalColor?: string;
  /** Phase 2 attribute: reserved for future use, not populated in phase 1. */
  season?: string;
  /** Phase 2 attribute: reserved for future use, not populated in phase 1. */
  octave?: string;
  source?: "curated" | "romcal";
}

export interface LiturgicalDay {
  /** ISO yyyy-mm-dd, always the UTC calendar date. */
  date: string;
  calendar: Calendar;
  celebrations: Celebration[];
}

export interface DatedCelebration {
  date: Date;
  celebration: Celebration;
}
