// Ordering contact details from the live site's cart in index.html (main, c41bf50).
// The live site sends collection orders to WhatsApp and offers a phone call.
export const orderContact = {
  whatsappNumber: '447576113811',
  phoneHref: 'tel:07576113811',
  phoneLabel: '07576 113811',
  closingLine: 'Collection order — please confirm. Thank you!',
  address: 'Brent South Shopping Park, London',
  mapUrl: 'https://maps.app.goo.gl/PyK18iuU76q4QAqD8',
  // Opening hours from the live site's header (Europe/London time).
  // Day 0 is Sunday. Times are minutes after midnight.
  hours: [
    { days: [1, 2, 3, 4, 5, 6], label: 'Mon–Sat', open: 11 * 60, close: 20 * 60 },
    { days: [0], label: 'Sun', open: 11 * 60, close: 18 * 60 },
  ],
};

const clock = minutes => {
  const hour = Math.floor(minutes / 60)
  const suffix = hour >= 12 ? 'pm' : 'am'
  const minute = minutes % 60
  return ((hour + 11) % 12 + 1) + (minute ? ':' + String(minute).padStart(2, '0') : '') + suffix
};

export const formatHours = ({ label, open, close }) => label + ' ' + clock(open) + '–' + clock(close);

// "Open now until 8pm" or "Closed · opens 11am tomorrow", in London time.
export function openingStatus(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(now).map(({ type, value }) => [type, value]))
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday)
  const minutes = Number(parts.hour) * 60 + Number(parts.minute)
  const today = orderContact.hours.find(({ days }) => days.includes(day))
  if (today && minutes >= today.open && minutes < today.close) {
    return { open: true, text: 'Open now until ' + clock(today.close) }
  }
  for (let ahead = minutes < (today?.open ?? 0) ? 0 : 1; ahead < 8; ahead++) {
    const next = orderContact.hours.find(({ days }) => days.includes((day + ahead) % 7))
    if (!next) continue
    const when = ahead === 0 ? 'today' : ahead === 1 ? 'tomorrow' :
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][(day + ahead) % 7]
    return { open: false, text: 'Closed now · opens ' + clock(next.open) + ' ' + when }
  }
  return { open: false, text: 'Closed now' }
}
