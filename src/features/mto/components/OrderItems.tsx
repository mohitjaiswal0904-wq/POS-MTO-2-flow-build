import { useRef, useState } from 'react'
import { Camera, ChevronDown, ImagePlus, Package, Plus, Trash2, Upload } from 'lucide-react'
import type { MtoItem, MtoItemImage } from '@/features/mto/types'
import {
  itemLineTotal,
  itemRemainingAmount,
} from '@/features/mto/utils/pricing'
import { CurrencyField, Field, SectionBlock } from '@/shared/ui'

export function OrderItemsSection({
  items,
  skuLocked,
  canAdd,
  onChange,
  onRemove,
  onAdd,
}: {
  items: MtoItem[]
  skuLocked: boolean
  canAdd: boolean
  onChange: (id: string, patch: Partial<MtoItem>) => void
  onRemove: (id: string) => void
  onAdd: () => void
}) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
            <Package className="size-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Order Items</h2>
            <p className="text-sm text-slate-500">
              {items.length} item{items.length === 1 ? '' : '(s)'} added
            </p>
          </div>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="size-4" />
            Add Item
          </button>
        )}
      </div>

      <div className="space-y-4 p-6">
        {items.map((item, index) => (
          <OrderItemCard
            key={item.id}
            index={index}
            item={item}
            skuLocked={skuLocked}
            canRemove={items.length > 1}
            onChange={(patch) => onChange(item.id, patch)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>
    </section>
  )
}

export function OrderItemCard({
  index,
  item,
  skuLocked,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number
  item: MtoItem
  skuLocked: boolean
  canRemove: boolean
  onChange: (patch: Partial<MtoItem>) => void
  onRemove: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [showImagePicker, setShowImagePicker] = useState(false)

  const addImages = (files: FileList | null) => {
    if (!files?.length) return
    const next: MtoItemImage[] = Array.from(files).map((file) => ({
      id: `img-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name || `Photo ${Date.now()}`,
      url: URL.createObjectURL(file),
      source: 'upload' as const,
    }))
    onChange({ images: [...item.images, ...next] })
    setShowImagePicker(false)
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
        <span className="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
          Item #{index + 1}
          {item.skuReference ? ` · ${item.skuReference}` : ''}
        </span>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="size-4" />
          Remove
        </button>
      </div>

      <div className="space-y-0 p-4">
        <SectionBlock title="Product Images">
          {skuLocked ? (
            <>
              <p className="mb-3 text-sm text-slate-500">
                Live catalog images for this product — upload is not available for in-house designs.
              </p>
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
                        <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          Live
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No catalog images available for this SKU.</p>
              )}
            </>
          ) : (
            <>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  addImages(e.target.files)
                  e.target.value = ''
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addImages(e.target.files)
                  e.target.value = ''
                }}
              />

              {!showImagePicker ? (
                <button
                  type="button"
                  onClick={() => setShowImagePicker(true)}
                  className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:bg-slate-100"
                >
                  <ImagePlus className="mb-2 size-6 text-slate-500" />
                  <p className="text-sm font-medium text-slate-700">Add product images</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Camera or upload · PNG, JPG
                  </p>
                </button>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <div className="border-b border-slate-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-medium text-amber-900">
                      Upload clear images from as many angles as possible
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800/90">
                      Front, side, top, and close-up shots help the design team understand the product
                      better. Prefer good lighting and sharp focus.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-6 text-center hover:border-slate-400 hover:bg-slate-50"
                    >
                      <Camera className="size-7 text-slate-700" />
                      <span className="text-sm font-semibold text-slate-800">Open camera</span>
                      <span className="text-xs text-slate-500">Capture a new photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-6 text-center hover:border-slate-400 hover:bg-slate-50"
                    >
                      <Upload className="size-7 text-slate-700" />
                      <span className="text-sm font-semibold text-slate-800">Upload images</span>
                      <span className="text-xs text-slate-500">Choose from gallery / files</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-200 px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(false)}
                      className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {item.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </SectionBlock>

        <SectionBlock title="General Details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="SKU Reference"
              value={item.skuReference}
              placeholder="Enter SKU"
              disabled={skuLocked || Boolean(item.skuReference)}
              onChange={(value) => onChange({ skuReference: value })}
            />
            <Field
              label="Product Category"
              value={item.productCategory}
              placeholder="e.g., Ring, Necklace"
              disabled={skuLocked || Boolean(item.skuReference)}
              onChange={(value) => onChange({ productCategory: value })}
            />
            <Field
              label="Product Name"
              value={item.productName}
              placeholder="Enter product name"
              disabled={skuLocked || Boolean(item.skuReference)}
              onChange={(value) => onChange({ productName: value })}
            />
            <Field
              label="Design Type"
              value={item.designType}
              placeholder="Enter design type"
              onChange={(value) => onChange({ designType: value })}
            />
            <Field
              label="Quantity"
              type="number"
              value={item.quantity}
              placeholder="1"
              onChange={(value) => onChange({ quantity: value })}
            />
            <Field
              label="Engraving"
              value={item.engraving}
              placeholder="Optional engraving text"
              onChange={(value) => onChange({ engraving: value })}
            />
            <Field
              label="Buying Remark"
              value={item.buyingRemark}
              placeholder="Add remarks"
              onChange={(value) => onChange({ buyingRemark: value })}
            />
          </div>
        </SectionBlock>

        <SectionBlock title="Metal Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Base Metal / Metal Type"
              value={item.baseMetal}
              placeholder="e.g., Gold, Silver"
              onChange={(value) => onChange({ baseMetal: value })}
            />
            <Field
              label="Karat / Purity"
              value={item.karat}
              placeholder="e.g., 18K, 22K"
              onChange={(value) => onChange({ karat: value })}
            />
            <Field
              label="Gold Colour"
              value={item.colour}
              placeholder="e.g., Yellow, Rose, White"
              onChange={(value) => onChange({ colour: value })}
            />
            <Field
              label="Metal Weight"
              type="number"
              value={item.metalWeight}
              placeholder="0"
              onChange={(value) => onChange({ metalWeight: value })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Weight Unit</label>
              <div className="relative">
                <select
                  value={item.weightUnit}
                  onChange={(e) => onChange({ weightUnit: e.target.value })}
                  className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
                >
                  <option>Grams</option>
                  <option>Carats</option>
                  <option>Ounces</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title="Diamond Details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field
              label="Diamond Weight / Size (ct)"
              value={item.diamondWeight}
              placeholder="0.00 ct"
              onChange={(value) => onChange({ diamondWeight: value })}
            />
            <Field
              label="Diamond Clarity / Quality"
              value={item.diamondClarity}
              placeholder="e.g., VS1, VVS"
              onChange={(value) => onChange({ diamondClarity: value })}
            />
            <Field
              label="Diamond Shape"
              value={item.diamondShape}
              placeholder="e.g., Round, Princess"
              onChange={(value) => onChange({ diamondShape: value })}
            />
            <Field
              label="Diamond Cut"
              value={item.diamondCut}
              placeholder="e.g., Excellent, Very Good"
              onChange={(value) => onChange({ diamondCut: value })}
            />
            <Field
              label="Number of Diamonds"
              type="number"
              value={item.numberOfDiamonds}
              placeholder="0"
              onChange={(value) => onChange({ numberOfDiamonds: value })}
            />
            <Field
              label="Gemstone Details"
              value={item.gemstoneDetails}
              placeholder="If applicable"
              onChange={(value) => onChange({ gemstoneDetails: value })}
            />
          </div>
        </SectionBlock>

        <SectionBlock title="Dimensions & Size">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field
              label="Length"
              value={item.length}
              placeholder="0 mm"
              onChange={(value) => onChange({ length: value })}
            />
            <Field
              label="Width"
              value={item.width}
              placeholder="0 mm"
              onChange={(value) => onChange({ width: value })}
            />
            <Field
              label="Height"
              value={item.height}
              placeholder="0 mm"
              onChange={(value) => onChange({ height: value })}
            />
            <Field
              label="Ring / Product Size"
              value={item.size}
              placeholder="e.g., 7, M"
              onChange={(value) => onChange({ size: value })}
            />
            <Field
              label="Region"
              value={item.region}
              placeholder="e.g., US, UK, India"
              onChange={(value) => onChange({ region: value })}
            />
          </div>
        </SectionBlock>

        <SectionBlock title="Pricing & Payment">
          <p className="mb-4 text-sm text-slate-500">
            Set price and advance for this product. Order totals are calculated from all products.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CurrencyField
              label="Item Price"
              value={item.itemPrice}
              onChange={(value) => onChange({ itemPrice: value })}
            />
            <CurrencyField
              label="Customer Gold Price Lock (today's price)"
              value={item.customerGoldPriceLock}
              onChange={(value) => onChange({ customerGoldPriceLock: value })}
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-600">Payment for this product</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onChange({ paymentMode: 'full' })}
                className={`rounded-xl border p-3 text-left ${
                  item.paymentMode === 'full'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <p className="text-sm font-semibold">Full payment</p>
                <p
                  className={`mt-0.5 text-xs ${
                    item.paymentMode === 'full' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Pay full estimated price now
                </p>
              </button>
              <button
                type="button"
                onClick={() => onChange({ paymentMode: 'partial' })}
                className={`rounded-xl border p-3 text-left ${
                  item.paymentMode === 'partial'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <p className="text-sm font-semibold">Partial / Token</p>
                <p
                  className={`mt-0.5 text-xs ${
                    item.paymentMode === 'partial' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Collect advance; remaining later
                </p>
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <CurrencyField
              label="Estimated price"
              value={String(itemLineTotal(item))}
              onChange={() => undefined}
              readOnly
            />
            <CurrencyField
              label={item.paymentMode === 'full' ? 'Amount paid' : 'Advance / Token'}
              value={
                item.paymentMode === 'full'
                  ? String(itemLineTotal(item))
                  : item.advancePayment
              }
              onChange={(value) => onChange({ advancePayment: value })}
              readOnly={item.paymentMode === 'full'}
            />
            <CurrencyField
              label="Remaining"
              value={String(itemRemainingAmount(item))}
              onChange={() => undefined}
              readOnly
            />
          </div>
        </SectionBlock>
      </div>
    </div>
  )
}
