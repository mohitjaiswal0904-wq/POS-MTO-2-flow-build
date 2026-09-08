import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BadgeIndianRupee,
  Check,
  ChevronDown,
  CircleCheck,
  Gift,
  Headphones,
  IndianRupee,
  LockKeyhole,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  UserPlus,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { FreeGiftScanPanel } from '@/features/pop/components/FreeGiftScanPanel'
import { PopPageHeader } from '@/features/pop/components/PopPageHeader'
import {
  addPopPlan,
  CURRENT_POP_STORE,
  upsertPopCustomerProfile,
  type PopFreeGift,
} from '@/features/pop/data/popPlans'
import {
  POP_FAQ_SECTIONS,
  POP_TERMS,
  type PopFaqSection,
} from '@/features/pop/data/popPolicy'

const MONTHS_PAID = 5
const FAQ_TABS = [...POP_FAQ_SECTIONS, { id: 'terms' as const, label: 'Terms & Conditions' }]

const HOW_IT_WORKS = [
  {
    title: 'Enroll in plan',
    description: 'Choose a monthly instalment amount and register the customer.',
    icon: UserPlus,
  },
  {
    title: 'Pay for 5 months',
    description: 'Collect five monthly instalments against the active plan.',
    icon: WalletCards,
  },
  {
    title: 'Get 6th month free',
    description: 'Palmonas adds one instalment value as the plan bonus.',
    icon: Gift,
  },
  {
    title: 'Redeem on jewellery',
    description: 'Redeem the full plan value on eligible 9KT jewellery.',
    icon: Sparkles,
  },
]

const BENEFITS = [
  {
    title: 'Premium collection',
    description: 'Access 9KT gold and lab-grown diamond products.',
    icon: Sparkles,
  },
  {
    title: '100% secure',
    description: 'Customer savings are securely tracked against the plan.',
    icon: ShieldCheck,
  },
  {
    title: 'Instant redemption',
    description: 'Redeem the completed plan value directly at checkout.',
    icon: Zap,
  },
  {
    title: 'Extra benefits',
    description: 'Eligible discounts on making charges and special offers.',
    icon: Gift,
  },
  {
    title: 'Flexible plans',
    description: 'Select instalments in multiples of ₹1,000.',
    icon: BadgeIndianRupee,
  },
  {
    title: 'Lifetime support',
    description: 'Assistance is available throughout the plan journey.',
    icon: Headphones,
  },
]

function formatRupees(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function normalizeInstalment(value: number) {
  if (!Number.isFinite(value)) return 1000
  return Math.max(1000, Math.round(value / 1000) * 1000)
}

export function PopPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [instalment, setInstalment] = useState(3000)
  const [faqTab, setFaqTab] = useState<(typeof FAQ_TABS)[number]['id']>('general')
  const [openFaq, setOpenFaq] = useState('general-0')
  const [showEnrollment, setShowEnrollment] = useState(false)
  const [success, setSuccess] = useState('')
  const activeFaqSection = POP_FAQ_SECTIONS.find((section) => section.id === faqTab)

  const paidValue = instalment * MONTHS_PAID
  const totalValue = paidValue + instalment

  const startEnrollment = () => {
    setSuccess('')
    setShowEnrollment(true)
  }

  useEffect(() => {
    const state = location.state as { enroll?: boolean; payment?: boolean } | null
    if (!state?.enroll && !state?.payment) return
    if (state.enroll) startEnrollment()
    if (state.payment) navigate('/pop', { replace: true })
    else navigate('.', { replace: true, state: {} })
  }, [location.state, navigate])

  return (
    <AppLayout>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f6f2]">
        <PopPageHeader onEnroll={startEnrollment} />

        <main className="mx-auto max-w-[1360px] space-y-6 px-6 py-6">
          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CircleCheck className="size-5 shrink-0 text-emerald-600" />
              <span className="font-medium">{success}</span>
              <button
                type="button"
                onClick={() => setSuccess('')}
                className="ml-auto rounded-md p-1 hover:bg-emerald-100"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <section className="relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-sm">
            <div className="absolute -right-16 -top-28 size-80 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 size-40 rounded-full bg-white/5 blur-2xl" />
            <div className="relative grid gap-8 px-7 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-300">
                  Start the savings journey
                </p>
                <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Pay for 5 months.
                  <br />
                  Get the 6th month free.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  Help customers build their jewellery budget with predictable monthly
                  instalments and an extra month contributed by Palmonas.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={startEnrollment}
                    className="h-11 rounded-lg bg-amber-300 px-5 text-sm font-semibold text-slate-950 hover:bg-amber-200"
                  >
                    Start saving now
                  </button>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <LockKeyhole className="size-4 text-amber-300" />
                    Starting from ₹1,000/month
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Example plan value</p>
                    <p className="mt-1 text-3xl font-semibold">{formatRupees(totalValue)}</p>
                  </div>
                  <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-slate-950">
                    1 month FREE
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  <PlanRow label="Monthly instalment" value={formatRupees(instalment)} />
                  <PlanRow label="Customer pays (5 months)" value={formatRupees(paidValue)} />
                  <div className="border-t border-white/10 pt-3">
                    <PlanRow
                      label="Palmonas bonus"
                      value={`+ ${formatRupees(instalment)}`}
                      highlight
                    />
                  </div>
                </div>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-5/6 rounded-full bg-amber-300" />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Customer pays 5 of 6 instalment values
                </p>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading
              eyebrow="How it works"
              title="Four simple steps"
              description="A clear journey from enrollment to jewellery redemption."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {HOW_IT_WORKS.map((step, index) => {
                const Icon = step.icon
                return (
                  <article
                    key={step.title}
                    className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <span className="absolute right-4 top-4 text-3xl font-semibold text-slate-100">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.description}</p>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeading
                eyebrow="Savings calculator"
                title="Calculate the plan benefit"
                description="Instalments must be in multiples of ₹1,000."
              />

              <div className="mt-6">
                <label
                  htmlFor="monthly-instalment"
                  className="text-sm font-medium text-slate-700"
                >
                  Monthly instalment
                </label>
                <div className="mt-2 flex max-w-md items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setInstalment((current) => Math.max(1000, current - 1000))}
                    className="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-white"
                    aria-label="Decrease instalment"
                  >
                    <Minus className="size-4" />
                  </button>
                  <div className="flex flex-1 items-center justify-center gap-1">
                    <IndianRupee className="size-4 shrink-0 text-slate-700" aria-hidden="true" />
                    <input
                      id="monthly-instalment"
                      type="number"
                      min={1000}
                      step={1000}
                      value={instalment}
                      onChange={(event) => setInstalment(Number(event.target.value))}
                      onBlur={() => setInstalment((current) => normalizeInstalment(current))}
                      className="h-10 w-[8ch] bg-transparent text-lg font-semibold tabular-nums text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setInstalment((current) => normalizeInstalment(current) + 1000)}
                    className="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-white"
                    aria-label="Increase instalment"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1000, 3000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setInstalment(amount)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                        instalment === amount
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {formatRupees(amount)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <ValueCard label="Your instalments" value={paidValue} note="5 months" />
                <ValueCard label="Palmonas bonus" value={instalment} note="6th month" bonus />
                <ValueCard label="Redeemable value" value={totalValue} note="after completion" dark />
              </div>
            </div>

            <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
                <Gift className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">
                Customer saves {formatRupees(instalment)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                On a {formatRupees(totalValue)} plan, the customer contributes only{' '}
                {formatRupees(paidValue)}.
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  'No hidden charges',
                  'Early withdrawal option',
                  'Eligible on 9KT jewellery',
                  'Special making-charge benefits',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="flex size-5 items-center justify-center rounded-full bg-white text-emerald-600">
                      <Check className="size-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={startEnrollment}
                className="mt-6 h-10 w-full rounded-lg bg-slate-950 text-sm font-medium text-white hover:bg-slate-800"
              >
                Enroll with this amount
              </button>
            </aside>
          </section>

          <section>
            <SectionHeading
              eyebrow="Why customers choose POP"
              title="Benefits built for peace of mind"
              description="Everything needed for a simple, transparent savings journey."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <article
                    key={benefit.title}
                    className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{benefit.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section id="pop-policy" className="scroll-mt-4 space-y-4 pb-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Plan of Purchase · Frequently Asked Questions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Source: palmonas.com/pages/pop-policy
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {FAQ_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setFaqTab(tab.id)
                      if (tab.id !== 'terms') setOpenFaq(`${tab.id}-0`)
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      faqTab === tab.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div
                key={faqTab}
                className="mt-6 h-[26rem] overflow-y-auto overscroll-contain border-t border-slate-100 pt-5 pr-1"
              >
                {faqTab === 'terms' ? (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Terms & Conditions</h3>
                    <ol className="mt-4 space-y-3">
                      {POP_TERMS.map((term, index) => (
                        <li key={term} className="flex gap-3 text-sm leading-6 text-slate-600">
                          <span className="w-6 shrink-0 font-semibold text-slate-400">
                            {index + 1}.
                          </span>
                          <span>{term}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <FaqList
                    section={activeFaqSection!}
                    openKey={openFaq}
                    onToggle={(key) => setOpenFaq(openFaq === key ? '' : key)}
                  />
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {showEnrollment && (
        <EnrollmentModal
          instalment={normalizeInstalment(instalment)}
          onClose={() => setShowEnrollment(false)}
          onComplete={(customerName, planId, phone, monthlyAmount, freeGifts) => {
            const customerId = `CUS-${String(Date.now()).slice(-4)}`
            const enrolledOn = new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
            addPopPlan({
              planId,
              customerId,
              customerName,
              phone,
              monthlyAmount,
              monthsPaid: 0,
              enrollmentDate: enrolledOn,
              nextDueDate: enrolledOn,
              status: 'ACTIVE',
              history: [],
            })
            upsertPopCustomerProfile({
              customerId,
              name: customerName,
              phone,
              email: '—',
              store: CURRENT_POP_STORE,
              address: '—',
              customerSince: enrolledOn,
              kycStatus: 'Pending',
              onboardedBy: 'Store associate',
              freeGifts: freeGifts.length > 0 ? freeGifts : undefined,
            })
            setShowEnrollment(false)
            const giftNote =
              freeGifts.length > 0
                ? ` Free gift: ${freeGifts.map((g) => g.name).join(', ')}.`
                : ''
            navigate(
              `/pop/lookup?phone=${phone}&collect=${planId}&enrolled=1`,
              {
                state: {
                  notice: `${customerName} enrolled on ${planId}.${giftNote} Collect month 1 of ${monthlyAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} to activate the plan.`,
                },
              },
            )
          }}
        />
      )}
    </AppLayout>
  )
}

function FaqList({
  section,
  openKey,
  onToggle,
}: {
  section: PopFaqSection
  openKey: string
  onToggle: (key: string) => void
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{section.label}</h3>
      <div className="mt-2 divide-y divide-slate-100">
        {section.items.map((faq, index) => {
          const key = `${section.id}-${index}`
          const isOpen = openKey === key
          return (
            <div key={faq.question} className="py-1">
              <button
                type="button"
                onClick={() => onToggle(key)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-slate-800">{faq.question}</span>
                <ChevronDown
                  className={`size-4 shrink-0 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="max-w-4xl pb-4 text-sm leading-6 text-slate-500">{faq.answer}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlanRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className={highlight ? 'font-semibold text-amber-300' : 'font-medium text-white'}>
        {value}
      </span>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function ValueCard({
  label,
  value,
  note,
  bonus = false,
  dark = false,
}: {
  label: string
  value: number
  note: string
  bonus?: boolean
  dark?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        dark
          ? 'border-slate-900 bg-slate-900 text-white'
          : bonus
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-slate-200 bg-slate-50'
      }`}
    >
      <p className={`text-xs ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p>
      <p className={`mt-2 text-xl font-semibold ${bonus ? 'text-emerald-700' : ''}`}>
        {bonus ? '+ ' : ''}
        {formatRupees(value)}
      </p>
      <p className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{note}</p>
    </div>
  )
}

function EnrollmentModal({
  instalment,
  onClose,
  onComplete,
}: {
  instalment: number
  onClose: () => void
  onComplete: (
    customerName: string,
    planId: string,
    phone: string,
    monthlyAmount: number,
    freeGifts: PopFreeGift[],
  ) => void
}) {
  const [step, setStep] = useState<'details' | 'otp' | 'gift'>('details')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [amount, setAmount] = useState(instalment)
  const [consent, setConsent] = useState(false)
  const [otp, setOtp] = useState('')
  const [sentOtp, setSentOtp] = useState('')
  const [pendingPlanId, setPendingPlanId] = useState('')
  const [freeGifts, setFreeGifts] = useState<PopFreeGift[]>([])
  const [error, setError] = useState('')
  const [resendIn, setResendIn] = useState(0)

  const totalValue = useMemo(() => normalizeInstalment(amount) * 6, [amount])
  const maskedMobile =
    mobile.length === 10 ? `+91 ${mobile.slice(0, 2)}•••••${mobile.slice(-3)}` : mobile

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendIn])

  const sendOtp = () => {
    const code = '123456'
    setSentOtp(code)
    setOtp('')
    setResendIn(30)
    setError('')
    setStep('otp')
  }

  const goToOtp = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Enter the customer name.')
      return
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }
    if (!consent) {
      setError('Confirm that the customer accepted the plan terms.')
      return
    }
    sendOtp()
  }

  const verifyOtp = (event: FormEvent) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit OTP sent to the customer.')
      return
    }
    if (otp !== sentOtp) {
      setError('Incorrect OTP. Ask the customer to share the latest code.')
      return
    }
    setError('')
    setPendingPlanId(`POP${new Date().getFullYear()}${String(Date.now()).slice(-6)}`)
    setStep('gift')
  }

  const finishEnrollment = (gifts: PopFreeGift[]) => {
    onComplete(
      name.trim(),
      pendingPlanId,
      mobile,
      normalizeInstalment(amount),
      gifts,
    )
  }

  const formSubmit =
    step === 'details' ? goToOtp : step === 'otp' ? verifyOtp : (event: FormEvent) => event.preventDefault()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <form
        onSubmit={formSubmit}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {step === 'details'
                ? 'Enroll customer'
                : step === 'otp'
                  ? 'Verify mobile'
                  : 'Enrollment gift'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {step === 'details'
                ? 'Create a new 5+1 Plan of Purchase.'
                : step === 'otp'
                  ? `OTP sent to ${maskedMobile}. Confirm details before creating the plan.`
                  : 'Optionally scan a product tag to issue a free gift with this enrollment.'}
            </p>
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

        <div className="shrink-0 border-b border-slate-100 px-6 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <StepPill active={step === 'details'} done={step !== 'details'} label="1. Details" />
            <span className="text-slate-300">→</span>
            <StepPill active={step === 'otp'} done={step === 'gift'} label="2. OTP" />
            <span className="text-slate-300">→</span>
            <StepPill active={step === 'gift'} done={false} label="3. Free gift" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {step === 'details' && (
            <div className="space-y-4 px-6 py-5">
              <FormField
                label="Customer name"
                value={name}
                placeholder="Enter full name"
                onChange={setName}
              />
              <FormField
                label="Mobile number"
                value={mobile}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                maxLength={10}
                onChange={(value) => setMobile(value.replace(/\D/g, '').slice(0, 10))}
              />
              <div>
                <label htmlFor="enrollment-amount" className="text-sm font-medium text-slate-700">
                  Monthly instalment
                </label>
                <div className="mt-1.5 flex h-10 items-center gap-1 rounded-lg border border-slate-200 px-3 focus-within:border-slate-400">
                  <IndianRupee className="size-4 shrink-0 text-slate-700" aria-hidden="true" />
                  <input
                    id="enrollment-amount"
                    type="number"
                    min={1000}
                    step={1000}
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                    onBlur={() => setAmount((current) => normalizeInstalment(current))}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium tabular-nums text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Customer pays</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupees(normalizeInstalment(amount) * 5)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Redeemable value</span>
                  <span className="font-semibold text-emerald-700">{formatRupees(totalValue)}</span>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => {
                    setConsent(event.target.checked)
                    setError('')
                  }}
                  className="mt-0.5 size-4 accent-slate-900"
                />
                <span className="text-sm leading-5 text-slate-600">
                  Customer has reviewed and accepted the Plan of Purchase terms.
                </span>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-medium text-slate-900">{name.trim()}</p>
                <p className="mt-0.5 text-slate-500">
                  {maskedMobile} · {formatRupees(normalizeInstalment(amount))} / month
                </p>
              </div>

              <div>
                <label htmlFor="enrollment-otp" className="text-sm font-medium text-slate-700">
                  Enter OTP
                </label>
                <div className="relative mt-1.5">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="enrollment-otp"
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={otp}
                    placeholder="6-digit code"
                    onChange={(event) => {
                      setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                      setError('')
                    }}
                    className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-center text-lg font-semibold tracking-[0.35em] text-slate-900 outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-400"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Demo OTP for this session:{' '}
                  <span className="font-semibold text-slate-800">123456</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <button
                  type="button"
                  disabled={resendIn > 0}
                  onClick={sendOtp}
                  className="font-medium text-slate-800 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                >
                  {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('details')
                    setOtp('')
                    setError('')
                  }}
                  className="font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                >
                  Edit details
                </button>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}

          {step === 'gift' && (
            <div className="space-y-4 px-6 py-5">
              {freeGifts.length > 0 ? (
                <div className="space-y-3">
                  {freeGifts.map((gift) => (
                    <div
                      key={gift.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-emerald-950">{gift.name}</p>
                        <p className="mt-0.5 text-xs text-emerald-800">
                          {gift.sku} · {gift.barcode} · scanned & billed ₹0
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFreeGifts((current) => current.filter((item) => item.id !== gift.id))
                        }
                        className="text-xs font-medium text-emerald-900 underline-offset-2 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFreeGifts([])}
                    className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
                  >
                    Scan a different product
                  </button>
                </div>
              ) : (
                <FreeGiftScanPanel
                  planId={pendingPlanId}
                  onVerified={(gift) => setFreeGifts([gift])}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          {step === 'gift' ? (
            <>
              <button
                type="button"
                onClick={() => finishEnrollment([])}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Skip gift
              </button>
              <button
                type="button"
                onClick={() => finishEnrollment(freeGifts)}
                className="flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <CircleCheck className="size-4" />
                {freeGifts.length > 0 ? 'Create plan with gift' : 'Create plan'}
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-medium text-white hover:bg-slate-800"
            >
              {step === 'details' ? (
                <>
                  <ShieldCheck className="size-4" />
                  Send OTP
                </>
              ) : (
                'Verify & continue'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function StepPill({
  label,
  active,
  done,
}: {
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 ${
        active
          ? 'bg-slate-950 text-white'
          : done
            ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
            : 'bg-slate-100 text-slate-500'
      }`}
    >
      {label}
    </span>
  )
}

function FormField({
  label,
  value,
  placeholder,
  inputMode,
  maxLength,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  inputMode?: 'text' | 'numeric'
  maxLength?: number
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">
        {label}
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
        />
      </label>
    </div>
  )
}
