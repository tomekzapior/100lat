import { useMemo } from 'react'
import { ArrowRight, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Confetti } from '../components/Confetti'
import { PersonAvatar } from '../components/PersonAvatar'
import { PersonRow } from '../components/PersonRow'
import { useDemoData } from '../data/demoDataStore'
import {
  compareByNextBirthday,
  formatBirthday,
  formatDistanceToBirthday,
  getNextBirthday,
} from '../lib/dates'

function joinNames(names: string[]) {
  return new Intl.ListFormat('pl-PL', {
    style: 'long',
    type: 'conjunction',
  }).format(names)
}

function HomePageSkeleton() {
  return (
    <div className="home-page home-loading" aria-busy="true" aria-label="Ładowanie kalendarza">
      <span className="sr-only">Ładujemy kalendarz urodzin.</span>
      <section className="birthday-hero birthday-hero--loading" aria-hidden="true">
        <div className="birthday-hero__paper">
          <div className="skeleton skeleton--stamp" />
          <div className="birthday-hero__content">
            <div className="skeleton skeleton--eyebrow" />
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--copy" />
            <div className="skeleton skeleton--button" />
          </div>
        </div>
      </section>

      <section className="home-directory" aria-hidden="true">
        <div className="skeleton skeleton--heading" />
        <div className="people-list people-list--loading">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="skeleton skeleton--row" key={index} />
          ))}
        </div>
      </section>
    </div>
  )
}

export function HomePage() {
  const { people, isLoading } = useDemoData()
  const referenceDate = useMemo(() => new Date(), [])

  const activePeople = useMemo(
    () =>
      people
        .filter((person) => person.isActive)
        .sort((first, second) => compareByNextBirthday(first, second, referenceDate)),
    [people, referenceDate],
  )

  if (isLoading) return <HomePageSkeleton />

  const todaysPeople = activePeople.filter(
    (person) => getNextBirthday(person.birthdayMd, referenceDate).days === 0,
  )
  const featuredPeople = todaysPeople.length > 0 ? todaysPeople : activePeople.slice(0, 1)
  const featuredBirthday = featuredPeople[0]
    ? getNextBirthday(featuredPeople[0].birthdayMd, referenceDate)
    : null
  const isToday = todaysPeople.length > 0
  const featuredIds = new Set(featuredPeople.map((person) => person.id))
  const directoryPeople = activePeople.filter((person) => !featuredIds.has(person.id))

  return (
    <div className={`home-page${isToday ? ' home-page--celebrating' : ''}`}>
      <Confetti active={isToday} />
      {featuredBirthday && featuredPeople.length > 0 ? (
        <section
          className={`birthday-hero${isToday ? ' birthday-hero--today' : ''}`}
          aria-labelledby="birthday-hero-title"
        >
          <div className="birthday-hero__paper">
            <div className="birthday-hero__side">
              <div className="date-stamp" aria-label={formatDistanceToBirthday(featuredBirthday.days)}>
                <span className="date-stamp__label">
                  {isToday ? 'dzisiaj' : formatDistanceToBirthday(featuredBirthday.days)}
                </span>
                <time
                  className="date-stamp__date"
                  dateTime={featuredBirthday.date.toISOString().slice(0, 10)}
                >
                  {formatBirthday(featuredPeople[0].birthdayMd)}
                </time>
              </div>

              <div className="birthday-hero__faces" aria-hidden="true">
                {featuredPeople.slice(0, 3).map((person) => (
                  <PersonAvatar
                    className="birthday-hero__face"
                    person={person}
                    size="lg"
                    key={person.id}
                  />
                ))}
              </div>
            </div>

            <div className="birthday-hero__content">
              <p className="birthday-hero__eyebrow">
                {isToday ? 'Najważniejsza data w kalendarzu' : 'Następny powód do świętowania'}
              </p>
              <h1 className="birthday-hero__title" id="birthday-hero-title">
                {isToday
                  ? `${featuredPeople.length === 1 ? 'Dziś świętuje' : 'Dziś świętują'} ${joinNames(featuredPeople.map((person) => person.nickname))}`
                  : `Następne urodziny ma ${featuredPeople[0].nickname}`}
              </h1>
              <p className="birthday-hero__copy">
                {isToday
                  ? featuredPeople.length === 1
                    ? 'Zostaw kilka słów, które przeczyta właśnie dzisiaj. Podpisana kartka czeka na profilu.'
                    : 'Każda z tych osób ma dziś swój moment. Wybierz profil i zostaw kilka osobistych słów.'
                  : 'Kartka już czeka. Możesz zajrzeć na profil i podpisać ją przed terminem.'}
              </p>

              <div className="birthday-hero__actions" aria-label="Profile solenizantów">
                {featuredPeople.map((person) => (
                  <Link
                    className="button button--primary"
                    to={`/people/${encodeURIComponent(person.id)}`}
                    key={person.id}
                  >
                    <span>
                      {featuredPeople.length === 1 ? 'Otwórz profil' : `Profil: ${person.nickname}`}
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="empty-state empty-state--hero" aria-labelledby="empty-calendar-title">
          <SearchX aria-hidden="true" />
          <h1 id="empty-calendar-title">Kalendarz czeka na pierwszą osobę</h1>
          <p>Aktywne profile pojawią się tutaj po dodaniu ich w administracji demo.</p>
          <Link className="button button--primary" to="/admin">
            Przejdź do administracji
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      )}

      <section className="home-directory" aria-labelledby="people-heading">
        <div className="home-directory__header">
          <div>
            <p className="home-directory__eyebrow">Dalej w kalendarzu</p>
            <h2 className="home-directory__heading" id="people-heading">
              Kto świętuje później?
            </h2>
          </div>
          <p className="home-directory__intro">
            {directoryPeople.length} kolejnych dat
          </p>
        </div>

        {directoryPeople.length > 0 ? (
          <ul className="people-list" aria-label="Urodziny zespołu">
            {directoryPeople.map((person) => (
              <PersonRow person={person} referenceDate={referenceDate} key={person.id} />
            ))}
          </ul>
        ) : (
          <div className="empty-state empty-state--directory">
            <SearchX aria-hidden="true" />
            <h3>To cały aktywny zespół</h3>
            <p>Kolejne profile możesz dodać w administracji demo.</p>
          </div>
        )}
      </section>
    </div>
  )
}
