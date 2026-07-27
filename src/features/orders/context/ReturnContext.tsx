import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ReturnRequest } from '@/features/orders/types'

interface ReturnContextValue {
  returnRequest: ReturnRequest | null
  submitReturnRequest: (request: ReturnRequest) => void
  appendReturnItems: (items: ReturnRequest['items'], refundAmount: number) => void
}

const ReturnContext = createContext<ReturnContextValue | null>(null)

export function ReturnProvider({ children }: { children: ReactNode }) {
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null)

  const submitReturnRequest = (request: ReturnRequest) => {
    setReturnRequest(request)
  }

  const appendReturnItems = (items: ReturnRequest['items'], refundAmount: number) => {
    setReturnRequest((prev) => {
      if (!prev) return prev

      const existingIds = new Set(prev.items.map((item) => item.unitId))
      const newItems = items.filter((item) => !existingIds.has(item.unitId))

      return {
        ...prev,
        items: [...prev.items, ...newItems],
        refundAmount: prev.refundAmount + refundAmount,
      }
    })
  }

  return (
    <ReturnContext.Provider value={{ returnRequest, submitReturnRequest, appendReturnItems }}>
      {children}
    </ReturnContext.Provider>
  )
}

export function useReturn() {
  const context = useContext(ReturnContext)
  if (!context) {
    throw new Error('useReturn must be used within ReturnProvider')
  }
  return context
}
