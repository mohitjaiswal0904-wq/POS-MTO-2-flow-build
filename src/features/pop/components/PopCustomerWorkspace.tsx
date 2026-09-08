import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ChevronDown,
  CircleCheck,
  Clock,
  Gift,
  IdCard,
  Search,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react'
import { formatCurrency } from '@/shared/lib/currency'
import { AddFreeGiftModal } from '@/features/pop/components/FreeGiftScanPanel'
import {
  getPlanCollectionCue,
  sortPlansByCollectionPriority,
  type PopCollectionCue,
  type PopCollectionCueKind,
} from '@/features/pop/data/popDashboard'
import {
  addFreeGiftToProfile,
  getPopCustomerByPhone,
  recordPopPayment,
  upsertPopCustomerProfile,
  type PopCustomerProfile,
  type PopFreeGift,
  type PopPlan,
  type PopPlanStatus,
} from '@/features/pop/data/popPlans'

function formatRupees(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPhone(digits: string) {
  if (digits.length !== 10) return digits
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

export function PopCustomerWorkspace() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const phoneParam = searchParams.get('phone') ?? ''
  const collectPlanId = searchParams.get('collect') ?? ''
  const [query, setQuery] = useState(phoneParam)
  const [applied, setApplied] = useState(phoneParam)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false)
  const [freeGiftOpen, setFreeGiftOpen] = useState(false)
  const [autoCollectPlanId, setAutoCollectPlanId] = useState(collectPlanId)

  useEffect(() => {
    const digits = phoneParam.replace(/\D/g, '').slice(0, 10)
    if (!digits) return
    setQuery(digits)
    setApplied(digits)
    setError('')
  }, [phoneParam])

  useEffect(() => {
    const state = location.state as { notice?: string } | null
    if (state?.notice) {
      setNotice(state.notice)
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
    }
  }, [location.pathname, location.search, location.state, navigate])

  useEffect(() => {
    if (!collectPlanId) return
    setAutoCollectPlanId(collectPlanId)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('collect')
        next.delete('enrolled')
        return next
      },
      { replace: true },
    )
  }, [collectPlanId, setSearchParams])

  const result = useMemo(() => {
    void refreshKey
    if (!applied) return undefined
    return getPopCustomerByPhone(applied)
  }, [applied, refreshKey])

  const profileIncomplete = Boolean(
    result && (result.profile.kycStatus === 'Pending' || !result.profile.panLast4),
  )

  const orderedPlans = useMemo(
    () => (result ? sortPlansByCollectionPriority(result.plans) : []),
    [result],
  )

  const pushSummary = useMemo(() => {
    const cues = orderedPlans.map((plan) => getPlanCollectionCue(plan))
    return {
      overdue: cues.filter((cue) => cue.kind === 'overdue').length,
      dueToday: cues.filter((cue) => cue.kind === 'due_today').length,
      dueSoon: cues.filter((cue) => cue.kind === 'due_soon' || cue.kind === 'near_complete').length,
      ready: cues.filter((cue) => cue.kind === 'ready_to_redeem').length,
    }
  }, [orderedPlans])

  const lookup = (event?: FormEvent) => {
    event?.preventDefault()
    const digits = query.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Enter a 10-digit mobile number.')
      return
    }
    setError('')
    setNotice('')
    setApplied(digits)
    setSearchParams({ phone: digits })
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={lookup} className="flex w-full gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={14}
              value={query}
              placeholder="Enter 10-digit phone number"
              onChange={(event) => setQuery(event.target.value.replace(/[^\d]/g, '').slice(0, 10))}
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>
          <button
            type="submit"
            className="h-10 shrink-0 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Open account
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      {notice && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <p className="min-w-0 flex-1 font-medium">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice('')}
            className="shrink-0 rounded-md p-1 hover:bg-emerald-100"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {applied && !result && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No customer or POP plan found for {formatPhone(applied.replace(/\D/g, ''))}.
        </p>
      )}

      {result && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                {result.profile.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">{result.profile.name}</h2>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      result.profile.kycStatus === 'Verified' && result.profile.panLast4
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    }`}
                  >
                    {result.profile.kycStatus === 'Verified' && result.profile.panLast4
                      ? 'KYC Verified'
                      : 'Profile incomplete'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {result.profile.customerId} · Customer since {result.profile.customerSince}
                </p>
              </div>
              {profileIncomplete && (
                <button
                  type="button"
                  onClick={() => setCompleteProfileOpen(true)}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
                >
                  <IdCard className="size-4" />
                  Complete profile
                </button>
              )}
            </div>

            {profileIncomplete && (
              <div className="mt-4 flex flex-wrap items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <IdCard className="mt-0.5 size-4 shrink-0 text-amber-700" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-950">
                    Add PAN to finish verification
                  </p>
                  <p className="mt-0.5 text-xs text-amber-800">
                    KYC stays pending until a valid PAN is captured for this customer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCompleteProfileOpen(true)}
                  className="h-8 shrink-0 rounded-lg border border-amber-300 bg-white px-3 text-xs font-medium text-amber-900 hover:bg-amber-100"
                >
                  Add PAN
                </button>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Phone" value={formatPhone(result.profile.phone)} />
              <Info label="Email" value={result.profile.email} />
              <Info label="Home store" value={result.profile.store} />
              <Info
                label="PAN"
                value={result.profile.panLast4 ? `•••• ${result.profile.panLast4}` : 'Not added'}
              />
              <Info label="Onboarded by" value={result.profile.onboardedBy} />
              <div className="sm:col-span-2">
                <Info label="Address" value={result.profile.address} />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Free gifts</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Products scanned and billed as ₹0 during POP onboarding or follow-up.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFreeGiftOpen(true)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Gift className="size-4" />
                  Issue free gift
                </button>
              </div>

              {(result.profile.freeGifts?.length ?? 0) === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  No free gifts issued yet. Scan a product barcode to verify and bill as free.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                  {result.profile.freeGifts!.map((gift) => (
                    <FreeGiftRow key={gift.id} gift={gift} />
                  ))}
                </ul>
              )}
            </div>
          </section>

          <PlanTotals plans={result.plans} />

          {(pushSummary.overdue > 0 ||
            pushSummary.dueToday > 0 ||
            pushSummary.dueSoon > 0 ||
            pushSummary.ready > 0) && (
            <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                What to push on this visit
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pushSummary.overdue > 0 && (
                  <PushPill tone="danger" label={`${pushSummary.overdue} overdue — collect now`} />
                )}
                {pushSummary.dueToday > 0 && (
                  <PushPill tone="warn" label={`${pushSummary.dueToday} due today`} />
                )}
                {pushSummary.dueSoon > 0 && (
                  <PushPill
                    tone="info"
                    label={`${pushSummary.dueSoon} due within 7 days / last instalment`}
                  />
                )}
                {pushSummary.ready > 0 && (
                  <PushPill tone="accent" label={`${pushSummary.ready} ready to redeem`} />
                )}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">
              Plans ({result.plans.length})
            </h3>
            <p className="mb-3 text-xs text-slate-500">
              Sorted by urgency — overdue and due plans appear first.
            </p>
            {orderedPlans.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                This customer has no Plan of Purchase yet.
              </p>
            ) : (
              <div className="space-y-3">
                {orderedPlans.map((plan) => (
                  <PlanCard
                    key={`${plan.planId}-${refreshKey}`}
                    plan={plan}
                    autoCollect={autoCollectPlanId === plan.planId}
                    onCollected={(message) => {
                      setNotice(message)
                      setAutoCollectPlanId('')
                      setRefreshKey((value) => value + 1)
                    }}
                    onRedeem={() => navigate(`/pop/redeem/${plan.planId}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {completeProfileOpen && result && (
        <CompleteProfileModal
          profile={result.profile}
          onClose={() => setCompleteProfileOpen(false)}
          onComplete={(updated) => {
            upsertPopCustomerProfile(updated)
            setCompleteProfileOpen(false)
            setNotice(`Profile verified for ${updated.name}. PAN •••• ${updated.panLast4} saved.`)
            setRefreshKey((value) => value + 1)
          }}
        />
      )}

      {freeGiftOpen && result && (
        <AddFreeGiftModal
          planId={result.plans[0]?.planId}
          onClose={() => setFreeGiftOpen(false)}
          onAdd={(gift) => {
            const ok = addFreeGiftToProfile(result.profile.phone, gift)
            setFreeGiftOpen(false)
            if (ok) {
              setNotice(`${gift.name} verified and billed as a free gift (₹0).`)
              setRefreshKey((value) => value + 1)
            } else {
              setNotice('Could not attach free gift — profile not found.')
            }
          }}
        />
      )}
    </>
  )
}

function FreeGiftRow({ gift }: { gift: PopFreeGift }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-slate-900">{gift.name}</p>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Free gift · ₹0
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {gift.sku} · {gift.barcode}
          {gift.planId ? ` · ${gift.planId}` : ''} · issued {gift.issuedOn}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400 line-through">{formatCurrency(gift.mrp)}</p>
        <p className="text-xs font-medium text-emerald-700">Scanned & verified</p>
      </div>
    </li>
  )
}

function CompleteProfileModal({
  profile,
  onClose,
  onComplete,
}: {
  profile: PopCustomerProfile
  onClose: () => void
  onComplete: (profile: PopCustomerProfile) => void
}) {
  const [pan, setPan] = useState('')
  const [email, setEmail] = useState(profile.email === '—' ? '' : profile.email)
  const [address, setAddress] = useState(profile.address === '—' ? '' : profile.address)
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalized = pan.trim().toUpperCase()
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalized)) {
      setError('Enter a valid PAN (e.g. ABCDE1234F).')
      return
    }
    onComplete({
      ...profile,
      panLast4: normalized.slice(-4),
      kycStatus: 'Verified',
      email: email.trim() || profile.email,
      address: address.trim() || profile.address,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <IdCard className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Complete profile</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Add PAN to verify {profile.name.split(' ')[0]}’s KYC.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label htmlFor="profile-pan" className="text-sm font-medium text-slate-700">
              PAN card number
            </label>
            <input
              id="profile-pan"
              type="text"
              autoFocus
              maxLength={10}
              value={pan}
              placeholder="ABCDE1234F"
              onChange={(event) => {
                setPan(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))
                setError('')
              }}
              className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold tracking-widest text-slate-900 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-400"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Only the last 4 digits are stored on the profile after verification.
            </p>
          </div>

          <div>
            <label htmlFor="profile-email" className="text-sm font-medium text-slate-700">
              Email <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              placeholder="customer@email.com"
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <div>
            <label htmlFor="profile-address" className="text-sm font-medium text-slate-700">
              Address <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="profile-address"
              rows={2}
              value={address}
              placeholder="Full address"
              onChange={(event) => setAddress(event.target.value)}
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Verify & save
          </button>
        </div>
      </form>
    </div>
  )
}

function PlanTotals({ plans }: { plans: PopPlan[] }) {
  const active = plans.filter((plan) => plan.status === 'ACTIVE').length
  const collected = plans.reduce((sum, plan) => sum + plan.monthsPaid * plan.monthlyAmount, 0)
  const monthly = plans
    .filter((plan) => plan.status === 'ACTIVE')
    .reduce((sum, plan) => sum + plan.monthlyAmount, 0)

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <TotalCard label="Active plans" value={String(active)} />
      <TotalCard label="Total plans" value={String(plans.length)} />
      <TotalCard label="Collected so far" value={formatRupees(collected)} note={monthly ? `Due now ${formatRupees(monthly)}` : undefined} />
    </div>
  )
}

function TotalCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  )
}

function PlanCard({
  plan,
  onCollected,
  onRedeem,
  autoCollect = false,
}: {
  plan: PopPlan
  onCollected: (message: string) => void
  onRedeem: () => void
  autoCollect?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [collecting, setCollecting] = useState(autoCollect)
  const [mode, setMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash')
  const [associate, setAssociate] = useState('')
  const [reference, setReference] = useState('')
  const [collectError, setCollectError] = useState('')
  const cue = getPlanCollectionCue(plan)
  const remaining = Math.max(0, 5 - plan.monthsPaid)
  const paidValue = plan.monthsPaid * plan.monthlyAmount
  const redeemable = plan.monthsPaid >= 5 ? plan.monthlyAmount * 6 : paidValue
  const borderTone = cueBorderClass(cue.kind)

  useEffect(() => {
    if (autoCollect) setCollecting(true)
  }, [autoCollect])

  const submitCollect = () => {
    if (!associate.trim()) {
      setCollectError('Enter the salesperson name.')
      return
    }
    if (mode !== 'Cash' && !reference.trim()) {
      setCollectError('Enter the UPI / card reference number.')
      return
    }
    const month = plan.monthsPaid + 1
    const receiptNo = `RCPT-${plan.planId.slice(-4)}-${String(month).padStart(2, '0')}`
    const updated = recordPopPayment(plan.planId, {
      month,
      paidOn: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      amount: plan.monthlyAmount,
      mode,
      receiptNo,
    })
    setCollecting(false)
    setAssociate('')
    setReference('')
    setCollectError('')
    onCollected(
      `${plan.customerName}: month ${month} of 5 collected (${formatRupees(plan.monthlyAmount)}). Receipt ${receiptNo}${
        updated?.status === 'COMPLETED' ? '. Plan is now complete.' : ''
      }`,
    )
  }

  return (
    <article className={`rounded-2xl border bg-white p-5 shadow-sm ${borderTone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">{plan.planId}</p>
            <StatusChip status={plan.status} />
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            {formatRupees(plan.monthlyAmount)} / month · enrolled {plan.enrollmentDate}
          </p>
        </div>
        <DueCueBadge cue={cue} />
      </div>

      <div
        className={`mt-4 rounded-xl px-3.5 py-3 ${cueBannerClass(cue.kind)}`}
      >
        <div className="flex items-start gap-2">
          <DueCueIcon kind={cue.kind} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{cue.label}</p>
            <p className="mt-0.5 text-xs text-slate-600">{cue.detail}</p>
            <p className="mt-1.5 text-xs font-medium text-slate-700">{cue.pushHint}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Info label="Paid" value={`${plan.monthsPaid} of 5`} />
        <Info label="Collected" value={formatRupees(paidValue)} />
        <Info
          label="Next due"
          value={plan.nextDueDate}
          emphasize={
            cue.kind === 'overdue' ||
            cue.kind === 'due_today' ||
            cue.kind === 'due_soon' ||
            cue.kind === 'near_complete'
          }
        />
        <Info
          label="If completed"
          value={plan.monthsPaid >= 5 ? formatRupees(redeemable) : formatRupees(plan.monthlyAmount * 6)}
        />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            cue.kind === 'overdue'
              ? 'bg-red-500'
              : cue.kind === 'due_today'
                ? 'bg-amber-500'
                : cue.kind === 'ready_to_redeem'
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
          }`}
          style={{ width: `${(plan.monthsPaid / 5) * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-400">
        {remaining === 0
          ? 'Customer instalments complete'
          : `${remaining} instalment${remaining === 1 ? '' : 's'} remaining`}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {plan.status === 'ACTIVE' && remaining > 0 && (
          <button
            type="button"
            onClick={() => {
              setCollecting((current) => !current)
              setCollectError('')
            }}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white hover:opacity-90 ${
              cue.kind === 'overdue' || cue.kind === 'due_today'
                ? 'bg-red-700'
                : 'bg-slate-950 hover:bg-slate-800'
            }`}
          >
            <WalletCards className="size-4" />
            {collecting
              ? 'Hide form'
              : plan.monthsPaid === 0
                ? 'Collect first instalment'
                : cue.kind === 'overdue'
                  ? 'Collect overdue'
                  : cue.kind === 'due_today'
                    ? 'Collect today'
                    : cue.kind === 'near_complete'
                      ? 'Collect last instalment'
                      : 'Collect instalment'}
          </button>
        )}
        {(plan.status === 'COMPLETED' || plan.monthsPaid >= 5) && !plan.redeemedOn && (
          <button
            type="button"
            onClick={onRedeem}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-amber-300 px-3 text-sm font-semibold text-slate-950 hover:bg-amber-200"
          >
            <Gift className="size-4" />
            Redeem gift card
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Payment history
          <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {collecting && (
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">
            Collect month {plan.monthsPaid + 1} · {formatRupees(plan.monthlyAmount)}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-xs font-medium text-slate-600">
              Mode
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as 'Cash' | 'UPI' | 'Card')}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 outline-none focus:border-slate-400"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Salesperson
              <input
                type="text"
                value={associate}
                onChange={(event) => {
                  setAssociate(event.target.value)
                  setCollectError('')
                }}
                placeholder="Name"
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Reference {mode === 'Cash' ? '(optional)' : ''}
              <input
                type="text"
                value={reference}
                onChange={(event) => {
                  setReference(event.target.value)
                  setCollectError('')
                }}
                placeholder={mode === 'Cash' ? 'Optional' : 'UPI / card ref'}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </label>
          </div>
          {collectError && <p className="text-xs text-red-600">{collectError}</p>}
          <button
            type="button"
            onClick={submitCollect}
            className="h-9 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Confirm payment
          </button>
        </div>
      )}

      {open && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          {plan.history.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-500">No instalments recorded yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2 font-semibold">Month</th>
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Amount</th>
                  <th className="px-3 py-2 font-semibold">Mode</th>
                  <th className="px-3 py-2 font-semibold">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {plan.history.map((row) => (
                  <tr key={row.receiptNo} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2">{row.month}</td>
                    <td className="px-3 py-2 text-slate-600">{row.paidOn}</td>
                    <td className="px-3 py-2">{formatRupees(row.amount)}</td>
                    <td className="px-3 py-2 text-slate-600">{row.mode}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.receiptNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </article>
  )
}

function PushPill({
  label,
  tone,
}: {
  label: string
  tone: 'danger' | 'warn' | 'info' | 'accent'
}) {
  const className =
    tone === 'danger'
      ? 'bg-red-50 text-red-800 ring-1 ring-red-200'
      : tone === 'warn'
        ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
        : tone === 'info'
          ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200'
          : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function DueCueBadge({ cue }: { cue: PopCollectionCue }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cueBadgeClass(cue.kind)}`}
    >
      {cue.label}
    </span>
  )
}

function DueCueIcon({ kind }: { kind: PopCollectionCueKind }) {
  if (kind === 'overdue' || kind === 'defaulted') {
    return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
  }
  if (kind === 'due_today') {
    return <Clock className="mt-0.5 size-4 shrink-0 text-amber-700" />
  }
  if (kind === 'ready_to_redeem') {
    return <Gift className="mt-0.5 size-4 shrink-0 text-amber-700" />
  }
  if (kind === 'near_complete') {
    return <Sparkles className="mt-0.5 size-4 shrink-0 text-violet-700" />
  }
  if (kind === 'redeemed') {
    return <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
  }
  return <Clock className="mt-0.5 size-4 shrink-0 text-slate-500" />
}

function cueBorderClass(kind: PopCollectionCueKind) {
  if (kind === 'overdue' || kind === 'defaulted') return 'border-red-300'
  if (kind === 'due_today') return 'border-amber-300'
  if (kind === 'due_soon' || kind === 'near_complete') return 'border-blue-200'
  if (kind === 'ready_to_redeem') return 'border-amber-300'
  return 'border-slate-200'
}

function cueBannerClass(kind: PopCollectionCueKind) {
  if (kind === 'overdue' || kind === 'defaulted') return 'bg-red-50'
  if (kind === 'due_today') return 'bg-amber-50'
  if (kind === 'due_soon' || kind === 'near_complete') return 'bg-blue-50'
  if (kind === 'ready_to_redeem') return 'bg-amber-50'
  if (kind === 'redeemed') return 'bg-emerald-50'
  return 'bg-slate-50'
}

function cueBadgeClass(kind: PopCollectionCueKind) {
  if (kind === 'overdue' || kind === 'defaulted') return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  if (kind === 'due_today') return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
  if (kind === 'due_soon') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
  if (kind === 'near_complete') return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
  if (kind === 'ready_to_redeem') return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
  if (kind === 'redeemed') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  if (kind === 'upcoming') return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

function StatusChip({ status }: { status: PopPlanStatus }) {
  const className =
    status === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      : status === 'COMPLETED'
        ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
        : 'bg-red-50 text-red-700 ring-1 ring-red-200'
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${className}`}>{status}</span>
  )
}

function Info({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-sm font-medium ${
          emphasize ? 'font-semibold text-red-700' : 'text-slate-800'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
