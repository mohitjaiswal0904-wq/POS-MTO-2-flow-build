import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Calendar,
  Package,
  Warehouse,
  Eye,
  Clock,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { inventoryItems } from '@/features/inventory/data/inventoryData'
import { formatCurrency } from '@/shared/lib/currency'
import type { InventoryStatus, InventoryTab } from '@/features/inventory/types'

const TABS: { id: InventoryTab; label: string }[] = [
  { id: 'stock', label: 'Stock Overview' },
  { id: 'inward', label: 'Inward History' },
  { id: 'outward', label: 'Outward History' },
  { id: 'advices', label: 'Advices' },
]

const STATUS_OPTIONS: Array<'All Status' | InventoryStatus> = [
  'All Status',
  'Display',
  'Backoffice',
  'Reserved',
]

function statusBadgeClass(status: InventoryStatus) {
  switch (status) {
    case 'Display':
      return 'bg-green-100 text-green-700'
    case 'Backoffice':
      return 'bg-orange-100 text-orange-700'
    case 'Reserved':
      return 'bg-blue-100 text-blue-700'
  }
}

export function InventoryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<InventoryTab>('stock')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All Status' | InventoryStatus>('All Status')

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch =
        item.designId.toLowerCase().includes(search.toLowerCase()) ||
        item.productName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
                Inventory Management
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Manage stock, track inward/outward operations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/inventory/history')}
                className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Clock className="size-4" />
                History
              </button>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Filter className="size-4" />
                Filter
              </button>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Calendar className="size-4" />
                Date Range
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Stock"
              value="22"
              icon={<Package className="size-6 text-slate-600" />}
              iconBg="bg-slate-100"
            />
            <SummaryCard
              label="Backoffice"
              value="7"
              icon={<Warehouse className="size-6 text-orange-600" />}
              iconBg="bg-orange-50"
            />
            <SummaryCard
              label="On Display"
              value="13"
              icon={<Eye className="size-6 text-green-600" />}
              iconBg="bg-green-50"
            />
            <SummaryCard
              label="Reserved"
              value="2"
              icon={<Clock className="size-6 text-blue-600" />}
              iconBg="bg-blue-50"
            />
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden px-6 py-4">
          <div className="mb-4 inline-flex w-fit rounded-lg bg-slate-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'stock' ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by SKU or product name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as typeof statusFilter)
                      }
                      className="h-9 appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-10 text-sm font-medium text-slate-700 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white"
                >
                  <Plus className="size-4" />
                  Outward Stock
                </button>
              </div>

              <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {[
                        'Design ID',
                        'Product Name',
                        'Category',
                        'Status',
                        'Quantity',
                        'Location',
                        'Price',
                        'Last Updated',
                        'Actions',
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
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => navigate(`/inventory/${item.id}/history`)}
                        className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 font-medium text-slate-800">{item.designId}</td>
                        <td className="px-4 py-4 text-slate-700">{item.productName}</td>
                        <td className="px-4 py-4 text-slate-700">{item.category}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-4 text-slate-700">{item.location}</td>
                        <td className="px-4 py-4 text-slate-700">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-4 text-slate-500">{item.lastUpdated}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/inventory/${item.id}/history`)
                              }}
                              className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                            >
                              History
                            </button>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm font-medium text-slate-500 underline-offset-2 hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                          No inventory items match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
              <div className="text-center">
                <p className="text-base font-medium text-slate-700">
                  {TABS.find((tab) => tab.id === activeTab)?.label}
                </p>
                <p className="mt-1 text-sm text-slate-500">This section will be available soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string
  value: string
  icon: ReactNode
  iconBg: string
}) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-[28px] font-semibold leading-8 tracking-tight text-slate-900">
          {value}
        </p>
      </div>
      <div className={`flex size-12 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
    </div>
  )
}
