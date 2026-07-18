import { describe, expect, it } from 'vitest'
import { hasErrors, validatePerson, validateWish } from './validation'

describe('wish validation', () => {
  it('requires an author and both meaningful texts', () => {
    const errors = validateWish({
      recipientId: 'recipient',
      authorId: '',
      appreciationText: 'Za mało',
      wishText: '',
      signatureStyle: 'nickname',
    })

    expect(errors.authorId).toBeTruthy()
    expect(errors.appreciationText).toBeTruthy()
    expect(errors.wishText).toBeTruthy()
    expect(hasErrors(errors)).toBe(true)
  })
})

describe('person validation', () => {
  it('accepts a complete synthetic profile', () => {
    const errors = validatePerson({
      name: 'Alicja Nowak',
      nickname: 'Ala',
      birthdayMd: '07-18',
      about: 'Lubi prostotę.',
      avatarTone: 'berry',
      isAdmin: false,
    })

    expect(errors).toEqual({})
  })

  it('rejects an impossible birthday', () => {
    const errors = validatePerson({
      name: 'Alicja Nowak',
      nickname: 'Ala',
      birthdayMd: '02-30',
      about: '',
      avatarTone: 'berry',
      isAdmin: false,
    })

    expect(errors.birthdayMd).toContain('MM-DD')
  })
})
