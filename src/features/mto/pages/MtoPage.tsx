import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Palette, PenLine, Search } from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import {
  getSkuByCode,
  searchSkuCatalog,
  skuCatalog,
} from '@/features/inventory/data/skuHistoryData'
import type { SkuCatalog } from '@/features/inventory/types'
import { useMto } from '@/features/mto/context/MtoContext'
import {
  ActionBar,
  CustomerSection,
  EmptyState,
  InlineSkuPicker,
  OrderItemsSection,
  OrderTotalsSummary,
  PaymentSection,
  ProductDetailsCard,
  SkuResultCard,
} from '@/features/mto/components'
import {
  MTO_JOURNEY_OPTIONS,
  createEmptyCustomer,
  createEmptyMtoItem,
  type MtoCustomerInfo,
  type MtoItem,
  type MtoOrderType,
  type MtoPaymentStatus,
} from '@/features/mto/types'
import { revokeItemImages } from '@/features/mto/utils/images'
import {
  itemAdvanceAmount,
  itemFromSku,
  itemLineTotal,
} from '@/features/mto/utils/pricing'

type Step =
  | 'home'
  | 'in_house_search'
  | 'in_house_product'
  | 'in_house_customise'
  | 'custom_form'
  | 'payment'

export function MtoPage() {
  const navigate = useNavigate()
  const { placeOrder } = useMto()

  const [step, setStep] = useState<Step>('home')
  const [journey, setJourney] = useState<MtoOrderType | null>(null)

  const [skuQuery, setSkuQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [previewSku, setPreviewSku] = useState<SkuCatalog | null>(null)

  const [items, setItems] = useState<MtoItem[]>([createEmptyMtoItem()])
  const [customer, setCustomer] = useState<MtoCustomerInfo>(createEmptyCustomer())
  const [showAddProduct, setShowAddProduct] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState('Card')

  const searchResults = useMemo(() => {
    if (!activeQuery.trim()) return []
    const exact = getSkuByCode(activeQuery)
    if (exact) return [exact]
    return searchSkuCatalog(activeQuery)
  }, [activeQuery])

  const itemsTotal = useMemo(
    () => items.reduce((sum, item) => sum + itemLineTotal(item), 0),
    [items],
  )

  const advanceTotal = useMemo(
    () => items.reduce((sum, item) => sum + itemAdvanceAmount(item), 0),
    [items],
  )

  const remainingAmount = useMemo(
    () => Math.max(itemsTotal - advanceTotal, 0),
    [itemsTotal, advanceTotal],
  )

  const derivedPaymentStatus = useMemo((): MtoPaymentStatus => {
    if (advanceTotal <= 0) return 'Pending'
    if (remainingAmount > 0) return 'Partial'
    return 'Paid'
  }, [advanceTotal, remainingAmount])

  const resetAll = () => {
    setItems((current) => {
      current.forEach((item) => revokeItemImages(item.images))
      return [createEmptyMtoItem()]
    })
    setStep('home')
    setJourney(null)
    setSkuQuery('')
    setActiveQuery('')
    setPreviewSku(null)
    setShowAddProduct(false)
    setCustomer(createEmptyCustomer())
    setPaymentMethod('Card')
  }

  const startJourney = (type: MtoOrderType) => {
    setJourney(type)
    setItems([createEmptyMtoItem()])
    setShowAddProduct(false)
    if (type === 'in_house') {
      setStep('in_house_search')
    } else {
      setStep('custom_form')
    }
  }

  const runSearch = (value?: string) => {
    const next = (value ?? skuQuery).trim()
    setSkuQuery(next)
    setActiveQuery(next)
    setPreviewSku(null)
  }

  const openProduct = (sku: SkuCatalog) => {
    setPreviewSku(sku)
    setActiveQuery(sku.sku)
    setSkuQuery(sku.sku)
    setStep('in_house_product')
  }

  const startCustomization = (sku: SkuCatalog, append = false) => {
    const nextItem = itemFromSku(sku)
    setItems((current) => (append ? [...current, nextItem] : [nextItem]))
    setPreviewSku(sku)
    setShowAddProduct(false)
    setSkuQuery('')
    setActiveQuery('')
    setStep('in_house_customise')
  }

  const updateItem = (id: string, patch: Partial<MtoItem>) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, ...patch }
        if (journey === 'in_house' && item.skuReference) {
          next.skuReference = item.skuReference
        }
        const mode = next.paymentMode
        const lineTotal = (Number(next.itemPrice) || 0) * (Number(next.quantity) || 1)
        if (mode === 'full') {
          next.advancePayment = String(lineTotal)
        } else if (patch.paymentMode === 'partial' && item.paymentMode === 'full') {
          next.advancePayment = '0'
        }
        return next
      }),
    )
  }

  const removeItem = (id: string) => {
    setItems((current) => {
      if (current.length <= 1) return current
      const target = current.find((item) => item.id === id)
      if (target) revokeItemImages(target.images)
      return current.filter((item) => item.id !== id)
    })
  }

  const goToPayment = () => {
    setStep('payment')
  }

  const confirmOrder = () => {
    if (!journey) return

    const order = placeOrder({
      orderType: journey,
      items,
      customer,
      payment: {
        totalAmount: itemsTotal,
        advancePayment: advanceTotal,
        remainingAmount,
        paymentStatus: derivedPaymentStatus,
        paymentMethod: advanceTotal > 0 ? paymentMethod : '—',
      },
    })

    navigate(`/mto/orders/${order.id}`)
  }

  const headerSubtitle =
    journey === 'in_house'
      ? 'In-House Design Customization'
      : journey === 'fully_custom'
        ? 'Fully Custom Design'
        : 'Choose how you want to create this made-to-order request'

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {step !== 'home' && (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 'payment') {
                      setStep(
                        journey === 'in_house' ? 'in_house_customise' : 'custom_form',
                      )
                      return
                    }
                    if (step === 'in_house_customise') {
                      setStep('in_house_product')
                      return
                    }
                    if (step === 'in_house_product') {
                      setStep('in_house_search')
                      return
                    }
                    resetAll()
                  }}
                  className="mt-1 flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <div>
                <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
                  Made-to-Order (MTO)
                </h1>
                <p className="mt-1 text-base text-slate-500">{headerSubtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/mto/orders')}
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              All MTO Order
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-[1082px] space-y-4">
            {step === 'home' && (
              <section className="rounded-[14px] border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-800">Select customer journey</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Two paths — customise an in-house design, or create a fully custom piece
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {MTO_JOURNEY_OPTIONS.map((option) => {
                    const Icon = option.id === 'in_house' ? Palette : PenLine
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => startJourney(option.id)}
                        className="rounded-[14px] border border-slate-200 bg-slate-50 p-6 text-left transition hover:border-slate-400 hover:bg-white"
                      >
                        <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-white">
                          <Icon className="size-6 text-slate-700" />
                        </div>
                        <p className="text-lg font-semibold text-slate-800">{option.title}</p>
                        <p className="mt-2 text-sm text-slate-500">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {step === 'in_house_search' && (
              <>
                <section className="rounded-[14px] border border-slate-200 bg-white p-5">
                  <h2 className="text-lg font-semibold text-slate-800">Search product by SKU</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Find an existing catalog design to customise
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="relative min-w-[280px] flex-1">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={skuQuery}
                        onChange={(e) => setSkuQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') runSearch()
                        }}
                        placeholder="Search by SKU or product name (e.g. SKU0001)"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => runSearch()}
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
                        onClick={() => runSearch(entry.sku)}
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
                </section>

                {!activeQuery.trim() && (
                  <EmptyState
                    title="Search a SKU to continue"
                    description="Select a catalog product to open its details and start customization."
                  />
                )}

                {activeQuery.trim() && searchResults.length === 0 && (
                  <EmptyState
                    title="No SKU found"
                    description="Try SKU0001 or SKU0002, or search by product name."
                  />
                )}

                {searchResults.map((sku) => (
                  <SkuResultCard
                    key={sku.sku}
                    sku={sku}
                    actionLabel="View details"
                    onAction={() => openProduct(sku)}
                  />
                ))}
              </>
            )}

            {step === 'in_house_product' && previewSku && (
              <ProductDetailsCard
                sku={previewSku}
                appendMode={items.some((item) => Boolean(item.skuReference))}
                onStartCustomization={() =>
                  startCustomization(
                    previewSku,
                    items.some((item) => Boolean(item.skuReference)),
                  )
                }
              />
            )}

            {step === 'in_house_customise' && (
              <>
                <ActionBar
                  title="Customise in-house design"
                  subtitle={`${items.length} product(s) in this order · all products stay on this page`}
                  onClear={resetAll}
                  onContinue={goToPayment}
                  continueLabel="Continue to Payment"
                  secondaryAction={{
                    label: showAddProduct ? 'Hide product search' : 'Add another product',
                    onClick: () => {
                      setShowAddProduct((open) => !open)
                      if (showAddProduct) {
                        setSkuQuery('')
                        setActiveQuery('')
                      }
                    },
                  }}
                />

                {showAddProduct && (
                  <InlineSkuPicker
                    skuQuery={skuQuery}
                    activeQuery={activeQuery}
                    searchResults={searchResults}
                    onQueryChange={setSkuQuery}
                    onSearch={runSearch}
                    onAdd={(sku) => startCustomization(sku, true)}
                    onClose={() => {
                      setShowAddProduct(false)
                      setSkuQuery('')
                      setActiveQuery('')
                    }}
                  />
                )}

                <OrderItemsSection
                  items={items}
                  skuLocked
                  canAdd={false}
                  onChange={updateItem}
                  onRemove={removeItem}
                  onAdd={() => undefined}
                />

                <OrderTotalsSummary
                  itemsTotal={itemsTotal}
                  advanceTotal={advanceTotal}
                  remainingAmount={remainingAmount}
                />

                <CustomerSection customer={customer} onChange={setCustomer} />
              </>
            )}

            {step === 'custom_form' && (
              <>
                <ActionBar
                  title="Custom design specifications"
                  subtitle={`${items.length} product(s) · attach images, fill details, set payment per item`}
                  onClear={resetAll}
                  onContinue={goToPayment}
                  continueLabel="Continue to Payment"
                />

                <OrderItemsSection
                  items={items}
                  skuLocked={false}
                  canAdd
                  onChange={updateItem}
                  onRemove={removeItem}
                  onAdd={() => setItems((current) => [...current, createEmptyMtoItem()])}
                />

                <OrderTotalsSummary
                  itemsTotal={itemsTotal}
                  advanceTotal={advanceTotal}
                  remainingAmount={remainingAmount}
                />

                <CustomerSection customer={customer} onChange={setCustomer} />
              </>
            )}

            {step === 'payment' && journey && (
              <PaymentSection
                journey={journey}
                items={items}
                itemsTotal={itemsTotal}
                advanceTotal={advanceTotal}
                remainingAmount={remainingAmount}
                paymentStatus={derivedPaymentStatus}
                paymentMethod={paymentMethod}
                customerName={customer.customerName}
                onItemChange={updateItem}
                onApplyAllMode={(mode) => {
                  setItems((current) =>
                    current.map((item) => {
                      const line = itemLineTotal(item)
                      return {
                        ...item,
                        paymentMode: mode,
                        advancePayment: mode === 'full' ? String(line) : '0',
                      }
                    }),
                  )
                }}
                onMethodChange={setPaymentMethod}
                onBack={() =>
                  setStep(journey === 'in_house' ? 'in_house_customise' : 'custom_form')
                }
                onConfirm={confirmOrder}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
