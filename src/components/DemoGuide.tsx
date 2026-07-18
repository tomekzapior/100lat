import {
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from 'react'
import {
  CheckCircle2,
  Gift,
  KeyRound,
  RotateCcw,
  Settings2,
  X,
} from 'lucide-react'
import { useDemoData } from '../data/demoDataStore'
import { DEMO_ADMIN_CODE, DEMO_MEMBER_CODE } from '../lib/demoCredentials'

interface DemoGuideProps {
  open: boolean
  onClose: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function DemoGuide({ open, onClose, returnFocusRef }: DemoGuideProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()
  const [wasReset, setWasReset] = useState(false)
  const [isResetConfirming, setIsResetConfirming] = useState(false)
  const { resetDemo } = useDemoData()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      previousFocusRef.current =
        returnFocusRef?.current ??
        (document.activeElement instanceof HTMLElement ? document.activeElement : null)

      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
      return
    }

    if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [open, returnFocusRef])

  const restoreFocus = () => {
    const focusTarget = returnFocusRef?.current ?? previousFocusRef.current
    if (!focusTarget?.isConnected) return
    window.requestAnimationFrame(() => focusTarget.focus())
  }

  const handleDialogClose = () => {
    setWasReset(false)
    setIsResetConfirming(false)
    onClose()
    restoreFocus()
  }

  const closeDialog = () => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (typeof dialog.close === 'function') dialog.close()
    else {
      dialog.removeAttribute('open')
      handleDialogClose()
    }
  }

  const confirmReset = () => {
    resetDemo()
    setIsResetConfirming(false)
    setWasReset(true)
  }

  return (
    <dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="demo-guide"
      onClose={handleDialogClose}
      ref={dialogRef}
    >
      <div className="demo-guide__paper">
        <header className="demo-guide__header">
          <div className="demo-guide__heading-group">
            <span className="demo-guide__eyebrow">Portfolio demo</span>
            <h2 id={titleId}>Jak przetestować aplikację</h2>
          </div>
          <button
            aria-label="Zamknij instrukcję"
            className="button button--ghost demo-guide__close"
            onClick={closeDialog}
            type="button"
          >
            <X aria-hidden="true" size={22} strokeWidth={2} />
          </button>
        </header>

        <p className="demo-guide__intro" id={descriptionId}>
          Osoby i wpisy są fikcyjne. Przejdź dowolny scenariusz, a po testach
          jednym przyciskiem przywróć dane początkowe.
        </p>

        <ol className="demo-guide__scenarios">
          <li className="demo-guide__scenario">
            <span aria-hidden="true" className="demo-guide__scenario-icon">
              <Gift size={20} strokeWidth={2} />
            </span>
            <div>
              <h3>Złóż życzenia</h3>
              <p>
                Otwórz profil, wybierz autora i użyj kodu pracownika{' '}
                <code>{DEMO_MEMBER_CODE}</code>.
              </p>
            </div>
          </li>
          <li className="demo-guide__scenario">
            <span aria-hidden="true" className="demo-guide__scenario-icon">
              <KeyRound size={20} strokeWidth={2} />
            </span>
            <div>
              <h3>Odczytaj kartkę</h3>
              <p>
                Na profilu solenizanta wybierz odczyt życzeń i potwierdź kodem{' '}
                <code>{DEMO_MEMBER_CODE}</code>.
              </p>
            </div>
          </li>
          <li className="demo-guide__scenario">
            <span aria-hidden="true" className="demo-guide__scenario-icon">
              <Settings2 size={20} strokeWidth={2} />
            </span>
            <div>
              <h3>Sprawdź administrację</h3>
              <p>
                Przejdź do sekcji Admin. Kod administratora to{' '}
                <code>{DEMO_ADMIN_CODE}</code>.
              </p>
            </div>
          </li>
        </ol>

        <footer className="demo-guide__footer">
          {isResetConfirming ? (
            <div
              className="demo-guide__reset-confirm"
              role="group"
              aria-label="Potwierdzenie resetu danych demo"
            >
              <p>Usunąć zmiany z tej sesji i przywrócić dane początkowe?</p>
              <div className="button-row">
                <button
                  className="button button--danger"
                  onClick={confirmReset}
                  type="button"
                >
                  Tak, przywróć
                </button>
                <button
                  className="button button--ghost"
                  onClick={() => setIsResetConfirming(false)}
                  type="button"
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <button
              className="button button--secondary demo-guide__reset"
              onClick={() => setIsResetConfirming(true)}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={18} strokeWidth={2} />
              Przywróć dane demo
            </button>
          )}
          {wasReset ? (
            <p className="demo-guide__reset-status" role="status">
              <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2} />
              Dane demo wróciły do stanu początkowego.
            </p>
          ) : null}
        </footer>
      </div>
    </dialog>
  )
}

export default DemoGuide
