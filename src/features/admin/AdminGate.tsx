import { KeyRound, ShieldCheck } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { DEMO_ADMIN_CODE, isValidAdminCode } from '../../lib/demoCredentials'

interface AdminGateProps {
  onUnlock: () => void
}

export function AdminGate({ onUnlock }: AdminGateProps) {
  const [code, setCode] = useState('')
  const [accessError, setAccessError] = useState('')
  const codeInputRef = useRef<HTMLInputElement>(null)

  function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isValidAdminCode(code.trim())) {
      setAccessError('')
      onUnlock()
      return
    }

    setAccessError('Kod jest niepoprawny. W tym demo użyj 4242.')
    window.requestAnimationFrame(() => codeInputRef.current?.focus())
  }

  return (
    <section className="admin-gate" aria-labelledby="admin-gate-title">
      <div className="admin-gate__card">
        <div className="admin-gate__mark" aria-hidden="true">
          <KeyRound />
        </div>
        <p className="eyebrow">Administrator demo</p>
        <h1 id="admin-gate-title">Wejdź za kulisy</h1>
        <p className="admin-gate__intro">
          Dodasz tu profil, poprawisz opis albo ukryjesz osobę. Zmiany
          zostają w tej sesji i znikają po zamknięciu karty.
        </p>

        <div className="admin-gate__demo-code">
          <span>Kod do publicznego demo</span>
          <strong>{DEMO_ADMIN_CODE}</strong>
          <small>To wskazówka testowa, nie prawdziwe zabezpieczenie.</small>
        </div>

        <form className="admin-gate__form" onSubmit={handleCodeSubmit} noValidate>
          <div className="field">
            <label htmlFor="admin-demo-code">Kod administratora</label>
            <input
              ref={codeInputRef}
              id="admin-demo-code"
              name="adminCode"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, '').slice(0, 4))
                setAccessError('')
              }}
              aria-invalid={Boolean(accessError)}
              aria-describedby={accessError ? 'admin-code-error' : 'admin-code-hint'}
              maxLength={4}
              required
            />
            <span className="field__hint" id="admin-code-hint">
              Wpisz lub wklej cztery cyfry pokazane wyżej.
            </span>
            {accessError && (
              <span className="field__error" id="admin-code-error" role="alert">
                {accessError}
              </span>
            )}
          </div>
          <button type="submit" className="button button--primary">
            <ShieldCheck aria-hidden="true" />
            Otwórz panel
          </button>
        </form>
      </div>
    </section>
  )
}

export default AdminGate
