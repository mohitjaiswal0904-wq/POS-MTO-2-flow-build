import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  MapPin,
  Store,
  User,
  X,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { useMto } from '@/features/mto/context/MtoContext'
import { formatCurrency } from '@/shared/lib/currency'
import { statusBadgeClass } from '@/features/mto/data/mtoData'
import { mtoTypeLabel } from '@/features/mto/types'

export function MtoOrderDetailsPage() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()
  const { getOrderById, updateOrderStatus } = useMto()
  const order = getOrderById(orderId)

  if (!order) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <p className="text-base font-semibold text-slate-800">Order not found</p>
          <button
            type="button"
            onClick={() => navigate('/mto/orders')}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
          >
            Back to MTO Orders
          </button>
        </div>
      </AppLayout>
    )
  }

  const canAct = order.status === 'Pending' || order.status === 'Processing'

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/mto/orders')}
                className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
                  {order.id}
                </h1>
                <p className="text-base text-slate-500">{order.dateLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusBadgeClass(order.status)}`}
              >
                {order.status.toLowerCase()}
              </span>
              {canAct && (
                <>
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                    className="flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <X className="size-4" />
                    Cancel Order
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateOrderStatus(
                        order.id,
                        order.status === 'Pending' ? 'Processing' : 'Completed',
                      )
                    }
                    className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    <Check className="size-4" />
                    {order.status === 'Pending' ? 'Accept / Start' : 'Complete Order'}
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-4">
            <section className="rounded-[14px] border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <Store className="size-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-800">Store Information</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <DetailField label="Store Type" value={order.storeType} />
                <DetailField label="Store Name" value={order.storeName} />
                <DetailField label="Location" value={order.storeLocation} />
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <User className="size-5 text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Customer Details</h2>
                </div>
                <button
                  type="button"
                  className="h-8 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Full Profile
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailField label="Full Name" value={order.customer.customerName} />
                <DetailField label="Email" value={order.customer.customerEmail || '—'} />
                <DetailField label="Phone Number" value={order.customer.customerPhone} />
                <DetailField label="Address" value={order.customer.customerAddress || '—'} />
                <DetailField label="MTO Type" value={mtoTypeLabel(order.orderType)} />
                <DetailField
                  label="Payment"
                  value={`${order.payment.paymentStatus} · ${formatCurrency(order.payment.advancePayment)} paid`}
                />
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Product Details</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/mto/orders/${order.id}/items/${item.id}`)}
                    className="flex w-full flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex gap-3">
                      {item.images[0] ? (
                        <img
                          src={item.images[0].url}
                          alt={item.productName || 'Product'}
                          className="size-16 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="size-16 shrink-0 rounded-lg bg-amber-100" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.productName || item.skuReference || 'Custom MTO Item'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white">
                            MTO
                          </span>
                          {item.karat && (
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">
                              {item.karat}
                            </span>
                          )}
                          {item.baseMetal && (
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">
                              {item.baseMetal}
                            </span>
                          )}
                          {(item.requestedSize || item.size) && (
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">
                              Size {item.requestedSize || item.size}
                            </span>
                          )}
                          {(item.requestedColour || item.colour) && (
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">
                              {item.requestedColour || item.colour}
                            </span>
                          )}
                        </div>
                        {item.images.length > 1 && (
                          <p className="mt-2 text-xs text-slate-500">
                            {item.images.length} reference images
                          </p>
                        )}
                        {item.buyingRemark && (
                          <p className="mt-2 text-sm text-slate-500">{item.buyingRemark}</p>
                        )}
                        <p className="mt-2 text-xs font-medium text-slate-600">
                          View full details →
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        Price {formatCurrency(Number(item.itemPrice) || 0)}
                      </p>
                      {item.paymentMode === 'partial' ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Advance{' '}
                          {formatCurrency(Number(item.advancePayment) || 0)} · Remaining{' '}
                          {formatCurrency(
                            Math.max(
                              (Number(item.itemPrice) || 0) * (Number(item.quantity) || 1) -
                                (Number(item.advancePayment) || 0),
                              0,
                            ),
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-emerald-700">Paid in full</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Order Status</h2>
              <div className="space-y-0">
                {order.timeline.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < order.timeline.length - 1 && (
                      <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-slate-200" />
                    )}
                    <div
                      className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border ${
                        event.completed
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      {event.completed ? <Check className="size-3.5" /> : <span className="size-2 rounded-full bg-slate-300" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{event.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{event.dateLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Billing Details</h2>
              <div className="space-y-2 text-sm">
                <BillingRow label="Subtotal" value={formatCurrency(order.subtotal)} />
                <BillingRow label="Tax (GST)" value={formatCurrency(order.tax)} />
                <BillingRow
                  label="Discount"
                  value={`- ${formatCurrency(order.discount)}`}
                  valueClass="text-emerald-600"
                />
                <BillingRow label="Shipping Charges" value={formatCurrency(order.shipping)} />
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-base font-semibold text-slate-800">Total Amount</p>
                  <p className="text-base font-semibold text-slate-900">
                    {formatCurrency(order.payment.totalAmount)}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {order.payment.paymentMethod}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                  >
                    Invoice
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-slate-500">
                  <MapPin className="size-3.5" />
                  Remaining {formatCurrency(order.payment.remainingAmount)}
                </div>
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

function BillingRow({
  label,
  value,
  valueClass = 'text-slate-800',
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-slate-500">{label}</p>
      <p className={valueClass}>{value}</p>
    </div>
  )
}
