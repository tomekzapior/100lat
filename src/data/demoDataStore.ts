import { createContext, useContext } from 'react'
import type { DemoDataContextValue } from '../types/domain'

export const DemoDataContext = createContext<DemoDataContextValue | null>(null)

export function useDemoData() {
  const context = useContext(DemoDataContext)
  if (!context) {
    throw new Error('useDemoData musi działać wewnątrz DemoDataProvider.')
  }
  return context
}
