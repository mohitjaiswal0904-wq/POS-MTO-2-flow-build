import type { OrderProduct, ProductUnit, ReturnItem, ReturnRequest } from '@/features/orders/types'

export function expandProductsToUnits(products: OrderProduct[]): ProductUnit[] {
  const units: ProductUnit[] = []

  for (const product of products) {
    for (let i = 0; i < product.quantity; i++) {
      units.push({
        unitId: `${product.id}-unit-${i + 1}`,
        unitIdentity: `${product.sku}-${String(i + 1).padStart(3, '0')}`,
        productId: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        unitPrice: product.unitPrice,
        displayPrice: product.displayPrice,
        originalPrice: product.originalPrice,
        metal: product.metal,
        stone: product.stone,
        giftWrap: product.giftWrap,
        giftWrapPrice: product.giftWrapPrice,
        unitIndex: i + 1,
        totalInLine: product.quantity,
      })
    }
  }

  return units
}

export function getReturnedUnitIds(returnRequest: ReturnRequest | null): Set<string> {
  if (!returnRequest) return new Set()
  return new Set(returnRequest.items.map((item) => item.unitId))
}

export function isUnitReturned(unitId: string, returnRequest: ReturnRequest | null): boolean {
  return getReturnedUnitIds(returnRequest).has(unitId)
}

export function getReturnableUnits(
  products: OrderProduct[],
  returnRequest: ReturnRequest | null,
): ProductUnit[] {
  const returnedIds = getReturnedUnitIds(returnRequest)
  return expandProductsToUnits(products).filter((unit) => !returnedIds.has(unit.unitId))
}

export function getReturnedUnitsForProduct(
  productId: string,
  returnRequest: ReturnRequest | null,
): ReturnItem[] {
  if (!returnRequest) return []
  return returnRequest.items.filter((item) => item.productId === productId)
}

export function getReturnedCountByProduct(
  productId: string,
  returnRequest: ReturnRequest | null,
): number {
  return getReturnedUnitsForProduct(productId, returnRequest).length
}

export function getUnitRefund(unit: ProductUnit): number {
  const giftWrap = unit.giftWrap ? unit.giftWrapPrice : 0
  return unit.unitPrice + giftWrap
}

export function calculateTotalRefund(items: ReturnItem[]): number {
  return items.reduce((sum, item) => sum + item.refundAmount, 0)
}

export function buildReturnItem(
  unit: ProductUnit,
  reason: ReturnItem['reason'],
  comment: string,
): ReturnItem {
  return {
    unitId: unit.unitId,
    unitIdentity: unit.unitIdentity,
    productId: unit.productId,
    sku: unit.sku,
    name: unit.name,
    category: unit.category,
    unitPrice: unit.unitPrice,
    refundAmount: getUnitRefund(unit),
    reason,
    comment,
  }
}

export function hasReturnableItems(
  products: OrderProduct[],
  returnRequest: ReturnRequest | null,
): boolean {
  return getReturnableUnits(products, returnRequest).length > 0
}

export function getOrderLineTotal(product: OrderProduct): number {
  const giftWrapPerUnit = product.giftWrap ? product.giftWrapPrice : 0
  return (product.unitPrice + giftWrapPerUnit) * product.quantity
}

export function groupUnitsByProduct(units: ProductUnit[]): Map<string, ProductUnit[]> {
  const map = new Map<string, ProductUnit[]>()
  for (const unit of units) {
    const group = map.get(unit.productId) ?? []
    group.push(unit)
    map.set(unit.productId, group)
  }
  return map
}
