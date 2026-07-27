import { Package, Plus, Search } from 'lucide-react'
import type { SkuCatalog } from '@/features/inventory/types'
import { formatCurrency } from '@/shared/lib/currency'

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[14px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-100">
        <Search className="size-6 text-slate-600" />
      </div>
      <p className="text-base font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  )
}

export function SkuResultCard({
  sku,
  actionLabel,
  onAction,
}: {
  sku: SkuCatalog
  actionLabel: string
  onAction: () => void
}) {
  const available = sku.units.filter(
    (unit) =>
      unit.status === 'Display' || unit.status === 'Backoffice' || unit.status === 'Reserved',
  ).length

  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          {sku.images[0] ? (
            <img
              src={sku.images[0]}
              alt={sku.productName}
              className="size-16 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Package className="size-7 text-amber-700" />
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-800">{sku.sku}</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                Catalog SKU
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Live
              </span>
            </div>
            <p className="mt-1 text-base text-slate-600">{sku.productName}</p>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <p className="text-slate-400">Category</p>
                <p className="font-medium text-slate-800">{sku.category}</p>
              </div>
              <div>
                <p className="text-slate-400">Metal</p>
                <p className="font-medium text-slate-800">{sku.metal}</p>
              </div>
              <div>
                <p className="text-slate-400">Price</p>
                <p className="font-medium text-slate-800">{formatCurrency(sku.price)}</p>
              </div>
              <div>
                <p className="text-slate-400">Available</p>
                <p className="font-medium text-slate-800">
                  {available} / {sku.units.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          {actionLabel}
        </button>
      </div>
    </section>
  )
}

export function ProductDetailsCard({
  sku,
  appendMode,
  onStartCustomization,
}: {
  sku: SkuCatalog
  appendMode?: boolean
  onStartCustomization: () => void
}) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          {sku.images[0] && (
            <img
              src={sku.images[0]}
              alt={sku.productName}
              className="size-24 shrink-0 rounded-xl object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium text-slate-500">Product details</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{sku.productName}</h2>
            <p className="mt-1 text-sm text-slate-500">{sku.sku}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onStartCustomization}
          className="flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          {appendMode ? (
            <>
              <Plus className="size-4" />
              Add to order
            </>
          ) : (
            'Start Customization'
          )}
        </button>
      </div>

      {sku.images.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-sm font-medium text-slate-600">Live product images</p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sku.images.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`${sku.productName} ${index + 1}`}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Category" value={sku.category} />
        <Detail label="Metal" value={sku.metal} />
        <Detail label="Base price" value={formatCurrency(sku.price)} />
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
        After starting customization you can change metal type, karat, gold colour, diamond shape /
        clarity, ring size, engraving, and other supported attributes. You can also add more
        products to the same order before payment.
      </div>
    </section>
  )
}

export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}
