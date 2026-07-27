import type { InventoryItem, ProductHistoryEvent } from '@/features/inventory/types'

export const inventoryItems: InventoryItem[] = [
  {
    id: 'inv-1',
    designId: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    status: 'Display',
    quantity: 5,
    location: 'Shelf A1',
    price: 45000,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'inv-2',
    designId: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    status: 'Backoffice',
    quantity: 5,
    location: 'Shelf A1',
    price: 45000,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'inv-3',
    designId: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    status: 'Display',
    quantity: 5,
    location: 'Shelf A1',
    price: 45000,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'inv-4',
    designId: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    status: 'Backoffice',
    quantity: 5,
    location: 'Shelf A1',
    price: 45000,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'inv-5',
    designId: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    status: 'Reserved',
    quantity: 5,
    location: 'Shelf A1',
    price: 45000,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'inv-6',
    designId: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    status: 'Backoffice',
    quantity: 5,
    location: 'Shelf A1',
    price: 45000,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'inv-7',
    designId: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    status: 'Reserved',
    quantity: 5,
    location: 'Shelf A1',
    price: 45000,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'inv-8',
    designId: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    status: 'Reserved',
    quantity: 5,
    location: 'Shelf A1',
    price: 45000,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'inv-9',
    designId: 'SKU0001',
    productName: 'Diamond Ring 22K',
    category: 'Rings',
    status: 'Reserved',
    quantity: 5,
    location: 'Shelf A1',
    price: 45000,
    lastUpdated: '2 hours ago',
  },
]

/** Lifecycle: inward → ops → ... → endpoint (Sold | Store Transfer | Returned to Warehouse) */
const sharedLifecycle: ProductHistoryEvent[] = [
  {
    id: 'evt-01',
    type: 'inward',
    title: 'Stock Inward',
    description: 'Product received from vendor and booked into inventory.',
    timestamp: '2024-04-10T09:15:00',
    dateLabel: '10 Apr 2024 · 09:15 AM',
    actor: 'Ananya Mehta',
    location: 'Receiving Dock',
    reference: 'INW-2024-1182',
    meta: [
      { label: 'Vendor', value: 'Jewelex Suppliers' },
      { label: 'Qty Received', value: '5' },
      { label: 'Invoice', value: 'INV-JL-88421' },
    ],
  },
  {
    id: 'evt-03',
    type: 'moved_backoffice',
    title: 'Moved to Backoffice',
    description: 'Unit transferred from receiving to backoffice vault storage.',
    timestamp: '2024-04-10T14:05:00',
    dateLabel: '10 Apr 2024 · 02:05 PM',
    actor: 'Store Ops',
    location: 'Vault B2',
    reference: 'MOV-2024-2201',
  },
  {
    id: 'evt-03b',
    type: 'name_changed',
    title: 'Product Name Changed',
    description: 'Catalog product name updated after merchandising review.',
    timestamp: '2024-04-11T09:30:00',
    dateLabel: '11 Apr 2024 · 09:30 AM',
    actor: 'Catalog Team',
    reference: 'NAME-2024-014',
    meta: [
      { label: 'Old Name', value: 'Diamond Ring' },
      { label: 'New Name', value: 'Diamond Ring 22K' },
    ],
  },
  {
    id: 'evt-04',
    type: 'price_update',
    title: 'Price Changed',
    description: 'Retail price revised after metal rate refresh and making charges.',
    timestamp: '2024-04-11T10:20:00',
    dateLabel: '11 Apr 2024 · 10:20 AM',
    actor: 'Pricing Team',
    reference: 'PRC-2024-091',
    meta: [
      { label: 'Old Price', value: '₹42,500' },
      { label: 'New Price', value: '₹45,000' },
      { label: 'Reason', value: 'Metal rate revision' },
    ],
  },
  {
    id: 'evt-05',
    type: 'moved_display',
    title: 'Moved to Display',
    description: 'Product placed on shop floor for customer viewing.',
    timestamp: '2024-04-12T09:50:00',
    dateLabel: '12 Apr 2024 · 09:50 AM',
    actor: 'Priya Nair',
    location: 'Shelf A1',
    reference: 'MOV-2024-2288',
  },
  {
    id: 'evt-05b',
    type: 'price_update',
    title: 'Price Changed',
    description: 'Promotional floor price applied for display.',
    timestamp: '2024-04-15T16:00:00',
    dateLabel: '15 Apr 2024 · 04:00 PM',
    actor: 'Store Manager',
    reference: 'PRC-2024-112',
    meta: [
      { label: 'Old Price', value: '₹45,000' },
      { label: 'New Price', value: '₹43,500' },
      { label: 'Reason', value: 'Weekend promo' },
    ],
  },
  {
    id: 'evt-05c',
    type: 'name_changed',
    title: 'Display Name Changed',
    description: 'Customer-facing display name updated on the floor tag.',
    timestamp: '2024-04-16T11:15:00',
    dateLabel: '16 Apr 2024 · 11:15 AM',
    actor: 'Visual Merchandising',
    reference: 'NAME-2024-021',
    meta: [
      { label: 'Old Name', value: 'Diamond Ring 22K' },
      { label: 'New Name', value: 'Diamond Ring 22K — Classic' },
    ],
  },
  {
    id: 'evt-06',
    type: 'location_change',
    title: 'Location Adjusted',
    description: 'Display tray rearranged during morning merchandising.',
    timestamp: '2024-04-18T08:30:00',
    dateLabel: '18 Apr 2024 · 08:30 AM',
    actor: 'Floor Staff',
    location: 'Shelf A1 · Tray 3',
  },
  {
    id: 'evt-07',
    type: 'reserved',
    title: 'Reserved for Customer',
    description: 'Item reserved during consultation. Held for trial / decision.',
    timestamp: '2024-04-22T16:10:00',
    dateLabel: '22 Apr 2024 · 04:10 PM',
    actor: 'Sales — Neha Shah',
    location: 'Shelf A1',
    reference: 'RSV-2024-0312',
    meta: [
      { label: 'Customer', value: 'Priya Sharma' },
      { label: 'Hold Until', value: '24 Apr 2024' },
    ],
  },
  {
    id: 'evt-08',
    type: 'note',
    title: 'Customer Follow-up Logged',
    description: 'Customer confirmed intent to purchase. Preparing billing.',
    timestamp: '2024-04-23T11:05:00',
    dateLabel: '23 Apr 2024 · 11:05 AM',
    actor: 'Sales — Neha Shah',
    reference: 'NOTE-884',
  },
]

const soldEndpoint: ProductHistoryEvent[] = [
  {
    id: 'evt-09',
    type: 'outward',
    title: 'Outward Initiated',
    description: 'Stock outward ticket created for POS checkout allocation.',
    timestamp: '2024-04-25T12:20:00',
    dateLabel: '25 Apr 2024 · 12:20 PM',
    actor: 'POS System',
    reference: 'OUT-2024-0677',
    meta: [{ label: 'Channel', value: 'Physical Store' }],
  },
  {
    id: 'evt-10',
    type: 'sold',
    title: 'Sold to Customer',
    description: 'Product sold and ownership transferred. Flow ended.',
    timestamp: '2024-04-25T12:45:00',
    dateLabel: '25 Apr 2024 · 12:45 PM',
    actor: 'Cashier — KP Store',
    location: 'Phoenix Mall Store',
    reference: 'ORD-2024-0042',
    meta: [
      { label: 'Customer', value: 'Priya Sharma' },
      { label: 'Payment', value: 'Card' },
      { label: 'Sale Amount', value: '₹45,000' },
      { label: 'Endpoint', value: 'Sold' },
    ],
  },
]

const transferEndpoint: ProductHistoryEvent[] = [
  {
    id: 'evt-trf',
    type: 'store_transfer',
    title: 'Store Transfer Completed',
    description: 'Unit transferred to another store. Flow ended.',
    timestamp: '2024-04-26T15:30:00',
    dateLabel: '26 Apr 2024 · 03:30 PM',
    actor: 'Inventory Lead',
    location: 'Koramangala Store',
    reference: 'TRF-2024-0881',
    meta: [
      { label: 'From', value: 'Phoenix Mall Store' },
      { label: 'To', value: 'Koramangala Store' },
      { label: 'Endpoint', value: 'Store Transfer' },
    ],
  },
]

const warehouseEndpoint: ProductHistoryEvent[] = [
  {
    id: 'evt-wh',
    type: 'returned_warehouse',
    title: 'Returned to Warehouse',
    description: 'Unit returned to central warehouse. Flow ended.',
    timestamp: '2024-04-27T18:10:00',
    dateLabel: '27 Apr 2024 · 06:10 PM',
    actor: 'Warehouse Ops',
    location: 'Main Warehouse',
    reference: 'WH-2024-1204',
    meta: [
      { label: 'Destination', value: 'Main Warehouse' },
      { label: 'Endpoint', value: 'Returned to Warehouse' },
    ],
  },
]

const historyByItemId: Record<string, ProductHistoryEvent[]> = {
  'inv-1': sharedLifecycle.slice(0, 5),
  'inv-2': sharedLifecycle.slice(0, 3),
  'inv-3': sharedLifecycle.slice(0, 5),
  'inv-4': sharedLifecycle.slice(0, 3),
  'inv-5': sharedLifecycle.slice(0, 7),
  'inv-6': sharedLifecycle.slice(0, 3),
  'inv-7': [...sharedLifecycle, ...transferEndpoint],
  'inv-8': [...sharedLifecycle, ...warehouseEndpoint],
  'inv-9': [...sharedLifecycle, ...soldEndpoint],
}

export function getInventoryItemById(id: string): InventoryItem | undefined {
  return inventoryItems.find((item) => item.id === id)
}

export function getProductHistory(itemId: string): ProductHistoryEvent[] {
  const events = historyByItemId[itemId] ?? sharedLifecycle.slice(0, 5)
  return [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

export function getInventorySummary(items: InventoryItem[]) {
  return {
    totalStock: items.reduce((sum, item) => sum + item.quantity, 0),
    backoffice: items
      .filter((item) => item.status === 'Backoffice')
      .reduce((sum, item) => sum + item.quantity, 0),
    onDisplay: items
      .filter((item) => item.status === 'Display')
      .reduce((sum, item) => sum + item.quantity, 0),
    reserved: items
      .filter((item) => item.status === 'Reserved')
      .reduce((sum, item) => sum + item.quantity, 0),
  }
}
