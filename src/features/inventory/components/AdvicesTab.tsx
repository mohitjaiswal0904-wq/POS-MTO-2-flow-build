import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Plus, Search } from 'lucide-react'
import {
  addAdvice,
  getAllAdvices,
  getInwardedCount,
  getInwardedPercent,
  matchesAdviceSearch,
} from '@/features/inventory/data/advicesData'
import { ADVICE_STATUSES, PALMONAS_LOCATIONS } from '@/features/inventory/data/stores'
import { UNIT_STATUS_LEGEND } from '@/features/inventory/data/unitStatusLegend'
import type { Advice, AdviceStatus, AdviceUnitCounts } from '@/features/inventory/types'
import { NewAdviceModal } from '@/features/inventory/components/NewAdviceModal'
import { SearchableStoreSelect } from '@/features/inventory/components/SearchableStoreSelect'

type RecencyFilter = 'all' | 'newest' | 'oldest' | 'today' | '7d' | '30d'

const RECENCY_OPTIONS: Array<{ id: RecencyFilter; label: string }> = [
  { id: 'all', label: 'All time' },
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
]

function adviceStatusClass(status: Advice['status']) {
  switch (status) {
    case 'INWARDED':
      return 'bg-emerald-100 text-emerald-800'
    case 'DISPATCHED':
      return 'bg-blue-100 text-blue-800'
    case 'PARTIALLY_INWARDED':
      return 'bg-amber-100 text-amber-800'
    case 'FAILED':
      return 'bg-red-100 text-red-700'
    case 'VOIDED':
      return 'bg-slate-200 text-slate-700'
  }
}

function distributionSegments(advice: Advice) {
  const total = advice.totalQty
  if (!total) return []
  return UNIT_STATUS_LEGEND.map((item) => ({
    ...item,
    count: advice.unitStatus[item.key],
    width: (advice.unitStatus[item.key] / total) * 100,
  })).filter((item) => item.count > 0)
}

function UnitStatusPills({ counts }: { counts: AdviceUnitCounts }) {
  const chips = UNIT_STATUS_LEGEND.filter((item) => counts[item.key] > 0)
  if (chips.length === 0) return <span className="text-slate-400">—</span>

  return (
    <div className="flex max-w-[240px] flex-wrap gap-1.5">
      {chips.map((item) => (
        <span
          key={item.key}
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${item.chipClass}`}
        >
          {item.label}
          <span className="font-semibold">{counts[item.key]}</span>
        </span>
      ))}
    </div>
  )
}

export function AdvicesTab() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [destination, setDestination] = useState('')
  const [source, setSource] = useState('')
  const [recency, setRecency] = useState<RecencyFilter>('newest')
  const [statusFilter, setStatusFilter] = useState<'All status' | AdviceStatus>('All status')
  const [showNewAdvice, setShowNewAdvice] = useState(false)
  const [createdVersion, setCreatedVersion] = useState(0)

  const applySearch = () => setAppliedSearch(searchInput)

  const rows = useMemo(() => {
    const today = new Date('2026-08-20T12:00:00')
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const filtered = getAllAdvices().filter((advice) => {
      if (!matchesAdviceSearch(advice, appliedSearch)) return false
      if (destination && advice.destination !== destination) return false
      if (source && advice.source !== source) return false
      if (statusFilter !== 'All status' && advice.status !== statusFilter) return false

      const updated = new Date(advice.updatedAtIso)
      if (dateFilter) {
        const selected = new Date(`${dateFilter}T00:00:00`)
        const sameDay =
          updated.getFullYear() === selected.getFullYear() &&
          updated.getMonth() === selected.getMonth() &&
          updated.getDate() === selected.getDate()
        if (!sameDay) return false
      }

      if (recency === 'today') {
        if (updated < startOfToday) return false
      }
      if (recency === '7d') {
        const from = new Date(startOfToday)
        from.setDate(from.getDate() - 7)
        if (updated < from) return false
      }
      if (recency === '30d') {
        const from = new Date(startOfToday)
        from.setDate(from.getDate() - 30)
        if (updated < from) return false
      }

      return true
    })

    const oldestFirst = recency === 'oldest'
    return filtered.sort((a, b) => {
      const delta = new Date(a.updatedAtIso).getTime() - new Date(b.updatedAtIso).getTime()
      return oldestFirst ? delta : -delta
    })
  }, [appliedSearch, createdVersion, dateFilter, destination, recency, source, statusFilter])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[160px]">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">Date</p>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
            />
          </div>
          <div className="min-w-[240px] flex-1">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Search
            </p>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Advice no., store, status, barcode..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setAppliedSearch(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      applySearch()
                    }
                  }}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={applySearch}
                className="h-9 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Search
              </button>
            </div>
          </div>
          <SearchableStoreSelect
            label="Store (destination)"
            value={destination}
            options={PALMONAS_LOCATIONS}
            allLabel="All stores"
            onChange={setDestination}
          />
          <SearchableStoreSelect
            label="Source"
            value={source}
            options={PALMONAS_LOCATIONS}
            allLabel="All sources"
            onChange={setSource}
          />
          <div className="min-w-[160px]">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">Updated</p>
            <div className="relative">
              <select
                value={recency}
                onChange={(e) => setRecency(e.target.value as RecencyFilter)}
                className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-9 text-sm font-medium text-slate-700 focus:outline-none"
              >
                {RECENCY_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div className="min-w-[180px]">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Status of advice
            </p>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-9 text-sm font-medium text-slate-700 focus:outline-none"
              >
                <option value="All status">All status</option>
                {ADVICE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNewAdvice(true)}
            className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="size-4" />
            New Advice
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-xs font-medium text-slate-500">Unit status legend</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {UNIT_STATUS_LEGEND.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span className={`h-1.5 w-6 rounded-full ${item.dotClass}`} />
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${item.chipClass}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                'Advice No.',
                'Type',
                'Source',
                'Destination',
                'File',
                'Increff Sub Order ID',
                'Invoice no.',
                'Remark',
                'Total Qty',
                'Quantity Distribution',
                'Unit Status',
                'Status',
                'Created By',
                'Updated At',
                'Actions',
              ].map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((advice) => {
              const percent = getInwardedPercent(advice)
              const inwarded = getInwardedCount(advice)
              const segments = distributionSegments(advice)

              return (
                <tr key={advice.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/inventory/advices/${advice.id}`)}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {advice.id}
                    </button>
                    {advice.fileName && (
                      <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-slate-400">
                        {advice.fileName}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">{advice.type}</td>
                  <td className="px-3 py-3 text-slate-700">{advice.source}</td>
                  <td className="px-3 py-3 text-slate-700">{advice.destination}</td>
                  <td className="max-w-[180px] truncate px-3 py-3 text-slate-700" title={advice.fileName}>
                    {advice.fileName || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                    {advice.increffSubOrderId || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                    {advice.invoiceNo || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="max-w-[220px] px-3 py-3 text-slate-700">
                    {advice.remark ? (
                      <p className="line-clamp-2" title={advice.remark}>
                        {advice.remark}
                      </p>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {advice.totalQty == null ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <div className="text-center">
                        <p className="text-lg font-semibold leading-6 text-slate-800">{advice.totalQty}</p>
                        <p className="text-[11px] text-slate-500">units expected</p>
                      </div>
                    )}
                  </td>
                  <td className="min-w-[170px] px-3 py-3">
                    {advice.totalQty == null ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <div>
                        <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                          {segments.length === 0 ? (
                            <div className="h-full w-full bg-slate-200" />
                          ) : (
                            segments.map((segment) => (
                              <div
                                key={segment.key}
                                className={segment.barClass}
                                style={{ width: `${segment.width}%` }}
                              />
                            ))
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {inwarded} of {advice.totalQty} inwarded ({percent}%)
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {advice.totalQty == null ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <UnitStatusPills counts={advice.unitStatus} />
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${adviceStatusClass(advice.status)}`}
                    >
                      {advice.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">{advice.createdBy}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">{advice.updatedAt}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/inventory/advices/${advice.id}`)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={15} className="px-4 py-12 text-center text-slate-500">
                  No advices match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNewAdvice && (
        <NewAdviceModal
          onClose={() => setShowNewAdvice(false)}
          onCreate={(advice) => {
            addAdvice(advice)
            setCreatedVersion((value) => value + 1)
            setShowNewAdvice(false)
          }}
        />
      )}
    </div>
  )
}
