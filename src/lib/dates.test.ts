import { describe, expect, it } from 'vitest'
import {
  formatDistanceToBirthday,
  getCelebrationYear,
  getNextBirthday,
  isValidMonthDay,
  normalizeSearch,
} from './dates'

describe('birthday date utilities', () => {
  it('wraps the next birthday into a new year', () => {
    const result = getNextBirthday('01-01', new Date('2026-12-31T12:00:00.000Z'))
    expect(result.days).toBe(1)
    expect(result.year).toBe(2027)
  })

  it('finds the next valid leap-day birthday', () => {
    const result = getNextBirthday('02-29', new Date('2025-03-01T12:00:00.000Z'))
    expect(result.year).toBe(2028)
    expect(result.days).toBe(1095)
  })

  it('rejects impossible month-day values', () => {
    expect(isValidMonthDay('02-29')).toBe(true)
    expect(isValidMonthDay('02-30')).toBe(false)
    expect(isValidMonthDay('13-01')).toBe(false)
    expect(isValidMonthDay('7-18')).toBe(false)
  })

  it('normalizes Polish characters for search', () => {
    expect(normalizeSearch('  Łucja ŻÓŁĆ  ')).toBe('lucja zolc')
  })

  it('uses clear distance labels', () => {
    expect(formatDistanceToBirthday(0)).toBe('dzisiaj')
    expect(formatDistanceToBirthday(1)).toBe('jutro')
    expect(formatDistanceToBirthday(12)).toBe('za 12 dni')
  })

  it('assigns wishes written before New Year to the upcoming celebration', () => {
    expect(getCelebrationYear('01-05', new Date('2026-12-31T12:00:00.000Z'))).toBe(2027)
  })

  it('keeps the current year for a birthday celebrated today', () => {
    expect(getCelebrationYear('07-18', new Date('2026-07-18T12:00:00.000Z'))).toBe(2026)
  })
})
