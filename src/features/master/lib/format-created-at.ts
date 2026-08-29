import { format } from 'date-fns';

export function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'd MMM yyyy, h:mm a').replace(/AM|PM/g, (period) => period.toLowerCase());
}
