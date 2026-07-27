import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">{children}</main>
    </div>
  )
}
