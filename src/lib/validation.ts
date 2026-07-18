import { isValidMonthDay } from './dates'
import type { PersonInput, WishInput } from '../types/domain'

export type FieldErrors<T extends string> = Partial<Record<T, string>>

export function validateWish(input: WishInput) {
  const errors: FieldErrors<'authorId' | 'appreciationText' | 'wishText'> = {}
  if (!input.authorId) errors.authorId = 'Wybierz osobę, która podpisze życzenia.'

  const appreciationLength = input.appreciationText.trim().length
  if (appreciationLength < 10) {
    errors.appreciationText = 'Napisz co najmniej 10 znaków.'
  } else if (appreciationLength > 500) {
    errors.appreciationText = 'Skróć tekst do 500 znaków.'
  }

  const wishLength = input.wishText.trim().length
  if (wishLength < 10) {
    errors.wishText = 'Napisz co najmniej 10 znaków.'
  } else if (wishLength > 500) {
    errors.wishText = 'Skróć tekst do 500 znaków.'
  }

  return errors
}

export function validatePerson(input: PersonInput) {
  const errors: FieldErrors<'name' | 'nickname' | 'birthdayMd' | 'about'> = {}
  const nameLength = input.name.trim().length
  const nicknameLength = input.nickname.trim().length

  if (nameLength < 3) errors.name = 'Wpisz imię i nazwisko, co najmniej 3 znaki.'
  if (nameLength > 80) errors.name = 'Skróć imię i nazwisko do 80 znaków.'
  if (nicknameLength < 2) errors.nickname = 'Nazwa wyświetlana potrzebuje co najmniej 2 znaków.'
  if (nicknameLength > 30) errors.nickname = 'Skróć nazwę wyświetlaną do 30 znaków.'
  if (!isValidMonthDay(input.birthdayMd)) {
    errors.birthdayMd = 'Podaj poprawny dzień i miesiąc w formacie MM-DD, na przykład 07-18.'
  }
  if (input.about.trim().length > 240) errors.about = 'Skróć opis do 240 znaków.'

  return errors
}

export function hasErrors<T extends string>(errors: FieldErrors<T>) {
  return Object.keys(errors).length > 0
}
