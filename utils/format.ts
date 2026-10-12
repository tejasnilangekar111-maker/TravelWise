export const formatRupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const formatCostRange = (min: number, max: number) =>
  `${formatRupees(min)} – ${formatRupees(max)}`;

/** "Vanaz Metro Station, Pune" → "Vanaz" ; "Hadapsar, Pune" → "Hadapsar" */
export function shortPlace(place: string): string {
  const first = place.split(',')[0].trim();
  return first.replace(/\s+(metro station|station|metro)$/i, '').trim() || first;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 18:05 → "6:05 PM" */
export function formatClock(d: Date): string {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today", "Tomorrow", or "Wed, 14 Oct" (with the year when it isn't this year). */
export function formatDay(d: Date, now = new Date()): string {
  const days = Math.round((startOfDay(d) - startOfDay(now)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  const year = d.getFullYear() === now.getFullYear() ? '' : ` ${d.getFullYear()}`;
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}${year}`;
}

/** "Leaving now", "Today · 6:30 PM", "Wed, 14 Oct · 8:30 AM" */
export function formatWhen(departAt: Date | null, now = new Date()): string {
  return departAt ? `${formatDay(departAt, now)} · ${formatClock(departAt)}` : 'Leaving now';
}

export const routeTitle = (from: string, to: string) => `${shortPlace(from)} → ${shortPlace(to)}`;
