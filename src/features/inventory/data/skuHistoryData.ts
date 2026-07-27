import type { ProductHistoryEvent, SkuCatalog, SkuUnit, SkuUnitOrigin } from '@/features/inventory/types'

function event(
  partial: Omit<ProductHistoryEvent, 'id'> & { id?: string },
): ProductHistoryEvent {
  return {
    id: partial.id ?? `evt-${Math.random().toString(36).slice(2, 9)}`,
    ...partial,
  }
}

/**
 * Lifecycle flow:
 * inward → backoffice → (display / reserved / edits)
 * Endpoints (flow ends here): Sold | Store Transfer | Returned to Warehouse
 */
function buildUnitHistory(
  barcode: string,
  origin: SkuUnitOrigin,
  status: SkuUnit['status'],
  location: string,
): ProductHistoryEvent[] {
  const base: ProductHistoryEvent[] = [
    event({
      type: 'inward',
      title: 'Stock Inward',
      description: `Unit ${barcode} received via ${origin}.`,
      timestamp: '2024-04-08T09:15:00',
      dateLabel: '08 Apr 2024 · 09:15 AM',
      actor: 'Ananya Mehta',
      location: 'Receiving Dock',
      reference: `INW-${barcode.slice(-4)}`,
      meta: [
        { label: 'Origin', value: origin },
        { label: 'Barcode', value: barcode },
        { label: 'Qty', value: '1' },
      ],
    }),
    event({
      type: 'moved_backoffice',
      title: 'Moved to Backoffice',
      description: 'Transferred into secure backoffice storage.',
      timestamp: '2024-04-08T14:05:00',
      dateLabel: '08 Apr 2024 · 02:05 PM',
      actor: 'Store Ops',
      location: 'Vault B2',
    }),
    event({
      type: 'name_changed',
      title: 'Product Name Changed',
      description: 'Catalog name updated for this SKU unit after merchandising review.',
      timestamp: '2024-04-09T10:30:00',
      dateLabel: '09 Apr 2024 · 10:30 AM',
      actor: 'Catalog Team',
      reference: `NAME-${barcode.slice(-4)}`,
      meta: [
        { label: 'Old Name', value: 'Diamond Ring' },
        { label: 'New Name', value: 'Diamond Ring 22K' },
        { label: 'Barcode', value: barcode },
      ],
    }),
    event({
      type: 'price_update',
      title: 'Price Changed',
      description: 'Unit retail price revised after gold rate and making-charge update.',
      timestamp: '2024-04-11T10:20:00',
      dateLabel: '11 Apr 2024 · 10:20 AM',
      actor: 'Pricing Team',
      reference: `PRC-${barcode.slice(-4)}`,
      meta: [
        { label: 'Old Price', value: '₹42,500' },
        { label: 'New Price', value: '₹45,000' },
        { label: 'Reason', value: 'Metal rate revision' },
      ],
    }),
  ]

  if (status === 'Backoffice') {
    return base
  }

  base.push(
    event({
      type: 'moved_display',
      title: 'Moved to Display',
      description: `Placed on floor at ${location}.`,
      timestamp: '2024-04-12T09:50:00',
      dateLabel: '12 Apr 2024 · 09:50 AM',
      actor: 'Priya Nair',
      location,
    }),
    event({
      type: 'price_update',
      title: 'Price Changed',
      description: 'Promotional floor price applied for display units.',
      timestamp: '2024-04-15T16:00:00',
      dateLabel: '15 Apr 2024 · 04:00 PM',
      actor: 'Store Manager',
      reference: `PRC-PROMO-${barcode.slice(-4)}`,
      meta: [
        { label: 'Old Price', value: '₹45,000' },
        { label: 'New Price', value: '₹43,500' },
        { label: 'Reason', value: 'Weekend promo' },
      ],
    }),
    event({
      type: 'name_changed',
      title: 'Display Name Changed',
      description: 'Floor label/name tag updated for customer-facing display.',
      timestamp: '2024-04-16T11:15:00',
      dateLabel: '16 Apr 2024 · 11:15 AM',
      actor: 'Visual Merchandising',
      reference: `NAME-DSP-${barcode.slice(-4)}`,
      meta: [
        { label: 'Old Name', value: 'Diamond Ring 22K' },
        { label: 'New Name', value: 'Diamond Ring 22K — Classic' },
      ],
    }),
  )

  if (status === 'Display') {
    return base
  }

  base.push(
    event({
      type: 'reserved',
      title: 'Reserved for Customer',
      description: 'Unit held against customer interest.',
      timestamp: '2024-04-22T16:10:00',
      dateLabel: '22 Apr 2024 · 04:10 PM',
      actor: 'Sales — Neha Shah',
      location,
      reference: `RSV-${barcode.slice(-4)}`,
      meta: [{ label: 'Customer', value: 'Priya Sharma' }],
    }),
  )

  if (status === 'Reserved') {
    return base
  }

  // Terminal endpoints — flow ends here
  if (status === 'Sold') {
    base.push(
      event({
        type: 'outward',
        title: 'Outward Initiated',
        description: 'Allocated for POS checkout.',
        timestamp: '2024-04-25T12:20:00',
        dateLabel: '25 Apr 2024 · 12:20 PM',
        actor: 'POS System',
        reference: `OUT-${barcode.slice(-4)}`,
      }),
      event({
        type: 'sold',
        title: 'Sold to Customer',
        description: 'Unit sold and ownership transferred. Flow ended.',
        timestamp: '2024-04-25T12:45:00',
        dateLabel: '25 Apr 2024 · 12:45 PM',
        actor: 'Cashier — KP Store',
        location: 'Phoenix Mall Store',
        reference: 'ORD-2024-0042',
        meta: [
          { label: 'Barcode', value: barcode },
          { label: 'Payment', value: 'Card' },
          { label: 'Sale Amount', value: '₹45,000' },
          { label: 'Endpoint', value: 'Sold' },
        ],
      }),
    )
    return base
  }

  if (status === 'Transferred') {
    base.push(
      event({
        type: 'store_transfer',
        title: 'Store Transfer Completed',
        description: 'Unit transferred to another store. Flow ended.',
        timestamp: '2024-04-26T15:30:00',
        dateLabel: '26 Apr 2024 · 03:30 PM',
        actor: 'Inventory Lead',
        location: 'Koramangala Store',
        reference: `TRF-${barcode.slice(-4)}`,
        meta: [
          { label: 'From', value: 'Phoenix Mall Store' },
          { label: 'To', value: 'Koramangala Store' },
          { label: 'Barcode', value: barcode },
          { label: 'Endpoint', value: 'Store Transfer' },
        ],
      }),
    )
    return base
  }

  // Warehouse — endpoint
  base.push(
    event({
      type: 'returned_warehouse',
      title: 'Returned to Warehouse',
      description: 'Unit returned to central warehouse. Flow ended.',
      timestamp: '2024-04-27T18:10:00',
      dateLabel: '27 Apr 2024 · 06:10 PM',
      actor: 'Warehouse Ops',
      location: 'Main Warehouse',
      reference: `WH-${barcode.slice(-4)}`,
      meta: [
        { label: 'Barcode', value: barcode },
        { label: 'Destination', value: 'Main Warehouse' },
        { label: 'Endpoint', value: 'Returned to Warehouse' },
      ],
    }),
  )

  return base
}

function createUnit(
  index: number,
  sku: string,
  status: SkuUnit['status'],
  origin: SkuUnitOrigin,
  location: string,
  lastMovement: string,
  price = 45000,
): SkuUnit {
  const barcode = `BC-${sku}-${String(index).padStart(4, '0')}`
  const history = buildUnitHistory(barcode, origin, status, location).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return {
    barcode,
    status,
    origin,
    location,
    inwardDate: '08 Apr 2024',
    lastMovement,
    price,
    history,
  }
}

/**
 * Full possibility set for barcode BC-SKU0001-0001:
 * Inward → Location (Backoffice / Display) → Price → Name → Sold → Returned → Store Transfer
 */
function buildAllPossibilitiesHistory(barcode: string): ProductHistoryEvent[] {
  return [
    event({
      id: 'sku0001-0001-inward',
      type: 'inward',
      title: 'Stock Inward',
      description: `Unit ${barcode} received into inventory.`,
      timestamp: '2024-04-08T09:15:00',
      dateLabel: '08 Apr 2024 · 09:15 AM',
      actor: 'Ananya Mehta',
      location: 'Receiving Dock',
      reference: 'INW-0001',
      meta: [
        { label: 'Origin', value: 'Vendor Supply' },
        { label: 'Barcode', value: barcode },
        { label: 'Qty', value: '1' },
      ],
    }),
    event({
      id: 'sku0001-0001-backoffice',
      type: 'moved_backoffice',
      title: 'Location Changed · Backoffice',
      description: 'Moved from receiving to secure backoffice storage.',
      timestamp: '2024-04-08T14:05:00',
      dateLabel: '08 Apr 2024 · 02:05 PM',
      actor: 'Store Ops',
      location: 'Vault B2',
      reference: 'LOC-BO-0001',
      meta: [
        { label: 'From', value: 'Receiving Dock' },
        { label: 'To', value: 'Backoffice · Vault B2' },
      ],
    }),
    event({
      id: 'sku0001-0001-display',
      type: 'moved_display',
      title: 'Location Changed · Display',
      description: 'Moved from backoffice to floor display.',
      timestamp: '2024-04-12T09:50:00',
      dateLabel: '12 Apr 2024 · 09:50 AM',
      actor: 'Priya Nair',
      location: 'Shelf A1',
      reference: 'LOC-DSP-0001',
      meta: [
        { label: 'From', value: 'Backoffice · Vault B2' },
        { label: 'To', value: 'Display · Shelf A1' },
      ],
    }),
    event({
      id: 'sku0001-0001-price',
      type: 'price_update',
      title: 'Price Changed',
      description: 'Retail price revised after metal rate update.',
      timestamp: '2024-04-15T16:00:00',
      dateLabel: '15 Apr 2024 · 04:00 PM',
      actor: 'Pricing Team',
      reference: 'PRC-0001',
      meta: [
        { label: 'Old Price', value: '₹42,500' },
        { label: 'New Price', value: '₹45,000' },
        { label: 'Reason', value: 'Metal rate revision' },
      ],
    }),
    event({
      id: 'sku0001-0001-name',
      type: 'name_changed',
      title: 'Name Changed',
      description: 'Product display name updated for catalog and floor label.',
      timestamp: '2024-04-16T11:15:00',
      dateLabel: '16 Apr 2024 · 11:15 AM',
      actor: 'Catalog Team',
      reference: 'NAME-0001',
      meta: [
        { label: 'Old Name', value: 'Diamond Ring' },
        { label: 'New Name', value: 'Diamond Ring 22K' },
      ],
    }),
    event({
      id: 'sku0001-0001-sold',
      type: 'sold',
      title: 'Sold',
      description: 'Unit sold to customer at POS.',
      timestamp: '2024-04-25T12:45:00',
      dateLabel: '25 Apr 2024 · 12:45 PM',
      actor: 'Cashier — KP Store',
      location: 'Phoenix Mall Store',
      reference: 'ORD-2024-0042',
      meta: [
        { label: 'Barcode', value: barcode },
        { label: 'Payment', value: 'Card' },
        { label: 'Sale Amount', value: '₹45,000' },
      ],
    }),
    event({
      id: 'sku0001-0001-returned',
      type: 'returned_warehouse',
      title: 'Returned',
      description: 'Unit returned by customer and sent back to warehouse.',
      timestamp: '2024-05-02T11:20:00',
      dateLabel: '02 May 2024 · 11:20 AM',
      actor: 'Returns Desk',
      location: 'Main Warehouse',
      reference: 'RET-2024-0118',
      meta: [
        { label: 'Barcode', value: barcode },
        { label: 'Return Order', value: 'ORD-2024-0042' },
        { label: 'Destination', value: 'Main Warehouse' },
      ],
    }),
    event({
      id: 'sku0001-0001-transfer',
      type: 'store_transfer',
      title: 'Store Transfer',
      description: 'Unit transferred to another store. Flow ended.',
      timestamp: '2024-05-06T15:30:00',
      dateLabel: '06 May 2024 · 03:30 PM',
      actor: 'Inventory Lead',
      location: 'Koramangala Store',
      reference: 'TRF-0001',
      meta: [
        { label: 'From', value: 'Main Warehouse' },
        { label: 'To', value: 'Koramangala Store' },
        { label: 'Barcode', value: barcode },
        { label: 'Endpoint', value: 'Store Transfer' },
      ],
    }),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function createShowcaseUnit(): SkuUnit {
  const barcode = 'BC-SKU0001-0001'
  return {
    barcode,
    status: 'Transferred',
    origin: 'Vendor Supply',
    location: 'Koramangala Store',
    inwardDate: '08 Apr 2024',
    lastMovement: '1 hour ago',
    price: 45000,
    history: buildAllPossibilitiesHistory(barcode),
  }
}

export const skuCatalog: SkuCatalog[] = [
  {
    sku: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    metal: '22K Yellow Gold',
    price: 45000,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f995f9795?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop',
    ],
    units: [
      createShowcaseUnit(),
      createUnit(2, 'SKU0001', 'Display', 'Vendor Supply', 'Shelf A1', '2 hours ago'),
      createUnit(3, 'SKU0001', 'Display', 'Store Transfer', 'Shelf A2', '5 hours ago'),
      createUnit(4, 'SKU0001', 'Display', 'Vendor Supply', 'Shelf A1', '1 day ago'),
      createUnit(5, 'SKU0001', 'Backoffice', 'Head Office', 'Vault B2', '1 day ago'),
      createUnit(6, 'SKU0001', 'Backoffice', 'Vendor Supply', 'Vault B2', '3 hours ago'),
      createUnit(7, 'SKU0001', 'Reserved', 'Repair Inward', 'Hold Rack', '6 hours ago'),
      createUnit(8, 'SKU0001', 'Sold', 'Vendor Supply', 'Phoenix Mall Store', '2 days ago'),
      createUnit(9, 'SKU0001', 'Transferred', 'Store Transfer', 'Koramangala Store', '1 day ago'),
      createUnit(10, 'SKU0001', 'Warehouse', 'Customer Return', 'Main Warehouse', '3 hours ago'),
    ],
  },
  {
    sku: 'SKU0002',
    productName: 'Gold Pearl Earrings',
    category: 'Earrings',
    metal: '9KT Rose Gold',
    price: 36727,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
    ],
    units: [
      createUnit(1, 'SKU0002', 'Display', 'Vendor Supply', 'Shelf B1', '3 hours ago', 36727),
      createUnit(2, 'SKU0002', 'Display', 'Vendor Supply', 'Shelf B1', '3 hours ago', 36727),
      createUnit(3, 'SKU0002', 'Backoffice', 'Head Office', 'Vault C1', '1 day ago', 36727),
      createUnit(4, 'SKU0002', 'Sold', 'Store Transfer', 'Phoenix Mall Store', '5 hours ago', 36727),
      createUnit(5, 'SKU0002', 'Warehouse', 'Vendor Supply', 'Main Warehouse', '2 hours ago', 36727),
    ],
  },
]

export function searchSkuCatalog(query: string): SkuCatalog[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return skuCatalog.filter(
    (entry) =>
      entry.sku.toLowerCase().includes(q) ||
      entry.productName.toLowerCase().includes(q) ||
      entry.units.some((unit) => unit.barcode.toLowerCase().includes(q)),
  )
}

export function getSkuByCode(sku: string): SkuCatalog | undefined {
  return skuCatalog.find((entry) => entry.sku.toLowerCase() === sku.toLowerCase())
}

export function getUnitByBarcode(barcode: string):
  | { sku: SkuCatalog; unit: SkuUnit }
  | undefined {
  const q = barcode.trim().toLowerCase()
  if (!q) return undefined

  for (const entry of skuCatalog) {
    const unit = entry.units.find((item) => item.barcode.toLowerCase() === q)
    if (unit) {
      return { sku: entry, unit }
    }
  }

  return undefined
}

export function searchBarcodes(query: string): Array<{ sku: SkuCatalog; unit: SkuUnit }> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const matches: Array<{ sku: SkuCatalog; unit: SkuUnit }> = []
  for (const entry of skuCatalog) {
    for (const unit of entry.units) {
      if (unit.barcode.toLowerCase().includes(q)) {
        matches.push({ sku: entry, unit })
      }
    }
  }
  return matches
}

export function isLikelyBarcodeQuery(query: string): boolean {
  const q = query.trim().toUpperCase()
  return (
    q.startsWith('BC-') ||
    /^SKU\d{4}-\d{4}$/.test(q) ||
    Boolean(getUnitByBarcode(q))
  )
}

export function getSkuAvailability(sku: SkuCatalog) {
  const availability = {
    total: sku.units.length,
    available: sku.units.filter(
      (unit) =>
        unit.status === 'Display' ||
        unit.status === 'Backoffice' ||
        unit.status === 'Reserved',
    ).length,
    display: 0,
    backoffice: 0,
    reserved: 0,
    sold: 0,
    warehouse: 0,
    transferred: 0,
  }

  for (const unit of sku.units) {
    if (unit.status === 'Display') availability.display += 1
    if (unit.status === 'Backoffice') availability.backoffice += 1
    if (unit.status === 'Reserved') availability.reserved += 1
    if (unit.status === 'Sold') availability.sold += 1
    if (unit.status === 'Warehouse') availability.warehouse += 1
    if (unit.status === 'Transferred') availability.transferred += 1
  }

  return availability
}

export function getOriginBreakdown(sku: SkuCatalog) {
  const map = new Map<string, number>()
  for (const unit of sku.units) {
    map.set(unit.origin, (map.get(unit.origin) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([origin, count]) => ({ origin, count }))
}
