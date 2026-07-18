import { getWarsawDateKey, getWishYear, monthDayFromOffset } from '../lib/dates'
import type { DemoState, Person, Wish } from '../types/domain'

const createdAt = '2026-01-15T09:00:00.000Z'

export function createDemoPeople(date = new Date()): Person[] {
  return [
    {
      id: 'person-lena',
      name: 'Lena Maj',
      nickname: 'Lena',
      birthdayMd: monthDayFromOffset(0, date),
      about: 'Łączy ludzi szybciej niż wspólny lunch. Zawsze ma pod ręką dobry adres i jeszcze lepsze pytanie.',
      avatarTone: 'berry',
      isAdmin: false,
      isActive: true,
      createdAt,
    },
    {
      id: 'person-nina',
      name: 'Nina Mazur',
      nickname: 'Nina',
      birthdayMd: monthDayFromOffset(0, date),
      about: 'Pilnuje, żeby pomysły miały sens, a spotkania kończyły się konkretem. Po godzinach odnawia stare krzesła.',
      avatarTone: 'sun',
      isAdmin: false,
      isActive: true,
      createdAt,
    },
    {
      id: 'person-maks',
      name: 'Maks Nowak',
      nickname: 'Maks',
      birthdayMd: monthDayFromOffset(4, date),
      about: 'Rozplątuje trudne problemy i tłumaczy je bez zadęcia. W weekend najczęściej znika na rowerze.',
      avatarTone: 'mint',
      isAdmin: false,
      isActive: true,
      createdAt,
    },
    {
      id: 'person-iga',
      name: 'Iga Zielińska',
      nickname: 'Iga',
      birthdayMd: monthDayFromOffset(13, date),
      about: 'Widzi detale, których inni jeszcze nie zauważyli. Prowadzi też nieoficjalny ranking najlepszych drożdżówek.',
      avatarTone: 'sky',
      isAdmin: false,
      isActive: true,
      createdAt,
    },
    {
      id: 'person-bruno',
      name: 'Bruno Wilk',
      nickname: 'Bruno',
      birthdayMd: monthDayFromOffset(28, date),
      about: 'Buduje rzeczy, które wytrzymują kontakt z rzeczywistością. Zna trzy akordy i zdecydowanie zbyt wiele piosenek.',
      avatarTone: 'plum',
      isAdmin: false,
      isActive: true,
      createdAt,
    },
    {
      id: 'person-olek',
      name: 'Aleksander Lis',
      nickname: 'Olek',
      birthdayMd: monthDayFromOffset(62, date),
      about: 'Dba o rytm pracy zespołu i umie powiedzieć „nie teraz” bez zamykania rozmowy.',
      avatarTone: 'berry',
      isAdmin: true,
      isActive: true,
      createdAt,
    },
    {
      id: 'person-tosia',
      name: 'Antonina Bąk',
      nickname: 'Tosia',
      birthdayMd: monthDayFromOffset(96, date),
      about: 'Zamienia liczby w historie, które da się zapamiętać. Najlepiej odpoczywa w lesie albo przy planszówkach.',
      avatarTone: 'mint',
      isAdmin: false,
      isActive: true,
      createdAt,
    },
    {
      id: 'person-janek',
      name: 'Jan Krawiec',
      nickname: 'Janek',
      birthdayMd: monthDayFromOffset(155, date),
      about: 'Pierwszy zauważa, że coś może działać prościej. Robi świetną kawę i bardzo przeciętne zdjęcia analogowe.',
      avatarTone: 'sky',
      isAdmin: false,
      isActive: true,
      createdAt,
    },
  ]
}

export function createDemoWishes(date = new Date()): Wish[] {
  const wishYear = getWishYear(date)
  return [
    {
      id: 'wish-lena-maks',
      recipientId: 'person-lena',
      authorId: 'person-maks',
      appreciationText: 'Za spokój, z którym porządkujesz nawet najbardziej poplątany temat.',
      wishText: 'Dużo zdrowia, dobrych pomysłów i czasu na wszystko, co odkładasz na później.',
      signatureStyle: 'nickname',
      signatureLabel: 'Maks',
      wishYear,
      createdAt: new Date(date.getTime() - 52 * 60 * 1000).toISOString(),
    },
    {
      id: 'wish-lena-iga',
      recipientId: 'person-lena',
      authorId: 'person-iga',
      appreciationText: 'Za uważność i za to, że pamiętasz o osobach, nie tylko o zadaniach.',
      wishText: 'Niech ten rok przyniesie Ci kilka dobrych zaskoczeń i żadnych spotkań bez agendy.',
      signatureStyle: 'full-name',
      signatureLabel: 'Iga Zielińska',
      wishYear,
      createdAt: new Date(date.getTime() - 31 * 60 * 1000).toISOString(),
    },
    {
      id: 'wish-nina-bruno',
      recipientId: 'person-nina',
      authorId: 'person-bruno',
      appreciationText: 'Za to, że po Twoich uwagach wszystko robi się prostsze, a nie trudniejsze.',
      wishText: 'Wszystkiego najlepszego! Dużo zdrowia, udanych projektów i weekendów naprawdę wolnych od pracy.',
      signatureStyle: 'first-name',
      signatureLabel: 'Bruno',
      wishYear,
      createdAt: new Date(date.getTime() - 18 * 60 * 1000).toISOString(),
    },
  ]
}

export function createDemoState(date = new Date()): DemoState {
  return {
    version: 1,
    generatedOn: getWarsawDateKey(date),
    people: createDemoPeople(date),
    wishes: createDemoWishes(date),
  }
}
