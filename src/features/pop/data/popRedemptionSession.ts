export interface PopRedemptionSession {
  planId: string
  giftCard: string
  value: number
}

const STORAGE_KEY = 'pos.pop.redemption'

export function readPopRedemptionSession(): PopRedemptionSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PopRedemptionSession>
    if (!parsed.planId || !parsed.giftCard || !Number.isFinite(parsed.value)) return null
    return {
      planId: String(parsed.planId),
      giftCard: String(parsed.giftCard),
      value: Number(parsed.value),
    }
  } catch {
    return null
  }
}

export function writePopRedemptionSession(session: PopRedemptionSession) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearPopRedemptionSession() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function parsePopRedemptionFromSearch(params: URLSearchParams): PopRedemptionSession | null {
  const planId = params.get('popPlan')?.trim() ?? ''
  const giftCard = params.get('giftCard')?.trim() ?? ''
  const value = Number(params.get('value'))
  if (!planId || !giftCard || !Number.isFinite(value) || value <= 0) return null
  return { planId, giftCard, value }
}

export function popRedemptionQuery(session: PopRedemptionSession) {
  const params = new URLSearchParams({
    popPlan: session.planId,
    giftCard: session.giftCard,
    value: String(session.value),
  })
  return params.toString()
}
