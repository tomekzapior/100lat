import { useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronLeft, LockKeyhole, Send } from 'lucide-react'
import { useDemoData } from '../../data/demoDataStore'
import { isValidMemberCode, DEMO_MEMBER_CODE } from '../../lib/demoCredentials'
import { formatBirthday, getCelebrationYear, getNextBirthday } from '../../lib/dates'
import { SIGNATURE_OPTIONS, signaturePreview } from '../../lib/signatures'
import { hasErrors, validateWish, type FieldErrors } from '../../lib/validation'
import type { Person, SignatureStyle } from '../../types/domain'

type Step = 'identity' | 'confirm' | 'content' | 'duplicate' | 'success'
type ConfirmationReason = 'self' | 'early'

interface WishComposerProps {
  recipient: Person
  onClose: () => void
  onReadWishes: () => void
}

export function WishComposer({ recipient, onClose, onReadWishes }: WishComposerProps) {
  const { people, wishes, addWish } = useDemoData()
  const [step, setStep] = useState<Step>('identity')
  const [confirmationReason, setConfirmationReason] = useState<ConfirmationReason>('early')
  const [authorId, setAuthorId] = useState('')
  const [code, setCode] = useState('')
  const [appreciationText, setAppreciationText] = useState('')
  const [wishText, setWishText] = useState('')
  const [signatureStyle, setSignatureStyle] = useState<SignatureStyle>('nickname')
  const [errors, setErrors] = useState<FieldErrors<'authorId' | 'code' | 'appreciationText' | 'wishText'>>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const id = useId()

  const activePeople = useMemo(
    () => people.filter((person) => person.isActive).sort((a, b) => a.name.localeCompare(b.name, 'pl')),
    [people],
  )
  const author = people.find((person) => person.id === authorId)
  const daysUntil = getNextBirthday(recipient.birthdayMd).days

  function clearFieldError(
    field: 'authorId' | 'code' | 'appreciationText' | 'wishText',
  ) {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    setSubmitError('')
  }

  function verifyIdentity(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!authorId) nextErrors.authorId = 'Wybierz autora życzeń.'
    if (!isValidMemberCode(code)) nextErrors.code = `Kod demo ma wartość ${DEMO_MEMBER_CODE}.`
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    const duplicate = wishes.some(
      (wish) =>
        wish.authorId === authorId &&
        wish.recipientId === recipient.id &&
        wish.wishYear === getCelebrationYear(recipient.birthdayMd),
    )
    if (duplicate) {
      setStep('duplicate')
      return
    }
    if (authorId === recipient.id) {
      setConfirmationReason('self')
      setStep('confirm')
      return
    }
    if (daysUntil > 0) {
      setConfirmationReason('early')
      setStep('confirm')
      return
    }
    setStep('content')
  }

  function submitWish(event: React.FormEvent) {
    event.preventDefault()
    const input = {
      recipientId: recipient.id,
      authorId,
      appreciationText,
      wishText,
      signatureStyle,
    }
    const nextErrors = validateWish(input)
    setErrors(nextErrors)
    setSubmitError('')
    if (hasErrors(nextErrors)) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    setIsSubmitting(true)
    try {
      addWish({
        ...input,
        appreciationText: appreciationText.trim(),
        wishText: wishText.trim(),
      })
      setStep('success')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Nie udało się zapisać życzeń. Spróbuj ponownie.')
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'success') {
    return (
      <section className="wish-panel wish-panel--success" aria-labelledby={`${id}-success-title`}>
        <div className="success-seal" aria-hidden="true">Zapisane</div>
        <div>
          <p className="eyebrow">Kartka uzupełniona</p>
          <h2 id={`${id}-success-title`}>Życzenia są już na kartce</h2>
          <p className="supporting-copy">
            Podpis: {signaturePreview(author, signatureStyle)}. {recipient.nickname} przeczyta
            je na swoim profilu, a w demo wszystko zostaje w tej przeglądarce.
          </p>
        </div>
        <div className="button-row">
          <button className="button button--primary" type="button" onClick={onClose}>
            Wróć do profilu
          </button>
          <button className="button button--ghost" type="button" onClick={onReadWishes}>
            Odczytaj kartkę
          </button>
        </div>
      </section>
    )
  }

  if (step === 'duplicate') {
    return (
      <section className="wish-panel" aria-labelledby={`${id}-duplicate-title`}>
        <p className="eyebrow">Życzenia już zapisane</p>
        <h2 id={`${id}-duplicate-title`}>Ta kartka ma już Twój wpis</h2>
        <p className="supporting-copy">
          Ta osoba podpisała już tegoroczną kartkę. Każdy zostawia na niej
          jeden wpis w roku.
        </p>
        <div className="button-row">
          <button className="button button--secondary" type="button" onClick={() => setStep('identity')}>
            <ChevronLeft aria-hidden="true" size={18} />
            Wybierz inną osobę
          </button>
          <button className="button button--ghost" type="button" onClick={onClose}>
            Wróć do profilu
          </button>
        </div>
      </section>
    )
  }

  if (step === 'confirm') {
    const self = confirmationReason === 'self'
    return (
      <section className="wish-panel" aria-labelledby={`${id}-confirm-title`}>
        <p className="eyebrow">Jeszcze jedno sprawdzenie</p>
        <h2 id={`${id}-confirm-title`}>
          {self ? 'Piszesz życzenia dla siebie' : `Urodziny są ${formatBirthday(recipient.birthdayMd)}`}
        </h2>
        <p className="supporting-copy">
          {self
            ? 'W demo możesz przejść tę ścieżkę, żeby zobaczyć cały proces. W firmowej wersji tę zasadę ustala zespół.'
            : 'Kartkę możesz podpisać już teraz, a życzenia poczekają na swój dzień. Możesz też wrócić do kalendarza.'}
        </p>
        <div className="button-row">
          <button className="button button--primary" type="button" onClick={() => setStep('content')}>
            Kontynuuj
          </button>
          <button className="button button--ghost" type="button" onClick={() => setStep('identity')}>
            Zmień autora
          </button>
          <button className="button button--ghost" type="button" onClick={onClose}>
            Wróć do profilu
          </button>
        </div>
      </section>
    )
  }

  if (step === 'content') {
    return (
      <section className="wish-panel" aria-labelledby={`${id}-content-title`}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Krok 2 z 2</p>
            <h2 id={`${id}-content-title`}>Napisz kilka dobrych słów</h2>
          </div>
          <button className="button button--ghost button--compact" type="button" onClick={() => setStep('identity')}>
            <ChevronLeft aria-hidden="true" size={18} />
            Autor
          </button>
        </div>

        {(hasErrors(errors) || submitError) && (
          <div className="form-summary form-summary--error" ref={errorSummaryRef} tabIndex={-1} role="alert">
            <strong>Sprawdź formularz.</strong>
            <span>{submitError || 'Dwa pola potrzebują co najmniej 10 znaków.'}</span>
          </div>
        )}

        <form className="form-stack" onSubmit={submitWish} noValidate>
          <div className="field">
            <label htmlFor={`${id}-appreciation`}>Za co Cię cenimy</label>
            <textarea
              id={`${id}-appreciation`}
              value={appreciationText}
              onChange={(event) => {
                setAppreciationText(event.target.value)
                clearFieldError('appreciationText')
              }}
              aria-describedby={errors.appreciationText ? `${id}-appreciation-error` : `${id}-appreciation-help`}
              aria-invalid={Boolean(errors.appreciationText)}
              maxLength={500}
              rows={4}
              placeholder="Na przykład: Za spokój, z którym porządkujesz trudne tematy."
            />
            <div className="field-meta">
              <span id={`${id}-appreciation-help`}>10-500 znaków</span>
              <span>{appreciationText.length}/500</span>
            </div>
            {errors.appreciationText && <p className="field-error" id={`${id}-appreciation-error`}>{errors.appreciationText}</p>}
          </div>

          <div className="field">
            <label htmlFor={`${id}-wish`}>Czego Ci życzymy</label>
            <textarea
              id={`${id}-wish`}
              value={wishText}
              onChange={(event) => {
                setWishText(event.target.value)
                clearFieldError('wishText')
              }}
              aria-describedby={errors.wishText ? `${id}-wish-error` : `${id}-wish-help`}
              aria-invalid={Boolean(errors.wishText)}
              maxLength={500}
              rows={4}
              placeholder="Na przykład: Dużo czasu na własne pomysły i kilka dobrych zaskoczeń."
            />
            <div className="field-meta">
              <span id={`${id}-wish-help`}>10-500 znaków</span>
              <span>{wishText.length}/500</span>
            </div>
            {errors.wishText && <p className="field-error" id={`${id}-wish-error`}>{errors.wishText}</p>}
          </div>

          <fieldset className="choice-group">
            <legend>Podpiszę się jako</legend>
            {SIGNATURE_OPTIONS.map((option) => (
              <label className="radio-card" key={option.value}>
                <input
                  type="radio"
                  name="signature"
                  value={option.value}
                  checked={signatureStyle === option.value}
                  onChange={() => setSignatureStyle(option.value)}
                />
                <span>{option.label}</span>
                <small>{signaturePreview(author, option.value)}</small>
              </label>
            ))}
          </fieldset>

          <button className="button button--primary button--wide" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            <Send aria-hidden="true" size={18} />
            {isSubmitting ? 'Zapisuję życzenia…' : 'Dodaj do kartki'}
          </button>
          <button className="button button--ghost button--wide" type="button" onClick={onClose}>
            Anuluj i wróć do profilu
          </button>
        </form>
      </section>
    )
  }

  return (
    <section className="wish-panel" aria-labelledby={`${id}-identity-title`}>
      <p className="eyebrow">Krok 1 z 2</p>
      <h2 id={`${id}-identity-title`}>Kto podpisuje życzenia?</h2>
      <p className="supporting-copy">Wybierz, kim jesteś w fikcyjnym zespole, i potwierdź jawnym kodem demo. Treść zostaje w tej przeglądarce.</p>

      {hasErrors(errors) && (
        <div className="form-summary form-summary--error" ref={errorSummaryRef} tabIndex={-1} role="alert">
          <strong>Nie udało się potwierdzić autora.</strong>
          <span>Wybierz osobę i sprawdź kod demo.</span>
        </div>
      )}

      <form className="form-stack" onSubmit={verifyIdentity} noValidate>
        <div className="field">
          <label htmlFor={`${id}-author`}>Autor życzeń</label>
          <select
            id={`${id}-author`}
            value={authorId}
            onChange={(event) => {
              setAuthorId(event.target.value)
              clearFieldError('authorId')
            }}
            aria-invalid={Boolean(errors.authorId)}
            aria-describedby={errors.authorId ? `${id}-author-error` : undefined}
          >
            <option value="">Wybierz osobę</option>
            {activePeople.map((person) => <option value={person.id} key={person.id}>{person.name} ({person.nickname})</option>)}
          </select>
          {errors.authorId && <p className="field-error" id={`${id}-author-error`}>{errors.authorId}</p>}
        </div>

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
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, '').slice(0, 4))
                clearFieldError('code')
              }}
              aria-invalid={Boolean(errors.code)}
              aria-describedby={errors.code ? `${id}-code-error` : `${id}-code-help`}
              placeholder={DEMO_MEMBER_CODE}
            />
          </div>
          <p className="field-help" id={`${id}-code-help`}>Kod dla wszystkich osób w tym publicznym demo: <strong>{DEMO_MEMBER_CODE}</strong></p>
          {errors.code && <p className="field-error" id={`${id}-code-error`}>{errors.code}</p>}
        </div>

        <button className="button button--primary button--wide" type="submit">
          <Check aria-hidden="true" size={18} />
          Potwierdź autora
        </button>
        <button className="button button--ghost button--wide" type="button" onClick={onClose}>
          Anuluj i wróć do profilu
        </button>
      </form>
    </section>
  )
}
