import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  Package,
  RotateCcw,
  RefreshCw,
  ArrowLeftRight,
  Shield,
  Check,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { ReturnRequestModal, type ReturnSubmitPayload } from '@/features/orders/components/ReturnRequestModal'
import { ReturnStatusCard } from '@/features/orders/components/ReturnStatusCard'
import { useReturn } from '@/features/orders/context/ReturnContext'
import { order } from '@/features/orders/data/mockData'
import { formatCurrency } from '@/shared/lib/currency'
import {
  calculateTotalRefund,
  expandProductsToUnits,
  getOrderLineTotal,
  getReturnedCountByProduct,
  getReturnedUnitIds,
  getUnitRefund,
  hasReturnableItems,
} from '@/features/orders/utils/returnLogic'

export function OrderDetailsPage() {
  const navigate = useNavigate()
  const { returnRequest, submitReturnRequest, appendReturnItems } = useReturn()
  const [showReturnModal, setShowReturnModal] = useState(false)
  const canReturnMore = hasReturnableItems(order.products, returnRequest)

  const handleReturnSubmit = ({ items, refundMethod, bankAccount }: ReturnSubmitPayload) => {
    const refundAmount = calculateTotalRefund(items)
    const comment =
      items.map((i) => i.comment).filter(Boolean).join('; ') || "Customer didn't liked the product"

    if (returnRequest) {
      appendReturnItems(items, refundAmount)
    } else {
      submitReturnRequest({
        id: 'RET-2024-0012',
        orderId: order.id,
        requestedOn: '28 Apr 2024',
        status: 'In Progress',
        pickupStatus: 'Scheduled for 30 Apr 2024',
        refundAmount,
        comment,
        tracking: 'Pickup scheduled → Quality check → Refund processing',
        items,
        refundMethod,
        originalPaymentMethod: order.billing.paymentMethod,
        bankAccount,
      })
    }
    setShowReturnModal(false)
  }

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">Order ID</h1>
                <p className="text-base text-slate-500">{order.date}</p>
              </div>
            </div>
            <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium capitalize text-green-700">
              {order.status}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-4">
            {/* Store Information */}
            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="size-5 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-700">Store Information</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Store Type</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
                    <Building2 className="size-4 text-slate-400" />
                    {order.store.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Store Name</p>
                  <p className="mt-1 text-sm text-slate-800">{order.store.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Location</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
                    <MapPin className="size-4 text-slate-400" />
                    {order.store.location}
                  </p>
                </div>
              </div>
            </section>

            {/* Customer Details */}
            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="size-5 text-slate-600" />
                  <h2 className="text-xl font-semibold text-slate-700">Customer Details</h2>
                </div>
                <button
                  type="button"
                  className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white"
                >
                  Full Profile
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">Full Name</p>
                  <p className="mt-1 text-sm text-slate-800">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
                    <Mail className="size-4 text-slate-400" />
                    {order.customer.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Phone Number</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
                    <Phone className="size-4 text-slate-400" />
                    {order.customer.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Address</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
                    <MapPin className="size-4 text-slate-400" />
                    {order.customer.address}
                  </p>
                </div>
              </div>
            </section>

            {/* Product Details */}
            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <Package className="size-5 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-700">Product Details</h2>
              </div>

              <div className="space-y-4">
                {order.products.map((product) => {
                  const returnedCount = getReturnedCountByProduct(product.id, returnRequest)
                  const remainingCount = product.quantity - returnedCount
                  const lineTotal = getOrderLineTotal(product)
                  const units = expandProductsToUnits([product])
                  const returnedIds = getReturnedUnitIds(returnRequest)

                  return (
                  <div
                    key={product.id}
                    className="rounded-lg border border-slate-100 p-3"
                  >
                    <div className="flex gap-4">
                      <div className="size-20 shrink-0 rounded-lg bg-amber-50" />
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-700">{product.name}</p>
                            <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-semibold text-slate-700">{product.displayPrice}</span>
                              <span className="text-sm text-slate-400 line-through">
                                {product.originalPrice}
                              </span>
                            </div>
                            {returnedCount > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  {returnedCount} unit{returnedCount > 1 ? 's' : ''} returned
                                </span>
                                <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                  {remainingCount} kept by customer
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">
                              Quantity{' '}
                              <span className="font-semibold text-slate-700">{product.quantity}</span>
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                              Price{' '}
                              <span className="font-semibold text-slate-700">
                                {formatCurrency(lineTotal)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {product.metal}
                          </span>
                          <span className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {product.stone}
                          </span>
                        </div>
                        {product.giftWrap && (
                          <div className="flex items-center gap-2">
                            <div className="flex size-5 items-center justify-center rounded bg-slate-900">
                              <Check className="size-3 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-xs font-medium text-slate-700">
                              Add Special Gift Wrap - ₹{product.giftWrapPrice}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Individual Items
                      </p>
                      {units.map((unit) => {
                        const isReturned = returnedIds.has(unit.unitId)
                        const returnItem = returnRequest?.items.find((i) => i.unitId === unit.unitId)

                        return (
                          <div
                            key={unit.unitId}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                              isReturned ? 'bg-blue-50' : 'bg-slate-50'
                            }`}
                          >
                            <div>
                              <p className="font-medium text-slate-700">
                                {unit.unitIdentity}
                                {unit.totalInLine > 1 && (
                                  <span className="ml-1 font-normal text-slate-500">
                                    (Unit {unit.unitIndex})
                                  </span>
                                )}
                              </p>
                              {returnItem && (
                                <p className="text-xs text-blue-700">
                                  Returned · {returnItem.reason}
                                  {returnItem.comment && ` — ${returnItem.comment}`}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-slate-700">
                                {formatCurrency(getUnitRefund(unit))}
                              </p>
                              <p
                                className={`text-xs font-medium ${
                                  isReturned ? 'text-blue-600' : 'text-green-600'
                                }`}
                              >
                                {isReturned ? 'Returned' : 'With customer'}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  disabled={!canReturnMore}
                  className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 disabled:opacity-50"
                >
                  <RotateCcw className="size-4" />
                  {returnRequest && canReturnMore ? 'Return More Items' : 'Return'}
                </button>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
                >
                  <RefreshCw className="size-4" />
                  Replace
                </button>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
                >
                  <ArrowLeftRight className="size-4" />
                  Exchange
                </button>
                <button
                  type="button"
                  disabled
                  className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 opacity-20"
                >
                  <Shield className="size-4" />
                  Warranty
                </button>
              </div>
            </section>

            {/* Return/Replace/Exchange Status */}
            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <h2 className="mb-4 text-xl font-semibold text-slate-700">
                Return/Replace/Exchange Status
              </h2>

              {returnRequest ? (
                <ReturnStatusCard request={returnRequest} />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-slate-300 py-12 text-center">
                  <p className="text-base text-slate-600">
                    No active return, replace, or exchange requests
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Click the action buttons above to initiate a request
                  </p>
                </div>
              )}
            </section>

            {/* Billing Details */}
            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <h2 className="mb-4 text-xl font-semibold text-slate-700">Billing Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.billing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (GST)</span>
                  <span>{formatCurrency(order.billing.tax)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.billing.discount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Charges</span>
                  <span>{formatCurrency(order.billing.shipping)}</span>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-3xl font-semibold text-slate-900">
                      {formatCurrency(order.billing.total)}
                    </p>
                    <span className="mt-2 inline-block rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {order.billing.paymentMethod}
                    </span>
                  </div>
                  <button type="button" className="text-sm font-medium text-blue-600 underline">
                    Invoice
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showReturnModal && (
        <ReturnRequestModal
          products={order.products}
          originalPaymentMethod={order.billing.paymentMethod}
          existingReturnRequest={returnRequest}
          onClose={() => setShowReturnModal(false)}
          onSubmit={handleReturnSubmit}
        />
      )}
    </AppLayout>
  )
}
