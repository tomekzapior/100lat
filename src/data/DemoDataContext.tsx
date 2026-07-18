import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createId } from '../lib/ids'
import { getCelebrationYear, getWarsawDateKey } from '../lib/dates'
import type {
  DemoDataContextValue,
  DemoState,
  Person,
  PersonInput,
  SignatureStyle,
  Wish,
  WishInput,
} from '../types/domain'
import { createDemoState } from './demoSeed'
import { DemoDataContext } from './demoDataStore'
import { parseDemoState } from './parseDemoState'

const SESSION_KEY = 'sto-lat-demo-v1'

function readInitialState() {
  const fallback = createDemoState()
  if (typeof window === 'undefined') return fallback

  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY)
    if (!stored) return fallback
    const parsed = parseDemoState(JSON.parse(stored))
    if (!parsed || parsed.generatedOn !== getWarsawDateKey()) return fallback
    return parsed
  } catch {
    return fallback
  }
}

function signatureFor(person: Person, style: SignatureStyle) {
  if (style === 'nickname') return person.nickname
  if (style === 'first-name') return person.name.split(/\s+/)[0] ?? person.nickname
  return person.name
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(readInitialState)
  const [isLoading, setIsLoading] = useState(true)
  const [persistFailed, setPersistFailed] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 320)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state))
      setPersistFailed(false)
    } catch {
      setPersistFailed(true)
    }
  }, [state])

  const addWish = useCallback(
    (input: WishInput) => {
      const author = state.people.find((person) => person.id === input.authorId)
      const recipient = state.people.find((person) => person.id === input.recipientId)
      if (!author || !recipient) throw new Error('Nie znaleziono wybranej osoby.')

      const wishYear = getCelebrationYear(recipient.birthdayMd)
      const duplicate = state.wishes.some(
        (wish) =>
          wish.authorId === input.authorId &&
          wish.recipientId === input.recipientId &&
          wish.wishYear === wishYear,
      )
      if (duplicate) throw new Error('Ta osoba dodała już życzenia w tym roku.')

      const wish: Wish = {
        ...input,
        id: createId('wish'),
        signatureLabel: signatureFor(author, input.signatureStyle),
        wishYear,
        createdAt: new Date().toISOString(),
      }
      setState((current) => ({ ...current, wishes: [...current.wishes, wish] }))
      return wish
    },
    [state.people, state.wishes],
  )

  const addPerson = useCallback((input: PersonInput) => {
    const person: Person = {
      ...input,
      id: createId('person'),
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    setState((current) => ({ ...current, people: [...current.people, person] }))
    return person
  }, [])

  const updatePerson = useCallback(
    (id: string, input: PersonInput) => {
      const existing = state.people.find((person) => person.id === id)
      if (!existing) throw new Error('Nie znaleziono profilu do edycji.')
      if (existing.isAdmin && existing.isActive && !input.isAdmin) {
        const activeAdmins = state.people.filter(
          (person) => person.isAdmin && person.isActive,
        )
        if (activeAdmins.length === 1) {
          throw new Error('Ostatni administrator demo musi zachować rolę.')
        }
      }
      const person: Person = { ...existing, ...input }
      setState((current) => ({
        ...current,
        people: current.people.map((item) => (item.id === id ? person : item)),
      }))
      return person
    },
    [state.people],
  )

  const deactivatePerson = useCallback(
    (id: string) => {
      const target = state.people.find((person) => person.id === id)
      if (!target) return
      const activeAdmins = state.people.filter((person) => person.isAdmin && person.isActive)
      if (target.isAdmin && activeAdmins.length === 1) {
        throw new Error('Ostatni administrator demo musi pozostać aktywny.')
      }
      setState((current) => ({
        ...current,
        people: current.people.map((person) =>
          person.id === id ? { ...person, isActive: false } : person,
        ),
      }))
    },
    [state.people],
  )

  const restorePerson = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      people: current.people.map((person) =>
        person.id === id ? { ...person, isActive: true } : person,
      ),
    }))
  }, [])

  const resetDemo = useCallback(() => {
    const fresh = createDemoState()
    setState(fresh)
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh))
    } catch {
      return
    }
  }, [])

  const value = useMemo<DemoDataContextValue>(
    () => ({
      people: state.people,
      wishes: state.wishes,
      isLoading,
      persistFailed,
      addWish,
      addPerson,
      updatePerson,
      deactivatePerson,
      restorePerson,
      resetDemo,
    }),
    [
      state.people,
      state.wishes,
      isLoading,
      persistFailed,
      addWish,
      addPerson,
      updatePerson,
      deactivatePerson,
      restorePerson,
      resetDemo,
    ],
  )

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>
}
