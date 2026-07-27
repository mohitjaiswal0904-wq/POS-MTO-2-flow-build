export type RefundMethod = 'original' | 'bank_transfer'

export interface BankAccount {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
}

export type ReturnReason =
  | 'Changed mind'
  | 'Defective product'
  | 'Wrong size'
  | 'Quality issue'
  | 'Other'

export interface OrderProduct {
  id: string
  sku: string
  name: string
  category: string
  unitPrice: number
  displayPrice: string
  originalPrice: string
  metal: string
  stone: string
  quantity: number
  giftWrap: boolean
  giftWrapPrice: number
}

/** A single physically identifiable product unit in an order */
export interface ProductUnit {
  unitId: string
  unitIdentity: string
  productId: string
  sku: string
  name: string
  category: string
  unitPrice: number
  displayPrice: string
  originalPrice: string
  metal: string
  stone: string
  giftWrap: boolean
  giftWrapPrice: number
  unitIndex: number
  totalInLine: number
}

export interface Order {
  id: string
  date: string
  status: 'completed' | 'pending' | 'cancelled'
  customer: {
    name: string
    phone: string
    email: string
    address: string
  }
  store: {
    type: string
    name: string
    location: string
  }
  products: OrderProduct[]
  billing: {
    subtotal: number
    tax: number
    discount: number
    shipping: number
    total: number
    paymentMethod: string
  }
}

/** One return line = one individual product unit */
export interface ReturnItem {
  unitId: string
  unitIdentity: string
  productId: string
  sku: string
  name: string
  category: string
  unitPrice: number
  refundAmount: number
  reason: ReturnReason
  comment: string
}

export interface ReturnRequest {
  id: string
  orderId: string
  requestedOn: string
  status: 'In Progress' | 'Completed' | 'Rejected'
  pickupStatus: string
  refundAmount: number
  comment: string
  tracking: string
  items: ReturnItem[]
  refundMethod: RefundMethod
  originalPaymentMethod?: string
  bankAccount?: BankAccount
}

export interface CustomerOrder {
  serialNo: number
  orderId: string
  name: string
  phone: string
  totalOrders: number
  totalSpent: string
  lastVisit: string
}
