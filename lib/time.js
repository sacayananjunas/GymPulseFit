// "Today" is the user's local day, sent by the browser as an IANA timezone in the x-timezone header.

export function timezone(req) {
  const tz = req.headers['x-timezone']
  if (typeof tz === 'string' && tz.length < 64) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz })
      return tz
    } catch {
      /* fall through */
    }
  }
  return 'UTC'
}

// YYYY-MM-DD for the given date in the given timezone.
export function localDate(tz, date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function addDays(ymd, days) {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// Monday of the week containing ymd.
export function weekStart(ymd) {
  const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay() // 0 = Sunday
  return addDays(ymd, -((dow + 6) % 7))
}

export function weekdayShort(ymd) {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}
