import dayjs from 'dayjs'

export const pricePeriods: Record<string, { label: string; start: number; end: number }> = {
  morning: { label: '07:00~12:00', start: 420, end: 721 },
  afternoon: { label: '12:01~16:30', start: 721, end: 991 },
  evening: { label: '16:31~23:59', start: 991, end: 1440 },
}

export function getOtherTimeRanges(periodKeys: string[]): string[] {
  const intervals = periodKeys.flatMap((key) => pricePeriods[key] ? [pricePeriods[key]] : [])
    .sort((a, b) => a.start - b.start)
  const formatMinute = (minute: number) => dayjs().startOf('day').add(minute, 'minute').format('HH:mm')
  const ranges: string[] = []
  let cursor = 0
  for (const interval of intervals) {
    if (interval.start > cursor) ranges.push(`${formatMinute(cursor)}~${formatMinute(interval.start - 1)}`)
    cursor = Math.max(cursor, interval.end)
  }
  if (cursor < 1440) ranges.push(`${formatMinute(cursor)}~23:59`)
  return ranges
}

export function getBatchDates(
  ranges: ([string, string] | null)[],
  operation: string,
  monthDays: string[],
  weekdays: string[],
): string[] {
  const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dates = new Set<string>()
  for (const range of ranges) {
    if (!range) continue
    const end = dayjs(range[1])
    for (let date = dayjs(range[0]); date.isValid() && end.isValid() && !date.isAfter(end, 'day'); date = date.add(1, 'day')) {
      if (operation === 'number' && !monthDays.includes(String(date.date()))) continue
      if (operation === 'weekday' && !weekdays.includes(weekdayKeys[date.day()])) continue
      dates.add(date.format('YYYY-MM-DD'))
    }
  }
  return [...dates].sort()
}
