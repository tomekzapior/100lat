import { describe, expect, it } from 'vitest'
import { createDemoState } from './demoSeed'
import { parseDemoState } from './parseDemoState'

describe('parseDemoState', () => {
  it('akceptuje kompletny stan wygenerowany przez seed', () => {
    const state = createDemoState()
    expect(parseDemoState(JSON.parse(JSON.stringify(state)))).toEqual(state)
  })

  it('odrzuca stan bez wymaganych tablic albo w złej wersji', () => {
    expect(parseDemoState(null)).toBeNull()
    expect(parseDemoState({})).toBeNull()
    expect(parseDemoState({ version: 2, generatedOn: '2026-07-18', people: [], wishes: [] })).toBeNull()
    expect(parseDemoState({ version: 1, generatedOn: '2026-07-18', people: {}, wishes: [] })).toBeNull()
  })

  it('odrzuca osobę z uszkodzoną datą albo nieznanym tonem avatara', () => {
    const state = createDemoState()
    const badDate = JSON.parse(JSON.stringify(state)) as ReturnType<typeof createDemoState>
    badDate.people[0]!.birthdayMd = '13-45'
    expect(parseDemoState(badDate)).toBeNull()

    const badTone = JSON.parse(JSON.stringify(state)) as ReturnType<typeof createDemoState>
    ;(badTone.people[0] as unknown as Record<string, unknown>).avatarTone = 'neon'
    expect(parseDemoState(badTone)).toBeNull()

    const withNull = JSON.parse(JSON.stringify(state)) as ReturnType<typeof createDemoState>
    ;(withNull.people as unknown[]).push(null)
    expect(parseDemoState(withNull)).toBeNull()
  })

  it('odrzuca życzenie wskazujące na nieistniejącą osobę', () => {
    const state = JSON.parse(JSON.stringify(createDemoState())) as ReturnType<typeof createDemoState>
    state.wishes[0]!.recipientId = 'person-ghost'
    expect(parseDemoState(state)).toBeNull()
  })
})
