import { format } from 'date-fns';

export const DASHBOARD_TIME_ZONE = 'Asia/Kolkata';

export function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));

  return (
    utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day
  );
}

export function kolkataToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DASHBOARD_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Could not format calendar date');
  }

  return `${year}-${month}-${day}`;
}

export function formatDashboardDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return format(new Date(year ?? 0, (month ?? 1) - 1, day ?? 1), 'd MMM yyyy');
}

export function boundedCalendarDate(value: string | undefined, today: string): string | undefined {
  if (!value || !isCalendarDate(value) || value > today) return undefined;
  return value;
}

export function periodLabel(from: string | null, to: string): string {
  if (!from) return `Till date, through ${formatDashboardDate(to)}`;
  if (from === to) return formatDashboardDate(from);
  return `${formatDashboardDate(from)} – ${formatDashboardDate(to)}`;
}
