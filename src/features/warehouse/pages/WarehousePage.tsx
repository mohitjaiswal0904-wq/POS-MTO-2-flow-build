import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Package,
  Plus,
  Search,
  Truck,
  Warehouse,
  X,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { formatCurrency } from '@/shared/lib/currency'
import {
  addAdvice,
  getAllAdvices,
  getInwardedCount,
  getInwardedPercent,
  matchesAdviceSearch,
} from '@/features/inventory/data/advicesData'
import { ADVICE_STATUSES, PALMONAS_LOCATIONS } from '@/features/inventory/data/stores'
import { UNIT_STATUS_LEGEND } from '@/features/inventory/data/unitStatusLegend'
import { SearchableStoreSelect } from '@/features/inventory/components/SearchableStoreSelect'
import { CreateOutwardModal } from '@/features/warehouse/components/CreateOutwardModal'
import type { Advice, AdviceStatus, AdviceUnitCounts } from '@/features/inventory/types'
import { warehouseItems, type WarehouseStatus } from '@/features/warehouse/data/warehouseData'

const WAREHOUSE = 'Palmonas Central Warehouse Pune'

type WarehouseTab = 'advices' | 'operations'

type RecencyFilter = 'any' | 'newest' | 'oldest' | 'today' | '7d' | '30d'

const RECENCY_OPTIONS: Array<{ id: RecencyFilter; label: string }> = [
  { id: 'any', label: 'Any time' },
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
]

const STOCK_STATUS_OPTIONS: Array<'All Status' | WarehouseStatus> = [
  'All Status',
  'Available',
  'In Transit',
  'Reserved',
]

function adviceStatusClass(status: AdviceStatus) {
  switch (status) {
    case 'INWARDED':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    case 'DISPATCHED':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
    case 'PARTIALLY_INWARDED':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'FAILED':
      return 'bg-red-50 text-red-700 ring-1 ring-red-200'
    case 'VOIDED':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  }
}

function stockStatusClass(status: WarehouseStatus) {
  switch (status) {
    case 'Available':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    case 'In Transit':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'Reserved':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
  }
}

export function WarehousePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: WarehouseTab = tabParam === 'operations' ? 'operations' : 'advices'
  const [showCreateOutward, setShowCreateOutward] = useState(false)
  const [createdVersion, setCreatedVersion] = useState(0)
  const [createdAdviceId, setCreatedAdviceId] = useState('')
  const [createdFileName, setCreatedFileName] = useState('')

  const setActiveTab = (tab: WarehouseTab) => {
    if (tab === 'advices') setSearchParams({})
    else setSearchParams({ tab })
  }

  return (
    <AppLayout>
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-[1400px] px-8 py-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
                Warehouse inventory
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Review warehouse history and create outward transfers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateOutward(true)}
              className="flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-violet-700"
            >
              <Plus className="size-4" />
              Create outward
            </button>
          </div>

          <div className="mt-6 border-b border-slate-200">
            <div className="flex gap-6">
              {(
                [
                  { id: 'advices', label: 'Advices' },
                  { id: 'operations', label: 'Operations' },
                ] as Array<{ id: WarehouseTab; label: string }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`-mb-px border-b-2 pb-2.5 text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-slate-900 font-semibold text-slate-900'
                      : 'border-transparent font-medium text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {createdAdviceId && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <p className="flex-1 text-sm text-emerald-800">
                Outward file uploaded. Advice{' '}
                <span className="font-semibold">{createdAdviceId}</span>
                {createdFileName ? (
                  <>
                    {' '}
                    ({createdFileName})
                  </>
                ) : null}{' '}
                is processing in the background.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCreatedAdviceId('')
                  setCreatedFileName('')
                }}
                className="text-emerald-700 hover:text-emerald-900"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="pt-5">
            {activeTab === 'advices' ? (
              <WarehouseAdvices refreshKey={createdVersion} />
            ) : (
              <WarehouseOperations />
            )}
          </div>
        </div>
      </div>

      {showCreateOutward && (
        <CreateOutwardModal
          onClose={() => setShowCreateOutward(false)}
          onCreate={(advice) => {
            addAdvice(advice)
            setCreatedVersion((value) => value + 1)
            setCreatedAdviceId(advice.id)
            setCreatedFileName(advice.fileName ?? '')
            setShowCreateOutward(false)
            setSearchParams({})
          }}
        />
      )}
    </AppLayout>
  )
}

function WarehouseAdvices({ refreshKey }: { refreshKey: number }) {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [destination, setDestination] = useState('')
  const [source, setSource] = useState('')
  const [recency, setRecency] = useState<RecencyFilter>('any')
  const [statusFilter, setStatusFilter] = useState<'All Advices' | AdviceStatus>('All Advices')

  const rows = useMemo(() => {
    const today = new Date('2026-08-25T12:00:00')
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const filtered = getAllAdvices().filter((advice) => {
      if (advice.source !== WAREHOUSE && advice.destination !== WAREHOUSE) return false
      if (!matchesAdviceSearch(advice, appliedSearch)) return false
      if (destination && advice.destination !== destination) return false
      if (source && advice.source !== source) return false
      if (statusFilter !== 'All Advices' && advice.status !== statusFilter) return false

      const updated = new Date(advice.updatedAtIso)
      if (fromDate && updated < new Date(`${fromDate}T00:00:00`)) return false
      if (toDate && updated > new Date(`${toDate}T23:59:59`)) return false

      if (recency === 'today' && updated < startOfToday) return false
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
  }, [appliedSearch, destination, fromDate, recency, refreshKey, source, statusFilter, toDate])

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onChange={(next) => {
              setFromDate(next.from)
              setToDate(next.to)
            }}
          />
          <div className="min-w-[260px] flex-1">
            <FilterLabel>Search</FilterLabel>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  placeholder="Advice no., store, status, barcode..."
                  onChange={(event) => {
                    setSearchInput(event.target.value)
                    setAppliedSearch(event.target.value)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      setAppliedSearch(searchInput)
                    }
                  }}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setAppliedSearch(searchInput)}
                className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
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
          <div className="min-w-[150px]">
            <FilterLabel>Recency</FilterLabel>
            <SelectControl
              value={recency}
              onChange={(value) => setRecency(value as RecencyFilter)}
              options={RECENCY_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
            />
          </div>
          <div className="min-w-[180px]">
            <FilterLabel>Status of advice</FilterLabel>
            <SelectControl
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as typeof statusFilter)}
              options={[
                { value: 'All Advices', label: 'All Advices' },
                ...ADVICE_STATUSES.map((status) => ({ value: status, label: status })),
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-[11px] font-medium text-slate-500">Unit status legend</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {UNIT_STATUS_LEGEND.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span className={`h-1.5 w-6 rounded-full ${item.dotClass}`} />
              <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${item.chipClass}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
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
              ].map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((advice) => (
              <tr
                key={advice.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
              >
                <td className="whitespace-nowrap px-4 py-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/inventory/advices/${advice.id}`)}
                    className="font-medium text-violet-600 hover:underline"
                  >
                    {advice.id}
                  </button>
                  {advice.fileName && (
                    <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-slate-400">
                      {advice.fileName}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">{advice.type}</td>
                <td className="px-4 py-4 text-slate-700">{advice.source}</td>
                <td className="px-4 py-4 text-slate-700">{advice.destination}</td>
                <td className="max-w-[180px] truncate px-4 py-4 text-slate-700" title={advice.fileName}>
                  {advice.fileName || <span className="text-slate-400">—</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                  {advice.increffSubOrderId || <span className="text-slate-400">—</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                  {advice.invoiceNo || <span className="text-slate-400">—</span>}
                </td>
                <td className="max-w-[220px] px-4 py-4 text-slate-700">
                  {advice.remark ? (
                    <p className="line-clamp-2" title={advice.remark}>
                      {advice.remark}
                    </p>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {advice.totalQty == null ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <div className="text-center">
                      <p className="text-xl font-semibold leading-6 text-slate-900">
                        {advice.totalQty}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                        units expected
                      </p>
                    </div>
                  )}
                </td>
                <td className="min-w-[190px] px-4 py-4">
                  <QuantityDistribution advice={advice} />
                </td>
                <td className="px-4 py-4">
                  {advice.totalQty == null ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <UnitStatusPills counts={advice.unitStatus} />
                  )}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold ${adviceStatusClass(advice.status)}`}
                  >
                    {advice.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-700">{advice.createdBy}</td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-500">{advice.updatedAt}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={14} className="px-4 py-12 text-center text-slate-500">
                  No advices match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function QuantityDistribution({ advice }: { advice: Advice }) {
  if (advice.totalQty == null) return <span className="text-slate-400">—</span>

  const total = advice.totalQty
  const inwarded = getInwardedCount(advice)
  const percent = getInwardedPercent(advice) ?? 0
  const segments = UNIT_STATUS_LEGEND.map((item) => ({
    ...item,
    count: advice.unitStatus[item.key],
  })).filter((item) => item.count > 0)

  return (
    <div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-100">
        {segments.length === 0 ? (
          <div className="h-full w-full bg-slate-200" />
        ) : (
          segments.map((segment) => (
            <div
              key={segment.key}
              className={segment.barClass}
              style={{ width: `${(segment.count / total) * 100}%` }}
            />
          ))
        )}
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        {inwarded} of {total} inwarded ({percent}%)
      </p>
    </div>
  )
}

function UnitStatusPills({ counts }: { counts: AdviceUnitCounts }) {
  const chips = UNIT_STATUS_LEGEND.filter((item) => counts[item.key] > 0)
  if (chips.length === 0) return <span className="text-slate-400">—</span>

  return (
    <div className="flex max-w-[260px] flex-wrap gap-1.5">
      {chips.map((item) => (
        <span
          key={item.key}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium ${item.chipClass}`}
        >
          {item.label}
          <span className="font-semibold">{counts[item.key]}</span>
        </span>
      ))}
    </div>
  )
}

function DateRangeFilter({
  fromDate,
  toDate,
  onChange,
}: {
  fromDate: string
  toDate: string
  onChange: (next: { from: string; to: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const label = fromDate || toDate ? `${fromDate || 'Any'} → ${toDate || 'Any'}` : 'Date Range'

  return (
    <div ref={rootRef} className="relative min-w-[150px]">
      <FilterLabel>Date</FilterLabel>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Calendar className="size-4 shrink-0 text-slate-400" />
        <span className="truncate">{label}</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(event) => onChange({ from: event.target.value, to: toDate })}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm font-normal normal-case tracking-normal text-slate-700 focus:outline-none"
            />
          </label>
          <label className="mt-2 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
            To
            <input
              type="date"
              value={toDate}
              onChange={(event) => onChange({ from: fromDate, to: event.target.value })}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm font-normal normal-case tracking-normal text-slate-700 focus:outline-none"
            />
          </label>
          <div className="mt-3 flex justify-between">
            <button
              type="button"
              onClick={() => onChange({ from: '', to: '' })}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">{children}</p>
  )
}

function SelectControl({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-9 text-sm font-medium text-slate-700 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function WarehouseOperations() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All Status' | WarehouseStatus>('All Status')

  const totals = useMemo(() => {
    const sumFor = (status: WarehouseStatus) =>
      warehouseItems
        .filter((item) => item.status === status)
        .reduce((sum, item) => sum + item.quantity, 0)

    const available = sumFor('Available')
    const transit = sumFor('In Transit')
    const reserved = sumFor('Reserved')
    return { total: available + transit + reserved, available, transit, reserved }
  }, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return warehouseItems.filter((item) => {
      const matchesSearch =
        !query ||
        item.sku.toLowerCase().includes(query) ||
        item.productName.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total stock"
          value={String(totals.total)}
          icon={<Package className="size-5 text-slate-600" />}
          iconBg="bg-slate-100"
        />
        <SummaryCard
          label="Available"
          value={String(totals.available)}
          icon={<Warehouse className="size-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <SummaryCard
          label="In transit"
          value={String(totals.transit)}
          icon={<Truck className="size-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <SummaryCard
          label="Reserved"
          value={String(totals.reserved)}
          icon={<Clock className="size-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by SKU or product name..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="min-w-[160px]">
          <SelectControl
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as typeof statusFilter)}
            options={STOCK_STATUS_OPTIONS.map((option) => ({ value: option, label: option }))}
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['SKU', 'Product Name', 'Category', 'Status', 'Quantity', 'Bin', 'Price', 'Last Updated'].map(
                (header) => (
                  <th
                    key={header}
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
              >
                <td className="px-4 py-4 font-medium text-slate-800">{item.sku}</td>
                <td className="px-4 py-4 text-slate-700">{item.productName}</td>
                <td className="px-4 py-4 text-slate-700">{item.category}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${stockStatusClass(item.status)}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-700">{item.quantity}</td>
                <td className="px-4 py-4 text-slate-700">{item.bin}</td>
                <td className="px-4 py-4 text-slate-700">{formatCurrency(item.price)}</td>
                <td className="px-4 py-4 text-slate-500">{item.lastUpdated}</td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  No warehouse items match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
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
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-[26px] font-semibold leading-8 tracking-tight text-slate-900">
          {value}
        </p>
      </div>
      <div className={`flex size-11 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
    </div>
  )
}
