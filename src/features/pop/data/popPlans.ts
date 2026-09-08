export type PopPlanStatus = 'ACTIVE' | 'COMPLETED' | 'DEFAULTED'

export interface PopInstalmentRecord {
  month: number
  paidOn: string
  amount: number
  mode: 'Cash' | 'UPI' | 'Card'
  receiptNo: string
}

export interface PopFreeGift {
  id: string
  name: string
  sku: string
  barcode: string
  /** Catalogue MRP — billed as ₹0 free gift. */
  mrp: number
  issuedOn: string
  planId?: string
  verifiedByScan: true
}

export interface PopCustomerProfile {
  customerId: string
  name: string
  phone: string
  email: string
  store: string
  address: string
  customerSince: string
  kycStatus: 'Verified' | 'Pending'
  panLast4?: string
  /** Store associate who enrolled / onboarded this customer. */
  onboardedBy: string
  freeGifts?: PopFreeGift[]
}

export const popCustomerProfiles: PopCustomerProfile[] = [
  {
    customerId: 'CUS-0001',
    name: 'Priya Sharma',
    phone: '9876543210',
    email: 'priya.sharma@email.com',
    store: 'Palmonas Kharadi',
    address: '123, MG Road, Near Metro Station, Mumbai, Maharashtra - 400001',
    customerSince: 'April 2024',
    kycStatus: 'Verified',
    panLast4: '4421',
    onboardedBy: 'Meera Iyer',
  },
  {
    customerId: 'CUS-0004',
    name: 'Rahul Mehta',
    phone: '9811122334',
    email: 'rahul.mehta@email.com',
    store: 'Palmonas Baner',
    address: '45, Ashok Nagar, Sector 12, New Delhi, Delhi - 110001',
    customerSince: 'January 2025',
    kycStatus: 'Verified',
    panLast4: '8803',
    onboardedBy: 'Arjun Desai',
  },
  {
    customerId: 'CUS-0018',
    name: 'Aarav Kapoor',
    phone: '8090835885',
    email: 'aarav.kapoor@email.com',
    store: 'Palmonas Koregaon Park',
    address: 'Office 501, Verdant 84, Koregaon Park Annexe, Pune, Maharashtra - 411036',
    customerSince: 'May 2026',
    kycStatus: 'Pending',
    onboardedBy: 'Riya Nair',
    freeGifts: [
      {
        id: 'gift-aarav-1',
        name: 'Gold Stud Earrings',
        sku: 'SKU0005',
        barcode: 'BC-SKU0005-0001',
        mrp: 15400,
        issuedOn: '08 Jan 2026',
        planId: 'POP2026002602',
        verifiedByScan: true,
      },
    ],
  },
  {
    customerId: 'CUS-0008',
    name: 'Ananya Joshi',
    phone: '9900011223',
    email: 'ananya.joshi@email.com',
    store: 'Palmonas Viman Nagar',
    address: 'B-204, Lake View Apartments, Banjara Hills, Hyderabad - 500034',
    customerSince: 'February 2026',
    kycStatus: 'Pending',
    onboardedBy: 'Kabir Shah',
  },
  {
    customerId: 'CUS-0021',
    name: 'Neha Kapoor',
    phone: '9822011456',
    email: 'neha.kapoor@email.com',
    store: 'Palmonas Kharadi',
    address: 'Flat 12, Ivy Estate, Kharadi, Pune, Maharashtra - 411014',
    customerSince: 'August 2026',
    kycStatus: 'Verified',
    panLast4: '2190',
    onboardedBy: 'Meera Iyer',
  },
  {
    customerId: 'CUS-0022',
    name: 'Vikram Singh',
    phone: '9765432109',
    email: 'vikram.singh@email.com',
    store: 'Palmonas Baner',
    address: '22, Green Park, Baner, Pune, Maharashtra - 411045',
    customerSince: 'December 2025',
    kycStatus: 'Verified',
    panLast4: '7712',
    onboardedBy: 'Arjun Desai',
  },
  {
    customerId: 'CUS-0025',
    name: 'Sana Ali',
    phone: '9988776655',
    email: 'sana.ali@email.com',
    store: 'Palmonas Viman Nagar',
    address: 'C-18, Skyline Towers, Viman Nagar, Pune, Maharashtra - 411014',
    customerSince: 'November 2025',
    kycStatus: 'Pending',
    onboardedBy: 'Kabir Shah',
  },
  {
    customerId: 'CUS-0012',
    name: 'Karan Patel',
    phone: '9123456780',
    email: 'karan.patel@email.com',
    store: 'Palmonas Koregaon Park',
    address: '11, Lane 7, Koregaon Park, Pune, Maharashtra - 411001',
    customerSince: 'March 2026',
    kycStatus: 'Verified',
    panLast4: '3344',
    onboardedBy: 'Riya Nair',
  },
]

export interface PopPlan {
  planId: string
  customerId: string
  customerName: string
  phone: string
  monthlyAmount: number
  monthsPaid: number
  enrollmentDate: string
  nextDueDate: string
  status: PopPlanStatus
  panLast4?: string
  redeemedOn?: string
  history: PopInstalmentRecord[]
}

const extraPlans: PopPlan[] = []

export const popPlans: PopPlan[] = [
  {
    planId: 'POP2026001842',
    customerId: 'CUS-0001',
    customerName: 'Priya Sharma',
    phone: '9876543210',
    monthlyAmount: 3000,
    monthsPaid: 2,
    enrollmentDate: '27 Jun 2026',
    nextDueDate: '27 Aug 2026',
    status: 'ACTIVE',
    panLast4: '4421',
    history: [
      {
        month: 1,
        paidOn: '27 Jun 2026',
        amount: 3000,
        mode: 'UPI',
        receiptNo: 'RCPT-1842-01',
      },
      {
        month: 2,
        paidOn: '27 Jul 2026',
        amount: 3000,
        mode: 'Cash',
        receiptNo: 'RCPT-1842-02',
      },
    ],
  },
  {
    planId: 'POP2026001904',
    customerId: 'CUS-0001',
    customerName: 'Priya Sharma',
    phone: '9876543210',
    monthlyAmount: 5000,
    monthsPaid: 1,
    enrollmentDate: '12 Jul 2026',
    nextDueDate: '12 Aug 2026',
    status: 'ACTIVE',
    panLast4: '4421',
    history: [
      {
        month: 1,
        paidOn: '12 Jul 2026',
        amount: 5000,
        mode: 'Card',
        receiptNo: 'RCPT-1904-01',
      },
    ],
  },
  {
    planId: 'POP2026001511',
    customerId: 'CUS-0004',
    customerName: 'Rahul Mehta',
    phone: '9811122334',
    monthlyAmount: 10000,
    monthsPaid: 4,
    enrollmentDate: '20 Apr 2026',
    nextDueDate: '20 Aug 2026',
    status: 'ACTIVE',
    panLast4: '8803',
    history: [
      { month: 1, paidOn: '20 Apr 2026', amount: 10000, mode: 'UPI', receiptNo: 'RCPT-1511-01' },
      { month: 2, paidOn: '20 May 2026', amount: 10000, mode: 'UPI', receiptNo: 'RCPT-1511-02' },
      { month: 3, paidOn: '20 Jun 2026', amount: 10000, mode: 'Cash', receiptNo: 'RCPT-1511-03' },
      { month: 4, paidOn: '20 Jul 2026', amount: 10000, mode: 'Card', receiptNo: 'RCPT-1511-04' },
    ],
  },
  {
    planId: 'POP2026002218',
    customerId: 'CUS-0018',
    customerName: 'Aarav Kapoor',
    phone: '8090835885',
    monthlyAmount: 5000,
    monthsPaid: 3,
    enrollmentDate: '27 May 2026',
    nextDueDate: '27 Aug 2026',
    status: 'ACTIVE',
    panLast4: '5885',
    history: [
      { month: 1, paidOn: '27 May 2026', amount: 5000, mode: 'UPI', receiptNo: 'RCPT-2218-01' },
      { month: 2, paidOn: '27 Jun 2026', amount: 5000, mode: 'Cash', receiptNo: 'RCPT-2218-02' },
      { month: 3, paidOn: '27 Jul 2026', amount: 5000, mode: 'Card', receiptNo: 'RCPT-2218-03' },
    ],
  },
  {
    planId: 'POP2026002301',
    customerId: 'CUS-0018',
    customerName: 'Aarav Kapoor',
    phone: '8090835885',
    monthlyAmount: 2000,
    monthsPaid: 1,
    enrollmentDate: '10 Aug 2026',
    nextDueDate: '10 Sep 2026',
    status: 'ACTIVE',
    panLast4: '5885',
    history: [
      { month: 1, paidOn: '10 Aug 2026', amount: 2000, mode: 'UPI', receiptNo: 'RCPT-2301-01' },
    ],
  },
  {
    planId: 'POP2026002410',
    customerId: 'CUS-0018',
    customerName: 'Aarav Kapoor',
    phone: '8090835885',
    monthlyAmount: 1000,
    monthsPaid: 4,
    enrollmentDate: '15 Mar 2026',
    nextDueDate: '15 Aug 2026',
    status: 'ACTIVE',
    panLast4: '5885',
    history: [
      { month: 1, paidOn: '15 Mar 2026', amount: 1000, mode: 'Cash', receiptNo: 'RCPT-2410-01' },
      { month: 2, paidOn: '15 Apr 2026', amount: 1000, mode: 'UPI', receiptNo: 'RCPT-2410-02' },
      { month: 3, paidOn: '15 May 2026', amount: 1000, mode: 'UPI', receiptNo: 'RCPT-2410-03' },
      { month: 4, paidOn: '15 Jun 2026', amount: 1000, mode: 'Card', receiptNo: 'RCPT-2410-04' },
    ],
  },
  {
    planId: 'POP2026002555',
    customerId: 'CUS-0018',
    customerName: 'Aarav Kapoor',
    phone: '8090835885',
    monthlyAmount: 8000,
    monthsPaid: 2,
    enrollmentDate: '01 Jun 2026',
    nextDueDate: '01 Aug 2026',
    status: 'ACTIVE',
    panLast4: '5885',
    history: [
      { month: 1, paidOn: '01 Jun 2026', amount: 8000, mode: 'Card', receiptNo: 'RCPT-2555-01' },
      { month: 2, paidOn: '01 Jul 2026', amount: 8000, mode: 'UPI', receiptNo: 'RCPT-2555-02' },
    ],
  },
  {
    planId: 'POP2026002602',
    customerId: 'CUS-0018',
    customerName: 'Aarav Kapoor',
    phone: '8090835885',
    monthlyAmount: 3000,
    monthsPaid: 5,
    enrollmentDate: '08 Jan 2026',
    nextDueDate: '—',
    status: 'COMPLETED',
    panLast4: '5885',
    history: [
      { month: 1, paidOn: '08 Jan 2026', amount: 3000, mode: 'UPI', receiptNo: 'RCPT-2602-01' },
      { month: 2, paidOn: '08 Feb 2026', amount: 3000, mode: 'UPI', receiptNo: 'RCPT-2602-02' },
      { month: 3, paidOn: '08 Mar 2026', amount: 3000, mode: 'Cash', receiptNo: 'RCPT-2602-03' },
      { month: 4, paidOn: '08 Apr 2026', amount: 3000, mode: 'Card', receiptNo: 'RCPT-2602-04' },
      { month: 5, paidOn: '08 May 2026', amount: 3000, mode: 'UPI', receiptNo: 'RCPT-2602-05' },
    ],
  },
  {
    planId: 'POP2026002719',
    customerId: 'CUS-0018',
    customerName: 'Aarav Kapoor',
    phone: '8090835885',
    monthlyAmount: 4000,
    monthsPaid: 0,
    enrollmentDate: '20 Aug 2026',
    nextDueDate: '20 Aug 2026',
    status: 'ACTIVE',
    panLast4: '5885',
    history: [],
  },
  {
    planId: 'POP2026000888',
    customerId: 'CUS-0008',
    customerName: 'Ananya Joshi',
    phone: '9900011223',
    monthlyAmount: 1000,
    monthsPaid: 5,
    enrollmentDate: '02 Feb 2026',
    nextDueDate: '—',
    status: 'COMPLETED',
    redeemedOn: '12 Jul 2026',
    history: [
      { month: 1, paidOn: '02 Feb 2026', amount: 1000, mode: 'UPI', receiptNo: 'RCPT-0888-01' },
      { month: 2, paidOn: '02 Mar 2026', amount: 1000, mode: 'UPI', receiptNo: 'RCPT-0888-02' },
      { month: 3, paidOn: '02 Apr 2026', amount: 1000, mode: 'Cash', receiptNo: 'RCPT-0888-03' },
      { month: 4, paidOn: '02 May 2026', amount: 1000, mode: 'Card', receiptNo: 'RCPT-0888-04' },
      { month: 5, paidOn: '02 Jun 2026', amount: 1000, mode: 'UPI', receiptNo: 'RCPT-0888-05' },
    ],
  },
  {
    planId: 'POP2026003104',
    customerId: 'CUS-0021',
    customerName: 'Neha Kapoor',
    phone: '9822011456',
    monthlyAmount: 3000,
    monthsPaid: 1,
    enrollmentDate: '18 Aug 2026',
    nextDueDate: '18 Sep 2026',
    status: 'ACTIVE',
    panLast4: '2190',
    history: [
      { month: 1, paidOn: '18 Aug 2026', amount: 3000, mode: 'UPI', receiptNo: 'RCPT-3104-01' },
    ],
  },
  {
    planId: 'POP2026001190',
    customerId: 'CUS-0022',
    customerName: 'Vikram Singh',
    phone: '9765432109',
    monthlyAmount: 5000,
    monthsPaid: 5,
    enrollmentDate: '10 Jan 2026',
    nextDueDate: '—',
    status: 'COMPLETED',
    panLast4: '7712',
    history: [
      { month: 1, paidOn: '10 Jan 2026', amount: 5000, mode: 'Card', receiptNo: 'RCPT-1190-01' },
      { month: 2, paidOn: '10 Feb 2026', amount: 5000, mode: 'UPI', receiptNo: 'RCPT-1190-02' },
      { month: 3, paidOn: '10 Mar 2026', amount: 5000, mode: 'UPI', receiptNo: 'RCPT-1190-03' },
      { month: 4, paidOn: '10 Apr 2026', amount: 5000, mode: 'Cash', receiptNo: 'RCPT-1190-04' },
      { month: 5, paidOn: '10 May 2026', amount: 5000, mode: 'UPI', receiptNo: 'RCPT-1190-05' },
    ],
  },
  {
    planId: 'POP2026000744',
    customerId: 'CUS-0025',
    customerName: 'Sana Ali',
    phone: '9988776655',
    monthlyAmount: 2000,
    monthsPaid: 2,
    enrollmentDate: '15 Nov 2025',
    nextDueDate: '15 Jan 2026',
    status: 'DEFAULTED',
    history: [
      { month: 1, paidOn: '15 Nov 2025', amount: 2000, mode: 'UPI', receiptNo: 'RCPT-0744-01' },
      { month: 2, paidOn: '15 Dec 2025', amount: 2000, mode: 'Cash', receiptNo: 'RCPT-0744-02' },
    ],
  },
  {
    planId: 'POP2026002055',
    customerId: 'CUS-0012',
    customerName: 'Karan Patel',
    phone: '9123456780',
    monthlyAmount: 10000,
    monthsPaid: 3,
    enrollmentDate: '22 Mar 2026',
    nextDueDate: '22 Aug 2026',
    status: 'ACTIVE',
    panLast4: '3344',
    history: [
      { month: 1, paidOn: '22 Mar 2026', amount: 10000, mode: 'Card', receiptNo: 'RCPT-2055-01' },
      { month: 2, paidOn: '22 Apr 2026', amount: 10000, mode: 'UPI', receiptNo: 'RCPT-2055-02' },
      { month: 3, paidOn: '22 May 2026', amount: 10000, mode: 'UPI', receiptNo: 'RCPT-2055-03' },
    ],
  },
  {
    planId: 'POP2026003188',
    customerId: 'CUS-0001',
    customerName: 'Priya Sharma',
    phone: '9876543210',
    monthlyAmount: 2000,
    monthsPaid: 1,
    enrollmentDate: '22 Aug 2026',
    nextDueDate: '22 Sep 2026',
    status: 'ACTIVE',
    panLast4: '4421',
    history: [
      { month: 1, paidOn: '22 Aug 2026', amount: 2000, mode: 'Cash', receiptNo: 'RCPT-3188-01' },
    ],
  },
]

export function popGiftCardCode(planId: string) {
  return `POP-${planId.slice(-6)}`
}

export function popGiftValue(monthlyAmount: number) {
  return monthlyAmount * 6
}

export function popStoreFor(plan: PopPlan) {
  return (
    popCustomerProfiles.find(
      (profile) => profile.customerId === plan.customerId || profile.phone === plan.phone,
    )?.store ?? 'Unassigned'
  )
}

export const CURRENT_POP_STORE = 'Palmonas Koregaon Park'

export function getPopStores() {
  return [...new Set(popCustomerProfiles.map((profile) => profile.store))].sort((a, b) =>
    a.localeCompare(b),
  )
}

export function addPopPlan(plan: PopPlan) {
  extraPlans.unshift(plan)
}

const extraProfiles: PopCustomerProfile[] = []

export function upsertPopCustomerProfile(profile: PopCustomerProfile) {
  const digits = profile.phone.replace(/\D/g, '')
  const index = extraProfiles.findIndex((item) => item.phone === digits)
  const next = { ...profile, phone: digits }
  if (index >= 0) extraProfiles[index] = next
  else extraProfiles.unshift(next)
}

export function addFreeGiftToProfile(phone: string, gift: PopFreeGift): boolean {
  const digits = phone.replace(/\D/g, '')
  const existing = getAllPopCustomerProfiles().find((profile) => profile.phone === digits)
  if (!existing) return false
  upsertPopCustomerProfile({
    ...existing,
    freeGifts: [...(existing.freeGifts ?? []), gift],
  })
  return true
}

export function getAllPopCustomerProfiles(): PopCustomerProfile[] {
  const overrides = new Map(extraProfiles.map((profile) => [profile.phone, profile]))
  const seeded = popCustomerProfiles.map((profile) => overrides.get(profile.phone) ?? profile)
  const created = extraProfiles.filter(
    (profile) => !popCustomerProfiles.some((seed) => seed.phone === profile.phone),
  )
  return [...created, ...seeded]
}

export function getAllPopPlans(): PopPlan[] {
  const overrides = new Map(extraPlans.map((plan) => [plan.planId, plan]))
  const seeded = popPlans.map((plan) => overrides.get(plan.planId) ?? plan)
  const created = extraPlans.filter(
    (plan) => !popPlans.some((seed) => seed.planId === plan.planId),
  )
  return [...created, ...seeded]
}

export function findPopPlans(rawQuery: string): PopPlan[] {
  const query = rawQuery.trim().toLowerCase()
  const digits = rawQuery.replace(/\D/g, '')
  if (!query && digits.length < 4) return []

  return getAllPopPlans().filter((plan) => {
    const phone = plan.phone.replace(/\D/g, '')
    const haystack = `${plan.planId} ${plan.customerId} ${plan.customerName}`.toLowerCase()
    if (query && haystack.includes(query.replace(/\s+/g, ' '))) return true
    if (digits.length >= 4 && phone.includes(digits)) return true
    if (digits.length >= 4 && plan.customerId.replace(/\D/g, '').includes(digits)) return true
    return false
  })
}

export function getPlansByPhone(rawPhone: string): PopPlan[] {
  const digits = rawPhone.replace(/\D/g, '')
  if (digits.length < 10) return []
  return getAllPopPlans().filter((plan) => plan.phone.replace(/\D/g, '') === digits)
}

export function getPopCustomerByPhone(rawPhone: string): {
  profile: PopCustomerProfile
  plans: PopPlan[]
} | undefined {
  const digits = rawPhone.replace(/\D/g, '')
  if (digits.length < 10) return undefined

  const plans = getPlansByPhone(digits)
  const stored = getAllPopCustomerProfiles().find((profile) => profile.phone === digits)
  if (!stored && plans.length === 0) return undefined

  const first = plans[0]
  const profile: PopCustomerProfile =
    stored ??
    {
      customerId: first?.customerId ?? '—',
      name: first?.customerName ?? 'Unknown customer',
      phone: digits,
      email: '—',
      store: '—',
      address: '—',
      customerSince: first?.enrollmentDate ?? '—',
      kycStatus: 'Pending',
      panLast4: first?.panLast4,
      onboardedBy: '—',
    }

  return { profile, plans }
}

export function recordPopPayment(
  planId: string,
  payment: PopInstalmentRecord,
): PopPlan | undefined {
  const all = getAllPopPlans()
  const plan = all.find((item) => item.planId === planId)
  if (!plan || plan.status !== 'ACTIVE' || plan.monthsPaid >= 5) return plan

  const updated: PopPlan = {
    ...plan,
    monthsPaid: plan.monthsPaid + 1,
    history: [...plan.history, payment],
    status: plan.monthsPaid + 1 >= 5 ? 'COMPLETED' : 'ACTIVE',
    nextDueDate: plan.monthsPaid + 1 >= 5 ? '—' : nextMonthLabel(plan.nextDueDate),
  }

  const extraIndex = extraPlans.findIndex((item) => item.planId === planId)
  if (extraIndex >= 0) extraPlans[extraIndex] = updated
  else extraPlans.unshift(updated)

  return updated
}

export function markPopRedeemed(planId: string): PopPlan | undefined {
  const all = getAllPopPlans()
  const plan = all.find((item) => item.planId === planId)
  if (!plan || plan.monthsPaid < 5) return plan
  if (plan.redeemedOn) return plan

  const updated: PopPlan = {
    ...plan,
    status: 'COMPLETED',
    redeemedOn: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }

  const extraIndex = extraPlans.findIndex((item) => item.planId === planId)
  if (extraIndex >= 0) extraPlans[extraIndex] = updated
  else extraPlans.unshift(updated)

  return updated
}

function nextMonthLabel(current: string) {
  const parsed = Date.parse(current)
  if (Number.isNaN(parsed)) return current
  const date = new Date(parsed)
  date.setMonth(date.getMonth() + 1)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
