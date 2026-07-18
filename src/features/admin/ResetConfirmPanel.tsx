import { RotateCcw } from 'lucide-react'

interface ResetConfirmPanelProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ResetConfirmPanel({ onConfirm, onCancel }: ResetConfirmPanelProps) {
  return (
    <section
      className="admin-inline-panel admin-inline-panel--warning"
      aria-labelledby="reset-demo-title"
    >
      <div>
        <p className="eyebrow">Operacja nieodwracalna w tej sesji</p>
        <h2 id="reset-demo-title">Przywrócić dane początkowe?</h2>
        <p>
          Znikną dodane profile, lokalne zdjęcia i wszystkie zmiany wykonane
          podczas tej sesji. Zestaw demonstracyjny zostanie odtworzony.
        </p>
      </div>
      <div className="admin-inline-panel__actions">
        <button
          type="button"
          className="button button--danger"
          onClick={onConfirm}
        >
          <RotateCcw aria-hidden="true" />
          Tak, przywróć zestaw
        </button>
        <button
          type="button"
          className="button button--ghost"
          onClick={onCancel}
        >
          Anuluj
        </button>
      </div>
    </section>
  )
}

export default ResetConfirmPanel
