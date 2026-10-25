/** Builds dial and WhatsApp links from a Bangladeshi number. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function waHref(phone: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('880')) {
    // already international
  } else if (digits.startsWith('0')) {
    digits = `88${digits}`
  } else if (!digits.startsWith('88')) {
    digits = `88${digits}`
  }
  return `https://wa.me/${digits}`
}

/** Hides everything but the last four digits, for lists where a number is not yet unlocked. */
export function maskPhone(phone: string): string {
  const trimmed = phone.trim()
  if (trimmed.length <= 4) return '••••'
  return `${'•'.repeat(Math.max(4, trimmed.length - 4))}${trimmed.slice(-4)}`
}
