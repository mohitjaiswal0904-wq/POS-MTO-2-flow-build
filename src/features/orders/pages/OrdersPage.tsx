import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { customerOrders } from '@/features/orders/data/mockData'
import type { CustomerOrder } from '@/features/orders/types'

export function OrdersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = customerOrders.filter(
    (row: CustomerOrder) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.phone.includes(search) ||
      row.orderId.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">Customers</h1>
              <p className="mt-1 text-base text-slate-500">Manage customer relationships</p>
            </div>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white"
            >
              <Plus className="size-4" />
              Add Customer
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
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

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['S. NO', 'NAME', 'PHONE NO.', 'TOTAL ORDERS', 'TOTAL SPENT', 'LAST VISIT', 'ACTIONS'].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.serialNo} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-4 text-slate-700">{row.serialNo}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">{row.name}</td>
                    <td className="px-4 py-4 text-slate-700">{row.phone}</td>
                    <td className="px-4 py-4 text-slate-700">{row.totalOrders}</td>
                    <td className="px-4 py-4 text-slate-700">{row.totalSpent}</td>
                    <td className="px-4 py-4 text-slate-700">{row.lastVisit}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/orders/${row.orderId}`)}
                        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
