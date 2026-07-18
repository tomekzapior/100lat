import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page-shell narrow-page">
      <div className="empty-state empty-state--page">
        <span className="stamp">404</span>
        <h1>Ta kartka gdzieś się zapodziała</h1>
        <p>Adres nie prowadzi do żadnego ekranu w aplikacji.</p>
        <Link className="button button--primary" to="/">
          <ArrowLeft aria-hidden="true" size={18} />
          Wróć do kalendarza
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
