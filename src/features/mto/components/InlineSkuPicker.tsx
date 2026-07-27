import { Search } from 'lucide-react'
import type { SkuCatalog } from '@/features/inventory/types'
import { skuCatalog } from '@/features/inventory/data/skuHistoryData'
import { formatCurrency } from '@/shared/lib/currency'

export function InlineSkuPicker({
  skuQuery,
  activeQuery,
  searchResults,
  onQueryChange,
  onSearch,
  onAdd,
  onClose,
}: {
  skuQuery: string
  activeQuery: string
  searchResults: SkuCatalog[]
  onQueryChange: (value: string) => void
  onSearch: (value?: string) => void
  onAdd: (sku: SkuCatalog) => void
  onClose: () => void
}) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Add another product</h2>
          <p className="mt-1 text-sm text-slate-500">
            Search a SKU and add it to this same order page
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Close
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={skuQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch()
            }}
            placeholder="Search by SKU or product name"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => onSearch()}
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
            onClick={() => onSearch(entry.sku)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              activeQuery.toUpperCase() === entry.sku
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {entry.sku}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {!activeQuery.trim() && (
          <p className="text-sm text-slate-500">Search a catalog SKU to add it below.</p>
        )}
        {activeQuery.trim() && searchResults.length === 0 && (
          <p className="text-sm text-slate-500">No SKU found. Try SKU0001 or SKU0002.</p>
        )}
        {searchResults.map((sku) => (
          <div
            key={sku.sku}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-center gap-3">
              {sku.images[0] ? (
                <img
                  src={sku.images[0]}
                  alt={sku.productName}
                  className="size-12 rounded-lg object-cover"
                />
              ) : (
                <div className="size-12 rounded-lg bg-slate-200" />
              )}
              <div>
                <p className="font-semibold text-slate-800">{sku.productName}</p>
                <p className="text-sm text-slate-500">
                  {sku.sku} · {formatCurrency(sku.price)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAdd(sku)}
              className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add to order
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
