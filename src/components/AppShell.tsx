import { useEffect, useRef, useState } from 'react'
import { CircleHelp, House, Info, Settings2 } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useDemoData } from '../data/demoDataStore'
import { BrandMark } from './BrandMark'
import { DemoGuide } from './DemoGuide'
import { Toast } from './Toast'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return 'app-nav__link' + (isActive ? ' app-nav__link--active' : '')
}

export function AppShell() {
  const { persistFailed } = useDemoData()
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [persistWarningDismissed, setPersistWarningDismissed] = useState(false)
  const guideButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!persistFailed) setPersistWarningDismissed(false)
  }, [persistFailed])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Przejdź do treści
      </a>

      <header className="app-shell__header">
        <div className="app-shell__header-inner">
          <NavLink
            aria-label="Sto lat!, strona główna"
            className="app-shell__brand-link"
            to="/"
          >
            <BrandMark />
          </NavLink>

          <nav aria-label="Główna nawigacja" className="app-nav">
            <NavLink className={navLinkClass} end to="/">
              <House aria-hidden="true" size={18} strokeWidth={2} />
              <span>Kalendarz</span>
            </NavLink>
            <NavLink className={navLinkClass} to="/admin">
              <Settings2 aria-hidden="true" size={18} strokeWidth={2} />
              <span>Admin</span>
            </NavLink>
            <NavLink className={navLinkClass} to="/o-projekcie">
              <Info aria-hidden="true" size={18} strokeWidth={2} />
              <span>O projekcie</span>
            </NavLink>
            <button
              className="button button--secondary app-nav__guide-button"
              onClick={() => setIsGuideOpen(true)}
              ref={guideButtonRef}
              type="button"
            >
              <CircleHelp aria-hidden="true" size={18} strokeWidth={2} />
              <span>Instrukcja</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="app-shell__main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <DemoGuide
        open={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        returnFocusRef={guideButtonRef}
      />

      <Toast
        message={
          persistFailed && !persistWarningDismissed
            ? 'Nie udało się zapisać zmian w pamięci sesji. Wszystko działa dalej, ale zniknie po zamknięciu tej karty.'
            : null
        }
        tone="error"
        onDismiss={() => setPersistWarningDismissed(true)}
      />
    </div>
  )
}

export default AppShell
