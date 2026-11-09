const DAY = 86_400_000;

export const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T12:00:00Z`) + days * DAY).toISOString().slice(0, 10);

export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY);

/** Whole years between a birth date and a date. */
export function ageOn(birthDate: string, date: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number) as [number, number, number];
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

/** "2026-27" for a season starting in 2026; leagues played over a year keep the same form. */
export const seasonLabel = (start: string) => {
  const year = Number(start.slice(0, 4));
  return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
};

/**
 * Start of the next season: a year on, on the same weekday, and at least three weeks after the
 * last match so that long calendars do not overlap.
 */
export function nextSeasonStart(start: string, lastMatch: string): string {
  let next = addDays(start, 364);
  while (daysBetween(lastMatch, next) < 21) next = addDays(next, 7);
  return next;
}
