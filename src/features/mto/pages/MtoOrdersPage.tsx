import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus, Search } from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { useMto } from '@/features/mto/context/MtoContext'
import { formatMtoTotal, statusBadgeClass } from '@/features/mto/data/mtoData'
import type { MtoOrderStatus } from '@/features/mto/types'

const FILTERS: Array<'All Orders' | MtoOrderStatus> = [
  'All Orders',
  'Pending',
  'Processing',
  'Completed',
]

export function MtoOrdersPage() {
  const navigate = useNavigate()
  const { orders } = useMto()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All Orders' | MtoOrderStatus>('All Orders')

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.customer.customerName.toLowerCase().includes(q) ||
        order.customer.customerPhone.toLowerCase().includes(q)

      const matchesFilter =
        filter === 'All Orders'
          ? order.status !== 'Cancelled' || Boolean(q)
          : order.status === filter

      return matchesFilter && matchesSearch
    })
  }, [orders, search, filter])

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
                MTO Orders
              </h1>
              <p className="mt-1 text-base text-slate-500">Manage and track all orders</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/mto')}
              className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white"
            >
              <Plus className="size-4" />
              New MTO
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders by number or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    filter === tab
                      ? 'bg-slate-200 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
            >
              <Calendar className="size-4" />
              Aug 24 - Sep 28, 2026
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    'ORDER ID',
                    'CUSTOMER NAME',
                    'DATE',
                    'ITEMS',
                    'TOTAL',
                    'STORE',
                    'STATUS',
                    'ACTIONS',
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    onClick={() => navigate(`/mto/orders/${order.id}`)}
                  >
                    <td className="px-4 py-4 font-medium text-slate-800">{order.id}</td>
                    <td className="px-4 py-4 text-slate-700">{order.customer.customerName}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{order.items.length}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {formatMtoTotal(order.payment.totalAmount)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{order.storeName}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/mto/orders/${order.id}`)
                        }}
                        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                      No MTO orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
