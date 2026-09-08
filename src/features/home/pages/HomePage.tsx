import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Barcode,
  Bell,
  ChevronDown,
  Gift,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Star,
  Wifi,
  X,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { formatCurrency } from '@/shared/lib/currency'
import {
  catalogItems,
  COLLECTION_FILTERS,
  type CatalogItem,
} from '@/features/home/data/catalog'
import {
  clearPopRedemptionSession,
  parsePopRedemptionFromSearch,
  popRedemptionQuery,
  readPopRedemptionSession,
  writePopRedemptionSession,
  type PopRedemptionSession,
} from '@/features/pop/data/popRedemptionSession'

const goldPrices = [
  ['22 Carat pure', '₹ 7,802 per gram'],
  ['4 diff gold pure', '₹ 8,505 per gram'],
  ['18.1 Gold pure', '₹ 6,950 per gram'],
  ['24.1 Gold pure', '₹ 8,602 per gram'],
  ['7 diff gold price / HDFC', '₹ 8,747 per gram'],
]

const PRICE_OPTIONS = [
  { id: 'all', label: 'All Prices' },
  { id: 'under-20', label: 'Under ₹20,000' },
  { id: '20-50', label: '₹20,000 - ₹50,000' },
  { id: 'above-50', label: 'Above ₹50,000' },
] as const

function matchesPrice(price: number, band: string) {
  if (band === 'all') return true
  if (band === 'under-20') return price < 20000
  if (band === '20-50') return price >= 20000 && price <= 50000
  return price > 50000
}

export function HomePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<'all' | 'in_store'>('all')
  const [collection, setCollection] = useState<(typeof COLLECTION_FILTERS)[number]>(
    'ENTIRE COLLECTION',
  )
  const [nearestOnly, setNearestOnly] = useState(false)
  const [offersOnly, setOffersOnly] = useState(false)
  const [color, setColor] = useState('all')
  const [type, setType] = useState('all')
  const [metal, setMetal] = useState('all')
  const [stone, setStone] = useState('all')
  const [priceBand, setPriceBand] = useState('all')
  const [cartCount, setCartCount] = useState(0)
  const [popRedemption, setPopRedemption] = useState<PopRedemptionSession | null>(null)

  useEffect(() => {
    const fromUrl = parsePopRedemptionFromSearch(searchParams)
    if (fromUrl) {
      writePopRedemptionSession(fromUrl)
      setPopRedemption(fromUrl)
      return
    }
    setPopRedemption(readPopRedemptionSession())
  }, [searchParams])

  const goToCart = () => {
    if (popRedemption) {
      navigate(`/cart?${popRedemptionQuery(popRedemption)}`)
      return
    }
    navigate('/cart')
  }

  const dismissPopRedemption = () => {
    clearPopRedemptionSession()
    setPopRedemption(null)
    if (
      searchParams.has('popPlan') ||
      searchParams.has('giftCard') ||
      searchParams.has('value')
    ) {
      const next = new URLSearchParams(searchParams)
      next.delete('popPlan')
      next.delete('giftCard')
      next.delete('value')
      setSearchParams(next, { replace: true })
    }
  }

  const sourceProducts = useMemo(() => {
    if (source === 'in_store') {
      return catalogItems.filter((item) => item.sources.includes('in_store'))
    }
    return catalogItems
  }, [source])

  const availableCollections = useMemo(() => {
    const present = new Set(sourceProducts.map((item) => item.collection))
    return COLLECTION_FILTERS.filter(
      (name) => name === 'ENTIRE COLLECTION' || present.has(name),
    )
  }, [sourceProducts])

  const showNearest = source === 'all' && sourceProducts.some((item) => item.sources.includes('nearest'))
  const showOffers = sourceProducts.some((item) => item.offers.length > 0)

  const attributePool = useMemo(() => {
    return sourceProducts.filter((item) => {
      if (collection !== 'ENTIRE COLLECTION' && item.collection !== collection) return false
      if (nearestOnly && !item.sources.includes('nearest')) return false
      if (offersOnly && item.offers.length === 0) return false
      return true
    })
  }, [collection, nearestOnly, offersOnly, sourceProducts])

  const colorOptions = uniqueValues(attributePool, 'color')
  const typeOptions = uniqueValues(attributePool, 'type')
  const metalOptions = uniqueValues(attributePool, 'metal')
  const stoneOptions = uniqueValues(attributePool, 'stone')

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return attributePool.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.collection.toLowerCase().includes(normalizedQuery) ||
        item.metal.toLowerCase().includes(normalizedQuery)
      return (
        matchesQuery &&
        (color === 'all' || item.color === color) &&
        (type === 'all' || item.type === type) &&
        (metal === 'all' || item.metal === metal) &&
        (stone === 'all' || item.stone === stone) &&
        matchesPrice(item.price, priceBand)
      )
    })
  }, [attributePool, color, metal, priceBand, query, stone, type])

  const selectAll = () => {
    setSource('all')
    setCollection('ENTIRE COLLECTION')
    setNearestOnly(false)
    setOffersOnly(false)
    resetAttributes()
  }

  const selectInStore = () => {
    const inStoreItems = catalogItems.filter((item) => item.sources.includes('in_store'))
    const present = new Set(inStoreItems.map((item) => item.collection))
    setSource('in_store')
    setNearestOnly(false)
    setOffersOnly(false)
    setCollection((current) =>
      current !== 'ENTIRE COLLECTION' && !present.has(current) ? 'ENTIRE COLLECTION' : current,
    )
    resetAttributes()
  }

  const resetAttributes = () => {
    setColor('all')
    setType('all')
    setMetal('all')
    setStone('all')
    setPriceBand('all')
  }

  return (
    <AppLayout>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <header className="shrink-0 px-3 pt-3">
          <div className="flex h-[62px] items-center justify-between border-b border-slate-200 px-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-[22px] shrink-0 items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 text-[11px] font-medium text-emerald-700">
                <Wifi className="size-3" />
                6.6 MBPS
              </div>
              <label className="relative hidden w-full max-w-[400px] sm:block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search Anything"
                  className="h-9 w-full rounded-full bg-slate-50 pl-9 pr-4 text-xs text-slate-700 outline-none placeholder:text-slate-500"
                />
              </label>
            </div>

            <div className="ml-3 flex shrink-0 items-center gap-3">
              <button
                type="button"
                className="relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                <span className="absolute -right-0.5 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  1
                </span>
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                aria-label="Refresh"
              >
                <RefreshCw className="size-4" />
              </button>
              <span className="hidden h-9 items-center rounded-full border border-slate-200 px-3 text-[11px] font-medium text-slate-600 lg:flex">
                KPstore@palmonas.com
              </span>
              <button
                type="button"
                onClick={goToCart}
                className="flex h-9 items-center gap-2 rounded-full border-2 border-slate-900 px-3 text-sm font-medium text-slate-900"
              >
                Cart
                <span className="relative">
                  <ShoppingCart className="size-4" />
                  {cartCount > 0 && (
                    <span className="absolute -right-2.5 -top-2.5 flex size-4 items-center justify-center rounded-full bg-slate-900 text-[9px] text-white">
                      {cartCount}
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="h-[71px] overflow-hidden bg-slate-50 px-6 py-3">
            <div className="mb-1.5 flex items-center gap-3">
              <span className="rounded-md bg-emerald-300 px-2.5 py-1 text-[11px] font-semibold text-white">
                LIVE
              </span>
              <span className="text-[11px] font-semibold text-slate-600">Gold Prices</span>
            </div>
            <div className="flex min-w-max items-center">
              {goldPrices.map(([label, price], index) => (
                <div key={label} className="flex items-center">
                  <span className="text-xs text-slate-600">{label}:</span>
                  <span className="ml-2 text-xs font-semibold text-slate-700">{price}</span>
                  {index < goldPrices.length - 1 && (
                    <span className="mx-7 h-4 w-px bg-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        {popRedemption && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <Gift className="mt-0.5 size-4 shrink-0 text-amber-800" />
                <div>
                  <p className="text-sm font-semibold text-amber-950">
                    POP gift card ready · {popRedemption.giftCard} ·{' '}
                    {formatCurrency(popRedemption.value)}
                  </p>
                  <p className="text-xs text-amber-800">
                    Plan {popRedemption.planId}. Add jewellery, then open Cart — the gift credit
                    applies at checkout.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={goToCart}
                  className="h-8 rounded-lg bg-slate-950 px-3 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Go to cart
                </button>
                <button
                  type="button"
                  onClick={dismissPopRedemption}
                  className="flex size-8 items-center justify-center rounded-lg text-amber-900 hover:bg-amber-100"
                  aria-label="Dismiss POP gift banner"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
          <div className="pt-3">
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg bg-neutral-950 px-3 text-sm font-medium text-white"
            >
              <Plus className="size-4" />
              Add Walk In
            </button>
          </div>

          <section className="mt-3">
            <h1 className="mb-2 text-sm font-semibold text-slate-700">Search Products</h1>
            <div className="flex gap-3">
              <label className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by SKU, product name, or category..."
                  className="h-11 w-full rounded-lg bg-slate-50 pl-10 pr-20 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-600">
                  Search
                </span>
              </label>
              <button
                type="button"
                className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white"
              >
                <Barcode className="size-4" />
                <span className="hidden sm:inline">Scan Barcode</span>
              </button>
            </div>
          </section>

          <div className="mt-5">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Availability
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={source === 'all' && !nearestOnly} onClick={selectAll}>
                ALL
              </FilterChip>
              <FilterChip
                active={source === 'in_store'}
                dismissible={source === 'in_store'}
                onClick={selectInStore}
                onDismiss={selectAll}
              >
                IN HOUSE
              </FilterChip>
              {showNearest && (
                <FilterChip
                  active={nearestOnly}
                  dismissible={nearestOnly}
                  onClick={() => {
                    setSource('all')
                    setNearestOnly(true)
                  }}
                  onDismiss={() => setNearestOnly(false)}
                >
                  NEAREST STORE
                </FilterChip>
              )}
            </div>
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Collections & offers
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCollections.map((name) => (
                <FilterChip
                  key={name}
                  active={collection === name}
                  dismissible={collection === name && name !== 'ENTIRE COLLECTION'}
                  onClick={() => {
                    setCollection(name)
                    resetAttributes()
                  }}
                  onDismiss={() => setCollection('ENTIRE COLLECTION')}
                >
                  {name}
                </FilterChip>
              ))}
              {showOffers && (
                <FilterChip
                  active={offersOnly}
                  dismissible={offersOnly}
                  onClick={() => setOffersOnly(true)}
                  onDismiss={() => setOffersOnly(false)}
                >
                  OFFERS
                </FilterChip>
              )}
            </div>
          </div>

          <div className="mt-3 grid max-w-[832px] grid-cols-2 gap-2 md:grid-cols-5">
            <FilterSelect
              allLabel="All Colors"
              value={color}
              options={colorOptions}
              onChange={setColor}
            />
            <FilterSelect
              allLabel="All Types"
              value={type}
              options={typeOptions}
              onChange={setType}
            />
            <FilterSelect
              allLabel="All Metals"
              value={metal}
              options={metalOptions}
              onChange={setMetal}
            />
            <FilterSelect
              allLabel="All Stones"
              value={stone}
              options={stoneOptions}
              onChange={setStone}
            />
            <FilterSelect
              allLabel="All Prices"
              value={priceBand}
              options={PRICE_OPTIONS.filter((option) => option.id !== 'all').map((option) => ({
                id: option.id,
                label: option.label,
              }))}
              onChange={setPriceBand}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <article
                key={product.id}
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
                    {product.sources.includes('in_store') && (
                      <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[9px] font-medium text-white">
                        Available ({product.stock})
                      </span>
                    )}
                    {product.sources.includes('website') && (
                      <span className="rounded-md bg-blue-500 px-2 py-0.5 text-[9px] font-medium text-white">
                        Website
                      </span>
                    )}
                    {product.sources.includes('nearest') && (
                      <span className="rounded-md bg-orange-400 px-2 py-0.5 text-[9px] font-medium text-white">
                        CP - 5.1km
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-sm">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-slate-600">{product.rating}</span>
                    <span className="text-slate-400">({product.reviews})</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-base font-bold text-slate-700">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(product.compareAtPrice)}
                    </span>
                  </div>
                  {product.offers.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="truncate rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                        {product.offers[0]}
                      </span>
                      {product.offers.length > 1 && (
                        <span className="shrink-0 text-[11px] font-medium text-slate-500">
                          +{product.offers.length - 1} more offer
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setCartCount((count) => count + 1)}
                    className="mt-3 h-9 w-full rounded-lg bg-neutral-950 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>

          {visibleProducts.length === 0 && (
            <div className="py-20 text-center text-sm text-slate-500">
              No products match your search.
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  )
}

function uniqueValues(items: CatalogItem[], key: 'color' | 'type' | 'metal' | 'stone') {
  return [...new Set(items.map((item) => item[key]))].sort().map((value) => ({
    id: value,
    label: value,
  }))
}

function FilterChip({
  active,
  children,
  dismissible = false,
  onClick,
  onDismiss,
}: {
  active: boolean
  children: string
  dismissible?: boolean
  onClick: () => void
  onDismiss?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[34px] items-center gap-2 rounded-lg border px-2.5 text-[11px] font-medium transition-colors ${
        active
          ? 'border-neutral-950 bg-neutral-950 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
      {active && dismissible && (
        <X
          className="size-3"
          onClick={(event) => {
            event.stopPropagation()
            onDismiss?.()
          }}
        />
      )}
    </button>
  )
}

function FilterSelect({
  allLabel,
  value,
  options,
  onChange,
}: {
  allLabel: string
  value: string
  options: Array<{ id: string; label: string }>
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = value === 'all' ? allLabel : options.find((option) => option.id === value)?.label ?? allLabel

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-full items-center justify-between rounded-lg bg-slate-50 px-3 text-xs font-medium text-slate-600"
      >
        <span className="truncate">{selected}</span>
        <ChevronDown className={`size-4 shrink-0 text-slate-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange('all')
              setOpen(false)
            }}
            className={`block w-full px-3 py-2 text-left text-xs ${
              value === 'all' ? 'bg-slate-50 font-medium text-slate-800' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {allLabel}
          </button>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id)
                setOpen(false)
              }}
              className={`block w-full px-3 py-2 text-left text-xs ${
                value === option.id
                  ? 'bg-slate-50 font-medium text-slate-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
