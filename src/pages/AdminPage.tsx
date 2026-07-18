import {
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Undo2,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PersonAvatar } from '../components/PersonAvatar'
import { useDemoData } from '../data/demoDataStore'
import { AdminGate } from '../features/admin/AdminGate'
import { PersonEditor } from '../features/admin/PersonEditor'
import { ReminderPreview } from '../features/admin/ReminderPreview'
import { ResetConfirmPanel } from '../features/admin/ResetConfirmPanel'
import {
  compareByNextBirthday,
  formatBirthday,
  getNextBirthday,
} from '../lib/dates'
import type { Person, PersonInput } from '../types/domain'

type EditorState = { kind: 'new' } | { kind: 'edit'; id: string } | null
type InlinePanel = 'reminder' | 'reset' | null

interface Notice {
  kind: 'success' | 'error'
  message: string
  undoId?: string
}

interface AdminPersonRowProps {
  person: Person
  isHidden?: boolean
  isSelected?: boolean
  onEdit: (person: Person, trigger: HTMLButtonElement) => void
  onDeactivate: (person: Person) => void
  onRestore: (person: Person) => void
}

function AdminPersonRow({
  person,
  isHidden = false,
  isSelected = false,
  onEdit,
  onDeactivate,
  onRestore,
}: AdminPersonRowProps) {
  return (
    <li
      className={[
        'admin-person-row',
        isHidden ? 'admin-person-row--hidden' : '',
        isSelected ? 'admin-person-row--selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-current={isSelected ? 'true' : undefined}
    >
      <div className="admin-person-row__identity">
        <PersonAvatar person={person} size="sm" />
        <div>
          <strong>{person.nickname}</strong>
          <span>{person.name}</span>
        </div>
      </div>

      <div className="admin-person-row__meta">
        <time dateTime={`--${person.birthdayMd}`}>
          {formatBirthday(person.birthdayMd)}
        </time>
        {person.isAdmin && (
          <span className="admin-badge">
            <ShieldCheck aria-hidden="true" />
            Admin
          </span>
        )}
        {isHidden && <span className="admin-badge admin-badge--muted">Ukryty</span>}
      </div>

      <div className="admin-person-row__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={(event) => onEdit(person, event.currentTarget)}
          aria-label={`Edytuj profil: ${person.name}`}
          aria-pressed={isSelected}
        >
          <Pencil aria-hidden="true" />
          Edytuj
        </button>
        {isHidden ? (
          <button
            type="button"
            className="button button--secondary"
            onClick={() => onRestore(person)}
          >
            <Eye aria-hidden="true" />
            Przywróć
          </button>
        ) : (
          <button
            type="button"
            className="button button--ghost"
            onClick={() => onDeactivate(person)}
          >
            <EyeOff aria-hidden="true" />
            Ukryj
          </button>
        )}
      </div>
    </li>
  )
}

function readError(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Nie udało się wykonać tej operacji.'
}

export function AdminPage() {
  const {
    people,
    isLoading,
    addPerson,
    updatePerson,
    deactivatePerson,
    restorePerson,
    resetDemo,
  } = useDemoData()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [editor, setEditor] = useState<EditorState>(null)
  const [inlinePanel, setInlinePanel] = useState<InlinePanel>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const editorSlotRef = useRef<HTMLElement>(null)
  const editorTriggerRef = useRef<HTMLButtonElement | null>(null)

  const activePeople = useMemo(
    () => people.filter((person) => person.isActive),
    [people],
  )
  const hiddenPeople = useMemo(
    () => people.filter((person) => !person.isActive),
    [people],
  )
  const reminderPerson = useMemo(
    () =>
      [...people]
        .filter((person) => person.isActive)
        .sort((first, second) => compareByNextBirthday(first, second))[0],
    [people],
  )
  const editedPerson =
    editor?.kind === 'edit'
      ? people.find((person) => person.id === editor.id) ?? null
      : null
  const reminderDistance = reminderPerson
    ? getNextBirthday(reminderPerson.birthdayMd).days
    : null

  useEffect(() => {
    if (!editor) return
    window.requestAnimationFrame(() => {
      if (window.matchMedia?.('(max-width: 62rem)').matches ?? false) {
        const reduceMotion =
          window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
          false
        editorSlotRef.current?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        })
      }
      editorSlotRef.current
        ?.querySelector<HTMLElement>('[data-editor-heading]')
        ?.focus({ preventScroll: true })
    })
  }, [editor])

  function openEditor(
    nextEditor: EditorState,
    trigger?: HTMLButtonElement,
  ) {
    if (trigger) editorTriggerRef.current = trigger
    setEditor(nextEditor)
    setInlinePanel(null)
    setNotice(null)
  }

  function closeEditor() {
    setEditor(null)
    window.requestAnimationFrame(() => editorTriggerRef.current?.focus())
  }

  function savePerson(input: PersonInput) {
    if (!editor) return
    const saved =
      editor.kind === 'new'
        ? addPerson(input)
        : updatePerson(editor.id, input)
    closeEditor()
    setNotice({
      kind: 'success',
      message:
        editor.kind === 'new'
          ? `Profil ${saved.nickname} został dodany.`
          : `Zmiany w profilu ${saved.nickname} są zapisane.`,
    })
  }

  function hidePerson(person: Person) {
    try {
      deactivatePerson(person.id)
      if (editor?.kind === 'edit' && editor.id === person.id) setEditor(null)
      setNotice({
        kind: 'success',
        message: `Profil ${person.nickname} jest teraz ukryty.`,
        undoId: person.id,
      })
    } catch (error) {
      setNotice({ kind: 'error', message: readError(error) })
    }
  }

  function undoHide(id: string) {
    const person = people.find((item) => item.id === id)
    restorePerson(id)
    setNotice({
      kind: 'success',
      message: `Profil ${person?.nickname ?? 'osoby'} został przywrócony.`,
    })
  }

  function restoreHiddenPerson(person: Person) {
    restorePerson(person.id)
    setNotice({
      kind: 'success',
      message: `Profil ${person.nickname} znów jest widoczny.`,
    })
  }

  function confirmReset() {
    resetDemo()
    setEditor(null)
    setInlinePanel(null)
    setNotice({
      kind: 'success',
      message: 'Przywrócono początkowy zestaw danych demo.',
    })
  }

  if (!isUnlocked) {
    return <AdminGate onUnlock={() => setIsUnlocked(true)} />
  }

  if (isLoading) {
    return (
      <section className="admin-page admin-page--loading" aria-live="polite">
        <p className="eyebrow">Administrator demo</p>
        <h1>Przygotowujemy zespół…</h1>
      </section>
    )
  }

  return (
    <section className="admin-page" aria-labelledby="admin-page-title">
      <div className="admin-page__masthead">
        <header className="admin-page__header">
        <div>
          <p className="eyebrow">Administrator demo</p>
          <h1 id="admin-page-title">Zespół od kuchni</h1>
          <p>
            Wszystkie profile są fikcyjne. Każdą zmianę cofniesz jednym
            kliknięciem albo resetem demo.
          </p>
        </div>
        </header>

        <div className="admin-page__actions" aria-label="Działania administratora">
        <button
          type="button"
          className="button button--primary"
          onClick={(event) => openEditor({ kind: 'new' }, event.currentTarget)}
        >
          <Plus aria-hidden="true" />
          Dodaj profil
        </button>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            setInlinePanel('reminder')
            setEditor(null)
          }}
        >
          <Mail aria-hidden="true" />
          Podgląd e-maila
        </button>
        <button
          type="button"
          className="button button--ghost"
          onClick={() => {
            setInlinePanel('reset')
            setEditor(null)
          }}
        >
          <RotateCcw aria-hidden="true" />
          Reset demo
        </button>
        </div>
      </div>

      {notice && (
        <div
          className={`admin-notice admin-notice--${notice.kind}`}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          {notice.kind === 'success' ? (
            <CheckCircle2 aria-hidden="true" />
          ) : (
            <ShieldCheck aria-hidden="true" />
          )}
          <span>{notice.message}</span>
          {notice.undoId && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => undoHide(notice.undoId as string)}
            >
              <Undo2 aria-hidden="true" />
              Cofnij
            </button>
          )}
          <button
            type="button"
            className="button button--ghost admin-notice__close"
            onClick={() => setNotice(null)}
            aria-label="Zamknij komunikat"
          >
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      {inlinePanel === 'reminder' && (
        <ReminderPreview
          person={reminderPerson}
          distanceDays={reminderDistance}
          onClose={() => setInlinePanel(null)}
        />
      )}

      {inlinePanel === 'reset' && (
        <ResetConfirmPanel
          onConfirm={confirmReset}
          onCancel={() => setInlinePanel(null)}
        />
      )}

      <div
        className={`admin-page__workspace${editor ? ' admin-page__workspace--editing' : ''}`}
      >
        <section className="admin-page__directory" aria-labelledby="directory-title">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">Katalog</p>
              <h2 id="directory-title">Profile zespołu</h2>
            </div>
            <span className="admin-count">
              <Users aria-hidden="true" />
              {people.filter((person) => person.isActive).length} aktywnych
            </span>
          </div>

          <div className="admin-page__people-groups">
            <section aria-labelledby="active-people-title">
              <div className="admin-page__list-heading">
                <h3 id="active-people-title">Aktywne</h3>
                <span>{activePeople.length}</span>
              </div>
              {activePeople.length > 0 ? (
                <ul className="admin-page__people-list">
                  {activePeople.map((person) => (
                    <AdminPersonRow
                      key={person.id}
                      person={person}
                      isSelected={editor?.kind === 'edit' && editor.id === person.id}
                      onEdit={(selected, trigger) =>
                        openEditor({ kind: 'edit', id: selected.id }, trigger)
                      }
                      onDeactivate={hidePerson}
                      onRestore={restoreHiddenPerson}
                    />
                  ))}
                </ul>
              ) : (
                <div className="admin-empty">
                  <Users aria-hidden="true" />
                  <p>Nie ma teraz aktywnych profili.</p>
                </div>
              )}
            </section>

            <section aria-labelledby="hidden-people-title">
              <div className="admin-page__list-heading">
                <h3 id="hidden-people-title">Ukryte</h3>
                <span>{hiddenPeople.length}</span>
              </div>
              {hiddenPeople.length > 0 ? (
                <ul className="admin-page__people-list">
                  {hiddenPeople.map((person) => (
                    <AdminPersonRow
                      key={person.id}
                      person={person}
                      isHidden
                      isSelected={editor?.kind === 'edit' && editor.id === person.id}
                      onEdit={(selected, trigger) =>
                        openEditor({ kind: 'edit', id: selected.id }, trigger)
                      }
                      onDeactivate={hidePerson}
                      onRestore={restoreHiddenPerson}
                    />
                  ))}
                </ul>
              ) : (
                <p className="admin-empty admin-empty--compact">
                  Ukryte profile pojawią się tutaj i będzie można je przywrócić.
                </p>
              )}
            </section>
          </div>
        </section>

        <aside
          className="admin-page__editor-slot"
          aria-label="Panel roboczy"
          ref={editorSlotRef}
        >
          {editor ? (
            <PersonEditor
              person={editor.kind === 'edit' ? editedPerson : null}
              onSave={savePerson}
              onCancel={closeEditor}
            />
          ) : (
            <div className="admin-page__idle-panel">
              <div className="admin-page__idle-mark" aria-hidden="true">
                <Pencil />
              </div>
              <p className="eyebrow">Panel roboczy</p>
              <h2>Wybierz profil do edycji</h2>
              <p>
                Formularz otworzy się tutaj. Na telefonie pojawi się nad listą,
                dzięki czemu nie zgubisz kontekstu.
              </p>
              <button
                type="button"
                className="button button--secondary"
                onClick={(event) =>
                  openEditor({ kind: 'new' }, event.currentTarget)
                }
              >
                <Plus aria-hidden="true" />
                Dodaj nową osobę
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default AdminPage
