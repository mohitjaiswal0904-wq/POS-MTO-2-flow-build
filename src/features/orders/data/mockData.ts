import type { CustomerOrder, Order } from '@/features/orders/types'

export const RETURN_REASONS = [
  'Changed mind',
  'Defective product',
  'Wrong size',
  'Quality issue',
  'Other',
] as const

export const RETURN_POLICY = [
  'Returns accepted within 2 days of purchase',
  'Product must be in original condition with tags',
  'Refund will be processed within 7-10 business days',
]

export const order: Order = {
  id: 'ORD-2024-0042',
  date: '25 April 2024',
  status: 'completed',
  customer: {
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya.sharma@email.com',
    address: '123, MG Road, Bangalore, Karnataka - 560001',
  },
  store: {
    type: 'Physical Store',
    name: 'Phoenix Mall Store',
    location: 'Phoenix Marketcity, Bangalore',
  },
  products: [
    {
      id: 'prod-1',
      sku: 'GPE-9KT-001',
      name: 'Gold Pearl Earrings 1',
      category: 'Gold Jewelry',
      unitPrice: 25000,
      displayPrice: '₹36,727',
      originalPrice: '₹36,727',
      metal: '9KT Rose Gold',
      stone: 'Lab Diamond',
      quantity: 1,
      giftWrap: true,
      giftWrapPrice: 50,
    },
    {
      id: 'prod-2',
      sku: 'GCN-22K-001',
      name: 'Gold Chain Necklace',
      category: 'Gold Jewelry',
      unitPrice: 25000,
      displayPrice: '₹36,727',
      originalPrice: '₹36,727',
      metal: '9KT Rose Gold',
      stone: 'Lab Diamond',
      quantity: 2,
      giftWrap: true,
      giftWrapPrice: 50,
    },
  ],
  billing: {
    subtotal: 120000,
    tax: 3600,
    discount: 2000,
    shipping: 3400,
    total: 125000,
    paymentMethod: 'Card',
  },
}

export const customerOrders: CustomerOrder[] = Array.from({ length: 12 }, (_, i) => ({
  serialNo: i + 1,
  orderId: 'ORD-2024-0042',
  name: 'Diamond Ring 22K',
  phone: '+91 98765 43210',
  totalOrders: 12,
  totalSpent: '₹485K',
  lastVisit: '25 Apr',
}))

