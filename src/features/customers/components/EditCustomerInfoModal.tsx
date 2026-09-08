import { useEffect, useMemo, useState } from 'react'
import { MapPin, Pencil, Plus, X } from 'lucide-react'
import type { CustomerAddress, CustomerProfile } from '@/features/customers/types'
import { formatCustomerAddress } from '@/features/customers/types'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

type AddressFormState = {
  name: string
  fullAddress: string
  pincode: string
  city: string
  phone: string
}

const emptyAddressForm: AddressFormState = {
  name: '',
  fullAddress: '',
  pincode: '',
  city: '',
  phone: '',
}

function birthdayToInputValue(birthday: string): string {
  const match = birthday.match(/^(\d{1,2})\/([A-Za-z]+)\/(\d{4})$/)
  if (!match) return ''
  const day = match[1].padStart(2, '0')
  const monthIndex = MONTHS.findIndex((month) => month.toLowerCase() === match[2].toLowerCase())
  if (monthIndex < 0) return ''
  return `${match[3]}-${String(monthIndex + 1).padStart(2, '0')}-${day}`
}

function inputValueToBirthday(value: string): string {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  const monthName = MONTHS[Number(month) - 1]
  if (!year || !monthName || !day) return value
  return `${Number(day)}/${monthName}/${year}`
}

function toFormState(address: CustomerAddress): AddressFormState {
  return {
    name: address.name,
    fullAddress: address.fullAddress,
    pincode: address.pincode,
    city: address.city,
    phone: address.phone,
  }
}

interface EditCustomerInfoPanelProps {
  profile: CustomerProfile
  onClose: () => void
  onSave: (next: {
    birthday: string
    addresses: CustomerAddress[]
    selectedAddressId: string
  }) => void
}

export function EditCustomerInfoPanel({
  profile,
  onClose,
  onSave,
}: EditCustomerInfoPanelProps) {
  const [birthdayInput, setBirthdayInput] = useState(birthdayToInputValue(profile.birthday))
  const [addresses, setAddresses] = useState<CustomerAddress[]>(profile.addresses)
  const [selectedAddressId, setSelectedAddressId] = useState(profile.selectedAddressId)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setBirthdayInput(birthdayToInputValue(profile.birthday))
    setAddresses(profile.addresses)
    setSelectedAddressId(profile.selectedAddressId)
    setEditingAddressId(null)
    setIsAddingAddress(false)
    setAddressForm(emptyAddressForm)
  }, [profile])

  const selectedAddress = useMemo(
    () => addresses.find((entry) => entry.id === selectedAddressId) ?? addresses[0],
    [addresses, selectedAddressId],
  )

  const showAddressForm = isAddingAddress || editingAddressId !== null

  const updateForm = (field: keyof AddressFormState, value: string) => {
    setAddressForm((current) => ({ ...current, [field]: value }))
    setFormError('')
  }

  const closeAddressForm = () => {
    setIsAddingAddress(false)
    setEditingAddressId(null)
    setAddressForm(emptyAddressForm)
    setFormError('')
  }

  const startAddAddress = () => {
    setEditingAddressId(null)
    setIsAddingAddress(true)
    setAddressForm(emptyAddressForm)
    setFormError('')
  }

  const startEditAddress = (address: CustomerAddress) => {
    setIsAddingAddress(false)
    setEditingAddressId(address.id)
    setSelectedAddressId(address.id)
    setAddressForm(toFormState(address))
    setFormError('')
  }

  const handleSaveAddress = () => {
    if (
      !addressForm.name.trim() ||
      !addressForm.fullAddress.trim() ||
      !addressForm.pincode.trim() ||
      !addressForm.city.trim() ||
      !addressForm.phone.trim()
    ) {
      setFormError('Please fill Name, Full Address, Pincode, City, and Number.')
      return
    }

    const fields = {
      name: addressForm.name.trim(),
      fullAddress: addressForm.fullAddress.trim(),
      pincode: addressForm.pincode.trim(),
      city: addressForm.city.trim(),
      phone: addressForm.phone.trim(),
    }

    if (editingAddressId) {
      setAddresses((current) =>
        current.map((entry) =>
          entry.id === editingAddressId ? { ...entry, ...fields } : entry,
        ),
      )
      setSelectedAddressId(editingAddressId)
    } else {
      const nextAddress: CustomerAddress = {
        id: `addr-${Math.random().toString(36).slice(2, 9)}`,
        ...fields,
      }
      setAddresses((current) => [...current, nextAddress])
      setSelectedAddressId(nextAddress.id)
    }

    closeAddressForm()
  }

  const handleSaveAll = () => {
    if (addresses.length === 0) {
      setFormError('Add at least one address before saving.')
      return
    }
    onSave({
      birthday: inputValueToBirthday(birthdayInput) || profile.birthday,
      addresses,
      selectedAddressId: selectedAddress?.id ?? addresses[0].id,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[14px] border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Edit customer details</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Update date of birth and manage saved addresses
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Date of Birth
            </label>
            <input
              type="date"
              value={birthdayInput}
              onChange={(e) => setBirthdayInput(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Addresses</p>
                <p className="text-xs text-slate-500">
                  {isAddingAddress
                    ? 'Add a new address'
                    : editingAddressId
                      ? 'Editing selected address'
                      : `${addresses.length} saved${
                          addresses.length > 1 ? ' · select from the list below' : ''
                        }`}
                </p>
              </div>
              {!showAddressForm && (
                <button
                  type="button"
                  onClick={startAddAddress}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
                >
                  <Plus className="size-3.5" />
                  Add address
                </button>
              )}
            </div>

            {isAddingAddress ? (
              <div className="rounded-lg border border-slate-900 bg-white px-3 py-2.5">
                <InlineAddressForm
                  title="Add address"
                  addressForm={addressForm}
                  formError={formError}
                  submitLabel="Save address"
                  onUpdate={updateForm}
                  onCancel={closeAddressForm}
                  onSubmit={handleSaveAddress}
                />
              </div>
            ) : editingAddressId ? (
              <div className="rounded-lg border border-slate-900 bg-white px-3 py-2.5">
                <InlineAddressForm
                  title="Edit address"
                  addressForm={addressForm}
                  formError={formError}
                  submitLabel="Update address"
                  onUpdate={updateForm}
                  onCancel={closeAddressForm}
                  onSubmit={handleSaveAddress}
                />
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-slate-500">No addresses yet. Add one to continue.</p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2.5 ${
                      selectedAddressId === address.id
                        ? 'border-slate-900 bg-white'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{address.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatCustomerAddress(address)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{address.phone}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditAddress(address)}
                      className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-neutral-50 px-2.5 text-xs font-medium text-slate-700 hover:bg-white"
                    >
                      <Pencil className="size-3" />
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!showAddressForm && formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

function InlineAddressForm({
  title,
  addressForm,
  formError,
  submitLabel,
  onUpdate,
  onCancel,
  onSubmit,
}: {
  title: string
  addressForm: AddressFormState
  formError: string
  submitLabel: string
  onUpdate: (field: keyof AddressFormState, value: string) => void
  onCancel: () => void
  onSubmit: () => void
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Name"
          value={addressForm.name}
          placeholder="Recipient / label name"
          onChange={(value) => onUpdate('name', value)}
        />
        <Field
          label="Number for this address"
          value={addressForm.phone}
          placeholder="+91 ..."
          onChange={(value) => onUpdate('phone', value)}
        />
        <div className="sm:col-span-2">
          <Field
            label="Full Address"
            value={addressForm.fullAddress}
            placeholder="House / street / landmark"
            onChange={(value) => onUpdate('fullAddress', value)}
          />
        </div>
        <Field
          label="Pincode"
          value={addressForm.pincode}
          placeholder="400001"
          onChange={(value) => onUpdate('pincode', value)}
        />
        <Field
          label="City"
          value={addressForm.city}
          placeholder="Mumbai, Maharashtra"
          onChange={(value) => onUpdate('city', value)}
        />
      </div>
      {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
      />
    </div>
  )
}
