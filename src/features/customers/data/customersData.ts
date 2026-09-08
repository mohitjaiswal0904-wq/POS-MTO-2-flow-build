import type { Customer, CustomerAddress, CustomerProductItem, CustomerProfile } from '@/features/customers/types'

const productItem = (id: string): CustomerProductItem => ({
  id,
  name: 'Gold Pearl Earrings 1',
  metal: '9KT Rose Gold',
  stone: 'Lab Diamond',
  addedOn: '20 Apr',
  price: 95000,
})

export const customers: Customer[] = Array.from({ length: 12 }, (_, i) => ({
  id: `CUS-${String(i + 1).padStart(4, '0')}`,
  serialNo: i + 1,
  name: i === 0 ? 'Priya Sharma' : 'XYZ',
  phone: '+91 98765 43210',
  totalOrders: 12,
  totalSpent: '₹485K',
  lastVisit: '25 Apr',
}))

const dummyAddresses: CustomerAddress[] = [
  {
    id: 'addr-1',
    name: 'Priya Sharma — Home',
    fullAddress: '123, MG Road, Near Metro Station',
    pincode: '400001',
    city: 'Mumbai, Maharashtra',
    phone: '+91 98765 43210',
  },
  {
    id: 'addr-2',
    name: 'Priya Sharma — Office',
    fullAddress: 'Floor 7, Tech Park, Baner Road',
    pincode: '411045',
    city: 'Pune, Maharashtra',
    phone: '+91 98765 43211',
  },
  {
    id: 'addr-3',
    name: 'Rahul Sharma — Parents',
    fullAddress: '45, Ashok Nagar, Sector 12',
    pincode: '110001',
    city: 'New Delhi, Delhi',
    phone: '+91 98111 22334',
  },
  {
    id: 'addr-4',
    name: 'Priya Sharma — Weekend Home',
    fullAddress: 'Villa 8, Palm Grove Society, Whitefield',
    pincode: '560066',
    city: 'Bengaluru, Karnataka',
    phone: '+91 98765 43210',
  },
  {
    id: 'addr-5',
    name: 'Ananya Mehta — Friend',
    fullAddress: 'B-204, Lake View Apartments, Banjara Hills',
    pincode: '500034',
    city: 'Hyderabad, Telangana',
    phone: '+91 99000 11223',
  },
  {
    id: 'addr-6',
    name: 'Priya Sharma — Warehouse Pickup',
    fullAddress: 'Gate 3, Logistics Hub, Sarkhej-Gandhinagar Highway',
    pincode: '382210',
    city: 'Ahmedabad, Gujarat',
    phone: '+91 97250 44556',
  },
]

const priyaProfile: CustomerProfile = {
  id: 'CUS-0001',
  initials: 'PS',
  name: 'Priya Sharma',
  customerSince: 'Customer since April 2024',
  email: 'priya.sharma@email.com',
  phone: '+91 98765 43210',
  address: '123, MG Road, Near Metro Station, Mumbai, Maharashtra - 400001',
  addresses: dummyAddresses,
  selectedAddressId: dummyAddresses[0].id,
  birthday: '11/March/1996',
  birthdayOfferUnlocked: true,
  walletBalance: 5000,
  averageOrderValue: 40417,
  spendingByCategory: [
    { label: 'Gold', amountLabel: '₹285K', tone: 'gold' },
    { label: 'Silver', amountLabel: '₹45K', tone: 'silver' },
    { label: 'Demifine', amountLabel: '₹125K', tone: 'demifine' },
    { label: 'Pearl', amountLabel: '₹5K', tone: 'pearl' },
  ],
  onlineCart: [productItem('online-1'), productItem('online-2'), productItem('online-3')],
  storeCart: [productItem('store-1'), productItem('store-2'), productItem('store-3')],
  storeCartStoreName: 'Store Name',
  wishlist: [productItem('wish-1'), productItem('wish-2'), productItem('wish-3')],
  orderHistory: Array.from({ length: 4 }, () => ({
    id: 'ORD-2024-0042',
    dateLabel: '25 April 2024',
    status: 'completed' as const,
    itemCount: 2,
    total: 85000,
  })),
  giftCards: [
    {
      id: 'GIFT-5000-ABCD',
      code: 'XYZC-12DF-FGGD-G4645',
      status: 'active',
      expiresOn: '31 December 2024',
      balance: 5000,
    },
    {
      id: 'GIFT-5000-ABCD',
      code: 'XYZC-12DF-FGGD-G4645',
      status: 'expiring_soon',
      expiresOn: '31 December 2024',
      balance: 5000,
    },
    {
      id: 'GIFT-5000-ABCD',
      code: 'XYZC-12DF-FGGD-G4645',
      status: 'expired',
      expiresOn: '31 December 2024',
      balance: 5000,
    },
    {
      id: 'GIFT-5000-ABCD',
      code: 'XYZC-12DF-FGGD-G4645',
      status: 'used',
      expiresOn: '31 December 2024',
      balance: 5000,
    },
  ],
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((customer) => customer.id === id)
}

export function getCustomerProfile(id: string): CustomerProfile | undefined {
  const customer = getCustomerById(id)
  if (!customer) return undefined

  if (customer.id === priyaProfile.id) {
    return {
      ...priyaProfile,
      addresses: dummyAddresses.map((address) => ({ ...address })),
    }
  }

  const fallbackAddresses: CustomerAddress[] = [
    {
      id: `addr-${customer.id}-1`,
      name: `${customer.name} — Home`,
      fullAddress: '12, Park Street, Near City Mall',
      pincode: '700016',
      city: 'Kolkata, West Bengal',
      phone: customer.phone,
    },
    {
      id: `addr-${customer.id}-2`,
      name: `${customer.name} — Office`,
      fullAddress: '3rd Floor, Business Hub, Anna Salai',
      pincode: '600002',
      city: 'Chennai, Tamil Nadu',
      phone: customer.phone,
    },
    {
      id: `addr-${customer.id}-3`,
      name: `${customer.name} — Alternate`,
      fullAddress: 'Flat 501, Riverfront Residency, Gomti Nagar',
      pincode: '226010',
      city: 'Lucknow, Uttar Pradesh',
      phone: customer.phone,
    },
  ]

  return {
    ...priyaProfile,
    id: customer.id,
    name: customer.name,
    initials: customer.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    phone: customer.phone,
    addresses: fallbackAddresses,
    selectedAddressId: fallbackAddresses[0].id,
    address: `${fallbackAddresses[0].fullAddress}, ${fallbackAddresses[0].city} - ${fallbackAddresses[0].pincode}`,
  }
}
