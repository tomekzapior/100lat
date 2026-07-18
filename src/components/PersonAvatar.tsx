import { useEffect, useState } from 'react'
import { getInitials } from '../lib/dates'
import type { Person } from '../types/domain'

export type AvatarSize = 'sm' | 'md' | 'lg'

interface PersonAvatarProps {
  person: Pick<Person, 'name' | 'avatarUrl' | 'avatarTone'>
  size?: AvatarSize
  className?: string
}

export function PersonAvatar({ person, size = 'md', className = '' }: PersonAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => setImageFailed(false), [person.avatarUrl])

  const classes = [
    'person-avatar',
    'person-avatar--' + size,
    'person-avatar--' + person.avatarTone,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const showImage = Boolean(person.avatarUrl) && !imageFailed

  return (
    <span aria-hidden="true" className={classes}>
      {showImage ? (
        <img
          alt=""
          className="person-avatar__image"
          decoding="async"
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={person.avatarUrl}
        />
      ) : (
        <span className="person-avatar__initials">{getInitials(person.name)}</span>
      )}
    </span>
  )
}

export default PersonAvatar
