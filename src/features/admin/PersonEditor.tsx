import {
  CalendarDays,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { PersonAvatar } from '../../components/PersonAvatar'
import { formatBirthday, isValidMonthDay } from '../../lib/dates'
import {
  hasErrors,
  validatePerson,
  type FieldErrors,
} from '../../lib/validation'
import type { AvatarTone, Person, PersonInput } from '../../types/domain'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const AVATAR_TARGET_EDGE = 512
const MAX_STORED_AVATAR_CHARS = 220_000

async function compressAvatar(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const candidate = new Image()
      candidate.onload = () => resolve(candidate)
      candidate.onerror = () => reject(new Error('image-load'))
      candidate.src = objectUrl
    })

    const longestEdge = Math.max(image.naturalWidth, image.naturalHeight)
    if (!longestEdge) throw new Error('image-empty')
    const scale = Math.min(1, AVATAR_TARGET_EDGE / longestEdge)
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('canvas')
    context.fillStyle = '#fff9ed'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    let quality = 0.85
    let dataUrl = canvas.toDataURL('image/jpeg', quality)
    while (dataUrl.length > MAX_STORED_AVATAR_CHARS && quality > 0.4) {
      quality -= 0.15
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }
    if (dataUrl.length > MAX_STORED_AVATAR_CHARS) throw new Error('image-too-big')
    return dataUrl
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

const toneOptions: Array<{ value: AvatarTone; label: string }> = [
  { value: 'berry', label: 'Malinowy' },
  { value: 'sun', label: 'Słoneczny' },
  { value: 'mint', label: 'Miętowy' },
  { value: 'sky', label: 'Błękitny' },
  { value: 'plum', label: 'Śliwkowy' },
]

type PersonField = 'name' | 'nickname' | 'birthdayMd' | 'about'

const fieldLabels: Record<PersonField, string> = {
  name: 'Imię i nazwisko',
  nickname: 'Nazwa wyświetlana',
  birthdayMd: 'Data urodzin',
  about: 'Krótki opis',
}

const emptyPerson: PersonInput = {
  name: '',
  nickname: '',
  birthdayMd: '',
  about: '',
  avatarTone: 'berry',
  isAdmin: false,
}

function inputFromPerson(person?: Person | null): PersonInput {
  if (!person) return { ...emptyPerson }
  return {
    name: person.name,
    nickname: person.nickname,
    birthdayMd: person.birthdayMd,
    about: person.about,
    avatarUrl: person.avatarUrl,
    avatarTone: person.avatarTone,
    isAdmin: person.isAdmin,
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Nie udało się zapisać profilu. Spróbuj ponownie.'
}

export interface PersonEditorProps {
  person?: Person | null
  onSave: (input: PersonInput) => void
  onCancel: () => void
}

export function PersonEditor({ person, onSave, onCancel }: PersonEditorProps) {
  const [form, setForm] = useState<PersonInput>(() => inputFromPerson(person))
  const [errors, setErrors] = useState<FieldErrors<PersonField>>({})
  const [uploadError, setUploadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [imageMeta, setImageMeta] = useState<{
    name: string
    size: number
  } | null>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTokenRef = useRef(0)
  const formId = useId()

  const isEditing = Boolean(person)
  const errorEntries = (
    Object.entries(errors) as Array<[PersonField, string | undefined]>
  ).filter((entry): entry is [PersonField, string] => entry[1] !== undefined)
  const activeTone =
    toneOptions.find((tone) => tone.value === form.avatarTone)?.label ??
    'Kolor profilu'
  const previewBirthday = isValidMonthDay(form.birthdayMd)
    ? formatBirthday(form.birthdayMd)
    : 'Data do uzupełnienia'

  useEffect(() => {
    uploadTokenRef.current += 1
    setForm(inputFromPerson(person))
    setErrors({})
    setUploadError('')
    setSaveError('')
    setImageMeta(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [person])

  useEffect(
    () => () => {
      uploadTokenRef.current += 1
    },
    [],
  )

  function updateField<Key extends keyof PersonInput>(
    key: Key,
    value: PersonInput[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaveError('')
    if (key in errors) {
      setErrors((current) => {
        const next = { ...current }
        delete next[key as PersonField]
        return next
      })
    }
  }

  function validateField(field: PersonField) {
    const nextError = validatePerson(form)[field]
    setErrors((current) => {
      const next = { ...current }
      if (nextError) next[field] = nextError
      else delete next[field]
      return next
    })
  }

  function focusErrorSummary() {
    window.requestAnimationFrame(() => errorSummaryRef.current?.focus())
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const token = ++uploadTokenRef.current
    setUploadError('')
    setSaveError('')

    if (!file.type.startsWith('image/')) {
      setImageMeta(null)
      setUploadError('Wybierz plik graficzny w formacie image/*.')
      event.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageMeta(null)
      setUploadError('Zdjęcie może mieć maksymalnie 2 MB.')
      event.target.value = ''
      return
    }

    compressAvatar(file)
      .then((dataUrl) => {
        if (token !== uploadTokenRef.current) return
        setForm((current) => ({ ...current, avatarUrl: dataUrl }))
        setImageMeta({
          name: file.name,
          size: Math.round(dataUrl.length * 0.75),
        })
      })
      .catch(() => {
        if (token !== uploadTokenRef.current) return
        setImageMeta(null)
        setUploadError('Nie udało się przetworzyć zdjęcia. Wybierz inny plik.')
      })
  }

  function removeImage() {
    uploadTokenRef.current += 1
    setForm((current) => ({ ...current, avatarUrl: undefined }))
    setUploadError('')
    setImageMeta(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validatePerson(form)
    setErrors(nextErrors)
    setSaveError('')

    if (hasErrors(nextErrors) || uploadError) {
      focusErrorSummary()
      return
    }

    try {
      onSave({
        ...form,
        name: form.name.trim(),
        nickname: form.nickname.trim(),
        birthdayMd: form.birthdayMd.trim(),
        about: form.about.trim(),
      })
    } catch (error) {
      setSaveError(errorMessage(error))
      focusErrorSummary()
    }
  }

  return (
    <section className="person-editor" aria-labelledby={`${formId}-title`}>
      <div className="person-editor__heading">
        <div>
          <p className="eyebrow">Profil zespołu</p>
          <h2 data-editor-heading id={`${formId}-title`} tabIndex={-1}>
            {isEditing ? `Edytuj: ${person?.nickname}` : 'Dodaj osobę'}
          </h2>
          <p className="person-editor__intro">
            Rok urodzenia i dane kontaktowe nie są zbierane. Wszystkie zmiany
            zostają tylko w tej sesji demo.
          </p>
        </div>
        <button
          type="button"
          className="button button--ghost person-editor__close"
          onClick={onCancel}
          aria-label="Zamknij edycję profilu"
        >
          <X aria-hidden="true" />
        </button>
      </div>

      <form className="person-editor__form" onSubmit={handleSubmit} noValidate>
        <aside className="person-editor__preview" aria-label="Podgląd profilu na żywo">
          <div className="person-editor__preview-kicker">
            <Sparkles aria-hidden="true" />
            Podgląd na żywo
          </div>
          <div className="person-editor__preview-avatar">
            <PersonAvatar person={form} size="lg" />
          </div>
          <div className="person-editor__preview-copy">
            <strong>{form.nickname.trim() || 'Nowa osoba'}</strong>
            <span>{form.name.trim() || 'Imię i nazwisko'}</span>
          </div>
          <div className="person-editor__preview-date">
            <CalendarDays aria-hidden="true" />
            <span>
              Urodziny
              <time
                dateTime={
                  isValidMonthDay(form.birthdayMd)
                    ? `--${form.birthdayMd}`
                    : undefined
                }
              >
                {previewBirthday}
              </time>
            </span>
          </div>
          <p className="person-editor__preview-story">
            {form.about.trim() ||
              'Tu pojawi się krótka historia, którą zobaczy zespół na profilu.'}
          </p>
          <div className="person-editor__preview-badges">
            <span>
              <i
                className={`tone-choice__swatch tone-choice__swatch--${form.avatarTone}`}
                aria-hidden="true"
              />
              {activeTone}
            </span>
            {form.isAdmin ? (
              <span>
                <ShieldCheck aria-hidden="true" />
                Admin demo
              </span>
            ) : null}
          </div>
        </aside>

        <div className="person-editor__sections">
        {(errorEntries.length > 0 || uploadError || saveError) && (
          <div
            ref={errorSummaryRef}
            className="form-error-summary"
            role="alert"
            tabIndex={-1}
          >
            <h3>Sprawdź formularz</h3>
            <ul>
              {errorEntries.map(([field, message]) => (
                <li key={field}>
                  <a href={`#${formId}-${field}`}>
                    {fieldLabels[field]}: {message}
                  </a>
                </li>
              ))}
              {uploadError && (
                <li>
                  <a href={`#${formId}-avatar`}>Zdjęcie: {uploadError}</a>
                </li>
              )}
              {saveError && <li>{saveError}</li>}
            </ul>
          </div>
        )}

          <section
            className="person-editor__section person-editor__section--basics"
            aria-labelledby={`${formId}-basics-title`}
          >
            <div className="person-editor__section-heading">
              <span aria-hidden="true">01</span>
              <div>
                <h3 id={`${formId}-basics-title`}>Dane profilu</h3>
                <p>To zobaczy zespół w kalendarzu i na stronie urodzinowej.</p>
              </div>
            </div>
            <div className="person-editor__section-content">
        <div className="person-editor__field-grid">
          <div className="field">
            <label htmlFor={`${formId}-name`}>Imię i nazwisko</label>
            <input
              id={`${formId}-name`}
              name="name"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              onBlur={() => validateField('name')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${formId}-name-error` : undefined}
              autoComplete="off"
              maxLength={80}
              required
            />
            {errors.name && (
              <span className="field__error" id={`${formId}-name-error`}>
                {errors.name}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor={`${formId}-nickname`}>Nazwa wyświetlana</label>
            <input
              id={`${formId}-nickname`}
              name="nickname"
              value={form.nickname}
              onChange={(event) => updateField('nickname', event.target.value)}
              onBlur={() => validateField('nickname')}
              aria-invalid={Boolean(errors.nickname)}
              aria-describedby={
                errors.nickname ? `${formId}-nickname-error` : undefined
              }
              autoComplete="off"
              maxLength={30}
              required
            />
            {errors.nickname && (
              <span className="field__error" id={`${formId}-nickname-error`}>
                {errors.nickname}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor={`${formId}-birthdayMd`}>Data urodzin</label>
            <input
              id={`${formId}-birthdayMd`}
              name="birthdayMd"
              value={form.birthdayMd}
              onChange={(event) => updateField('birthdayMd', event.target.value)}
              onBlur={() => validateField('birthdayMd')}
              aria-invalid={Boolean(errors.birthdayMd)}
              aria-describedby={
                errors.birthdayMd
                  ? `${formId}-birthdayMd-hint ${formId}-birthdayMd-error`
                  : `${formId}-birthdayMd-hint`
              }
              inputMode="numeric"
              placeholder="07-18"
              pattern="[0-9]{2}-[0-9]{2}"
              maxLength={5}
              required
            />
            <span className="field__hint" id={`${formId}-birthdayMd-hint`}>
              Format miesiąc-dzień, na przykład 07-18. Bez roku.
            </span>
            {errors.birthdayMd && (
              <span
                className="field__error"
                id={`${formId}-birthdayMd-error`}
              >
                {errors.birthdayMd}
              </span>
            )}
          </div>
        </div>

        <div className="field">
          <div className="field__label-row">
            <label htmlFor={`${formId}-about`}>Krótki opis</label>
            <span aria-hidden="true">{form.about.length}/240</span>
          </div>
          <textarea
            id={`${formId}-about`}
            name="about"
            rows={4}
            value={form.about}
            onChange={(event) => updateField('about', event.target.value)}
            onBlur={() => validateField('about')}
            aria-invalid={Boolean(errors.about)}
            aria-describedby={errors.about ? `${formId}-about-error` : undefined}
            maxLength={240}
          />
          {errors.about && (
            <span className="field__error" id={`${formId}-about-error`}>
              {errors.about}
            </span>
          )}
        </div>
            </div>
          </section>

          <section
            className="person-editor__section person-editor__section--appearance"
            aria-labelledby={`${formId}-appearance-title`}
          >
            <div className="person-editor__section-heading">
              <span aria-hidden="true">02</span>
              <div>
                <h3 id={`${formId}-appearance-title`}>Wygląd profilu</h3>
                <p>Kolor działa od razu; zdjęcie pozostaje tylko w przeglądarce.</p>
              </div>
            </div>
            <div className="person-editor__section-content person-editor__appearance-grid">
        <fieldset className="person-editor__tones">
          <legend>Kolor avatara</legend>
          <div className="tone-options">
            {toneOptions.map((tone) => (
              <label className="tone-choice" key={tone.value}>
                <input
                  type="radio"
                  name="avatarTone"
                  value={tone.value}
                  checked={form.avatarTone === tone.value}
                  onChange={() => updateField('avatarTone', tone.value)}
                />
                <span
                  className={`tone-choice__swatch tone-choice__swatch--${tone.value}`}
                  aria-hidden="true"
                />
                <span>{tone.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="person-editor__upload">
          <div className="person-editor__upload-heading">
            <ImagePlus aria-hidden="true" />
            <div>
              <h3>Własne zdjęcie</h3>
              <p>Opcjonalne. Plik image/* do 2 MB; przed zapisem zmniejszamy go lokalnie, nic nie opuszcza przeglądarki.</p>
            </div>
          </div>
          <div className="person-editor__upload-actions">
            <label
              className="button button--secondary"
              htmlFor={`${formId}-avatar`}
            >
              <Upload aria-hidden="true" />
              {form.avatarUrl ? 'Zmień zdjęcie' : 'Wybierz zdjęcie'}
            </label>
            <input
              ref={fileInputRef}
              className="visually-hidden"
              id={`${formId}-avatar`}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              aria-invalid={Boolean(uploadError)}
              aria-describedby={
                uploadError ? `${formId}-avatar-error` : `${formId}-avatar-hint`
              }
            />
            {form.avatarUrl && (
              <button
                type="button"
                className="button button--ghost"
                onClick={removeImage}
              >
                <Trash2 aria-hidden="true" />
                Usuń zdjęcie
              </button>
            )}
          </div>
          {imageMeta && (
            <p className="person-editor__file-meta" role="status">
              <strong>{imageMeta.name}</strong>
              <span>{Math.ceil(imageMeta.size / 1024)} KB po kompresji · gotowe do podglądu</span>
            </p>
          )}
          <span className="field__hint" id={`${formId}-avatar-hint`}>
            Po wybraniu zobaczysz lokalny podgląd w avatarze powyżej.
          </span>
          {uploadError && (
            <span className="field__error" id={`${formId}-avatar-error`}>
              {uploadError}
            </span>
          )}
        </div>
            </div>
          </section>

          <section
            className="person-editor__section person-editor__section--access"
            aria-labelledby={`${formId}-access-title`}
          >
            <div className="person-editor__section-heading">
              <span aria-hidden="true">03</span>
              <div>
                <h3 id={`${formId}-access-title`}>Dostęp</h3>
                <p>Rola administracyjna dotyczy wyłącznie tego publicznego demo.</p>
              </div>
            </div>
            <div className="person-editor__section-content">
        <label className="person-editor__admin-toggle">
          <input
            type="checkbox"
            checked={form.isAdmin}
            onChange={(event) => updateField('isAdmin', event.target.checked)}
          />
          <ShieldCheck aria-hidden="true" />
          <span>
            <strong>Administrator demo</strong>
            <small>Ta rola może zarządzać fikcyjnym zespołem.</small>
          </span>
        </label>
            </div>
          </section>
        </div>

        <div className="person-editor__actions">
          <button type="submit" className="button button--primary">
            {isEditing ? 'Zapisz zmiany' : 'Dodaj osobę'}
          </button>
          <button type="button" className="button button--ghost" onClick={onCancel}>
            Anuluj
          </button>
        </div>
      </form>
    </section>
  )
}

export default PersonEditor
