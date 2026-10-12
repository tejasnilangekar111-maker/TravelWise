/** Helpers for picking a trip's departure date and time. */

export type PickMode = 'date' | 'time';

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** The first time offered when switching to "Schedule": ~30 min out, on a 5-minute mark. */
export function defaultDeparture(now = new Date()): Date {
  const step = 5 * 60_000;
  return new Date(Math.ceil((now.getTime() + 30 * 60_000) / step) * step);
}

/**
 * Applies one half of a pick to the current value: a date pick keeps the
 * clock time, a time pick keeps the day.
 */
export function mergePick(mode: PickMode, current: Date, picked: Date): Date {
  const d = new Date(current);
  if (mode === 'date') d.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  else d.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return d;
}
