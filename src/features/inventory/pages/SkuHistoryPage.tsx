import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Package,
  Warehouse,
  Eye,
  Clock,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Barcode,
  MapPin,
  User,
  ArrowDownToLine,
  ArrowUpFromLine,
  IndianRupee,
  StickyNote,
  Type,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import {
  getOriginBreakdown,
  getSkuAvailability,
  getSkuByCode,
  getUnitByBarcode,
  isLikelyBarcodeQuery,
  searchBarcodes,
  searchSkuCatalog,
  skuCatalog,
} from '@/features/inventory/data/skuHistoryData'
import { formatCurrency } from '@/shared/lib/currency'
import type { ProductHistoryEvent, ProductHistoryEventType, SkuCatalog, SkuUnit } from '@/features/inventory/types'

function statusBadgeClass(status: string) {
  switch (status) {
    case 'Display':
      return 'bg-green-100 text-green-700'
    case 'Backoffice':
      return 'bg-orange-100 text-orange-700'
    case 'Reserved':
      return 'bg-blue-100 text-blue-700'
    case 'Sold':
      return 'bg-slate-900 text-white'
    case 'Warehouse':
      return 'bg-cyan-100 text-cyan-800'
    case 'Transferred':
      return 'bg-violet-100 text-violet-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function eventVisual(type: ProductHistoryEventType) {
  switch (type) {
    case 'inward':
      return {
        icon: ArrowDownToLine,
        ring: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700',
        label: 'Inward',
      }
    case 'returned_warehouse':
      return {
        icon: Warehouse,
        ring: 'border-cyan-200 bg-cyan-50 text-cyan-700',
        badge: 'bg-cyan-100 text-cyan-700',
        label: 'Endpoint · Warehouse',
      }
    case 'store_transfer':
      return {
        icon: ArrowUpFromLine,
        ring: 'border-violet-200 bg-violet-50 text-violet-700',
        badge: 'bg-violet-100 text-violet-700',
        label: 'Endpoint · Transfer',
      }
    case 'moved_backoffice':
      return {
        icon: Warehouse,
        ring: 'border-orange-200 bg-orange-50 text-orange-700',
        badge: 'bg-orange-100 text-orange-700',
        label: 'Backoffice',
      }
    case 'moved_display':
      return {
        icon: Eye,
        ring: 'border-green-200 bg-green-50 text-green-700',
        badge: 'bg-green-100 text-green-700',
        label: 'Display',
      }
    case 'reserved':
    case 'unreserved':
      return {
        icon: Clock,
        ring: 'border-blue-200 bg-blue-50 text-blue-700',
        badge: 'bg-blue-100 text-blue-700',
        label: 'Reserved',
      }
    case 'outward':
      return {
        icon: ArrowUpFromLine,
        ring: 'border-violet-200 bg-violet-50 text-violet-700',
        badge: 'bg-violet-100 text-violet-700',
        label: 'Outward',
      }
    case 'sold':
      return {
        icon: ShoppingBag,
        ring: 'border-slate-800 bg-slate-900 text-white',
        badge: 'bg-slate-900 text-white',
        label: 'Endpoint · Sold',
      }
    case 'price_update':
      return {
        icon: IndianRupee,
        ring: 'border-amber-200 bg-amber-50 text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        label: 'Price Changed',
      }
    case 'name_changed':
      return {
        icon: Type,
        ring: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        badge: 'bg-indigo-100 text-indigo-700',
        label: 'Name Changed',
      }
    case 'location_change':
      return {
        icon: MapPin,
        ring: 'border-sky-200 bg-sky-50 text-sky-700',
        badge: 'bg-sky-100 text-sky-700',
        label: 'Location',
      }
    case 'note':
      return {
        icon: StickyNote,
        ring: 'border-slate-200 bg-slate-50 text-slate-600',
        badge: 'bg-slate-100 text-slate-600',
        label: 'Note',
      }
  }
}

export function SkuHistoryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSku = searchParams.get('sku') ?? ''
  const [query, setQuery] = useState(initialSku)
  const [selectedSku, setSelectedSku] = useState<string>(initialSku)
  const [expandedBarcode, setExpandedBarcode] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'All' | SkuUnit['status']>('All')

  useEffect(() => {
    const skuFromUrl = searchParams.get('sku')
    if (skuFromUrl) {
      setSelectedSku(skuFromUrl)
      setQuery(skuFromUrl)
    }
  }, [searchParams])

  const matchedSku = useMemo(() => {
    if (!selectedSku) return undefined
    return getSkuByCode(selectedSku)
  }, [selectedSku])

  const suggestions = useMemo(() => searchSkuCatalog(query), [query])

  const availability = matchedSku ? getSkuAvailability(matchedSku) : null
  const origins = matchedSku ? getOriginBreakdown(matchedSku) : []

  const filteredUnits = useMemo(() => {
    if (!matchedSku) return []
    if (statusFilter === 'All') return matchedSku.units
    return matchedSku.units.filter((unit) => unit.status === statusFilter)
  }, [matchedSku, statusFilter])

  const barcodeSuggestions = useMemo(() => searchBarcodes(query).slice(0, 6), [query])

  const handleSearch = (value?: string) => {
    const next = (value ?? query).trim()
    if (!next) return

    {
      const barcodeMatch = getUnitByBarcode(next) ?? (
        isLikelyBarcodeQuery(next) ? searchBarcodes(next)[0] : undefined
      )
      if (barcodeMatch) {
        navigate(`/inventory/history/barcode/${encodeURIComponent(barcodeMatch.unit.barcode)}`)
        return
      }
    }

    const exact = getSkuByCode(next)
    const fallback = searchSkuCatalog(next)[0]
    const found = exact ?? fallback

    if (found) {
      setSelectedSku(found.sku)
      setQuery(found.sku)
      setSearchParams({ sku: found.sku })
      setExpandedBarcode(null)
      setStatusFilter('All')
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
                SKU History
              </h1>
              <p className="text-base text-slate-500">
                Search by SKU for full availability, or by barcode for that unit’s history only
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[280px] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                  placeholder="Search by SKU or barcode (e.g. SKU0001, BC-SKU0001-0001)"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="h-11 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white"
              >
                Search
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {skuCatalog.map((entry) => (
                <button
                  key={entry.sku}
                  type="button"
                  onClick={() => handleSearch(entry.sku)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    selectedSku === entry.sku
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {entry.sku}
                </button>
              ))}
            </div>

            {query &&
              (suggestions.length > 0 || barcodeSuggestions.length > 0) &&
              query.trim().toUpperCase() !== selectedSku && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2">
                  {barcodeSuggestions.length > 0 && (
                    <>
                      <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Barcodes
                      </p>
                      {barcodeSuggestions.map(({ sku, unit }) => (
                        <button
                          key={unit.barcode}
                          type="button"
                          onClick={() => handleSearch(unit.barcode)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">{unit.barcode}</p>
                            <p className="text-xs text-slate-500">
                              {sku.sku} · {unit.status} · {unit.origin}
                            </p>
                          </div>
                          <span className="text-xs text-slate-400">Open barcode</span>
                        </button>
                      ))}
                    </>
                  )}
                  {suggestions.length > 0 && (
                    <>
                      <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        SKUs
                      </p>
                      {suggestions.map((entry) => (
                        <button
                          key={entry.sku}
                          type="button"
                          onClick={() => handleSearch(entry.sku)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">{entry.sku}</p>
                            <p className="text-xs text-slate-500">
                              {entry.productName} · {entry.units.length} units
                            </p>
                          </div>
                          <span className="text-xs text-slate-400">View SKU</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {!matchedSku || !availability ? (
            <EmptySearchState />
          ) : (
            <div className="mx-auto max-w-5xl space-y-4">
              <SkuOverview sku={matchedSku} availability={availability} origins={origins} />

              <section className="rounded-[14px] border border-slate-200 bg-white p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-700">
                      Individual Units ({filteredUnits.length})
                    </h2>
                    <p className="text-sm text-slate-500">
                      Endpoints: Sold, Store Transfer, or Returned to Warehouse — newest event ends
                      the flow
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'All',
                        'Display',
                        'Backoffice',
                        'Reserved',
                        'Sold',
                        'Transferred',
                        'Warehouse',
                      ] as const
                    ).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                          statusFilter === status
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredUnits.map((unit) => (
                    <UnitCard
                      key={unit.barcode}
                      unit={unit}
                      expanded={expandedBarcode === unit.barcode}
                      onToggle={() =>
                        setExpandedBarcode((current) =>
                          current === unit.barcode ? null : unit.barcode,
                        )
                      }
                      onOpenBarcode={() =>
                        navigate(`/inventory/history/barcode/${encodeURIComponent(unit.barcode)}`)
                      }
                    />
                  ))}
                  {filteredUnits.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                      No units match this status filter.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function EmptySearchState() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-[14px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-100">
        <Barcode className="size-6 text-slate-600" />
      </div>
      <p className="text-base font-semibold text-slate-800">Search a SKU to view history</p>
      <p className="mt-1 text-sm text-slate-500">
        See total availability by status, origin breakdown, and movement logs for every barcode under
        that SKU.
      </p>
    </div>
  )
}

function SkuOverview({
  sku,
  availability,
  origins,
}: {
  sku: SkuCatalog
  availability: ReturnType<typeof getSkuAvailability>
  origins: Array<{ origin: string; count: number }>
}) {
  return (
    <>
      <section className="rounded-[14px] border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <Package className="size-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-700">SKU Information</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="SKU" value={sku.sku} />
          <Field label="Product Name" value={sku.productName} />
          <Field label="Category" value={sku.category} />
          <Field label="Metal" value={sku.metal} />
          <Field label="Unit Price" value={formatCurrency(sku.price)} />
          <Field label="Total Quantity" value={String(availability.total)} />
          <Field label="In store (active)" value={String(availability.available)} />
          <Field
            label="Ended (endpoints)"
            value={String(
              availability.sold + availability.warehouse + availability.transferred,
            )}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="On Display"
          value={String(availability.display)}
          hint={`of ${availability.total} units`}
          icon={<Eye className="size-5 text-green-600" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="Backoffice"
          value={String(availability.backoffice)}
          hint={`of ${availability.total} units`}
          icon={<Package className="size-5 text-orange-600" />}
          iconBg="bg-orange-50"
        />
        <StatCard
          label="Reserved"
          value={String(availability.reserved)}
          hint={`of ${availability.total} units`}
          icon={<Clock className="size-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Sold"
          value={String(availability.sold)}
          hint="Endpoint · flow ended"
          icon={<ShoppingBag className="size-5 text-slate-700" />}
          iconBg="bg-slate-100"
        />
        <StatCard
          label="Store Transfer"
          value={String(availability.transferred)}
          hint="Endpoint · flow ended"
          icon={<ArrowUpFromLine className="size-5 text-violet-700" />}
          iconBg="bg-violet-50"
        />
        <StatCard
          label="Returned to Warehouse"
          value={String(availability.warehouse)}
          hint="Endpoint · flow ended"
          icon={<Warehouse className="size-5 text-cyan-700" />}
          iconBg="bg-cyan-50"
        />
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-xl font-semibold text-slate-700">Origin Breakdown</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {origins.map(({ origin, count }) => (
            <div
              key={origin}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p className="text-sm font-medium text-slate-700">{origin}</p>
              <p className="text-sm font-semibold text-slate-900">
                {count} unit{count > 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function UnitCard({
  unit,
  expanded,
  onToggle,
  onOpenBarcode,
}: {
  unit: SkuUnit
  expanded: boolean
  onToggle: () => void
  onOpenBarcode: () => void
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
      <div className="flex w-full items-start justify-between gap-4 p-4">
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left hover:opacity-90">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-800">{unit.barcode}</p>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(unit.status)}`}>
              {unit.status}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3">
            <p>
              <span className="text-slate-400">Origin · </span>
              {unit.origin}
            </p>
            <p>
              <span className="text-slate-400">Location · </span>
              {unit.location}
            </p>
            <p>
              <span className="text-slate-400">Last move · </span>
              {unit.lastMovement}
            </p>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenBarcode}
            className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
          >
            Open
          </button>
          <p className="text-sm font-semibold text-slate-800">{formatCurrency(unit.price)}</p>
          <button type="button" onClick={onToggle} className="text-slate-500">
            {expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
          <p className="mb-3 text-sm font-medium text-slate-700">
            Movement log for {unit.barcode}
          </p>
          <div className="space-y-0">
            {unit.history.map((historyEvent, index) => (
              <UnitTimelineItem
                key={historyEvent.id}
                event={historyEvent}
                isLast={index === unit.history.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UnitTimelineItem({
  event,
  isLast,
}: {
  event: ProductHistoryEvent
  isLast: boolean
}) {
  const visual = eventVisual(event.type)
  const Icon = visual.icon

  return (
    <div className="relative flex gap-3 pb-4">
      {!isLast && (
        <div className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-slate-200" />
      )}
      <div
        className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border ${visual.ring}`}
      >
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1 rounded-[10px] border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">{event.title}</p>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${visual.badge}`}>
                {visual.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{event.description}</p>
          </div>
          <p className="text-xs text-slate-500">{event.dateLabel}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <User className="size-3 text-slate-400" />
            {event.actor}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 text-slate-400" />
              {event.location}
            </span>
          )}
          {event.reference && (
            <span className="rounded border border-slate-200 px-1.5 py-0.5 font-medium text-slate-700">
              {event.reference}
            </span>
          )}
        </div>
        {event.meta && event.meta.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 sm:grid-cols-3">
            {event.meta.map((field) => (
              <div key={`${event.id}-${field.label}`}>
                <p className="text-[11px] font-medium text-slate-500">{field.label}</p>
                <p className="text-xs text-slate-800">{field.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon,
  iconBg,
}: {
  label: string
  value: string
  hint: string
  icon: ReactNode
  iconBg: string
}) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      </div>
      <div className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
    </div>
  )
}
