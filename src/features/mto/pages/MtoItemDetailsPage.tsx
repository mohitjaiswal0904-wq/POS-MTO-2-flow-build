import { useNavigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowLeft, ImageOff } from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { useMto } from '@/features/mto/context/MtoContext'
import { formatCurrency } from '@/shared/lib/currency'
import {
  itemAdvanceAmount,
  itemLineTotal,
  itemRemainingAmount,
} from '@/features/mto/utils/pricing'

export function MtoItemDetailsPage() {
  const { orderId = '', itemId = '' } = useParams()
  const navigate = useNavigate()
  const { getOrderById } = useMto()
  const order = getOrderById(orderId)
  const item = order?.items.find((entry) => entry.id === itemId)

  if (!order || !item) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <p className="text-base font-semibold text-slate-800">Product details not found</p>
          <button
            type="button"
            onClick={() => navigate(orderId ? `/mto/orders/${orderId}` : '/mto/orders')}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
          >
            Back
          </button>
        </div>
      </AppLayout>
    )
  }

  const title = item.productName || item.skuReference || 'Custom MTO Item'
  const lineTotal = itemLineTotal(item)
  const advance = itemAdvanceAmount(item)
  const remaining = itemRemainingAmount(item)

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate(`/mto/orders/${order.id}`)}
                className="mt-1 flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
                  {title}
                </h1>
                <p className="mt-1 text-base text-slate-500">
                  Order {order.id} · Product specifications & images
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-4">
            <FormSection title="Product Images">
              {item.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {item.images.map((image) => (
                    <div
                      key={image.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="aspect-square w-full object-cover"
                      />
                      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                        <p className="truncate text-xs text-slate-500">{image.name}</p>
                        {image.source === 'catalog' && (
                          <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                  <ImageOff className="mb-2 size-6 text-slate-400" />
                  <p className="text-sm text-slate-500">No images attached to this product</p>
                </div>
              )}
            </FormSection>

            <FormSection title="General Details">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadField label="SKU Reference" value={item.skuReference} />
                <ReadField label="Product Category" value={item.productCategory} />
                <ReadField label="Product Name" value={item.productName} />
                <ReadField label="Design Type" value={item.designType} />
                <ReadField label="Quantity" value={item.quantity || '1'} />
                <ReadField label="Engraving" value={item.engraving} />
                <ReadField label="Buying Remark" value={item.buyingRemark} />
              </div>
            </FormSection>

            <FormSection title="Metal Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ReadField label="Base Metal / Metal Type" value={item.baseMetal} />
                <ReadField label="Karat / Purity" value={item.karat} />
                <ReadField label="Gold Colour" value={item.colour} />
                <ReadField label="Metal Weight" value={item.metalWeight} />
                <ReadField label="Weight Unit" value={item.weightUnit} />
              </div>
            </FormSection>

            <FormSection title="Diamond Details">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ReadField label="Diamond Weight / Size (ct)" value={item.diamondWeight} />
                <ReadField label="Diamond Clarity / Quality" value={item.diamondClarity} />
                <ReadField label="Diamond Shape" value={item.diamondShape} />
                <ReadField label="Diamond Cut" value={item.diamondCut} />
                <ReadField label="Number of Diamonds" value={item.numberOfDiamonds} />
                <ReadField label="Gemstone Details" value={item.gemstoneDetails} />
              </div>
            </FormSection>

            <FormSection title="Dimensions & Size">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <ReadField label="Length" value={item.length} />
                <ReadField label="Width" value={item.width} />
                <ReadField label="Height" value={item.height} />
                <ReadField label="Ring / Product Size" value={item.size} />
                <ReadField label="Region" value={item.region} />
              </div>
            </FormSection>

            <FormSection title="Pricing & Payment">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadField
                  label="Item Price"
                  value={formatCurrency(Number(item.itemPrice) || 0)}
                />
                <ReadField
                  label="Customer Gold Price Lock (today's price)"
                  value={formatCurrency(Number(item.customerGoldPriceLock) || 0)}
                />
                <ReadField
                  label="Payment type"
                  value={item.paymentMode === 'partial' ? 'Partial / Token' : 'Full payment'}
                />
                <ReadField label="Estimated price" value={formatCurrency(lineTotal)} />
                <ReadField
                  label={item.paymentMode === 'full' ? 'Amount paid' : 'Advance / Token'}
                  value={formatCurrency(advance)}
                />
                <ReadField label="Remaining" value={formatCurrency(remaining)} />
              </div>
            </FormSection>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function ReadField({ label, value }: { label: string; value: string }) {
  const display = value?.trim() ? value : '—'
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-600">{label}</p>
      <div className="flex min-h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800">
        {display}
      </div>
    </div>
  )
}
