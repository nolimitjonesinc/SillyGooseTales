import { fromZonedTime, toZonedTime } from 'date-fns-tz'

const SLOT_HOURS: Record<string, number> = {
  morning: 7,
  afternoon: 15,
  evening: 19
}

const DAY_INDICES: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6
}

// Returns the next UTC delivery datetime for a subscriber
export function calculateNextDeliveryAt(
  timezone: string,
  deliveryDay: string,
  deliverySlot: string
): Date {
  const targetDayIndex = DAY_INDICES[deliveryDay.toLowerCase()] ?? 1
  const targetHour = SLOT_HOURS[deliverySlot.toLowerCase()] ?? 19

  const nowUtc = new Date()
  const nowLocal = toZonedTime(nowUtc, timezone)

  // Find next occurrence of the target day
  const currentDay = nowLocal.getDay()
  let daysUntil = targetDayIndex - currentDay
  if (daysUntil < 0) daysUntil += 7
  // If it's the same day but the hour has passed, schedule for next week
  if (daysUntil === 0 && nowLocal.getHours() >= targetHour) daysUntil = 7

  const localDelivery = new Date(nowLocal)
  localDelivery.setDate(localDelivery.getDate() + daysUntil)
  localDelivery.setHours(targetHour, 0, 0, 0)

  return fromZonedTime(localDelivery, timezone)
}

// Returns true if this subscriber is due for story generation in the next 24h
export function isDueInNext24Hours(nextDeliveryAt: string): boolean {
  const delivery = new Date(nextDeliveryAt)
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  return delivery >= now && delivery <= in24h
}
