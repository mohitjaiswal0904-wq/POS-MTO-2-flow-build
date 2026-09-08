import type { ReactNode } from 'react'
import { useState } from 'react'
import { ArrowLeft, Check, Copy, Gift, PiggyBank, ShoppingBag } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '@/shared/components/layout'
import { PopViewSwitch } from '@/features/pop/components/PopViewSwitch'
import { getAllPopPlans } from '@/features/pop/data/popPlans'
import redeemCheck from '@/features/pop/assets/redeem-check.svg'
import redeemGift from '@/features/pop/assets/redeem-gift.svg'

function formatRupees(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function PopRedemptionPage() {
  const navigate = useNavigate()
  const { planId = '' } = useParams()
  const plan = getAllPopPlans().find((item) => item.planId === planId)

  if (!plan) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#f7f6f2] p-6">
          <p className="font-semibold text-slate-900">POP plan not found</p>
          <button
            type="button"
            onClick={() => navigate('/pop')}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            Back to customer lookup
          </button>
        </div>
      </AppLayout>
    )
  }

  if (plan.status !== 'COMPLETED' || plan.monthsPaid < 5) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#f7f6f2] p-6 text-center">
          <p className="font-semibold text-slate-900">This plan is not ready to redeem</p>
          <p className="text-sm text-slate-500">
            All five customer instalments must be complete before the gift card is available.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/pop/lookup?phone=${plan.phone}`)}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            Back to plan
          </button>
        </div>
      </AppLayout>
    )
  }

  if (plan.redeemedOn) {
    return (
      <AppLayout>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f6f2]">
          <header className="border-b border-slate-200 bg-white px-6 pt-5">
            <div className="mx-auto max-w-[1120px]">
              <button
                type="button"
                onClick={() => navigate(`/pop/lookup?phone=${plan.phone}`)}
                className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="size-4" />
                Back to account
              </button>
              <h1 className="text-xl font-semibold text-slate-900">Already redeemed</h1>
              <p className="mt-1 text-sm text-slate-500">
                {plan.customerName} · {plan.planId}
              </p>
              <PopViewSwitch />
            </div>
          </header>
          <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-3 px-6 py-10">
            <p className="text-sm text-slate-600">
              Gift card for this plan was used on <span className="font-semibold">{plan.redeemedOn}</span>.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/pop/lookup?phone=${plan.phone}`)}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Open customer account
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const savings = plan.monthlyAmount * 5
  const bonus = plan.monthlyAmount
  const total = savings + bonus
  const giftCardCode = `POP-${plan.planId.slice(-6)}`
  const validUntil = '05 Aug 2027'

  return (
    <AppLayout>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f6f2]">
        <header className="border-b border-slate-200 bg-white px-6 pt-5">
          <div className="mx-auto max-w-[1120px]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/pop/lookup?phone=${plan.phone}`)}
                className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
                aria-label="Back"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#151515]">
                  Redeem for {plan.customerName}
                </h1>
                <p className="text-sm text-slate-500">{plan.planId}</p>
              </div>
            </div>
            <PopViewSwitch />
          </div>
        </header>

        <main className="mx-auto max-w-[1120px] px-6 py-7">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section>
              <div className="text-center">
                <div className="mx-auto flex size-[34px] items-center justify-center rounded-full bg-gradient-to-br from-[#05df72] to-[#00a63e]">
                  <img src={redeemCheck} alt="" className="size-5" />
                </div>
                <h2 className="mt-3 text-lg font-bold text-[#151515]">Plan complete</h2>
                <p className="mt-3 text-base text-[#4a5565]">
                  Customer finished 5 instalments — gift card is ready to apply at cart
                </p>
              </div>

              <div className="relative mt-6 overflow-hidden rounded-xl bg-gradient-to-r from-[#ffebb4] to-[#fffbe9] p-5">
                <div className="absolute -right-7 -top-8 size-28 rounded-full bg-red-200/20" />
                <p className="text-sm text-[#151515]">Ready to Redeem</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-[#151515]">
                  {formatRupees(total)}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-[#e17100]">
                  <span className="flex size-4 items-center justify-center">
                    <img src={redeemGift} alt="" className="size-4" />
                  </span>
                  Including {formatRupees(bonus)} bonus
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[19px] border border-[#ffebb4] bg-white">
                <RedemptionRow
                  icon={
                    <span className="flex size-[29px] items-center justify-center rounded-full bg-purple-100">
                      <PiggyBank className="size-4 text-purple-700" />
                    </span>
                  }
                  title="Your Savings"
                  subtitle="5 monthly payments"
                  value={formatRupees(savings)}
                />
                <RedemptionRow
                  icon={
                    <span className="flex size-[29px] items-center justify-center rounded-full bg-amber-100">
                      <Gift className="size-4 text-amber-700" />
                    </span>
                  }
                  title="Bonus Added"
                  subtitle="6th month FREE"
                  value={`+ ${formatRupees(bonus)}`}
                  valueClass="text-[#00a63e] font-bold"
                />
                <div className="flex items-center justify-between px-4 py-4 text-sm text-[#151515]">
                  <span>Total Available</span>
                  <span className="font-medium">{formatRupees(total)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Gift card</p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <GiftCardCopy code={giftCardCode} />
                  <span className="text-sm text-slate-500">Valid until {validUntil}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/products?popPlan=${encodeURIComponent(plan.planId)}&giftCard=${encodeURIComponent(giftCardCode)}&value=${total}`,
                  )
                }
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#151515] px-4 text-sm font-medium tracking-wide text-white hover:bg-black"
              >
                <ShoppingBag className="size-4" />
                Browse Jewellery & Redeem Now
              </button>
            </section>

            <section className="space-y-5">
              <div className="w-full rounded-xl bg-[#f7f7f7] p-5">
                <h3 className="text-lg font-bold text-[#1a1a1a]">How Redemption Works</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#8e8e8e]">
                  <li className="flex gap-2">
                    <span>•</span>
                    Browse our exclusive jewellery collection
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    Use your full amount towards any purchase
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    Pay any remaining balance with other payment methods
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    Valid until {validUntil}
                  </li>
                </ul>
              </div>

              <div className="w-full rounded-xl border border-[#d5d5d5] bg-white p-5">
                <p className="text-xs leading-5 text-[#616161]">
                  <span className="font-bold text-black">Note: </span>
                  After completing the plan, you will receive a gift card. You must redeem it
                  within 60 days. If not redeemed within this period, the gift card will be renewed
                  with a new lifetime validity.
                </p>
              </div>

              <div className="w-full rounded-xl border border-[#d5d5d5] bg-white p-5">
                <h3 className="text-sm font-bold text-black">T&C</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-xs leading-5 text-[#616161]">
                  <li>
                    If you enrolled for the plan offline, you can redeem the amount at your nearest
                    Palmonas store.
                  </li>
                  <li>
                    If you enrolled for the plan online, you can redeem the amount on the Palmonas
                    website or mobile app.
                  </li>
                </ul>
              </div>

              <div className="w-full rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900">Plan summary</h3>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <Summary label="Plan ID" value={plan.planId} />
                  <Summary label="Customer ID" value={plan.customerId} />
                  <Summary label="Monthly amount" value={formatRupees(plan.monthlyAmount)} />
                  <Summary label="Payments" value={`${plan.monthsPaid} of 5 complete`} />
                </dl>
              </div>
            </section>
          </div>
        </main>
      </div>
    </AppLayout>
  )
}

function GiftCardCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="font-mono font-semibold text-slate-900">{code}</span>
      <button
        type="button"
        onClick={copy}
        className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        aria-label={copied ? 'Gift card code copied' : 'Copy gift card code'}
      >
        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function RedemptionRow({
  icon,
  title,
  subtitle,
  value,
  valueClass = 'text-[#151515]',
}: {
  icon: ReactNode
  title: string
  subtitle: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-medium text-[#151515]">{title}</p>
          <p className="text-xs text-[#4a5565]">{subtitle}</p>
        </div>
      </div>
      <p className={`text-sm ${valueClass}`}>{value}</p>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 font-medium text-slate-800">{value}</dd>
    </div>
  )
}
