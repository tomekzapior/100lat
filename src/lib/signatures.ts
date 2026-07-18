import type { Person, SignatureStyle } from '../types/domain'

export const SIGNATURE_OPTIONS: Array<{ value: SignatureStyle; label: string }> = [
  { value: 'full-name', label: 'Imię i nazwisko' },
  { value: 'nickname', label: 'Nazwa wyświetlana' },
  { value: 'first-name', label: 'Tylko imię' },
]

export function signaturePreview(person: Person | undefined, style: SignatureStyle) {
  if (!person) return 'Wybierz autora'
  if (style === 'nickname') return person.nickname
  if (style === 'first-name') return person.name.split(/\s+/)[0] ?? person.nickname
  return person.name
}
