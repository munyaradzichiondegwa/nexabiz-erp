import { format, parseISO, isValid } from 'date-fns'

export const DATE_FORMAT = 'dd MMM yyyy'
export const DATETIME_FORMAT = 'dd MMM yyyy HH:mm'
export const API_DATE_FORMAT = 'yyyy-MM-dd'

export function formatDate(date: string | Date, fmt = DATE_FORMAT): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? format(d, fmt) : '—'
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, DATETIME_FORMAT)
}

export function toApiDate(date: Date): string {
  return format(date, API_DATE_FORMAT)
}
