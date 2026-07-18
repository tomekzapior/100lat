import { X } from 'lucide-react'
import { formatBirthday, formatDistanceToBirthday } from '../../lib/dates'
import type { Person } from '../../types/domain'

interface ReminderPreviewProps {
  person: Person | null
  distanceDays: number | null
  onClose: () => void
}

export function ReminderPreview({ person, distanceDays, onClose }: ReminderPreviewProps) {
  return (
    <section
      className="admin-inline-panel admin-reminder"
      aria-labelledby="reminder-preview-title"
    >
      <div className="admin-inline-panel__heading">
        <div>
          <p className="eyebrow">Bez wysyłki</p>
          <h2 id="reminder-preview-title">Podgląd przypomnienia e-mail</h2>
        </div>
        <button
          type="button"
          className="button button--ghost"
          onClick={onClose}
          aria-label="Zamknij podgląd przypomnienia"
        >
          <X aria-hidden="true" />
        </button>
      </div>

      {person && distanceDays !== null ? (
        <div className="admin-reminder__sheet">
          <dl className="admin-reminder__meta">
            <div>
              <dt>Temat</dt>
              <dd>
                {person.nickname} ma urodziny{' '}
                {formatDistanceToBirthday(distanceDays)}
              </dd>
            </div>
            <div>
              <dt>Odbiorcy</dt>
              <dd>Fikcyjny zespół demo</dd>
            </div>
          </dl>
          <div className="admin-reminder__message">
            <p>Cześć!</p>
            <p>
              {formatBirthday(person.birthdayMd)} świętuje{' '}
              <strong>{person.nickname}</strong>. Zajrzyj do aplikacji
              i zostaw kilka osobistych słów.
            </p>
            <p>Ta wiadomość jest tylko podglądem, demo niczego nie wysyła.</p>
            <span>Sto lat! · publiczne demo portfolio</span>
          </div>
        </div>
      ) : (
        <p className="admin-empty">
          Dodaj aktywną osobę, żeby zobaczyć przykładowe przypomnienie.
        </p>
      )}
    </section>
  )
}

export default ReminderPreview
