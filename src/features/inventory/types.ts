export type InventoryStatus = 'Display' | 'Backoffice' | 'Reserved'

export interface InventoryItem {
  id: string
  designId: string
  productName: string
  category: string
  status: InventoryStatus
  quantity: number
  location: string
  price: number
  lastUpdated: string
}

export type InventoryTab = 'stock' | 'inward' | 'outward' | 'advices'

export type ProductHistoryEventType =
  | 'inward'
  | 'returned_warehouse'
  | 'store_transfer'
  | 'moved_backoffice'
  | 'moved_display'
  | 'reserved'
  | 'unreserved'
  | 'outward'
  | 'sold'
  | 'price_update'
  | 'name_changed'
  | 'location_change'
  | 'note'

export interface ProductHistoryEvent {
  id: string
  type: ProductHistoryEventType
  title: string
  description: string
  timestamp: string
  dateLabel: string
  actor: string
  location?: string
  reference?: string
  meta?: Array<{ label: string; value: string }>
}

export type SkuUnitOrigin =
  | 'Vendor Supply'
  | 'Store Transfer'
  | 'Customer Return'
  | 'Repair Inward'
  | 'Head Office'

export interface SkuUnit {
  barcode: string
  status: InventoryStatus | 'Sold' | 'Warehouse' | 'Transferred'
  origin: SkuUnitOrigin
  location: string
  inwardDate: string
  lastMovement: string
  price: number
  history: ProductHistoryEvent[]
}

export interface SkuCatalog {
  sku: string
  productName: string
  category: string
  metal: string
  price: number
  images: string[]
  units: SkuUnit[]
}
