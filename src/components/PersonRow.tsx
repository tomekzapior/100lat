import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  formatBirthday,
  formatDistanceToBirthday,
  getNextBirthday,
  normalizeSearch,
} from '../lib/dates'
import type { Person } from '../types/domain'
import { PersonAvatar } from './PersonAvatar'

interface PersonRowProps {
  person: Person
  referenceDate?: Date
}

export function PersonRow({ person, referenceDate = new Date() }: PersonRowProps) {
  const nextBirthday = getNextBirthday(person.birthdayMd, referenceDate)
  const firstName = person.name.split(/\s+/)[0] ?? ''
  const hasDistinctNickname =
    normalizeSearch(person.nickname) !== normalizeSearch(firstName)
  const birthdayDate = nextBirthday.date.toISOString().slice(0, 10)
  const isSoon = nextBirthday.days > 0 && nextBirthday.days <= 7

  return (
    <li className="people-list__item">
      <Link
        className="person-row"
        to={`/people/${encodeURIComponent(person.id)}`}
        aria-label={`${person.name}, urodziny ${formatDistanceToBirthday(nextBirthday.days)}. Otwórz profil.`}
      >
        <span className="person-row__main">
          <PersonAvatar person={person} size="md" />
          <span className="person-row__identity">
            <span className="person-row__name">{person.name}</span>
            {hasDistinctNickname ? (
              <span className="person-row__nickname">mówią na mnie {person.nickname}</span>
            ) : null}
          </span>
        </span>

        <span className="person-row__birthday">
          <time className="person-row__date" dateTime={birthdayDate}>
            {formatBirthday(person.birthdayMd)}
          </time>
          <span
            className={`person-row__distance${isSoon ? ' person-row__distance--soon' : ''}`}
          >
            {formatDistanceToBirthday(nextBirthday.days)}
          </span>
        </span>

        <ArrowUpRight className="person-row__arrow" aria-hidden="true" />
      </Link>
    </li>
  )
}
