import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { seedMtoOrders } from '@/features/mto/data/mtoData'
import type {
  MtoCustomerInfo,
  MtoItem,
  MtoOrder,
  MtoOrderStatus,
  MtoOrderType,
  MtoPaymentInfo,
} from '@/features/mto/types'

interface PlaceMtoOrderInput {
  orderType: MtoOrderType
  items: MtoItem[]
  customer: MtoCustomerInfo
  payment: Omit<MtoPaymentInfo, 'remainingAmount'> & { remainingAmount?: number }
  designNotes?: string
}

interface MtoContextValue {
  orders: MtoOrder[]
  getOrderById: (id: string) => MtoOrder | undefined
  placeOrder: (input: PlaceMtoOrderInput) => MtoOrder
  updateOrderStatus: (id: string, status: MtoOrderStatus) => void
}

const MtoContext = createContext<MtoContextValue | null>(null)

function nextOrderId(existing: MtoOrder[]): string {
  const suffix = String(123455 + existing.length).padStart(6, '0')
  return `PMXYZ${suffix}`
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatTimelineStamp(date: Date): string {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function MtoProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<MtoOrder[]>(seedMtoOrders)

  const value = useMemo<MtoContextValue>(
    () => ({
      orders,
      getOrderById: (id) => orders.find((order) => order.id === id),
      placeOrder: (input) => {
        const now = new Date()
        const id = nextOrderId(orders)
        const total = input.payment.totalAmount
        const advance = input.payment.advancePayment
        const remaining = Math.max(total - advance, 0)
        const derivedStatus =
          advance <= 0 ? 'Pending' : remaining > 0 ? 'Partial' : 'Paid'

        const order: MtoOrder = {
          id,
          orderType: input.orderType,
          status: 'Pending',
          createdAt: now.toISOString(),
          dateLabel: formatDateLabel(now),
          storeName: 'Phoenix Mall Store',
          storeType: 'Physical Store',
          storeLocation: 'Phoenix Marketcity, Bangalore',
          items: input.items,
          customer: {
            ...input.customer,
            orderNumber: input.customer.orderNumber || id,
          },
          designNotes: input.designNotes,
          payment: {
            totalAmount: total,
            advancePayment: advance,
            remainingAmount: remaining,
            paymentStatus: input.payment.paymentStatus || derivedStatus,
            paymentMethod: input.payment.paymentMethod || (advance > 0 ? 'Card' : '—'),
          },
          timeline: [
            {
              id: 't1',
              title: 'Request Submitted',
              dateLabel: formatTimelineStamp(now),
              completed: true,
            },
            {
              id: 't2',
              title: 'Request Accepted',
              dateLabel: '—',
              completed: false,
            },
            {
              id: 't3',
              title: 'In Production',
              dateLabel: '—',
              completed: false,
            },
            {
              id: 't4',
              title: 'Order Completed',
              dateLabel: '—',
              completed: false,
            },
          ],
          subtotal: total,
          tax: 0,
          discount: 0,
          shipping: 0,
        }

        setOrders((current) => [order, ...current])
        return order
      },
      updateOrderStatus: (id, status) => {
        setOrders((current) =>
          current.map((order) => {
            if (order.id !== id) return order

            const now = new Date()
            const stamp = formatTimelineStamp(now)
            let timeline = order.timeline.map((event) => ({ ...event }))

            if (status === 'Processing') {
              timeline = timeline.map((event, index) =>
                index <= 2
                  ? {
                      ...event,
                      completed: true,
                      dateLabel: event.completed && event.dateLabel !== '—' ? event.dateLabel : stamp,
                    }
                  : event,
              )
            }

            if (status === 'Completed') {
              timeline = timeline.map((event) => ({
                ...event,
                completed: true,
                dateLabel: event.dateLabel === '—' ? stamp : event.dateLabel,
              }))
            }

            if (status === 'Cancelled') {
              timeline = [
                ...timeline.filter((event) => event.completed),
                {
                  id: `cancel-${Date.now()}`,
                  title: 'Order Cancelled',
                  dateLabel: stamp,
                  completed: true,
                },
              ]
            }

            return { ...order, status, timeline }
          }),
        )
      },
    }),
    [orders],
  )

  return <MtoContext.Provider value={value}>{children}</MtoContext.Provider>
}

export function useMto() {
  const context = useContext(MtoContext)
  if (!context) {
    throw new Error('useMto must be used within MtoProvider')
  }
  return context
}
