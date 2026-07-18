import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 4000 })

Object.defineProperty(window, 'scrollTo', {
  configurable: true,
  value: () => undefined,
})

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: () => undefined,
})
