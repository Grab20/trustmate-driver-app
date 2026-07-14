export type PaymentRecord = { weeksElapsed: number; weeksOnTime: number }

// Weeks paid on time since the rental started, clamped to what's actually been
// tracked (ontimePayments can't exceed weeks elapsed or the driver's total logged
// payment events, whichever is smaller — avoids overstating a partial week).
export function computePaymentRecord(
  matchedAt: string | null,
  ontimePayments: number | null,
): PaymentRecord | null {
  if (!matchedAt) return null

  const weeksElapsed = Math.max(1, Math.floor((Date.now() - new Date(matchedAt).getTime()) / (7 * 24 * 60 * 60 * 1000)))
  const weeksOnTime = Math.min(ontimePayments ?? 0, weeksElapsed)

  return { weeksElapsed, weeksOnTime }
}
