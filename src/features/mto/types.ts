export type MtoOrderType = 'in_house' | 'fully_custom'

export type MtoOrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled'

export type MtoPaymentStatus = 'Pending' | 'Partial' | 'Paid'

export type ShipFromStore = 'Yes' | 'No'

export interface MtoItemImage {
  id: string
  name: string
  url: string
  source: 'upload' | 'catalog'
}

export interface MtoItem {
  id: string
  skuReference: string
  productCategory: string
  productName: string
  vendorName: string
  designType: string
  quantity: string
  buyingRemark: string
  engraving: string
  itemPrice: string
  customerGoldPriceLock: string
  vendorGoldPriceLock: string
  baseMetal: string
  karat: string
  metalWeight: string
  weightUnit: string
  diamondWeight: string
  diamondClarity: string
  diamondShape: string
  diamondCut: string
  numberOfDiamonds: string
  gemstoneDetails: string
  length: string
  width: string
  height: string
  size: string
  region: string
  colour: string
  requestedSize: string
  requestedColour: string
  receivedAtStore: string
  employeeName: string
  employeeId: string
  /** Product reference images linked to this item only */
  images: MtoItemImage[]
  /** Per-product payment */
  paymentMode: 'full' | 'partial'
  advancePayment: string
}

export interface MtoCustomerInfo {
  customerName: string
  customerPhone: string
  customerAddress: string
  customerEmail: string
  orderNumber: string
  invoiceNumber: string
  committedDeliveryDate: string
  shipFromStore: ShipFromStore
}

export interface MtoPaymentInfo {
  totalAmount: number
  advancePayment: number
  remainingAmount: number
  paymentStatus: MtoPaymentStatus
  paymentMethod: string
}

export interface MtoTimelineEvent {
  id: string
  title: string
  dateLabel: string
  completed: boolean
}

export interface MtoOrder {
  id: string
  orderType: MtoOrderType
  status: MtoOrderStatus
  createdAt: string
  dateLabel: string
  storeName: string
  storeType: string
  storeLocation: string
  items: MtoItem[]
  customer: MtoCustomerInfo
  payment: MtoPaymentInfo
  designNotes?: string
  timeline: MtoTimelineEvent[]
  subtotal: number
  tax: number
  discount: number
  shipping: number
}

export const MTO_JOURNEY_OPTIONS: Array<{
  id: MtoOrderType
  title: string
  description: string
}> = [
  {
    id: 'in_house',
    title: 'In-House Design Customization',
    description:
      'Search an existing catalog SKU and customise metal, diamonds, size, colour, and more.',
  },
  {
    id: 'fully_custom',
    title: 'Fully Custom Design',
    description:
      'Fill specifications and attach reference images for an entirely new jewelry piece.',
  },
]

export function createEmptyMtoItem(): MtoItem {
  return {
    id: `item-${Math.random().toString(36).slice(2, 9)}`,
    skuReference: '',
    productCategory: '',
    productName: '',
    vendorName: '',
    designType: '',
    quantity: '1',
    buyingRemark: '',
    engraving: '',
    itemPrice: '0',
    customerGoldPriceLock: '0',
    vendorGoldPriceLock: '0',
    baseMetal: '',
    karat: '',
    metalWeight: '0',
    weightUnit: 'Grams',
    diamondWeight: '',
    diamondClarity: '',
    diamondShape: '',
    diamondCut: '',
    numberOfDiamonds: '0',
    gemstoneDetails: '',
    length: '',
    width: '',
    height: '',
    size: '',
    region: '',
    colour: '',
    requestedSize: '',
    requestedColour: '',
    receivedAtStore: '',
    employeeName: '',
    employeeId: '',
    images: [],
    paymentMode: 'full',
    advancePayment: '0',
  }
}

export function createEmptyCustomer(): MtoCustomerInfo {
  return {
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerEmail: '',
    orderNumber: '',
    invoiceNumber: '',
    committedDeliveryDate: '',
    shipFromStore: 'No',
  }
}

export function mtoTypeLabel(type: MtoOrderType): string {
  return MTO_JOURNEY_OPTIONS.find((option) => option.id === type)?.title ?? type
}
