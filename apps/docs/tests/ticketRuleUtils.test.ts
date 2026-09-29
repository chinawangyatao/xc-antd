import { describe, expect, test } from 'bun:test'
import { getBatchDates, getOtherTimeRanges } from '../src/pages/ticketRuleUtils'

describe('ticket rule examples', () => {
  test('computes remaining time ranges without overlapping configured periods', () => {
    expect(getOtherTimeRanges(['morning', 'afternoon'])).toEqual(['00:00~06:59', '16:31~23:59'])
    expect(getOtherTimeRanges(['afternoon', 'morning', 'morning', 'evening'])).toEqual(['00:00~06:59'])
    expect(getOtherTimeRanges([])).toEqual(['00:00~23:59'])
  })

  test('applies month-day filters across leap days and excludes nonexistent dates', () => {
    expect(getBatchDates([['2024-02-28', '2024-03-31']], 'number', ['29', '31'], []))
      .toEqual(['2024-02-29', '2024-03-29', '2024-03-31'])
    expect(getBatchDates([['2025-02-01', '2025-02-28']], 'number', ['31'], [])).toEqual([])
  })

  test('filters weekdays, includes endpoints, and deduplicates overlapping date ranges', () => {
    expect(getBatchDates([['2026-09-28', '2026-10-05'], ['2026-10-01', '2026-10-05']], 'weekday', [], ['mon']))
      .toEqual(['2026-09-28', '2026-10-05'])
    expect(getBatchDates([null, ['2026-10-01', '2026-10-01']], 'all', [], []))
      .toEqual(['2026-10-01'])
  })
})
