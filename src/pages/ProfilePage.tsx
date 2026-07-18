import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, BookOpen, CalendarDays, CakeSlice, PenLine } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Fireworks } from '../components/Fireworks'
import { PersonAvatar } from '../components/PersonAvatar'
import { useDemoData } from '../data/demoDataStore'
import { WishComposer } from '../features/wishes/WishComposer'
import { WishesReader } from '../features/wishes/WishesReader'
import {
  formatBirthday,
  formatDistanceToBirthday,
  getCelebrationYear,
  getNextBirthday,
  normalizeSearch,
} from '../lib/dates'

type ProfileMode = 'write' | 'read' | null

export function ProfilePage() {
  const { personId } = useParams()
  const { people, wishes } = useDemoData()
  const [mode, setMode] = useState<ProfileMode>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const writeButtonRef = useRef<HTMLButtonElement>(null)
  const readButtonRef = useRef<HTMLButtonElement>(null)
  const person = people.find((candidate) => candidate.id === personId && candidate.isActive)

  useEffect(() => {
    if (!mode) return
    requestAnimationFrame(() => {
      const reduceMotion =
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      flowRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
      flowRef.current?.focus({ preventScroll: true })
    })
  }, [mode])

  function closeFlow() {
    const returnTarget = mode === 'write' ? writeButtonRef.current : readButtonRef.current
    setMode(null)
    requestAnimationFrame(() => returnTarget?.focus())
  }

  if (!person) {
    return (
      <div className="page-shell narrow-page">
        <div className="empty-state empty-state--page">
          <span className="stamp">404</span>
          <h1>Nie znaleźliśmy tej osoby</h1>
          <p>Profil mógł zostać wyłączony w panelu demo.</p>
          <Link className="button button--primary" to="/">
            <ArrowLeft aria-hidden="true" size={18} />
            Wróć do kalendarza
          </Link>
        </div>
      </div>
    )
  }

  const birthday = getNextBirthday(person.birthdayMd)
  const celebrationYear = getCelebrationYear(person.birthdayMd)
  const wishCount = wishes.filter(
    (wish) => wish.recipientId === person.id && wish.wishYear === celebrationYear,
  ).length
  const isToday = birthday.days === 0
  const firstName = person.name.split(/\s+/)[0] ?? ''
  const hasDistinctNickname =
    normalizeSearch(person.nickname) !== normalizeSearch(firstName)

  return (
    <div className="page-shell profile-page">
      <Fireworks active={isToday} />

      <div className="profile-page__topbar">
        <Link className="back-link" to="/">
          <ArrowLeft aria-hidden="true" size={18} />
          Kalendarz
        </Link>
        <aside className="profile-demo-note" aria-label="Informacja o wersji demonstracyjnej">
          <strong>Portfolio demo</strong>
          <span>fikcyjne dane · zapis lokalny</span>
        </aside>
      </div>

      <article className={`profile-card ${isToday ? 'profile-card--today' : ''}`}>
        <div className="profile-card__portrait">
          <span className="registration-dot registration-dot--one" aria-hidden="true" />
          <span className="registration-dot registration-dot--two" aria-hidden="true" />
          <PersonAvatar person={person} className="profile-avatar" />
          {isToday && <span className="birthday-sticker">Dziś!</span>}
        </div>

        <div className="profile-card__content">
          <p className="eyebrow">
            {isToday ? 'Świętujemy dzisiaj' : 'Nadchodzące urodziny'}
          </p>
          <h1>{person.name}</h1>
          {hasDistinctNickname && (
            <p className="profile-nickname">dla znajomych: {person.nickname}</p>
          )}
          <p className="profile-about">{person.about}</p>

          <dl className="birthday-facts">
            <div>
              <dt>
                <CalendarDays aria-hidden="true" size={18} />
                Data
              </dt>
              <dd>
                <time dateTime={`--${person.birthdayMd}`}>
                  {formatBirthday(person.birthdayMd)}
                </time>
              </dd>
            </div>
            <div>
              <dt>
                <CakeSlice aria-hidden="true" size={18} />
                Do urodzin
              </dt>
              <dd>{formatDistanceToBirthday(birthday.days)}</dd>
            </div>
          </dl>

          <div className="profile-actions" aria-label="Działania dla profilu">
            <button
              ref={writeButtonRef}
              className="button button--primary"
              type="button"
              onClick={() => setMode('write')}
              aria-pressed={mode === 'write'}
            >
              <PenLine aria-hidden="true" size={18} />
              Dodaj życzenia
            </button>
            <button
              ref={readButtonRef}
              className="button button--secondary"
              type="button"
              onClick={() => setMode('read')}
              aria-pressed={mode === 'read'}
            >
              <BookOpen aria-hidden="true" size={18} />
              Odczytaj kartkę
              <span className="count-badge" aria-label={`${wishCount} wpisów`}>
                {wishCount}
              </span>
            </button>
          </div>
        </div>
      </article>

      <div
        className="profile-flow"
        ref={flowRef}
        role={mode ? 'region' : undefined}
        aria-label={
          mode === 'write'
            ? 'Formularz dodawania życzeń'
            : mode === 'read'
              ? 'Kartka z życzeniami'
              : undefined
        }
        tabIndex={mode ? -1 : undefined}
      >
        {mode === 'write' && (
          <WishComposer
            recipient={person}
            onClose={closeFlow}
            onReadWishes={() => setMode('read')}
          />
        )}
        {mode === 'read' && (
          <WishesReader recipient={person} onClose={closeFlow} />
        )}
      </div>
    </div>
  )
}

export default ProfilePage
