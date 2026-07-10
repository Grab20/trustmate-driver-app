const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Given a weekday name ("Monday") and a time ("08:00"), returns the next upcoming
// occurrence of that weekday/time from now (today counts if the time hasn't passed yet).
export function getNextOccurrence(dayName: string | null, timeStr: string | null): Date | null {
  if (!dayName) return null
  const targetDay = WEEKDAYS.findIndex((d) => d.toLowerCase() === dayName.toLowerCase())
  if (targetDay === -1) return null

  const [hours, minutes] = (timeStr ?? '08:00').split(':').map(Number)
  const now = new Date()
  const result = new Date(now)
  result.setHours(hours || 0, minutes || 0, 0, 0)

  let daysUntil = (targetDay - now.getDay() + 7) % 7
  if (daysUntil === 0 && result.getTime() <= now.getTime()) daysUntil = 7
  result.setDate(now.getDate() + daysUntil)
  return result
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function getRentalWeekNumber(matchedAt: string | null): number | null {
  if (!matchedAt) return null
  const start = new Date(matchedAt).getTime()
  const now = Date.now()
  if (now < start) return 1
  return Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)) + 1
}
