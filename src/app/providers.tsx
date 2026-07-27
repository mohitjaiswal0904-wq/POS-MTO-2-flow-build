import type { ReactNode } from 'react'
import { ReturnProvider } from '@/features/orders'
import { MtoProvider } from '@/features/mto'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReturnProvider>
      <MtoProvider>{children}</MtoProvider>
    </ReturnProvider>
  )
}
