import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { DemoDataProvider } from './data/DemoDataContext'
import { getWarsawDateKey } from './lib/dates'

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DemoDataProvider>
        <App />
      </DemoDataProvider>
    </MemoryRouter>,
  )
}

async function unlockAdmin(user: UserEvent) {
  await user.type(screen.getByLabelText('Kod administratora'), '4242')
  await user.click(screen.getByRole('button', { name: 'Otwórz panel' }))
  await screen.findByRole('heading', { name: 'Zespół od kuchni' })
}

describe('kluczowe przepływy aplikacji', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('pokazuje konfetti na Home bez wyszukiwarki i bez duplikowania solenizantów', async () => {
    const { container } = renderApp('/')

    await screen.findByRole('heading', { name: /Dziś świętują/i })

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(
      container.querySelector('.celebration-canvas--confetti'),
    ).toBeInTheDocument()

    const directory = screen.getByRole('region', {
      name: 'Kto świętuje później?',
    })
    expect(
      within(directory).queryByRole('link', { name: /Lena Maj/i }),
    ).not.toBeInTheDocument()
    expect(
      within(directory).queryByRole('link', { name: /Nina Mazur/i }),
    ).not.toBeInTheDocument()
  })

  it('pokazuje fajerwerki tylko na profilu dzisiejszej solenizantki', () => {
    const todayProfile = renderApp('/people/person-lena')

    expect(
      todayProfile.container.querySelector(
        '.celebration-canvas--fireworks',
      ),
    ).toBeInTheDocument()

    cleanup()

    const upcomingProfile = renderApp('/people/person-maks')
    expect(
      upcomingProfile.container.querySelector(
        '.celebration-canvas--fireworks',
      ),
    ).not.toBeInTheDocument()
  })

  it('nie montuje animowanego Canvasu przy ograniczonym ruchu', () => {
    const originalMatchMedia = window.matchMedia
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    }))

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: matchMedia,
    })

    try {
      const home = renderApp('/')
      expect(home.container.querySelector('.celebration-canvas')).toBeNull()
      home.unmount()

      const profile = renderApp('/people/person-lena')
      expect(profile.container.querySelector('.celebration-canvas')).toBeNull()
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: originalMatchMedia,
      })
    }
  })

  it('odblokowuje panel administratora kodem demo 4242', async () => {
    const user = userEvent.setup()
    renderApp('/admin')

    await unlockAdmin(user)
    expect(screen.getByRole('button', { name: /Dodaj profil/i })).toBeEnabled()
  })

  it('dodaje nowy profil i pokazuje go w katalogu', async () => {
    const user = userEvent.setup()
    renderApp('/admin')
    await unlockAdmin(user)

    await user.click(screen.getByRole('button', { name: 'Dodaj profil' }))
    await user.type(screen.getByLabelText('Imię i nazwisko'), 'Tola Kos')
    await user.type(screen.getByLabelText('Nazwa wyświetlana'), 'Tola')
    await user.type(screen.getByLabelText('Data urodzin'), '09-14')
    await user.click(screen.getByRole('button', { name: 'Dodaj osobę' }))

    expect(
      await screen.findByText('Profil Tola został dodany.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Edytuj profil: Tola Kos' }),
    ).toBeInTheDocument()
  })

  it('ukrywa profil i pozwala cofnąć operację', async () => {
    const user = userEvent.setup()
    renderApp('/admin')
    await unlockAdmin(user)

    const brunoRow = screen.getByText('Bruno Wilk').closest('li')
    expect(brunoRow).not.toBeNull()
    await user.click(within(brunoRow!).getByRole('button', { name: 'Ukryj' }))

    expect(
      await screen.findByText('Profil Bruno jest teraz ukryty.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Cofnij/i }))
    expect(
      await screen.findByText('Profil Bruno został przywrócony.'),
    ).toBeInTheDocument()
  })

  it('nie pozwala odebrać roli ostatniemu administratorowi demo', async () => {
    const user = userEvent.setup()
    renderApp('/admin')
    await unlockAdmin(user)

    await user.click(
      screen.getByRole('button', { name: 'Edytuj profil: Aleksander Lis' }),
    )
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Zapisz zmiany' }))

    expect(
      await screen.findByText('Ostatni administrator demo musi zachować rolę.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Edytuj: Olek' }),
    ).toBeInTheDocument()
  })

  it('odrzuca uszkodzony stan sesji i wraca do seeda', async () => {
    window.sessionStorage.setItem(
      'sto-lat-demo-v1',
      JSON.stringify({
        version: 1,
        generatedOn: getWarsawDateKey(),
        people: [null],
        wishes: [],
      }),
    )

    renderApp('/')

    expect(
      await screen.findByRole('heading', { name: /Dziś świętują/i }),
    ).toBeInTheDocument()
  })

  it('pokazuje ostrzeżenie, gdy zapis sesji zawodzi', async () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

    try {
      renderApp('/')
      expect(
        await screen.findByText(/Nie udało się zapisać zmian w pamięci sesji/i),
      ).toBeInTheDocument()
    } finally {
      setItemSpy.mockRestore()
    }
  })

  it('resetuje dane z instrukcji dopiero po jawnym potwierdzeniu', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: 'Instrukcja' }))
    const guide = screen.getByRole('dialog', {
      name: 'Jak przetestować aplikację',
    })

    await user.click(
      within(guide).getByRole('button', { name: 'Przywróć dane demo' }),
    )

    expect(
      within(guide).getByRole('group', {
        name: 'Potwierdzenie resetu danych demo',
      }),
    ).toBeInTheDocument()
    expect(
      within(guide).getByText(
        'Usunąć zmiany z tej sesji i przywrócić dane początkowe?',
      ),
    ).toBeInTheDocument()
    expect(
      within(guide).queryByText('Dane demo wróciły do stanu początkowego.'),
    ).not.toBeInTheDocument()

    await user.click(
      within(guide).getByRole('button', { name: 'Tak, przywróć' }),
    )

    expect(
      within(guide).getByRole('status'),
    ).toHaveTextContent('Dane demo wróciły do stanu początkowego.')
    expect(
      within(guide).queryByRole('group', {
        name: 'Potwierdzenie resetu danych demo',
      }),
    ).not.toBeInTheDocument()
  })

  it('odczytuje istniejącą kartkę Leny kodem demo 2026', async () => {
    const user = userEvent.setup()
    renderApp('/people/person-lena')

    await user.click(screen.getByRole('button', { name: /Odczytaj kartkę/i }))
    const lockPanel = (
      await screen.findByRole('heading', { name: 'Twoja kartka czeka, Lena' })
    ).closest('section')
    expect(lockPanel).not.toBeNull()

    await user.type(within(lockPanel!).getByLabelText('Kod demo'), '2026')
    await user.click(within(lockPanel!).getByRole('button', { name: 'Otwórz kartkę' }))

    expect(
      await screen.findByRole('heading', { name: 'Dobre słowa od zespołu' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Za spokój, z którym porządkujesz nawet najbardziej poplątany temat/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Maks')).toBeInTheDocument()
  })

  it('dodaje kompletne, nieduplikujące się życzenia i pokazuje je na kartce', async () => {
    const user = userEvent.setup()
    renderApp('/people/person-lena')

    await user.click(screen.getByRole('button', { name: 'Dodaj życzenia' }))
    await user.selectOptions(
      screen.getByLabelText('Autor życzeń'),
      'person-nina',
    )
    await user.type(screen.getByLabelText('Kod demo'), '2026')
    await user.click(screen.getByRole('button', { name: 'Potwierdź autora' }))

    const appreciation =
      'Za energię, dzięki której nawet trudne rozmowy kończą się dobrym pomysłem.'
    const wish =
      'Życzę Ci spokojnego roku, wielu podróży i czasu na najważniejsze projekty.'

    await user.type(screen.getByLabelText('Za co Cię cenimy'), appreciation)
    await user.type(screen.getByLabelText('Czego Ci życzymy'), wish)
    await user.click(
      screen.getByRole('button', { name: 'Dodaj do kartki' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Życzenia są już na kartce' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Odczytaj kartkę' }))
    await user.type(await screen.findByLabelText('Kod demo'), '2026')
    await user.click(screen.getByRole('button', { name: 'Otwórz kartkę' }))

    expect(await screen.findByText(appreciation)).toBeInTheDocument()
    expect(screen.getByText(wish)).toBeInTheDocument()
    expect(screen.getByText('Nina')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})
