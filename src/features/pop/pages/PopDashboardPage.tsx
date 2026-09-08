import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CircleCheck,
  Clock,
  Gift,
  MapPin,
  Receipt,
  Search,
  Sparkles,
  TrendingUp,
  UserRoundSearch,
  Users,
  WalletCards,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { formatCurrency } from '@/shared/lib/currency'
import { SearchableStoreSelect } from '@/features/inventory/components/SearchableStoreSelect'
import { PopPageHeader } from '@/features/pop/components/PopPageHeader'
import {
  getPopDashboardSnapshot,
  parsePopDate,
  type PopActionItem,
  type PopActionKind,
  type PopNamedCount,
} from '@/features/pop/data/popDashboard'
import {
  CURRENT_POP_STORE,
  getPopStores,
  type PopPlan,
} from '@/features/pop/data/popPlans'

const PAYMENT_MODE_FILTERS = ['All', 'Cash', 'UPI', 'Card'] as const
const QUEUE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'due_today', label: 'Due today' },
  { id: 'due_soon', label: 'Due soon' },
  { id: 'near_complete', label: 'Last payment' },
] as const

type QueueFilter = (typeof QUEUE_FILTERS)[number]['id']

function statusClass(status: PopPlan['status']) {
  if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  if (status === 'DEFAULTED') return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
}

function kindBadge(kind: PopActionKind) {
  switch (kind) {
    case 'overdue':
      return 'bg-red-50 text-red-700 ring-1 ring-red-200'
    case 'due_today':
      return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
    case 'due_soon':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
    case 'near_complete':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
  }
}

function maxCount(rows: PopNamedCount[]) {
  return Math.max(...rows.map((row) => row.count), 1)
}

function maxAmount(rows: PopNamedCount[]) {
  return Math.max(...rows.map((row) => row.amount), 1)
}

export function PopDashboardPage() {
  const navigate = useNavigate()
  const [store, setStore] = useState(CURRENT_POP_STORE)
  const data = useMemo(() => getPopDashboardSnapshot(store), [store])

  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all')
  const [queueQuery, setQueueQuery] = useState('')
  const [logQuery, setLogQuery] = useState('')
  const [logMode, setLogMode] = useState<(typeof PAYMENT_MODE_FILTERS)[number]>('All')
  const [logPeriod, setLogPeriod] = useState<'all' | 'month'>('month')

  const urgentCount = data.overdueCount + data.dueTodayCount
  const needsWork = data.actionQueue.length

  const filteredQueue = useMemo(() => {
    const term = queueQuery.trim().toLowerCase().replace(/\s+/g, '')
    return data.actionQueue.filter((item) => {
      if (queueFilter !== 'all' && item.kind !== queueFilter) return false
      if (!term) return true
      const haystack =
        `${item.plan.customerName}${item.plan.customerId}${item.plan.planId}${item.plan.phone}`.toLowerCase()
      return haystack.replace(/\s+/g, '').includes(term)
    })
  }, [data.actionQueue, queueFilter, queueQuery])

  const paymentLogs = useMemo(() => {
    const term = logQuery.trim().toLowerCase().replace(/\s+/g, '')
    const asOf = parsePopDate(data.asOfLabel)
    return data.paymentLogs.filter((row) => {
      if (logMode !== 'All' && row.mode !== logMode) return false
      if (logPeriod === 'month') {
        const paid = parsePopDate(row.paidOn)
        if (
          !paid ||
          !asOf ||
          paid.getMonth() !== asOf.getMonth() ||
          paid.getFullYear() !== asOf.getFullYear()
        ) {
          return false
        }
      }
      if (!term) return true
      const haystack =
        `${row.customerName}${row.customerId}${row.planId}${row.receiptNo}${row.phone}${row.mode}`.toLowerCase()
      return haystack.replace(/\s+/g, '').includes(term)
    })
  }, [data.asOfLabel, data.paymentLogs, logMode, logPeriod, logQuery])

  const logTotal = paymentLogs.reduce((sum, row) => sum + row.amount, 0)

  const openAccount = (phone?: string) => {
    navigate(phone ? `/pop/lookup?phone=${phone}` : '/pop')
  }

  return (
    <AppLayout>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f6f2]">
        <PopPageHeader onEnroll={() => navigate('/pop', { state: { enroll: true } })} />

        <div className="mx-auto max-w-[1360px] space-y-5 px-6 py-6">
          {/* Store context + pulse */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <MapPin className="size-4 shrink-0 text-slate-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{store}</p>
                <p className="text-xs text-slate-500">
                  Store floor view · {data.asOfLabel} · {data.active} active plans
                </p>
              </div>
            </div>
            <SearchableStoreSelect
              label="Store"
              value={store}
              options={getPopStores()}
              allowEmpty={false}
              onChange={setStore}
            />
          </div>

          {/* Priority pulse — 4 action metrics, not 6 vanity KPIs */}
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PulseCard
              label="Needs collection"
              value={String(needsWork)}
              hint={
                urgentCount > 0
                  ? `${data.overdueCount} overdue · ${data.dueTodayCount} due today`
                  : `${data.dueSoonCount} due this week`
              }
              tone={urgentCount > 0 ? 'danger' : needsWork > 0 ? 'warn' : 'ok'}
              icon={AlertTriangle}
            />
            <PulseCard
              label="Ready to redeem"
              value={String(data.readyToRedeem)}
              hint={
                data.readyToRedeem > 0
                  ? `${formatCurrency(data.giftLiability)} gift value waiting`
                  : 'No unused gift cards'
              }
              tone={data.readyToRedeem > 0 ? 'accent' : 'neutral'}
              icon={Gift}
            />
            <PulseCard
              label="Collected this month"
              value={formatCurrency(data.collectedThisMonth)}
              hint={`${data.paymentLogs.filter((r) => {
                const paid = parsePopDate(r.paidOn)
                const asOf = parsePopDate(data.asOfLabel)
                return (
                  paid &&
                  asOf &&
                  paid.getMonth() === asOf.getMonth() &&
                  paid.getFullYear() === asOf.getFullYear()
                )
              }).length} receipts · ${formatCurrency(data.collectedLifetime)} lifetime`}
              tone="neutral"
              icon={WalletCards}
            />
            <PulseCard
              label="One instalment left"
              value={String(data.nearCompleteCount)}
              hint={
                data.nearCompleteCount > 0
                  ? 'Close these to unlock gift cards'
                  : 'No plans at month 4'
              }
              tone={data.nearCompleteCount > 0 ? 'warn' : 'neutral'}
              icon={Sparkles}
            />
          </section>

          {/* 1. Today's work — action queue first */}
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-slate-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Today’s collection queue</h2>
                  <p className="text-xs text-slate-500">
                    Overdue first, then due today, due soon, and last instalments. Delay over 4 days
                    risks losing the bonus month.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openAccount()}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                <WalletCards className="size-4" />
                Collect payment
              </button>
            </header>

            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={queueQuery}
                  onChange={(e) => setQueueQuery(e.target.value)}
                  placeholder="Find customer, phone, or plan…"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUEUE_FILTERS.map((filter) => {
                  const count =
                    filter.id === 'all'
                      ? data.actionQueue.length
                      : data.actionQueue.filter((item) => item.kind === filter.id).length
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setQueueFilter(filter.id)}
                      className={`h-8 rounded-lg px-3 text-xs font-medium ${
                        queueFilter === filter.id
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {filter.label}
                      {count > 0 ? ` (${count})` : ''}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="max-h-[26rem] overflow-auto">
              {filteredQueue.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <CircleCheck className="mx-auto size-8 text-emerald-500" />
                  <p className="mt-3 text-sm font-medium text-slate-900">Queue is clear</p>
                  <p className="mt-1 text-sm text-slate-500">
                    No overdue, due-soon, or last-instalment plans match this filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/pop')}
                    className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <UserRoundSearch className="size-4" />
                    Look up a walk-in customer
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredQueue.map((item) => (
                    <ActionRow
                      key={`${item.kind}-${item.plan.planId}`}
                      item={item}
                      onCollect={() => openAccount(item.plan.phone)}
                      onOpen={() => openAccount(item.plan.phone)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </article>

          {/* 2. Redeem + near-complete side by side */}
          <section className="grid gap-5 xl:grid-cols-2">
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Gift className="size-4 text-amber-700" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Ready to redeem</h2>
                    <p className="text-xs text-slate-500">
                      Completed plans with an unused gift card at this store
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                  {data.readyToRedeem}
                </span>
              </header>
              <div className="divide-y divide-slate-100">
                {data.readyPlans.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-slate-500">
                    No gift cards waiting. Finish month-5 collections to unlock redemptions.
                  </p>
                ) : (
                  data.readyPlans.map((row) => (
                    <div
                      key={row.plan.planId}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/pop/lookup?phone=${row.plan.phone}`)}
                        className="min-w-0 text-left hover:opacity-80"
                      >
                        <p className="font-medium text-slate-900 underline-offset-2 hover:underline">
                          {row.plan.customerName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {row.giftCode} · {row.plan.planId}
                        </p>
                      </button>
                      <div className="flex items-center gap-2">
                        <p className="mr-1 text-sm font-semibold text-slate-900">
                          {formatCurrency(row.giftValue)}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate(`/pop/lookup?phone=${row.plan.phone}`)}
                          className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View details
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/pop/redeem/${row.plan.planId}`)}
                          className="h-8 rounded-lg bg-amber-300 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-200"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-violet-700" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Almost complete</h2>
                    <p className="text-xs text-slate-500">
                      Month 4 of 5 — one more payment unlocks the gift card
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                  {data.nearCompleteCount}
                </span>
              </header>
              <div className="divide-y divide-slate-100">
                {data.nearCompletePlans.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-slate-500">
                    No plans sitting on the last instalment right now.
                  </p>
                ) : (
                  data.nearCompletePlans.map((plan) => (
                    <div
                      key={plan.planId}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/pop/lookup?phone=${plan.phone}`)}
                        className="min-w-0 text-left hover:opacity-80"
                      >
                        <p className="font-medium text-slate-900 underline-offset-2 hover:underline">
                          {plan.customerName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(plan.monthlyAmount)} due {plan.nextDueDate} · {plan.planId}
                        </p>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/pop/lookup?phone=${plan.phone}`)}
                          className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View details
                        </button>
                        <button
                          type="button"
                          onClick={() => openAccount(plan.phone)}
                          className="h-8 rounded-lg bg-slate-950 px-3 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Collect last
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          {/* 3. Payment log — audit / dispute / manager check */}
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-slate-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Payment log</h2>
                  <p className="text-xs text-slate-500">
                    Store receipts for disputes and day-end check · {paymentLogs.length} shown ·{' '}
                    {formatCurrency(logTotal)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLogPeriod('month')}
                  className={`h-8 rounded-lg px-3 text-xs font-medium ${
                    logPeriod === 'month'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  This month
                </button>
                <button
                  type="button"
                  onClick={() => setLogPeriod('all')}
                  className={`h-8 rounded-lg px-3 text-xs font-medium ${
                    logPeriod === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All time
                </button>
              </div>
            </header>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={logQuery}
                  onChange={(e) => setLogQuery(e.target.value)}
                  placeholder="Search name, phone, plan, or receipt…"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_MODE_FILTERS.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setLogMode(mode)}
                    className={`h-8 rounded-lg px-3 text-xs font-medium ${
                      logMode === mode
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[22rem] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Plan</th>
                    <th className="px-3 py-3">Month</th>
                    <th className="px-3 py-3">Mode</th>
                    <th className="px-3 py-3">Receipt</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-sm text-slate-500">
                        No receipts match this store and filter.
                      </td>
                    </tr>
                  ) : (
                    paymentLogs.map((row) => (
                      <tr
                        key={row.receiptNo}
                        className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        onClick={() => navigate(`/pop/lookup?phone=${row.phone}`)}
                      >
                        <td className="whitespace-nowrap px-5 py-3 text-slate-600">{row.paidOn}</td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-slate-900">{row.customerName}</p>
                          <p className="text-xs text-slate-500">{row.customerId}</p>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-slate-600">{row.planId}</td>
                        <td className="px-3 py-3 text-slate-600">{row.month}/5</td>
                        <td className="px-3 py-3 text-slate-600">{row.mode}</td>
                        <td className="px-3 py-3 font-mono text-xs text-slate-600">{row.receiptNo}</td>
                        <td className="px-5 py-3 text-right font-medium text-slate-900">
                          {formatCurrency(row.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          {/* 4. Insights — structured panels */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-slate-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Store insights</h2>
                  <p className="text-xs text-slate-500">
                    Snapshot for this store · {data.active} active · {data.customers} customers
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">As of {data.asOfLabel}</p>
            </header>

            <div className="space-y-4 bg-slate-50/80 p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-3">
                <InsightPanel
                  title="Plan status"
                  subtitle={`${data.plans} plans total`}
                  icon={Users}
                >
                  <InsightBars rows={data.byStatus} useCount unit="plans" />
                </InsightPanel>
                <InsightPanel
                  title="Instalment mix"
                  subtitle="Monthly amount bands"
                  icon={WalletCards}
                >
                  <InsightBars rows={data.byInstalment} useCount unit="plans" />
                </InsightPanel>
                <InsightPanel
                  title="Payment modes"
                  subtitle={`${formatCurrency(data.collectedLifetime)} collected`}
                  icon={Receipt}
                >
                  <InsightBars rows={data.byMode} showAmount />
                </InsightPanel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InsightPanel
                  title="Enrollment trend"
                  subtitle="Last 6 months"
                  icon={TrendingUp}
                >
                  <div className="space-y-3">
                    {data.enrollmentTrend.map((row) => (
                      <div key={row.label}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span className="font-medium text-slate-600">{row.label}</span>
                          <span className="tabular-nums text-slate-800">
                            <span className="font-semibold">{row.count}</span>
                            <span className="text-slate-400"> plans · </span>
                            {formatCurrency(row.amount)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-800"
                            style={{
                              width: `${Math.max(6, (row.count / maxCount(data.enrollmentTrend)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </InsightPanel>

                <InsightPanel
                  title="New customers"
                  subtitle={`${data.newCustomersThisMonth} first enrollments this month`}
                  icon={Sparkles}
                >
                  {data.newCustomers.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                      No first-time enrollments this month.
                    </p>
                  ) : (
                    <ul className="-mx-1 divide-y divide-slate-100">
                      {data.newCustomers.map((row) => (
                        <li
                          key={row.profile.customerId}
                          className="flex items-center justify-between gap-3 px-1 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {row.profile.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {row.profile.customerId} · {row.firstEnrollment} · {row.plans} plan
                              {row.plans === 1 ? '' : 's'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/pop/lookup?phone=${row.profile.phone}`)}
                            className="h-8 shrink-0 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Open
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </InsightPanel>
              </div>

              <InsightPanel
                title="Recent enrollments"
                subtitle="Latest plans at this store"
                icon={Users}
                flush
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-2.5">Customer</th>
                        <th className="px-3 py-2.5">Plan</th>
                        <th className="px-3 py-2.5">Enrolled</th>
                        <th className="px-3 py-2.5">Instalment</th>
                        <th className="px-3 py-2.5">Paid</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentEnrollments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                            No enrollments at this store yet.
                          </td>
                        </tr>
                      ) : (
                        data.recentEnrollments.map((plan) => (
                          <tr
                            key={plan.planId}
                            className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            onClick={() => navigate(`/pop/lookup?phone=${plan.phone}`)}
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">{plan.customerName}</p>
                              <p className="text-xs text-slate-500">{plan.customerId}</p>
                            </td>
                            <td className="px-3 py-3 font-mono text-xs text-slate-600">
                              {plan.planId}
                            </td>
                            <td className="px-3 py-3 text-slate-600">{plan.enrollmentDate}</td>
                            <td className="px-3 py-3 text-slate-800">
                              {formatCurrency(plan.monthlyAmount)}
                            </td>
                            <td className="px-3 py-3 text-slate-600">{plan.monthsPaid}/5</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(plan.status)}`}
                              >
                                {plan.status === 'COMPLETED' && plan.redeemedOn
                                  ? 'Redeemed'
                                  : plan.status.charAt(0) + plan.status.slice(1).toLowerCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </InsightPanel>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}

function PulseCard({
  label,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  tone: 'danger' | 'warn' | 'accent' | 'ok' | 'neutral'
  icon: typeof AlertTriangle
}) {
  const ring =
    tone === 'danger'
      ? 'border-red-200 bg-red-50/40'
      : tone === 'warn'
        ? 'border-amber-200 bg-amber-50/40'
        : tone === 'accent'
          ? 'border-amber-200 bg-amber-50/50'
          : tone === 'ok'
            ? 'border-emerald-200 bg-emerald-50/40'
            : 'border-slate-200 bg-white'

  const iconColor =
    tone === 'danger'
      ? 'text-red-600'
      : tone === 'warn'
        ? 'text-amber-700'
        : tone === 'accent'
          ? 'text-amber-700'
          : tone === 'ok'
            ? 'text-emerald-600'
            : 'text-slate-500'

  return (
    <article className={`rounded-xl border px-4 py-4 ${ring}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <Icon className={`size-4 ${iconColor}`} />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </article>
  )
}

function ActionRow({
  item,
  onCollect,
  onOpen,
}: {
  item: PopActionItem
  onCollect: () => void
  onOpen: () => void
}) {
  const { plan, kind, dueLabel, nextMonth } = item
  const bonusAtRisk = kind === 'overdue' && item.daysOverdue > 4

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left hover:opacity-80"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-slate-900 underline-offset-2 hover:underline">
            {plan.customerName}
          </p>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${kindBadge(kind)}`}>
            {dueLabel}
          </span>
          {bonusAtRisk && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
              Bonus at risk
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          Month {nextMonth}/5 · {formatCurrency(plan.monthlyAmount)} · {plan.planId} · due{' '}
          {plan.nextDueDate}
        </p>
      </button>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          View details
        </button>
        <button
          type="button"
          onClick={onCollect}
          className="h-8 rounded-lg bg-slate-950 px-3 text-xs font-medium text-white hover:bg-slate-800"
        >
          Collect
        </button>
      </div>
    </li>
  )
}

function InsightPanel({
  title,
  subtitle,
  icon: Icon,
  children,
  flush = false,
}: {
  title: string
  subtitle: string
  icon: typeof Users
  children: ReactNode
  flush?: boolean
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-start gap-2.5 border-b border-slate-100 px-4 py-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="size-3.5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>
      <div className={flush ? '' : 'px-4 py-4'}>{children}</div>
    </article>
  )
}

function InsightBars({
  rows,
  showAmount,
  useCount,
  unit,
}: {
  rows: PopNamedCount[]
  showAmount?: boolean
  useCount?: boolean
  unit?: string
}) {
  const max = useCount ? maxCount(rows) : maxAmount(rows)
  return (
    <div className="space-y-3.5">
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">No data yet.</p>
      ) : (
        rows.map((row) => {
          const value = useCount ? row.count : row.amount
          return (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-slate-600">{row.label}</span>
                <span className="shrink-0 tabular-nums font-semibold text-slate-900">
                  {showAmount
                    ? formatCurrency(row.amount)
                    : `${row.count}${unit ? ` ${unit}` : ''}`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-800"
                  style={{ width: `${Math.max(6, (value / max) * 100)}%` }}
                />
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
