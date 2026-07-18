import { ArrowLeft, Database, LockKeyhole, Palette, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const decisions = [
  {
    icon: Sparkles,
    title: 'Cały proces w jednym miejscu',
    copy: 'Kalendarz, profile, składanie życzeń i panel administratora działają razem, tak jak w codziennym użyciu.',
  },
  {
    icon: LockKeyhole,
    title: 'Bez prawdziwych danych',
    copy: 'Demo pracuje na fikcyjnym zespole, a wszystkie zmiany zostają w bieżącej sesji przeglądarki.',
  },
  {
    icon: Database,
    title: 'Gotowe pod prawdziwy backend',
    copy: 'Repozytorium zawiera model danych Supabase, polityki RLS i plan przypomnień mailowych, na przykład przez Resend.',
  },
  {
    icon: Palette,
    title: 'Własny język wizualny',
    copy: 'Papier, tusz i stemple zamiast szablonowego panelu. Interfejs wygląda jak kartka przygotowana dla konkretnej osoby.',
  },
]

export function AboutPage() {
  return (
    <div className="page-shell about-page">
      <Link className="back-link" to="/">
        <ArrowLeft aria-hidden="true" size={18} />
        Kalendarz
      </Link>

      <header className="about-hero">
        <p className="eyebrow">Gotowe rozwiązanie dla zespołu</p>
        <h1>Mały rytuał, który pomaga pamiętać o ludziach</h1>
        <p>
          „Sto lat!” zbiera firmowe urodziny w jednym miejscu. Kalendarz podpowiada,
          kto świętuje, zespół podpisuje wspólną kartkę, a solenizant czyta życzenia
          w swoim dniu. O terminach pamięta aplikacja, nie pojedyncze osoby, więc
          nikt nie zostaje pominięty. To demo działa na fikcyjnych danych.
        </p>
        <div className="tech-line" aria-label="Technologie">
          <span>React</span>
          <span>TypeScript</span>
          <span>Supabase-ready</span>
          <span>RWD</span>
        </div>
      </header>

      <section className="decision-grid" aria-labelledby="decisions-title">
        <div className="section-heading section-heading--wide">
          <p className="eyebrow">Najważniejsze decyzje</p>
          <h2 id="decisions-title">Cztery decyzje, które widać w działaniu</h2>
        </div>
        {decisions.map(({ icon: Icon, title, copy }, index) => (
          <article className="decision-card" key={title}>
            <span className="decision-card__number">{String(index + 1).padStart(2, '0')}</span>
            <Icon aria-hidden="true" size={24} />
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="process-strip" aria-labelledby="process-title">
        <div>
          <p className="eyebrow">Od problemu do produktu</p>
          <h2 id="process-title">Co znajdziesz w repozytorium</h2>
        </div>
        <ol>
          <li><strong>01</strong><span>PRD i scenariusze użytkownika</span></li>
          <li><strong>02</strong><span>Design guide i tokeny wizualne</span></li>
          <li><strong>03</strong><span>Działającą aplikację responsywną</span></li>
          <li><strong>04</strong><span>Schemat bazy i zabezpieczenia RLS</span></li>
        </ol>
      </section>

      <aside className="about-cta">
        <div>
          <p className="eyebrow">Sprawdź interakcje</p>
          <h2>Najlepiej zacząć od dzisiejszych jubilatów</h2>
        </div>
        <div className="button-row">
          <Link className="button button--primary" to="/">
            Przejdź do kalendarza
          </Link>
          <a
            className="button button--secondary"
            href="https://github.com/tomekzapior/100lat"
            rel="noreferrer"
            target="_blank"
          >
            Kod na GitHubie
          </a>
        </div>
      </aside>
    </div>
  )
}

export default AboutPage
