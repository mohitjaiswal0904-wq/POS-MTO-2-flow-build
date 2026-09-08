import { useMemo, useRef, useState } from 'react'
import { Barcode, Search, Star, X } from 'lucide-react'
import { catalogProducts, type CatalogProduct } from '@/features/cart/data/cartData'
import { formatCurrency } from '@/shared/lib/currency'

interface AddProductModalProps {
  onClose: () => void
  onAdd: (product: CatalogProduct) => void
  cartSkus: string[]
}

export function AddProductModal({ onClose, onAdd, cartSkus }: AddProductModalProps) {
  const [query, setQuery] = useState('')
  const [scanCode, setScanCode] = useState('')
  const [scanMessage, setScanMessage] = useState('')
  const [scanError, setScanError] = useState('')
  const scanInputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return catalogProducts

    return catalogProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.barcode.toLowerCase().includes(term) ||
        product.metal.toLowerCase().includes(term),
    )
  }, [query])

  const scanProduct = (raw: string) => {
    const barcode = raw.trim()
    if (!barcode) {
      setScanError('Scan or enter a barcode.')
      setScanMessage('')
      return
    }

    const match = catalogProducts.find(
      (product) =>
        product.barcode.toLowerCase() === barcode.toLowerCase() ||
        product.sku.toLowerCase() === barcode.toLowerCase(),
    )

    if (!match) {
      setScanError(`No product found for ${barcode}.`)
      setScanMessage('')
      return
    }

    onAdd(match)
    setScanCode('')
    setScanError('')
    setScanMessage(`${match.name} added to cart.`)
    setQuery(match.sku)
    scanInputRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Add product</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Search the catalog or scan a barcode to add items to this cart.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 border-b border-slate-100 px-5 py-3">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by SKU, barcode, or product name..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
            />
          </label>

          <div>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Barcode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanCode}
                  onChange={(event) => {
                    setScanCode(event.target.value)
                    setScanError('')
                    setScanMessage('')
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      scanProduct(scanCode)
                    }
                  }}
                  placeholder="Scan barcode and press Enter"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  scanInputRef.current?.focus()
                  scanProduct(scanCode)
                }}
                className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800"
              >
                <Barcode className="size-4" />
                Scan Barcode
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {catalogProducts.map((product) => (
                <button
                  key={product.barcode}
                  type="button"
                  onClick={() => scanProduct(product.barcode)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600 hover:bg-white"
                >
                  {product.barcode}
                </button>
              ))}
            </div>
            {scanError && <p className="mt-2 text-sm text-red-600">{scanError}</p>}
            {scanMessage && <p className="mt-2 text-sm text-emerald-700">{scanMessage}</p>}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {results.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No products match your search.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((product) => {
                const inCart = cartSkus.includes(product.sku)
                const extraOffers = Math.max(0, product.offers.length - 1)

                return (
                  <article
                    key={product.sku}
                    className="rounded-xl border border-slate-200 bg-white p-2"
                  >
                    <div
                      className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100"
                      role="img"
                      aria-label={`${product.name} image`}
                    />
                    <div className="px-1 pb-0.5 pt-3">
                      <h2 className="truncate text-sm font-semibold text-slate-700">{product.name}</h2>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[9px] font-medium text-white">
                          Available (14)
                        </span>
                        <span className="rounded-md bg-blue-500 px-2 py-0.5 text-[9px] font-medium text-white">
                          Website
                        </span>
                        <span className="rounded-md bg-orange-400 px-2 py-0.5 text-[9px] font-medium text-white">
                          CP - 5.1km
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-sm">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-slate-600">4.5</span>
                        <span className="text-slate-400">(64)</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-base font-bold text-slate-700">
                          {formatCurrency(product.price)}
                        </span>
                        {product.compareAtPrice > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      {product.offers.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="truncate rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                            {product.offers[0]}
                          </span>
                          {extraOffers > 0 && (
                            <span className="shrink-0 text-[11px] font-medium text-slate-500">
                              +{extraOffers} more offer
                            </span>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => onAdd(product)}
                        className="mt-3 h-9 w-full rounded-lg bg-neutral-950 text-sm font-medium text-white hover:bg-neutral-800"
                      >
                        {inCart ? 'Add more' : 'Add to Cart'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
