export type Lang = 'bn' | 'en'

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
]

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function toBanglaDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)])
}

/** Renders digits in the script of the active language. */
export function localizeDigits(value: string | number, lang: Lang): string {
  const text = String(value)
  return lang === 'bn' ? toBanglaDigits(text) : text
}

export function formatNumber(value: number, lang: Lang): string {
  return localizeDigits(value.toLocaleString('en-US'), lang)
}

/** ৳ ৫,০০০ in Bangla, ৳ 5,000 in English. */
export function formatTaka(amount: number | null | undefined, lang: Lang): string {
  if (amount === null || amount === undefined) return '—'
  return `৳ ${formatNumber(amount, lang)}`
}

export function formatDate(iso: string, lang: Lang): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const day = localizeDigits(date.getDate(), lang)
  const month = lang === 'bn' ? BN_MONTHS[date.getMonth()] : EN_MONTHS[date.getMonth()]
  const year = localizeDigits(date.getFullYear(), lang)
  return lang === 'bn' ? `${day} ${month} ${year}` : `${day} ${month} ${year}`
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "৩ দিন আগে" / "3 days ago". */
export function timeAgo(iso: string, lang: Lang): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then

  if (diff < MINUTE) return lang === 'bn' ? 'এইমাত্র' : 'just now'
  if (diff < HOUR) {
    const n = Math.floor(diff / MINUTE)
    return lang === 'bn'
      ? `${localizeDigits(n, lang)} মিনিট আগে`
      : `${n} min ago`
  }
  if (diff < DAY) {
    const n = Math.floor(diff / HOUR)
    return lang === 'bn' ? `${localizeDigits(n, lang)} ঘণ্টা আগে` : `${n} hr ago`
  }
  if (diff < 30 * DAY) {
    const n = Math.floor(diff / DAY)
    return lang === 'bn' ? `${localizeDigits(n, lang)} দিন আগে` : `${n} days ago`
  }
  return formatDate(iso, lang)
}
