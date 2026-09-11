import { format, isValid } from 'date-fns';

function toDate(value: string) {
  const date = new Date(value);
  return isValid(date) ? date : null;
}

export function formatDate(value: string) {
  if (!value.trim()) return '—';
  const date = toDate(value);
  if (!date) return value;
  return format(date, 'd MMM yyyy');
}

export function formatDateTime(value: string) {
  if (!value.trim()) return '—';
  const date = toDate(value);
  if (!date) return value;
  return format(date, 'd MMM yyyy, h:mm a');
}
