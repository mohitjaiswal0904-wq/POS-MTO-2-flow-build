import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  ArrowDownToLine,
  Warehouse,
  Eye,
  Clock,
  ArrowUpFromLine,
  ShoppingBag,
  IndianRupee,
  MapPin,
  StickyNote,
  User,
  Type,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { getInventoryItemById, getProductHistory } from '@/features/inventory/data/inventoryData'
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

export function ProductHistoryPage() {
  const { itemId = '' } = useParams()
  const navigate = useNavigate()
  const item = getInventoryItemById(itemId)
  const events = useMemo(() => getProductHistory(itemId), [itemId])

  if (!item) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <p className="text-base font-medium text-slate-700">Inventory item not found</p>
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white"
          >
            Back to Inventory
          </button>
        </div>
      </AppLayout>
    )
  }

  const soldEvent = events.find((event) => event.type === 'sold')
  const inwardEvent = events.find((event) => event.type === 'inward')

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-center justify-between gap-4">
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
                  Product History
                </h1>
                <p className="text-base text-slate-500">
                  Full lifecycle logs from inward to customer sale
                </p>
              </div>
            </div>
            <span className={`rounded-lg px-3 py-1 text-sm font-medium ${statusBadgeClass(item.status)}`}>
              {item.status}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-4">
            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <Package className="size-5 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-700">Product Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailField label="Design ID" value={item.designId} />
                <DetailField label="Product Name" value={item.productName} />
                <DetailField label="Category" value={item.category} />
                <DetailField label="Location" value={item.location} />
                <DetailField label="Quantity" value={String(item.quantity)} />
                <DetailField label="Price" value={formatCurrency(item.price)} />
                <DetailField label="Last Updated" value={item.lastUpdated} />
                <DetailField label="Inventory Ref" value={item.id.toUpperCase()} />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryPill
                label="Journey Start"
                value={inwardEvent?.dateLabel ?? '—'}
                hint={inwardEvent?.reference ?? 'Awaiting inward'}
              />
              <SummaryPill
                label="Total Logs"
                value={String(events.length)}
                hint="Tracked lifecycle events"
              />
              <SummaryPill
                label="Current Status"
                value={soldEvent ? 'Sold' : item.status}
                hint={soldEvent ? (soldEvent.reference ?? 'Sale completed') : `Location · ${item.location}`}
              />
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-700">Lifecycle Timeline</h2>
                <p className="text-sm text-slate-500">Newest first</p>
              </div>
              <p className="mb-5 text-sm text-slate-500">
                Every stock movement and sales action for this item unit/line.
              </p>

              <div className="relative space-y-0">
                {events.map((event, index) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isLast={index === events.length - 1}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
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
