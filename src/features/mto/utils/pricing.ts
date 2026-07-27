import type { SkuCatalog } from '@/features/inventory/types'
import { createEmptyMtoItem, type MtoItem } from '@/features/mto/types'

export function itemFromSku(sku: SkuCatalog): MtoItem {
  const karatMatch = sku.metal.match(/\d+K[Tt]?/i)?.[0] ?? ''
  const baseMetal = sku.metal.replace(karatMatch, '').trim() || sku.metal
  const price = String(sku.price)

  return {
    ...createEmptyMtoItem(),
    skuReference: sku.sku,
    productName: sku.productName,
    productCategory: sku.category,
    itemPrice: price,
    karat: karatMatch,
    baseMetal,
    colour: sku.metal,
    paymentMode: 'full',
    advancePayment: price,
    images: (sku.images ?? []).map((url, index) => ({
      id: `catalog-${sku.sku}-${index}`,
      name: `${sku.productName} · View ${index + 1}`,
      url,
      source: 'catalog' as const,
    })),
  }
}

export function itemLineTotal(item: MtoItem): number {
  return (Number(item.itemPrice) || 0) * (Number(item.quantity) || 1)
}

export function itemAdvanceAmount(item: MtoItem): number {
  const total = itemLineTotal(item)
  if (item.paymentMode === 'full') return total
  return Math.min(Math.max(Number(item.advancePayment) || 0, 0), total)
}

export function itemRemainingAmount(item: MtoItem): number {
  return Math.max(itemLineTotal(item) - itemAdvanceAmount(item), 0)
}
