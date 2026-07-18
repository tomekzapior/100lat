import { isValidMonthDay } from '../lib/dates'
import type {
  AvatarTone,
  DemoState,
  Person,
  SignatureStyle,
  Wish,
} from '../types/domain'

const AVATAR_TONES: readonly AvatarTone[] = ['berry', 'sun', 'mint', 'sky', 'plum']
const SIGNATURE_STYLES: readonly SignatureStyle[] = ['full-name', 'nickname', 'first-name']

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isPerson(value: unknown): value is Person {
  if (!value || typeof value !== 'object') return false
  const person = value as Record<string, unknown>
  return (
    isNonEmptyString(person.id) &&
    isNonEmptyString(person.name) &&
    isNonEmptyString(person.nickname) &&
    typeof person.birthdayMd === 'string' &&
    isValidMonthDay(person.birthdayMd) &&
    typeof person.about === 'string' &&
    (person.avatarUrl === undefined || typeof person.avatarUrl === 'string') &&
    AVATAR_TONES.includes(person.avatarTone as AvatarTone) &&
    typeof person.isAdmin === 'boolean' &&
    typeof person.isActive === 'boolean' &&
    isIsoDateString(person.createdAt)
  )
}

function isWish(value: unknown, peopleIds: ReadonlySet<string>): value is Wish {
  if (!value || typeof value !== 'object') return false
  const wish = value as Record<string, unknown>
  return (
    isNonEmptyString(wish.id) &&
    isNonEmptyString(wish.recipientId) &&
    peopleIds.has(wish.recipientId as string) &&
    isNonEmptyString(wish.authorId) &&
    peopleIds.has(wish.authorId as string) &&
    isNonEmptyString(wish.appreciationText) &&
    isNonEmptyString(wish.wishText) &&
    SIGNATURE_STYLES.includes(wish.signatureStyle as SignatureStyle) &&
    isNonEmptyString(wish.signatureLabel) &&
    typeof wish.wishYear === 'number' &&
    Number.isInteger(wish.wishYear) &&
    isIsoDateString(wish.createdAt)
  )
}

export function parseDemoState(value: unknown): DemoState | null {
  if (!value || typeof value !== 'object') return null
  const state = value as Record<string, unknown>
  if (state.version !== 1) return null
  if (typeof state.generatedOn !== 'string') return null
  if (!Array.isArray(state.people) || !Array.isArray(state.wishes)) return null
  if (!state.people.every(isPerson)) return null

  const peopleIds = new Set(state.people.map((person) => person.id))
  if (peopleIds.size !== state.people.length) return null
  if (!state.wishes.every((wish) => isWish(wish, peopleIds))) return null

  return {
    version: 1,
    generatedOn: state.generatedOn,
    people: state.people,
    wishes: state.wishes,
  }
}
