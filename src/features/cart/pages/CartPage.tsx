import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  Gift,
  Maximize2,
  Minus,
  Plus,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import {
  availableDiscounts,
  cartCustomer,
  customCoupons,
  emptyDelivery,
  initialCartItems,
  WALLET_BALANCE,
  type CatalogProduct,
} from '@/features/cart/data/cartData'
import { AddProductModal } from '@/features/cart/components/AddProductModal'
import { ProductDetailsModal } from '@/features/cart/components/ProductDetailsModal'
import { ProductSpecsPanel } from '@/features/cart/components/ProductSpecsPanel'
import { formatCurrency } from '@/shared/lib/currency'
import type {
  AppliedOffer,
  CartItem,
  DeliveryAddress,
  PaymentMethod,
} from '@/features/cart/types'
import {
  getCartItemCount,
  getCartSubtotal,
  getItemLineTotal,
} from '@/features/cart/utils/pricing'
import {
  clearPopRedemptionSession,
  parsePopRedemptionFromSearch,
  readPopRedemptionSession,
  writePopRedemptionSession,
  type PopRedemptionSession,
} from '@/features/pop/data/popRedemptionSession'
import {
  getAllPopPlans,
  markPopRedeemed,
  popGiftCardCode,
  popGiftValue,
} from '@/features/pop/data/popPlans'

const PAYMENT_OPTIONS: Array<{ id: PaymentMethod; label: string; icon: typeof Banknote }> = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: Smartphone },
]

function resolveGiftCardOffer(code: string): AppliedOffer | null {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return null

  const session = readPopRedemptionSession()
  if (session && session.giftCard.toUpperCase() === normalized) {
    const sessionPlan = getAllPopPlans().find((item) => item.planId === session.planId)
    if (sessionPlan?.redeemedOn) return null
    return {
      id: `pop-gift-${session.planId}`,
      label: `POP ${session.giftCard} · ${formatCurrency(session.value)}`,
      type: 'gift_card',
      amount: session.value,
      planId: session.planId,
      giftCardCode: session.giftCard,
    }
  }

  const plan = getAllPopPlans().find(
    (item) =>
      popGiftCardCode(item.planId).toUpperCase() === normalized ||
      item.planId.toUpperCase() === normalized,
  )
  if (plan && plan.status === 'COMPLETED' && !plan.redeemedOn && plan.monthsPaid >= 5) {
    const value = popGiftValue(plan.monthlyAmount)
    const giftCode = popGiftCardCode(plan.planId)
    return {
      id: `pop-gift-${plan.planId}`,
      label: `POP ${giftCode} · ${formatCurrency(value)}`,
      type: 'gift_card',
      amount: value,
      planId: plan.planId,
      giftCardCode: giftCode,
    }
  }

  // Demo store gift cards (non-POP)
  if (normalized === 'GIFT500' || normalized === 'DEMO500') {
    return {
      id: `gift-${Date.now()}`,
      label: '₹500 Gift Card Applied',
      type: 'gift_card',
      amount: 500,
    }
  }

  return null
}

function giftCreditFromOffers(offers: AppliedOffer[]) {
  return offers
    .filter((offer) => offer.type === 'gift_card')
    .reduce((sum, offer) => sum + (offer.amount ?? 500), 0)
}

export function CartPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<CartItem[]>(initialCartItems)
  const [deliveryOpen, setDeliveryOpen] = useState(true)
  const [delivery, setDelivery] = useState<DeliveryAddress>(emptyDelivery)
  const [discountCode, setDiscountCode] = useState('')
  const [giftCardCode, setGiftCardCode] = useState('')
  const [giftError, setGiftError] = useState('')
  const [manualDiscountOpen, setManualDiscountOpen] = useState(false)
  const [manualCouponCode, setManualCouponCode] = useState('')
  const [manualDiscountReason, setManualDiscountReason] = useState('')
  const [manualDiscountError, setManualDiscountError] = useState('')
  const [popRedemption, setPopRedemption] = useState<PopRedemptionSession | null>(null)
  const [appliedOffers, setAppliedOffers] = useState<AppliedOffer[]>([
    { id: 'offer-bogo', label: 'Buy One get one free', type: 'discount' },
  ])
  const [useWallet, setUseWallet] = useState(false)
  const [taxesOpen, setTaxesOpen] = useState(true)
  const [splitPayment, setSplitPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [splitAmounts, setSplitAmounts] = useState({ cash: '', card: '', upi: '' })
  const [pdpItemId, setPdpItemId] = useState<string | null>(null)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [paymentNotice, setPaymentNotice] = useState('')

  useEffect(() => {
    const fromUrl = parsePopRedemptionFromSearch(searchParams)
    const session = fromUrl ?? readPopRedemptionSession()
    if (fromUrl) writePopRedemptionSession(fromUrl)
    setPopRedemption(session)
    if (!session) return

    setGiftCardCode(session.giftCard)
    setAppliedOffers((current) => {
      const withoutGift = current.filter((o) => o.type !== 'gift_card')
      return [
        ...withoutGift,
        {
          id: `pop-gift-${session.planId}`,
          label: `POP ${session.giftCard} · ${formatCurrency(session.value)}`,
          type: 'gift_card',
          amount: session.value,
          planId: session.planId,
          giftCardCode: session.giftCard,
        },
      ]
    })
  }, [searchParams])

  const pdpItem = items.find((item) => item.id === pdpItemId) ?? null

  const itemCount = getCartItemCount(items)
  const subtotal = getCartSubtotal(items)
  const giftCardCredit = giftCreditFromOffers(appliedOffers)
  const manualDiscountCredit = appliedOffers
    .filter((offer) => offer.type === 'manual_discount')
    .reduce((sum, offer) => sum + (offer.amount ?? 0), 0)
  const walletCredit = useWallet
    ? Math.min(WALLET_BALANCE, Math.max(0, subtotal - giftCardCredit - manualDiscountCredit))
    : 0
  const displayTotal = Math.max(0, subtotal - giftCardCredit - manualDiscountCredit - walletCredit)

  const splitPaid = useMemo(() => {
    return (
      Number(splitAmounts.cash || 0) +
      Number(splitAmounts.card || 0) +
      Number(splitAmounts.upi || 0)
    )
  }, [splitAmounts])
  const remaining = Math.max(0, displayTotal - splitPaid)

  const completePayment = () => {
    if (splitPayment && remaining > 0) {
      setPaymentNotice(`Still ${formatCurrency(remaining)} remaining on split payment.`)
      return
    }

    const popGift = appliedOffers.find((offer) => offer.type === 'gift_card' && offer.planId)
    if (popGift?.planId) {
      const updated = markPopRedeemed(popGift.planId)
      clearPopRedemptionSession()
      setPopRedemption(null)
      setAppliedOffers((current) => current.filter((o) => o.type !== 'gift_card'))
      setGiftCardCode('')
      const phone =
        getAllPopPlans().find((plan) => plan.planId === popGift.planId)?.phone ?? ''
      setPaymentNotice(
        updated?.redeemedOn
          ? `Payment complete. POP gift ${popGift.giftCardCode ?? ''} redeemed on ${updated.redeemedOn}.`
          : 'Payment complete.',
      )
      if (phone) {
        window.setTimeout(() => {
          navigate(`/pop/lookup?phone=${phone}`, {
            state: {
              notice: `Gift card redeemed for plan ${popGift.planId}. Order payment recorded.`,
            },
          })
        }, 900)
      }
      return
    }

    setPaymentNotice('Payment complete.')
  }

  const addProduct = (product: CatalogProduct) => {
    setItems((current) => {
      const existing = current.find((item) => item.sku === product.sku)
      if (existing) {
        return current.map((item) =>
          item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [
        ...current,
        {
          ...product,
          id: `cart-${Date.now()}`,
          quantity: 1,
          giftWrap: false,
          detailsOpen: false,
        },
      ]
    })
  }

  const updateItem = (id: string, patch: Partial<CartItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const applyDiscount = () => {
    const code = discountCode.trim()
    if (!code) return
    if (appliedOffers.some((o) => o.label.toLowerCase() === code.toLowerCase())) return
    setAppliedOffers((current) => [
      ...current,
      { id: `disc-${Date.now()}`, label: code, type: 'discount' },
    ])
    setDiscountCode('')
  }

  const applyGiftCard = () => {
    const code = giftCardCode.trim()
    if (!code) {
      setGiftError('Enter a gift card or POP code.')
      return
    }
    const offer = resolveGiftCardOffer(code)
    if (!offer) {
      setGiftError('Gift card not found, already redeemed, or not ready.')
      return
    }
    setGiftError('')
    if (offer.planId && offer.giftCardCode && offer.amount) {
      const session = {
        planId: offer.planId,
        giftCard: offer.giftCardCode,
        value: offer.amount,
      }
      writePopRedemptionSession(session)
      setPopRedemption(session)
    }
    setAppliedOffers((current) => {
      const withoutGift = current.filter((o) => o.type !== 'gift_card')
      return [...withoutGift, offer]
    })
    setGiftCardCode(offer.giftCardCode ?? code)
  }

  const clearPopGift = () => {
    clearPopRedemptionSession()
    setPopRedemption(null)
    setAppliedOffers((current) => current.filter((o) => o.type !== 'gift_card'))
    setGiftCardCode('')
    setGiftError('')
  }

  const applyManualDiscount = () => {
    const couponCode = manualCouponCode.trim().toUpperCase()
    if (!couponCode) {
      setManualDiscountError('Enter a coupon code.')
      return
    }
    const amount = customCoupons[couponCode]
    if (!amount) {
      setManualDiscountError('Coupon not found. Try FESTIVE10, WELCOME500, FLAT2000, or MONSOON3.')
      return
    }
    const maxAllowed = Math.max(0, subtotal - giftCardCredit)
    const credit = Math.min(amount, maxAllowed)
    if (credit <= 0) {
      setManualDiscountError('Cart total is already covered by other credits.')
      return
    }
    const reason = manualDiscountReason.trim()
    setManualDiscountError('')
    setAppliedOffers((current) => {
      const withoutManual = current.filter((o) => o.type !== 'manual_discount')
      return [
        ...withoutManual,
        {
          id: `coupon-${Date.now()}`,
          label: reason
            ? `Special discount · ${couponCode} (${reason})`
            : `Special discount · ${couponCode}`,
          type: 'manual_discount',
          amount: credit,
          couponCode,
          reason: reason || undefined,
        },
      ]
    })
    setManualCouponCode('')
    setManualDiscountReason('')
    setManualDiscountOpen(false)
  }

  const updateDelivery = (field: keyof DeliveryAddress, value: string) => {
    setDelivery((current) => ({ ...current, [field]: value }))
  }

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
              aria-label="Back"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-700">Checkout</h1>
              <p className="text-sm text-slate-500">Review and complete your order</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {popRedemption && (
            <div className="mx-auto mb-4 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex min-w-0 items-start gap-2">
                <Gift className="mt-0.5 size-4 shrink-0 text-amber-800" />
                <div>
                  <p className="text-sm font-semibold text-amber-950">
                    POP credit applied · {popRedemption.giftCard} ·{' '}
                    {formatCurrency(Math.min(giftCardCredit, popRedemption.value))}
                  </p>
                  <p className="text-xs text-amber-800">
                    Plan {popRedemption.planId}. Credit reduces the amount due below. Complete
                    payment to finish redemption.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearPopGift}
                className="h-8 rounded-lg border border-amber-300 bg-white px-3 text-xs font-medium text-amber-950 hover:bg-amber-100"
              >
                Remove POP gift
              </button>
            </div>
          )}
          <div className="mx-auto flex max-w-6xl flex-col gap-5 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <section className="rounded-[14px] border border-slate-200 bg-white p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-700">Shopping Cart</h2>
                    <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAddProductOpen(true)}
                      className="flex h-7 items-center gap-1.5 rounded-lg bg-neutral-950 px-3 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                      <Plus className="size-4" />
                      Add Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems([])}
                      className="flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 bg-neutral-50 px-3 text-sm font-medium text-slate-700 hover:bg-white"
                    >
                      <Trash2 className="size-4 text-slate-600" />
                      Clear Cart
                    </button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-slate-500">Your cart is empty.</p>
                    <button
                      type="button"
                      onClick={() => setAddProductOpen(true)}
                      className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                      <Plus className="size-4" />
                      Add Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <CartProductCard
                        key={item.id}
                        item={item}
                        onToggleGift={() => updateItem(item.id, { giftWrap: !item.giftWrap })}
                        onToggleDetails={() =>
                          updateItem(item.id, { detailsOpen: !item.detailsOpen })
                        }
                        onDecrement={() =>
                          updateItem(item.id, {
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        onIncrement={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                        onRemove={() => removeItem(item.id)}
                        onOpenPdp={() => setPdpItemId(item.id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-[14px] border border-slate-200 bg-white p-5">
                <h2 className="mb-5 text-xl font-semibold text-slate-700">Customer Information</h2>
                <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Name</p>
                    <p className="mt-1 text-base font-medium text-slate-700">{cartCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Mobile</p>
                    <p className="mt-1 text-base font-medium text-slate-700">{cartCustomer.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Email</p>
                    <p className="mt-1 text-base font-medium text-slate-700">{cartCustomer.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/customers/${cartCustomer.id}`)}
                  className="h-7 rounded-lg border border-slate-200 bg-neutral-50 px-3 text-sm font-medium text-slate-700 hover:bg-white"
                >
                  Full Profile
                </button>
              </section>
            </div>

            <div className="flex w-full flex-col gap-5 lg:w-[345px] lg:shrink-0">
              <section className="rounded-[14px] border border-slate-200 bg-white p-5">
                <button
                  type="button"
                  onClick={() => setDeliveryOpen((open) => !open)}
                  className="mb-5 flex w-full items-center justify-between gap-3"
                >
                  <h2 className="text-xl font-semibold text-slate-700">Delivery</h2>
                  <ChevronDown
                    className={`size-5 text-slate-500 transition-transform ${deliveryOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {deliveryOpen && (
                  <div className="space-y-3">
                    <DeliveryField
                      label="Full Name"
                      value={delivery.fullName}
                      onChange={(value) => updateDelivery('fullName', value)}
                    />
                    <DeliveryField
                      label="Address line 1"
                      required
                      value={delivery.addressLine1}
                      onChange={(value) => updateDelivery('addressLine1', value)}
                    />
                    <DeliveryField
                      label="Address line 2"
                      value={delivery.addressLine2}
                      onChange={(value) => updateDelivery('addressLine2', value)}
                    />
                    <DeliveryField
                      label="Postal/Zip Code"
                      required
                      value={delivery.postalCode}
                      onChange={(value) => updateDelivery('postalCode', value)}
                    />
                    <div>
                      <label className="mb-1 block text-xs tracking-wide text-neutral-800">
                        Phone Number<span className="text-red-500">*</span>
                      </label>
                      <div className="flex h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                        <span className="text-xs text-neutral-500">+91</span>
                        <input
                          type="tel"
                          value={delivery.phone}
                          onChange={(e) => updateDelivery('phone', e.target.value)}
                          className="h-full w-full bg-transparent text-xs text-slate-700 outline-none"
                        />
                      </div>
                    </div>
                    <DeliveryField
                      label="City"
                      value={delivery.city}
                      onChange={(value) => updateDelivery('city', value)}
                    />
                    <div>
                      <label className="mb-1 block text-xs tracking-wide text-neutral-800">
                        Country
                      </label>
                      <div className="relative">
                        <select
                          value={delivery.country}
                          onChange={(e) => updateDelivery('country', e.target.value)}
                          className="h-[42px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none"
                        >
                          <option value="">Choose from here</option>
                          <option value="India">India</option>
                          <option value="UAE">UAE</option>
                          <option value="USA">USA</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mt-2 h-11 w-full rounded-xl bg-neutral-950 text-sm font-semibold text-white hover:bg-neutral-800"
                    >
                      Save Address
                    </button>
                  </div>
                )}
              </section>

              <section className="rounded-[14px] border border-slate-200 bg-white p-5">
                <div className="space-y-3">
                  <CodeApplyRow
                    label="Discount Code"
                    value={discountCode}
                    onChange={setDiscountCode}
                    onApply={applyDiscount}
                  />
                  <CodeApplyRow
                    label="Gift Card"
                    value={giftCardCode}
                    onChange={(value) => {
                      setGiftCardCode(value)
                      setGiftError('')
                    }}
                    onApply={applyGiftCard}
                    placeholder="POP-002602 or GIFT500"
                  />
                  {giftError && <p className="text-xs text-red-600">{giftError}</p>}

                  {!manualDiscountOpen ? (
                    <button
                      type="button"
                      onClick={() => {
                        setManualDiscountOpen(true)
                        setManualDiscountError('')
                      }}
                      className="text-left text-xs text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                    >
                      + Add special discount
                    </button>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-slate-600">Special discount</p>
                        <button
                          type="button"
                          onClick={() => {
                            setManualDiscountOpen(false)
                            setManualCouponCode('')
                            setManualDiscountReason('')
                            setManualDiscountError('')
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={manualCouponCode}
                          onChange={(e) => {
                            setManualCouponCode(e.target.value.toUpperCase())
                            setManualDiscountError('')
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              applyManualDiscount()
                            }
                          }}
                          placeholder="Coupon code"
                          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm uppercase tracking-wide text-slate-700 outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-300"
                        />
                        <button
                          type="button"
                          onClick={applyManualDiscount}
                          className="h-9 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
                        >
                          Apply
                        </button>
                      </div>
                      <input
                        type="text"
                        value={manualDiscountReason}
                        onChange={(e) => setManualDiscountReason(e.target.value)}
                        placeholder="Note (optional)"
                        className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
                      />
                      {manualDiscountError && (
                        <p className="mt-1.5 text-xs text-red-600">{manualDiscountError}</p>
                      )}
                    </div>
                  )}
                </div>

                {appliedOffers.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {appliedOffers.map((offer) => {
                      const removeOffer = () => {
                        if (offer.type === 'gift_card' && offer.planId) clearPopGift()
                        else {
                          setAppliedOffers((current) =>
                            current.filter((entry) => entry.id !== offer.id),
                          )
                        }
                      }

                      if (offer.type === 'manual_discount') {
                        return (
                          <div
                            key={offer.id}
                            className="flex items-start justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                                Special discount
                              </p>
                              <p className="mt-0.5 text-sm text-slate-800">
                                <span className="font-medium tracking-wide">{offer.couponCode}</span>
                                {offer.amount != null && (
                                  <span className="text-slate-600">
                                    {' '}
                                    · −{formatCurrency(offer.amount)}
                                  </span>
                                )}
                              </p>
                              {offer.reason && (
                                <p className="mt-0.5 truncate text-xs text-slate-500">{offer.reason}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={removeOffer}
                              className="shrink-0 text-amber-800/60 hover:text-amber-950"
                              aria-label={`Remove ${offer.label}`}
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={offer.id}
                          className="flex items-center justify-between rounded-lg bg-neutral-950 px-3 py-2 text-sm text-white"
                        >
                          <span>{offer.label}</span>
                          <button
                            type="button"
                            onClick={removeOffer}
                            className="text-white/80 hover:text-white"
                            aria-label={`Remove ${offer.label}`}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  {availableDiscounts.map((discount) => {
                    const selected = appliedOffers.some((o) => o.label === discount)
                    return (
                      <button
                        key={discount}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setAppliedOffers((current) =>
                              current.filter((entry) => entry.label !== discount),
                            )
                          } else {
                            setAppliedOffers((current) => [
                              ...current,
                              {
                                id: `disc-${discount}`,
                                label: discount,
                                type: 'discount',
                              },
                            ])
                          }
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span>{discount}</span>
                        <span
                          className={`flex size-5 items-center justify-center rounded border ${
                            selected
                              ? 'border-neutral-950 bg-neutral-950 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selected && <Check className="size-3" />}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    Wallet Balance ({formatCurrency(WALLET_BALANCE)})
                  </span>
                  <span
                    className={`flex size-5 items-center justify-center rounded border ${
                      useWallet
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {useWallet && <Check className="size-3" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="sr-only"
                  />
                </label>

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(subtotal)}</span>
                  </div>
                  {giftCardCredit > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700">Gift card credit</span>
                      <span className="font-semibold text-emerald-700">
                        −{formatCurrency(giftCardCredit)}
                      </span>
                    </div>
                  )}
                  {manualDiscountCredit > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-800">Special discount</span>
                      <span className="font-semibold text-amber-800">
                        −{formatCurrency(manualDiscountCredit)}
                      </span>
                    </div>
                  )}
                  {useWallet && walletCredit > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Wallet</span>
                      <span className="font-semibold text-slate-700">
                        −{formatCurrency(walletCredit)}
                      </span>
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      onClick={() => setTaxesOpen((open) => !open)}
                      className="flex w-full items-center justify-between text-sm"
                    >
                      <span className="text-slate-500">Taxes</span>
                      <span className="flex items-center gap-2 font-semibold text-slate-700">
                        {formatCurrency(0)}
                        <ChevronDown
                          className={`size-4 text-slate-400 transition-transform ${taxesOpen ? 'rotate-180' : ''}`}
                        />
                      </span>
                    </button>
                    {taxesOpen && (
                      <div className="mt-2 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <span>SGST 1.5%</span>
                          <span>{formatCurrency(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CGST 1.5%</span>
                          <span>{formatCurrency(0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-base font-semibold text-slate-800">Total</span>
                    <span className="text-lg font-bold text-slate-900">
                      {displayTotal.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Split payment</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={splitPayment}
                    onClick={() => setSplitPayment((value) => !value)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      splitPayment ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${
                        splitPayment ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {!splitPayment ? (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {PAYMENT_OPTIONS.map(({ id, label, icon: Icon }) => {
                      const active = paymentMethod === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMethod(id)}
                          className={`flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium ${
                            active
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="size-5" />
                          {label}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {PAYMENT_OPTIONS.map(({ id, label, icon: Icon }) => (
                      <div key={id} className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                          <Icon className="size-4" />
                        </div>
                        <input
                          type="number"
                          min={0}
                          placeholder={label}
                          value={splitAmounts[id]}
                          onChange={(e) =>
                            setSplitAmounts((current) => ({ ...current, [id]: e.target.value }))
                          }
                          className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-slate-300"
                        />
                      </div>
                    ))}
                    {remaining > 0 && (
                      <p className="text-sm font-medium text-red-600">
                        Remaining to pay:{' '}
                        {remaining.toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={completePayment}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-neutral-950 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Complete Payment
                </button>
                {paymentNotice && (
                  <p className="mt-3 text-center text-sm font-medium text-emerald-700">{paymentNotice}</p>
                )}
                <button
                  type="button"
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Send Card Payment Link
                </button>
                <p className="mt-3 text-center text-[11px] leading-4 text-slate-400">
                  By completing payment you agree to the store terms and return policy.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      {pdpItem && (
        <ProductDetailsModal item={pdpItem} onClose={() => setPdpItemId(null)} />
      )}
      {addProductOpen && (
        <AddProductModal
          cartSkus={items.map((item) => item.sku)}
          onAdd={addProduct}
          onClose={() => setAddProductOpen(false)}
        />
      )}
    </AppLayout>
  )
}

function CartProductCard({
  item,
  onToggleGift,
  onToggleDetails,
  onDecrement,
  onIncrement,
  onRemove,
  onOpenPdp,
}: {
  item: CartItem
  onToggleGift: () => void
  onToggleDetails: () => void
  onDecrement: () => void
  onIncrement: () => void
  onRemove: () => void
  onOpenPdp: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onOpenPdp}
          className="size-[103px] shrink-0 rounded-[11px] bg-gradient-to-br from-amber-50 to-amber-100"
          aria-label={`Open details for ${item.name}`}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-sm text-slate-700">{item.name}</p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">SKU: {item.sku}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-slate-700">{formatCurrency(item.price)}</p>
            <p className="text-[14px] text-slate-400 line-through">
              {formatCurrency(item.compareAtPrice)}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-lg border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {item.metal}
            </span>
            <span className="rounded-lg border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {item.stone}
            </span>
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900">
              Net {item.weights.netGoldWeight}g
            </span>
          </div>
          {item.offers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.offers.map((offer) => (
                <span
                  key={offer}
                  className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                >
                  {offer}
                </span>
              ))}
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2">
            <span
              className={`flex size-[14px] items-center justify-center rounded-[3px] ${
                item.giftWrap ? 'bg-neutral-950 text-white' : 'border border-slate-300 bg-white'
              }`}
            >
              {item.giftWrap && <Check className="size-3" />}
            </span>
            <input
              type="checkbox"
              checked={item.giftWrap}
              onChange={onToggleGift}
              className="sr-only"
            />
            <span className="text-xs font-medium text-slate-700">
              Add Special Gift Wrap - ₹50
            </span>
          </label>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch">
          <div className="flex items-start gap-1">
            <button
              type="button"
              className="flex h-[22px] items-center gap-1 rounded border border-slate-200 bg-neutral-50 px-2 text-[9px] font-medium text-slate-700"
            >
              <Plus className="size-2.5" />
              Manual Entry
            </button>
            <button
              type="button"
              onClick={onOpenPdp}
              className="flex size-6 items-center justify-center text-slate-500 hover:text-slate-700"
              aria-label="Open product details"
            >
              <Maximize2 className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex size-6 items-center justify-center text-red-500 hover:text-red-600"
            aria-label="Remove item"
          >
            <Trash2 className="size-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDecrement}
                className="flex size-6 items-center justify-center rounded-md border border-slate-200 bg-neutral-50 text-slate-700"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3" />
              </button>
              <span className="min-w-6 text-center text-xs font-semibold text-slate-700">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={onIncrement}
                className="flex size-6 items-center justify-center rounded-md border border-slate-200 bg-neutral-50 text-slate-700"
                aria-label="Increase quantity"
              >
                <Plus className="size-3" />
              </button>
            </div>
            <p className="min-w-[54px] text-right text-sm font-semibold text-slate-700">
              {formatCurrency(getItemLineTotal(item))}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-2 border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={onToggleDetails}
          aria-expanded={item.detailsOpen}
          className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">Product details</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {item.detailsOpen
                ? 'Hide SKU, weights & price breakup'
                : 'View SKU, weights & price breakup'}
            </p>
          </div>
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-transform ${
              item.detailsOpen ? 'rotate-180' : ''
            }`}
          >
            <ChevronDown className="size-4" />
          </span>
        </button>
        {item.detailsOpen && (
          <div className="mt-2 px-1 pb-1">
            <ProductSpecsPanel item={item} />
          </div>
        )}
      </div>
    </div>
  )
}

function DeliveryField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-xs tracking-wide text-neutral-800">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-slate-300"
      />
    </div>
  )
}

function CodeApplyRow({
  label,
  value,
  onChange,
  onApply,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onApply: () => void
  placeholder?: string
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-600">{label}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onApply()
            }
          }}
          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
        />
        <button
          type="button"
          onClick={onApply}
          className="h-9 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
