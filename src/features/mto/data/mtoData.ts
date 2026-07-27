import type { MtoItem, MtoOrder, MtoOrderStatus } from '@/features/mto/types'
import { createEmptyMtoItem } from '@/features/mto/types'

function item(partial: Partial<MtoItem> & { productName: string; itemPrice: string }): MtoItem {
  return {
    ...createEmptyMtoItem(),
    ...partial,
  }
}

export const seedMtoOrders: MtoOrder[] = [
  {
    id: 'PMXYZ123455',
    orderType: 'fully_custom',
    status: 'Completed',
    createdAt: '2024-04-25T10:30:00',
    dateLabel: '25 April 2024',
    storeName: 'Phoenix Mall Store',
    storeType: 'Physical Store',
    storeLocation: 'Phoenix Marketcity, Bangalore',
    items: [
      item({
        productName: 'Gold Pearl Earrings 1',
        productCategory: 'Earrings',
        karat: '9KT',
        baseMetal: 'Rose Gold',
        size: '7',
        quantity: '1',
        itemPrice: '25000',
      }),
      item({
        productName: 'Diamond Ring Custom',
        productCategory: 'Rings',
        karat: '22K',
        baseMetal: 'Yellow Gold',
        size: '12',
        quantity: '1',
        itemPrice: '95000',
      }),
    ],
    customer: {
      customerName: 'Priya Sharma',
      customerPhone: '+91 98765 43210',
      customerAddress: '123, MG Road, Bangalore, Karnataka - 560001',
      customerEmail: 'priya.sharma@email.com',
      orderNumber: 'PMXYZ123455',
      invoiceNumber: 'INV-2024-8841',
      committedDeliveryDate: '2024-05-15',
      shipFromStore: 'Yes',
    },
    payment: {
      totalAmount: 125000,
      advancePayment: 125000,
      remainingAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Card',
    },
    timeline: [
      { id: 't1', title: 'Request Submitted', dateLabel: '25/04/2024, 10:30 AM', completed: true },
      { id: 't2', title: 'Request Accepted', dateLabel: '25/04/2024, 11:15 AM', completed: true },
      { id: 't3', title: 'In Production', dateLabel: '28/04/2024, 09:00 AM', completed: true },
      { id: 't4', title: 'Order Completed', dateLabel: '12/05/2024, 04:20 PM', completed: true },
    ],
    subtotal: 120000,
    tax: 3600,
    discount: 2000,
    shipping: 3400,
  },
  {
    id: 'PMXYZ123456',
    orderType: 'in_house',
    status: 'Processing',
    createdAt: '2024-04-26T14:10:00',
    dateLabel: '26 April 2024',
    storeName: 'Phoenix Mall Store',
    storeType: 'Physical Store',
    storeLocation: 'Phoenix Marketcity, Bangalore',
    items: [
      item({
        productName: 'Classic Band Ring',
        skuReference: 'SKU0001',
        productCategory: 'Rings',
        size: '10',
        requestedSize: '12',
        colour: 'Yellow Gold',
        requestedColour: 'Rose Gold',
        quantity: '1',
        itemPrice: '45000',
      }),
    ],
    customer: {
      customerName: 'Rahul Mehta',
      customerPhone: '+91 99887 66554',
      customerAddress: '45, Indiranagar, Bangalore',
      customerEmail: 'rahul.mehta@email.com',
      orderNumber: 'PMXYZ123456',
      invoiceNumber: 'INV-2024-8842',
      committedDeliveryDate: '2024-05-10',
      shipFromStore: 'No',
    },
    payment: {
      totalAmount: 45000,
      advancePayment: 15000,
      remainingAmount: 30000,
      paymentStatus: 'Partial',
      paymentMethod: 'UPI',
    },
    timeline: [
      { id: 't1', title: 'Request Submitted', dateLabel: '26/04/2024, 02:10 PM', completed: true },
      { id: 't2', title: 'Request Accepted', dateLabel: '26/04/2024, 03:00 PM', completed: true },
      { id: 't3', title: 'In Production', dateLabel: '27/04/2024, 10:00 AM', completed: true },
      { id: 't4', title: 'Order Completed', dateLabel: '—', completed: false },
    ],
    subtotal: 45000,
    tax: 0,
    discount: 0,
    shipping: 0,
  },
  {
    id: 'PMXYZ123457',
    orderType: 'fully_custom',
    status: 'Pending',
    createdAt: '2024-04-28T09:45:00',
    dateLabel: '28 April 2024',
    storeName: 'Koramangala Store',
    storeType: 'Physical Store',
    storeLocation: 'Koramangala, Bangalore',
    items: [
      item({
        productName: 'Custom Necklace Set',
        productCategory: 'Necklace',
        karat: '22K',
        baseMetal: 'Yellow Gold',
        quantity: '1',
        itemPrice: '185000',
      }),
      item({
        productName: 'Matching Bangle',
        productCategory: 'Bangles',
        karat: '22K',
        baseMetal: 'Yellow Gold',
        quantity: '2',
        itemPrice: '90000',
      }),
    ],
    customer: {
      customerName: 'Ananya Iyer',
      customerPhone: '+91 98123 45000',
      customerAddress: '12, Residency Road, Bangalore',
      customerEmail: 'ananya.iyer@email.com',
      orderNumber: 'PMXYZ123457',
      invoiceNumber: 'INV-2024-8843',
      committedDeliveryDate: '2024-06-01',
      shipFromStore: 'Yes',
    },
    payment: {
      totalAmount: 275000,
      advancePayment: 0,
      remainingAmount: 275000,
      paymentStatus: 'Pending',
      paymentMethod: '—',
    },
    timeline: [
      { id: 't1', title: 'Request Submitted', dateLabel: '28/04/2024, 09:45 AM', completed: true },
      { id: 't2', title: 'Request Accepted', dateLabel: '—', completed: false },
      { id: 't3', title: 'In Production', dateLabel: '—', completed: false },
      { id: 't4', title: 'Order Completed', dateLabel: '—', completed: false },
    ],
    subtotal: 275000,
    tax: 0,
    discount: 0,
    shipping: 0,
  },
]

export function formatMtoTotal(amount: number): string {
  if (amount >= 100000) {
    const lakhs = amount / 100000
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`.replace('.0L', 'L')
  }
  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}K`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export function statusBadgeClass(status: MtoOrderStatus): string {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700'
    case 'Processing':
      return 'bg-blue-100 text-blue-700'
    case 'Pending':
      return 'bg-amber-100 text-amber-700'
    case 'Cancelled':
      return 'bg-red-100 text-red-700'
  }
}
