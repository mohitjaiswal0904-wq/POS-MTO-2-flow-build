import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { customers } from '@/features/customers/data/customersData'

const TABLE_HEADERS = [
  'S. No',
  'Name',
  'Phone No.',
  'Total Orders',
  'Total Spent',
  'Last Visit',
  'Actions',
] as const

export function CustomersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return customers
    return customers.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        row.phone.toLowerCase().includes(query) ||
        row.id.toLowerCase().includes(query) ||
        String(row.serialNo).includes(query),
    )
  }, [search])

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
                Customers
              </h1>
              <p className="mt-1 text-base text-slate-500">Manage customer relationships</p>
            </div>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-lg bg-[#151515] px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add Customer
            </button>
          </div>

          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders by number or customer..."
              className="h-12 w-full rounded-lg border border-transparent bg-slate-50 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-500 focus:border-slate-200 focus:bg-white focus:outline-none"
            />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {TABLE_HEADERS.map((header) => (
                    <th
                      key={header}
                      className={`px-2.5 py-3 text-xs font-medium uppercase tracking-[0.6px] text-slate-500 ${
                        header === 'Actions' ? 'text-center' : ''
                      } ${header === 'S. No' ? 'pl-4' : ''}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-[21px] font-medium text-slate-900">{row.serialNo}</td>
                    <td className="px-2.5 py-[21px] text-slate-700">{row.name}</td>
                    <td className="px-2.5 py-[21px] text-slate-600">{row.phone}</td>
                    <td className="px-2.5 py-[21px] pl-8 text-slate-600">{row.totalOrders}</td>
                    <td className="px-2.5 py-[21px] font-medium text-slate-700">
                      {row.totalSpent}
                    </td>
                    <td className="px-2.5 py-[21px] font-semibold text-slate-700">
                      {row.lastVisit}
                    </td>
                    <td className="px-2.5 py-[21px] text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/customers/${row.id}`)}
                        className="inline-flex h-[29px] items-center justify-center rounded-lg border border-slate-200 bg-neutral-50 px-3 text-sm font-medium text-slate-700 hover:bg-white"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                      No customers match your search.
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
