import { useId, useMemo, useRef, useState } from 'react'
import { BookOpen, ChevronLeft, LockKeyhole } from 'lucide-react'
import { useDemoData } from '../../data/demoDataStore'
import { DEMO_MEMBER_CODE, isValidMemberCode } from '../../lib/demoCredentials'
import { getCelebrationYear } from '../../lib/dates'
import type { Person } from '../../types/domain'

interface WishesReaderProps {
  recipient: Person
  onClose: () => void
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function WishesReader({ recipient, onClose }: WishesReaderProps) {
  const { wishes } = useDemoData()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const errorRef = useRef<HTMLDivElement>(null)
  const id = useId()

  const celebrationYear = getCelebrationYear(recipient.birthdayMd)
  const recipientWishes = useMemo(
    () =>
      wishes
        .filter(
          (wish) =>
            wish.recipientId === recipient.id && wish.wishYear === celebrationYear,
        )
        .sort(
          (first, second) =>
            new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
        ),
    [celebrationYear, recipient.id, wishes],
  )

  function unlock(event: React.FormEvent) {
    event.preventDefault()
    if (!isValidMemberCode(code)) {
      setError(`Wpisz kod demo: ${DEMO_MEMBER_CODE}.`)
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    setError('')
    setIsUnlocked(true)
  }

  if (!isUnlocked) {
    return (
      <section className="wish-panel wish-reader-lock" aria-labelledby={`${id}-title`}>
        <div className="lock-mark" aria-hidden="true">
          <LockKeyhole size={28} />
        </div>
        <div>
          <p className="eyebrow">Prywatna kartka</p>
          <h2 id={`${id}-title`}>Twoja kartka czeka, {recipient.nickname}</h2>
          <p className="supporting-copy">
            Życzenia widzi tylko solenizant. W tym demo zamiast logowania
            wystarczy jawny kod, a wszystkie wpisy są fikcyjne.
          </p>
        </div>

        {error && (
          <div
            className="form-summary form-summary--error"
            ref={errorRef}
            tabIndex={-1}
            role="alert"
          >
            <strong>Nie udało się otworzyć kartki.</strong>
            <span>{error}</span>
          </div>
        )}

        <form className="form-stack" onSubmit={unlock} noValidate>
          <div className="field">
            <label htmlFor={`${id}-code`}>Kod demo</label>
            <div className="input-with-icon">
              <LockKeyhole aria-hidden="true" size={18} />
              <input
                id={`${id}-code`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, '').slice(0, 4))
                }
                aria-invalid={Boolean(error)}
                aria-describedby={`${id}-code-help`}
                placeholder={DEMO_MEMBER_CODE}
                autoFocus
              />
            </div>
            <p className="field-help" id={`${id}-code-help`}>
              Kod publicznego demo: <strong>{DEMO_MEMBER_CODE}</strong>
            </p>
          </div>
          <div className="button-row">
            <button className="button button--primary" type="submit">
              <BookOpen aria-hidden="true" size={18} />
              Otwórz kartkę
            </button>
            <button className="button button--ghost" type="button" onClick={onClose}>
              Anuluj
            </button>
          </div>
        </form>
      </section>
    )
  }

  return (
    <section className="wish-panel wish-reader" aria-labelledby={`${id}-reader-title`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Kartka · {celebrationYear}</p>
          <h2 id={`${id}-reader-title`}>
            Dobre słowa od zespołu
          </h2>
        </div>
        <button
          className="button button--ghost button--compact"
          type="button"
          onClick={onClose}
        >
          <ChevronLeft aria-hidden="true" size={18} />
          Profil
        </button>
      </div>

      {recipientWishes.length === 0 ? (
        <div className="empty-state">
          <BookOpen aria-hidden="true" size={28} />
          <h3>Ta kartka czeka na pierwszy wpis</h3>
          <p>Życzenia dodane w demo pojawią się tutaj od razu.</p>
        </div>
      ) : (
        <ol className="wish-notes" aria-label="Życzenia urodzinowe">
          {recipientWishes.map((wish, index) => (
            <li className="wish-note" key={wish.id}>
              <span className="wish-note__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="wish-note__body">
                <p className="wish-note__label">Cenimy Cię</p>
                <p>{wish.appreciationText}</p>
                <p className="wish-note__label">Życzymy Ci</p>
                <p>{wish.wishText}</p>
                <footer>
                  <strong>{wish.signatureLabel}</strong>
                  <time dateTime={wish.createdAt}>
                    {dateFormatter.format(new Date(wish.createdAt))}
                  </time>
                </footer>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
