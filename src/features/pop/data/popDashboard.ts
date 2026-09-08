import {
  getAllPopPlans,
  popCustomerProfiles,
  popGiftCardCode,
  popGiftValue,
  popStoreFor,
  type PopCustomerProfile,
  type PopPlan,
} from '@/features/pop/data/popPlans'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export interface PopNamedCount {
  label: string
  count: number
  amount: number
}

export interface PopReadyPlan {
  plan: PopPlan
  store: string
  giftCode: string
  giftValue: number
}

export interface PopPaymentLog {
  receiptNo: string
  paidOn: string
  month: number
  amount: number
  mode: 'Cash' | 'UPI' | 'Card'
  planId: string
  customerId: string
  customerName: string
  phone: string
}

export type PopActionKind = 'overdue' | 'due_today' | 'due_soon' | 'near_complete'

export interface PopActionItem {
  plan: PopPlan
  kind: PopActionKind
  daysOverdue: number
  daysUntilDue: number
  nextMonth: number
  dueLabel: string
}

export interface PopDashboardSnapshot {
  asOfLabel: string
  customers: number
  plans: number
  active: number
  completed: number
  readyToRedeem: number
  defaulted: number
  enrollmentsThisMonth: number
  newCustomersThisMonth: number
  collectedLifetime: number
  collectedThisMonth: number
  giftLiability: number
  outstandingBook: number
  overdueCount: number
  dueTodayCount: number
  dueSoonCount: number
  nearCompleteCount: number
  actionQueue: PopActionItem[]
  readyPlans: PopReadyPlan[]
  nearCompletePlans: PopPlan[]
  newCustomers: Array<{
    profile: PopCustomerProfile
    firstEnrollment: string
    plans: number
  }>
  recentEnrollments: PopPlan[]
  paymentLogs: PopPaymentLog[]
  byStatus: PopNamedCount[]
  byInstalment: PopNamedCount[]
  byMode: PopNamedCount[]
  enrollmentTrend: PopNamedCount[]
}

export function parsePopDate(label: string): Date | null {
  const match = label.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/)
  if (!match) return null
  const day = Number(match[1])
  const month = MONTHS.findIndex((item) => item.toLowerCase() === match[2].toLowerCase())
  const year = Number(match[3])
  if (month < 0 || !Number.isFinite(day) || !Number.isFinite(year)) return null
  return new Date(year, month, day)
}

export type PopCollectionCueKind =
  | 'overdue'
  | 'due_today'
  | 'due_soon'
  | 'upcoming'
  | 'near_complete'
  | 'ready_to_redeem'
  | 'redeemed'
  | 'defaulted'
  | 'on_track'

export interface PopCollectionCue {
  kind: PopCollectionCueKind
  label: string
  detail: string
  pushHint: string
  priority: number
  daysOverdue: number
  daysUntilDue: number
}

/** Shared “what should sales push?” cue for a plan, as of a store day. */
export function getPlanCollectionCue(
  plan: PopPlan,
  now = new Date(2026, 7, 27),
): PopCollectionCue {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (plan.status === 'DEFAULTED') {
    return {
      kind: 'defaulted',
      label: 'Defaulted',
      detail: 'Plan stopped mid-way',
      pushHint: 'Offer early redemption of amount paid — bonus month not applicable.',
      priority: 1,
      daysOverdue: 0,
      daysUntilDue: 0,
    }
  }

  if (plan.status === 'COMPLETED') {
    if (plan.redeemedOn) {
      return {
        kind: 'redeemed',
        label: 'Redeemed',
        detail: `Gift card used on ${plan.redeemedOn}`,
        pushHint: 'No collection needed.',
        priority: 90,
        daysOverdue: 0,
        daysUntilDue: 0,
      }
    }
    return {
      kind: 'ready_to_redeem',
      label: 'Ready to redeem',
      detail: `Gift value ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(plan.monthlyAmount * 6)}`,
      pushHint: 'Guide customer to jewellery redemption before the window closes.',
      priority: 2,
      daysOverdue: 0,
      daysUntilDue: 0,
    }
  }

  if (plan.monthsPaid === 0) {
    return {
      kind: 'due_today',
      label: 'First instalment due',
      detail: `Month 1 · ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(plan.monthlyAmount)} to activate`,
      pushHint: 'Collect month 1 now — the plan is not active until the first instalment is paid.',
      priority: 3,
      daysOverdue: 0,
      daysUntilDue: 0,
    }
  }

  if (plan.monthsPaid >= 5) {
    return {
      kind: 'ready_to_redeem',
      label: 'Ready to redeem',
      detail: 'All instalments complete',
      pushHint: 'Guide customer to jewellery redemption.',
      priority: 2,
      daysOverdue: 0,
      daysUntilDue: 0,
    }
  }

  const due = parsePopDate(plan.nextDueDate)
  if (!due) {
    return {
      kind: 'on_track',
      label: 'Active',
      detail: 'Next due not set',
      pushHint: 'Confirm next due date with the customer.',
      priority: 70,
      daysOverdue: 0,
      daysUntilDue: 0,
    }
  }

  const daysUntilDue = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  const nextMonth = plan.monthsPaid + 1
  const nearComplete = plan.monthsPaid === 4

  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue)
    const bonusAtRisk = daysOverdue > 4
    return {
      kind: 'overdue',
      label: daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`,
      detail: `Month ${nextMonth}/5 due was ${plan.nextDueDate}`,
      pushHint: bonusAtRisk
        ? 'Push hard to collect now — delay over 4 days risks losing the bonus month.'
        : 'Collect today. Delay over 4 days risks losing the bonus month.',
      priority: 0,
      daysOverdue,
      daysUntilDue: 0,
    }
  }

  if (daysUntilDue === 0) {
    return {
      kind: 'due_today',
      label: 'Due today',
      detail: `Month ${nextMonth}/5 · ${plan.nextDueDate}`,
      pushHint: nearComplete
        ? 'Last instalment due today — collect to unlock the gift card.'
        : 'Ask for today’s instalment before they leave the store.',
      priority: 3,
      daysOverdue: 0,
      daysUntilDue: 0,
    }
  }

  if (daysUntilDue <= 7) {
    return {
      kind: nearComplete ? 'near_complete' : 'due_soon',
      label: daysUntilDue === 1 ? 'Due tomorrow' : `Due in ${daysUntilDue} days`,
      detail: `Month ${nextMonth}/5 · ${plan.nextDueDate}`,
      pushHint: nearComplete
        ? 'One payment left — remind them to complete and redeem jewellery.'
        : 'Remind them of the upcoming due date and offer to collect early.',
      priority: nearComplete ? 4 : 5,
      daysOverdue: 0,
      daysUntilDue,
    }
  }

  if (nearComplete) {
    return {
      kind: 'near_complete',
      label: 'Last instalment upcoming',
      detail: `Month 5 due ${plan.nextDueDate}`,
      pushHint: 'One payment left — book a follow-up before the due date.',
      priority: 6,
      daysOverdue: 0,
      daysUntilDue,
    }
  }

  return {
    kind: 'upcoming',
    label: `Due ${plan.nextDueDate}`,
    detail: `Month ${nextMonth}/5 in ${daysUntilDue} days`,
    pushHint: 'On track — note the due date for the next visit.',
    priority: 50 + Math.min(daysUntilDue, 40),
    daysOverdue: 0,
    daysUntilDue,
  }
}

export function sortPlansByCollectionPriority(plans: PopPlan[], now?: Date) {
  return [...plans].sort((a, b) => {
    const left = getPlanCollectionCue(a, now)
    const right = getPlanCollectionCue(b, now)
    if (left.priority !== right.priority) return left.priority - right.priority
    return a.planId.localeCompare(b.planId)
  })
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameMonth(date: Date, ref: Date) {
  return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth()
}

function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

export function getPopDashboardSnapshot(
  store: string,
  now = new Date(2026, 7, 27),
): PopDashboardSnapshot {
  const today = startOfDay(now)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const plans = getAllPopPlans().filter((plan) => popStoreFor(plan) === store)
  const customerIds = new Set(plans.map((plan) => plan.customerId))

  const collectedLifetime = plans.reduce(
    (sum, plan) => sum + plan.history.reduce((inner, row) => inner + row.amount, 0),
    0,
  )
  const collectedThisMonth = plans.reduce((sum, plan) => {
    return (
      sum +
      plan.history.reduce((inner, row) => {
        const paid = parsePopDate(row.paidOn)
        return paid && isSameMonth(paid, today) ? inner + row.amount : inner
      }, 0)
    )
  }, 0)

  const readyPlans: PopReadyPlan[] = plans
    .filter((plan) => plan.status === 'COMPLETED' && !plan.redeemedOn)
    .map((plan) => ({
      plan,
      store: popStoreFor(plan),
      giftCode: popGiftCardCode(plan.planId),
      giftValue: popGiftValue(plan.monthlyAmount),
    }))
    .sort((a, b) => b.giftValue - a.giftValue)

  const giftLiability = readyPlans.reduce((sum, row) => sum + row.giftValue, 0)
  const outstandingBook = plans
    .filter((plan) => plan.status === 'ACTIVE')
    .reduce((sum, plan) => sum + (5 - plan.monthsPaid) * plan.monthlyAmount, 0)

  const enrollmentsThisMonth = plans.filter((plan) => {
    const enrolled = parsePopDate(plan.enrollmentDate)
    return enrolled ? isSameMonth(enrolled, today) : false
  }).length

  const firstEnrollmentByCustomer = new Map<string, Date>()
  for (const plan of plans) {
    const enrolled = parsePopDate(plan.enrollmentDate)
    if (!enrolled) continue
    const current = firstEnrollmentByCustomer.get(plan.customerId)
    if (!current || enrolled < current) firstEnrollmentByCustomer.set(plan.customerId, enrolled)
  }

  const newCustomerIds = [...firstEnrollmentByCustomer.entries()]
    .filter(([, date]) => isSameMonth(date, today))
    .map(([id]) => id)

  const newCustomers = newCustomerIds
    .map((customerId) => {
      const customerPlans = plans.filter((plan) => plan.customerId === customerId)
      if (customerPlans.length === 0) return null
      const first = customerPlans.reduce((earliest, plan) => {
        const current = parsePopDate(plan.enrollmentDate)
        const best = parsePopDate(earliest.enrollmentDate)
        if (!current) return earliest
        if (!best || current < best) return plan
        return earliest
      }, customerPlans[0])
      const stored = popCustomerProfiles.find((profile) => profile.customerId === customerId)
      const enrolled = firstEnrollmentByCustomer.get(customerId)
      if (!first || !enrolled) return null
      const profile: PopCustomerProfile =
        stored ??
        {
          customerId,
          name: first.customerName,
          phone: first.phone,
          email: '—',
          store: '—',
          address: '—',
          customerSince: first.enrollmentDate,
          kycStatus: 'Pending',
        }
      return {
        profile,
        firstEnrollment: first.enrollmentDate,
        plans: customerPlans.length,
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  const nearCompletePlans = plans
    .filter((plan) => plan.status === 'ACTIVE' && plan.monthsPaid === 4)
    .sort((a, b) => {
      const left = parsePopDate(a.nextDueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER
      const right = parsePopDate(b.nextDueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER
      return left - right
    })

  const actionQueue: PopActionItem[] = []
  for (const plan of plans) {
    if (plan.status !== 'ACTIVE' || plan.monthsPaid >= 5) continue
    const due = parsePopDate(plan.nextDueDate)
    if (!due) continue
    const delta = daysBetween(today, due)
    const nextMonth = plan.monthsPaid + 1
    if (delta < 0) {
      actionQueue.push({
        plan,
        kind: 'overdue',
        daysOverdue: Math.abs(delta),
        daysUntilDue: 0,
        nextMonth,
        dueLabel:
          Math.abs(delta) === 1 ? '1 day overdue' : `${Math.abs(delta)} days overdue`,
      })
    } else if (delta === 0) {
      actionQueue.push({
        plan,
        kind: 'due_today',
        daysOverdue: 0,
        daysUntilDue: 0,
        nextMonth,
        dueLabel: 'Due today',
      })
    } else if (delta <= 7) {
      actionQueue.push({
        plan,
        kind: 'due_soon',
        daysOverdue: 0,
        daysUntilDue: delta,
        nextMonth,
        dueLabel: delta === 1 ? 'Due tomorrow' : `Due in ${delta} days`,
      })
    } else if (plan.monthsPaid === 4) {
      actionQueue.push({
        plan,
        kind: 'near_complete',
        daysOverdue: 0,
        daysUntilDue: delta,
        nextMonth,
        dueLabel: `Last instalment · due ${plan.nextDueDate}`,
      })
    }
  }

  actionQueue.sort((a, b) => {
    const rank = { overdue: 0, due_today: 1, due_soon: 2, near_complete: 3 }
    if (rank[a.kind] !== rank[b.kind]) return rank[a.kind] - rank[b.kind]
    if (a.kind === 'overdue') return b.daysOverdue - a.daysOverdue
    return a.daysUntilDue - b.daysUntilDue
  })

  const overdueCount = actionQueue.filter((item) => item.kind === 'overdue').length
  const dueTodayCount = actionQueue.filter((item) => item.kind === 'due_today').length
  const dueSoonCount = actionQueue.filter((item) => item.kind === 'due_soon').length

  const statusMap: PopNamedCount[] = [
    {
      label: 'Active',
      count: plans.filter((plan) => plan.status === 'ACTIVE').length,
      amount: outstandingBook,
    },
    {
      label: 'Ready to redeem',
      count: readyPlans.length,
      amount: giftLiability,
    },
    {
      label: 'Redeemed',
      count: plans.filter((plan) => plan.status === 'COMPLETED' && Boolean(plan.redeemedOn)).length,
      amount: plans
        .filter((plan) => plan.status === 'COMPLETED' && Boolean(plan.redeemedOn))
        .reduce((sum, plan) => sum + popGiftValue(plan.monthlyAmount), 0),
    },
    {
      label: 'Defaulted',
      count: plans.filter((plan) => plan.status === 'DEFAULTED').length,
      amount: plans
        .filter((plan) => plan.status === 'DEFAULTED')
        .reduce((sum, plan) => sum + plan.history.reduce((inner, row) => inner + row.amount, 0), 0),
    },
  ]

  const instalmentMap = new Map<number, PopNamedCount>()
  for (const plan of plans) {
    const current = instalmentMap.get(plan.monthlyAmount) ?? {
      label: `₹${plan.monthlyAmount.toLocaleString('en-IN')}`,
      count: 0,
      amount: 0,
    }
    current.count += 1
    current.amount += plan.monthlyAmount
    instalmentMap.set(plan.monthlyAmount, current)
  }

  const modeMap = new Map<string, PopNamedCount>()
  for (const plan of plans) {
    for (const row of plan.history) {
      const current = modeMap.get(row.mode) ?? { label: row.mode, count: 0, amount: 0 }
      current.count += 1
      current.amount += row.amount
      modeMap.set(row.mode, current)
    }
  }

  const enrollmentTrend: PopNamedCount[] = []
  for (let offset = 5; offset >= 0; offset -= 1) {
    const cursor = new Date(today.getFullYear(), today.getMonth() - offset, 1)
    const label = `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
    const monthPlans = plans.filter((plan) => {
      const enrolled = parsePopDate(plan.enrollmentDate)
      return enrolled ? isSameMonth(enrolled, cursor) : false
    })
    enrollmentTrend.push({
      label,
      count: monthPlans.length,
      amount: monthPlans.reduce(
        (sum, plan) => sum + plan.history.reduce((inner, row) => inner + row.amount, 0),
        0,
      ),
    })
  }

  const recentEnrollments = [...plans].sort((a, b) => {
    const left = parsePopDate(a.enrollmentDate)?.getTime() ?? 0
    const right = parsePopDate(b.enrollmentDate)?.getTime() ?? 0
    return right - left
  })

  const paymentLogs: PopPaymentLog[] = plans
    .flatMap((plan) =>
      plan.history.map((row) => ({
        receiptNo: row.receiptNo,
        paidOn: row.paidOn,
        month: row.month,
        amount: row.amount,
        mode: row.mode,
        planId: plan.planId,
        customerId: plan.customerId,
        customerName: plan.customerName,
        phone: plan.phone,
      })),
    )
    .sort((a, b) => {
      const left = parsePopDate(a.paidOn)?.getTime() ?? 0
      const right = parsePopDate(b.paidOn)?.getTime() ?? 0
      if (right !== left) return right - left
      return b.receiptNo.localeCompare(a.receiptNo)
    })

  return {
    asOfLabel: today.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    customers: customerIds.size,
    plans: plans.length,
    active: plans.filter((plan) => plan.status === 'ACTIVE').length,
    completed: plans.filter((plan) => plan.status === 'COMPLETED').length,
    readyToRedeem: readyPlans.length,
    defaulted: plans.filter((plan) => plan.status === 'DEFAULTED').length,
    enrollmentsThisMonth,
    newCustomersThisMonth: newCustomers.length,
    collectedLifetime,
    collectedThisMonth,
    giftLiability,
    outstandingBook,
    overdueCount,
    dueTodayCount,
    dueSoonCount,
    nearCompleteCount: nearCompletePlans.length,
    actionQueue,
    readyPlans,
    nearCompletePlans,
    newCustomers,
    recentEnrollments: recentEnrollments.slice(0, 6),
    paymentLogs,
    byStatus: statusMap.filter((row) => row.count > 0 || row.label === 'Active'),
    byInstalment: [...instalmentMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value),
    byMode: [...modeMap.values()].sort((a, b) => b.amount - a.amount),
    enrollmentTrend,
  }
}
