const DAY_MS = 86_400_000
const WARSAW_TIME_ZONE = 'Europe/Warsaw'

interface DateParts {
  year: number
  month: number
  day: number
}

const warsawPartsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: WARSAW_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const birthdayFormatter = new Intl.DateTimeFormat('pl-PL', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
})

export function getWarsawDateParts(date = new Date()): DateParts {
  const parts = warsawPartsFormatter.formatToParts(date)
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
  }
}

export function getWarsawDateKey(date = new Date()) {
  const { year, month, day } = getWarsawDateParts(date)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function monthDayFromOffset(offset: number, date = new Date()) {
  const { year, month, day } = getWarsawDateParts(date)
  const shifted = new Date(Date.UTC(year, month - 1, day + offset, 12))
  const shiftedParts = getWarsawDateParts(shifted)
  return `${String(shiftedParts.month).padStart(2, '0')}-${String(shiftedParts.day).padStart(2, '0')}`
}

function parseMonthDay(monthDay: string) {
  const [month, day] = monthDay.split('-').map(Number)
  return { month, day }
}

export function isValidMonthDay(monthDay: string) {
  if (!/^\d{2}-\d{2}$/.test(monthDay)) return false
  const { month, day } = parseMonthDay(monthDay)
  const candidate = new Date(Date.UTC(2024, month - 1, day, 12))
  return candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day
}

function isValidDate(year: number, month: number, day: number) {
  const candidate = new Date(Date.UTC(year, month - 1, day, 12))
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  )
}

export function getNextBirthday(monthDay: string, date = new Date()) {
  const { year, month: currentMonth, day: currentDay } = getWarsawDateParts(date)
  const { month, day } = parseMonthDay(monthDay)
  const currentSerial = Date.UTC(year, currentMonth - 1, currentDay)

  for (let targetYear = year; targetYear <= year + 8; targetYear += 1) {
    if (!isValidDate(targetYear, month, day)) continue
    const targetSerial = Date.UTC(targetYear, month - 1, day)
    const days = Math.round((targetSerial - currentSerial) / DAY_MS)
    if (days >= 0) {
      return {
        days,
        year: targetYear,
        date: new Date(Date.UTC(targetYear, month - 1, day, 12)),
      }
    }
  }

  throw new Error(`Nie można obliczyć kolejnych urodzin dla daty ${monthDay}.`)
}

export function getWishYear(date = new Date()) {
  return getWarsawDateParts(date).year
}

export function getCelebrationYear(monthDay: string, date = new Date()) {
  return getNextBirthday(monthDay, date).year
}

export function formatBirthday(monthDay: string) {
  const { month, day } = parseMonthDay(monthDay)
  return birthdayFormatter.format(new Date(Date.UTC(2024, month - 1, day, 12)))
}

export function formatDistanceToBirthday(days: number) {
  if (days === 0) return 'dzisiaj'
  if (days === 1) return 'jutro'
  return `za ${days} dni`
}

export function compareByNextBirthday(
  first: { birthdayMd: string },
  second: { birthdayMd: string },
  date = new Date(),
) {
  return getNextBirthday(first.birthdayMd, date).days - getNextBirthday(second.birthdayMd, date).days
}

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('pl-PL')
    .replaceAll('ł', 'l')
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('pl-PL'))
    .join('')
}
