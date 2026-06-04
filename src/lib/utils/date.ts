import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
} from 'date-fns'
import { ja } from 'date-fns/locale'

export function formatDate(date: Date | string, fmt = 'yyyy/MM/dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: ja })
}

export function formatMonth(date: Date): string {
  return format(date, 'yyyy年M月', { locale: ja })
}

export function toPeriodString(date: Date): string {
  return format(date, 'yyyy-MM')
}

export function fromPeriodString(period: string): Date {
  return parseISO(`${period}-01`)
}

export function getCalendarDays(year: number, month: number): Date[] {
  const monthStart = startOfMonth(new Date(year, month - 1))
  const monthEnd = endOfMonth(monthStart)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  return eachDayOfInterval({ start: calStart, end: calEnd })
}

export function isSameMonthAs(date: Date, year: number, month: number): boolean {
  return isSameMonth(date, new Date(year, month - 1))
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function currentPeriod(): string {
  return toPeriodString(new Date())
}

export { addMonths, subMonths, parseISO }
