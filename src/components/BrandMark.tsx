interface BrandMarkProps {
  className?: string
}

export function BrandMark({ className = '' }: BrandMarkProps) {
  const classes = ['brand-mark', className].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      <span aria-hidden="true" className="brand-mark__stamp">
        100
      </span>
      <span className="brand-mark__name">Sto lat!</span>
    </span>
  )
}

export default BrandMark
