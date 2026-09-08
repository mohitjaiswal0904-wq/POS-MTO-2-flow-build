import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Copy,
  Gift,
  Heart,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import { EditCustomerInfoPanel } from '@/features/customers/components/EditCustomerInfoModal'
import { getCustomerProfile } from '@/features/customers/data/customersData'
import { formatCurrency } from '@/shared/lib/currency'
import type {
  CustomerAddress,
  CustomerGiftCard,
  CustomerProductItem,
  CustomerProfile,
  GiftCardStatus,
} from '@/features/customers/types'
import { formatCustomerAddress, getSelectedAddress } from '@/features/customers/types'

const categoryToneClass = {
  gold: 'bg-yellow-50 text-[#a65f00]',
  silver: 'bg-slate-100 text-slate-700',
  demifine: 'bg-blue-50 text-blue-700',
  pearl: 'bg-purple-50 text-purple-700',
} as const

function giftStatusBadge(status: GiftCardStatus) {
  switch (status) {
    case 'active':
      return { label: 'active', className: 'bg-green-100 text-green-700' }
    case 'expiring_soon':
      return { label: 'Expiring Soon', className: 'bg-orange-100 text-orange-600' }
    case 'expired':
      return { label: 'Expired', className: 'bg-red-100 text-red-800' }
    case 'used':
      return { label: 'used', className: 'bg-slate-100 text-slate-700' }
  }
}

export function CustomerDetailsPage() {
  const { customerId = '' } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<CustomerProfile | undefined>(() =>
    getCustomerProfile(customerId),
  )
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setProfile(getCustomerProfile(customerId))
    setIsEditing(false)
  }, [customerId])

  const selectedAddress = useMemo(
    () => (profile ? getSelectedAddress(profile) : undefined),
    [profile],
  )

  const addressDisplay = selectedAddress
    ? formatCustomerAddress(selectedAddress)
    : (profile?.address ?? '')

  const handleSaveCustomerInfo = (next: {
    birthday: string
    addresses: CustomerAddress[]
    selectedAddressId: string
  }) => {
    if (!profile) return
    const selected =
      next.addresses.find((entry) => entry.id === next.selectedAddressId) ?? next.addresses[0]
    setProfile({
      ...profile,
      birthday: next.birthday,
      addresses: next.addresses,
      selectedAddressId: selected.id,
      address: formatCustomerAddress(selected),
    })
    setIsEditing(false)
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <p className="text-base font-semibold text-slate-800">Customer not found</p>
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
          >
            Back to Customers
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex size-16 items-center justify-center rounded-full bg-slate-50 text-lg text-slate-700">
              {profile.initials}
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
                {profile.name}
              </h1>
              <p className="text-base text-slate-500">{profile.customerSince}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-5xl space-y-3">
            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="mb-5 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-700">Customer Information</h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-7 rounded-lg border border-slate-200 bg-neutral-50 px-3 text-sm font-medium text-slate-700 hover:bg-white"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <InfoField icon={Mail} label="Email Address" value={profile.email} />
                  <InfoField icon={Phone} label="Phone Number" value={profile.phone} />
                  <div>
                    <p className="text-sm text-slate-500">Birthday</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Calendar className="size-4 text-slate-400" />
                      <p className="text-base font-semibold text-slate-700">{profile.birthday}</p>
                      {profile.birthdayOfferUnlocked && (
                        <span className="rounded-lg bg-[#41b100] px-2 py-0.5 text-xs font-medium text-white">
                          🎉 Birthday Offer Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  {profile.addresses.length > 1 ? (
                    <div className="mt-1 space-y-2">
                      <div className="relative w-full">
                        <select
                          value={profile.selectedAddressId}
                          onChange={(e) => {
                            const nextId = e.target.value
                            const next =
                              profile.addresses.find((entry) => entry.id === nextId) ??
                              profile.addresses[0]
                            setProfile({
                              ...profile,
                              selectedAddressId: next.id,
                              address: formatCustomerAddress(next),
                            })
                          }}
                          className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-700 focus:border-slate-300 focus:outline-none"
                        >
                          {profile.addresses.map((address) => (
                            <option key={address.id} value={address.id}>
                              {address.name} · {address.city} · {address.pincode}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      </div>
                      <div className="flex w-full items-start gap-2">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-slate-700">{addressDisplay}</p>
                          {selectedAddress && (
                            <p className="mt-0.5 text-sm text-slate-500">{selectedAddress.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-slate-400" />
                      <p className="text-base font-semibold text-slate-700">{addressDisplay}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <MetricCard
                icon={Wallet}
                title="Wallet Balance"
                value={formatCurrency(profile.walletBalance)}
                subtitle="Available balance"
              />
              <MetricCard
                icon={TrendingUp}
                title="Average Order Value"
                value={formatCurrency(profile.averageOrderValue)}
                subtitle="Per transaction"
              />
            </div>

            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <h2 className="mb-5 text-xl font-semibold text-slate-700">Spending by Category</h2>
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                {profile.spendingByCategory.map((category) => (
                  <div
                    key={category.label}
                    className={`flex h-[92px] flex-col items-center justify-center gap-2 rounded-[10px] p-4 text-center ${categoryToneClass[category.tone].split(' ')[0]}`}
                  >
                    <p className="text-sm text-slate-600">{category.label}</p>
                    <p
                      className={`text-2xl font-bold ${categoryToneClass[category.tone].split(' ').slice(1).join(' ')}`}
                    >
                      {category.amountLabel}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <ProductListCard
              icon={ShoppingCart}
              title={`Online Cart (${profile.onlineCart.length})`}
              items={profile.onlineCart}
            />

            <ProductListCard
              icon={ShoppingCart}
              title={`Store Cart (${profile.storeCart.length})`}
              badge={profile.storeCartStoreName}
              items={profile.storeCart}
            />

            <ProductListCard
              icon={Heart}
              title={`Wishlist (${profile.wishlist.length})`}
              items={profile.wishlist}
            />

            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="mb-5 flex items-center gap-2">
                <Package className="size-5 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-700">
                  Order History ({profile.orderHistory.length})
                </h2>
              </div>
              <div className="space-y-3">
                {profile.orderHistory.map((order, index) => (
                  <div
                    key={`${order.id}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-slate-50 p-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-slate-700">{order.id}</p>
                        <span className="rounded-lg bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="size-4" />
                        {order.dateLabel}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Items</p>
                        <p className="text-base font-semibold text-slate-700">{order.itemCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="text-lg font-semibold text-slate-700">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="h-[29px] rounded-lg border border-slate-200 bg-neutral-50 px-3 text-sm font-medium text-slate-700 hover:bg-white"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="mb-5 flex items-center gap-2">
                <Gift className="size-5 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-700">
                  Gift Cards ({profile.giftCards.filter((card) => card.status === 'active' || card.status === 'expiring_soon').length})
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {profile.giftCards.map((card, index) => (
                  <GiftCardItem key={`${card.status}-${index}`} card={card} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {isEditing && (
        <EditCustomerInfoPanel
          profile={profile}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveCustomerInfo}
        />
      )}
    </AppLayout>
  )
}

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-slate-400" />
        <p className="text-base font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: typeof Wallet
  title: string
  value: string
  subtitle: string
}) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-5 text-slate-600" />
        <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
      </div>
      <p className="text-[22px] font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
    </section>
  )
}

function ProductListCard({
  icon: Icon,
  title,
  badge,
  items,
}: {
  icon: typeof ShoppingCart
  title: string
  badge?: string
  items: CustomerProductItem[]
}) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-4">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Icon className="size-5 text-slate-600" />
        <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
        {badge && (
          <span className="rounded-lg border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-2"
          >
            <div className="size-24 shrink-0 rounded-[10px] bg-gradient-to-br from-amber-50 to-amber-100" />
            <div className="min-w-[180px] flex-1">
              <p className="text-sm text-slate-700">{item.name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-lg border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {item.metal}
                </span>
                <span className="rounded-lg border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {item.stone}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-8">
              <div className="text-center">
                <p className="text-sm text-slate-500">Added</p>
                <p className="text-sm font-medium text-slate-700">{item.addedOn}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-base font-semibold text-slate-700">
                  {formatCurrency(item.price)}
                </p>
              </div>
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-100 text-slate-700 shadow-sm hover:bg-white"
                aria-label={`Add ${item.name}`}
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function GiftCardItem({ card }: { card: CustomerGiftCard }) {
  const badge = giftStatusBadge(card.status)
  const isDisabled = card.status === 'expired' || card.status === 'used'

  return (
    <div className="flex flex-col gap-3 rounded-[10px] bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-lg font-bold text-slate-700">{card.id}</p>
            <span className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Expires: {card.expiresOn}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Balance</p>
          <p className="text-lg font-semibold text-slate-700">{formatCurrency(card.balance)}</p>
        </div>
      </div>
      <div
        className={`flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 ${
          isDisabled ? 'bg-[#e9e9e9]' : 'bg-white'
        }`}
      >
        <p
          className={`flex-1 text-sm ${
            isDisabled ? 'text-slate-400/40' : 'text-slate-500'
          }`}
        >
          {card.code}
        </p>
        {!isDisabled && (
          <button
            type="button"
            className="text-slate-500 hover:text-slate-700"
            aria-label="Copy gift card code"
            onClick={() => navigator.clipboard?.writeText(card.code)}
          >
            <Copy className="size-5" />
          </button>
        )}
      </div>
    </div>
  )
}
