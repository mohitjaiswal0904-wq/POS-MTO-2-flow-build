import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Warehouse,
  Eye,
  Clock,
  ShoppingBag,
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
  getUnitByBarcode,
  searchBarcodes,
  skuCatalog,
} from '@/features/inventory/data/skuHistoryData'
import { formatCurrency } from '@/shared/lib/currency'
import type { ProductHistoryEvent, ProductHistoryEventType } from '@/features/inventory/types'

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

function readBarcodeFromLocation(
  splat: string | undefined,
  barcodeQuery: string | null,
): string {
  const fromPath = splat?.replace(/\/+$/, '').trim() ?? ''
  const fromQuery = barcodeQuery?.trim() ?? ''
  const raw = fromPath || fromQuery
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function BarcodeHistoryPage() {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const activeBarcode = readBarcodeFromLocation(params['*'], searchParams.get('barcode'))

  const [query, setQuery] = useState(activeBarcode)
  const match = useMemo(
    () => (activeBarcode ? getUnitByBarcode(activeBarcode) : undefined),
    [activeBarcode],
  )
  const barcodeSuggestions = useMemo(() => searchBarcodes(query).slice(0, 8), [query])

  useEffect(() => {
    setQuery(activeBarcode)
  }, [activeBarcode])

  const openBarcode = (barcode: string) => {
    const code = barcode.trim()
    if (!code) return
    setQuery(code)
    navigate(`/inventory/history/barcode/${encodeURIComponent(code)}`)
  }

  const handleSearch = (value?: string) => {
    const next = (value ?? query).trim()
    if (!next) return

    const found = getUnitByBarcode(next) ?? searchBarcodes(next)[0]
    if (found) {
      openBarcode(found.unit.barcode)
    }
  }

  const sampleBarcodes = skuCatalog.flatMap((entry) =>
    entry.units.slice(0, 2).map((unit) => unit.barcode),
  )

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/inventory/history')}
              className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
                Barcode History
              </h1>
              <p className="text-base text-slate-500">
                Search a barcode to view only that unit’s details, status, and movement logs
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
                  placeholder="Search barcode (e.g. BC-SKU0001-0001)"
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
              {sampleBarcodes.map((barcode) => (
                <button
                  key={barcode}
                  type="button"
                  onClick={() => handleSearch(barcode)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    activeBarcode.toUpperCase() === barcode.toUpperCase()
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {barcode}
                </button>
              ))}
            </div>

            {query &&
              barcodeSuggestions.length > 0 &&
              query.trim().toUpperCase() !== activeBarcode.toUpperCase() && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2">
                  {barcodeSuggestions.map(({ sku, unit }) => (
                    <button
                      key={unit.barcode}
                      type="button"
                      onClick={() => openBarcode(unit.barcode)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{unit.barcode}</p>
                        <p className="text-xs text-slate-500">
                          {sku.sku} · {sku.productName} · {unit.status}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">View</span>
                    </button>
                  ))}
                </div>
              )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {!match ? (
            <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-[14px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-100">
                <Barcode className="size-6 text-slate-600" />
              </div>
              <p className="text-base font-semibold text-slate-800">
                {activeBarcode ? 'Barcode not found' : 'Search a barcode to view history'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Only that barcode’s details, current status, origin, and movement logs will be shown.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl space-y-4">
              <section className="rounded-[14px] border border-slate-200 bg-white p-4">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Barcode className="size-5 text-slate-600" />
                    <div>
                      <h2 className="text-xl font-semibold text-slate-700">{match.unit.barcode}</h2>
                      <p className="text-sm text-slate-500">
                        Unique unit under {match.sku.sku} · {match.sku.productName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${statusBadgeClass(match.unit.status)}`}
                  >
                    {match.unit.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Barcode" value={match.unit.barcode} />
                  <Field label="SKU" value={match.sku.sku} />
                  <Field label="Product Name" value={match.sku.productName} />
                  <Field label="Category" value={match.sku.category} />
                  <Field label="Current Status" value={match.unit.status} />
                  <Field label="Origin" value={match.unit.origin} />
                  <Field label="Location" value={match.unit.location} />
                  <Field label="Price" value={formatCurrency(match.unit.price)} />
                  <Field label="Inward Date" value={match.unit.inwardDate} />
                  <Field label="Last Movement" value={match.unit.lastMovement} />
                  <Field label="Metal" value={match.sku.metal} />
                  <Field label="Log Count" value={String(match.unit.history.length)} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/inventory/history?sku=${match.sku.sku}`)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View full SKU ({match.sku.sku})
                  </button>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryPill
                  label="Current Status"
                  value={match.unit.status}
                  hint={`Location · ${match.unit.location}`}
                />
                <SummaryPill
                  label="Origin"
                  value={match.unit.origin}
                  hint={`Inward · ${match.unit.inwardDate}`}
                />
                <SummaryPill
                  label="Movement Logs"
                  value={String(match.unit.history.length)}
                  hint={match.unit.lastMovement}
                />
              </section>

              <section className="rounded-[14px] border border-slate-200 bg-white p-4">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-700">Movement Timeline</h2>
                  <p className="text-sm text-slate-500">Newest first</p>
                </div>
                <p className="mb-5 text-sm text-slate-500">
                  Logs for barcode {match.unit.barcode} only. Flow ends at Sold, Store Transfer, or
                  Returned to Warehouse (shown as the newest event when reached).
                </p>

                <div className="relative space-y-0">
                  {match.unit.history.map((historyEvent, index) => (
                    <TimelineItem
                      key={historyEvent.id}
                      event={historyEvent}
                      isLast={index === match.unit.history.length - 1}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
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

function SummaryPill({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  )
}

function TimelineItem({
  event,
  isLast,
}: {
  event: ProductHistoryEvent
  isLast: boolean
}) {
  const visual = eventVisual(event.type)
  const Icon = visual.icon

  return (
    <div className="relative flex gap-4 pb-6">
      {!isLast && (
        <div className="absolute left-[19px] top-10 h-[calc(100%-16px)] w-px bg-slate-200" />
      )}
      <div
        className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border ${visual.ring}`}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 rounded-[10px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-800">{event.title}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${visual.badge}`}>
                {visual.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{event.description}</p>
          </div>
          <p className="text-xs font-medium text-slate-500">{event.dateLabel}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <User className="size-3.5 text-slate-400" />
            {event.actor}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-slate-400" />
              {event.location}
            </span>
          )}
          {event.reference && (
            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
              {event.reference}
            </span>
          )}
        </div>

        {event.meta && event.meta.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-200 pt-3 sm:grid-cols-2 lg:grid-cols-4">
            {event.meta.map((field) => (
              <div key={`${event.id}-${field.label}`}>
                <p className="text-xs font-medium text-slate-500">{field.label}</p>
                <p className="text-sm text-slate-800">{field.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
