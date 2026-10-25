import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { optionLabel } from '../../shared/constants'
import type { Option } from '../../shared/constants'
import { formatDate, formatNumber, formatTaka, timeAgo, localizeDigits } from '../lib/format'
import type { Lang } from '../lib/format'
import { bn, en } from './strings'
import type { Key } from './strings'

const DICT: Record<Lang, Record<Key, string>> = { bn, en }
const STORAGE_KEY = 'tuitionlink.lang'

interface LocaleContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: Key) => string
  /** Label for a taxonomy key, e.g. a subject or district name. */
  label: (list: Option[], key: string) => string
  labels: (list: Option[], keys: string[]) => string[]
  money: (amount: number | null | undefined) => string
  num: (value: number) => string
  date: (iso: string) => string
  ago: (iso: string) => string
  digits: (value: string | number) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'bn' || stored === 'en') return stored
  } catch {
    /* storage unavailable: fall through to Bangla */
  }
  return 'bn'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title =
      lang === 'bn'
        ? 'টিউশনলিংক — বিনামূল্যে টিউশন খুঁজুন | TuitionLink BD'
        : 'TuitionLink BD — find tuition free in Bangladesh'
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => DICT[lang][key],
      label: (list, key) => optionLabel(list, key, lang),
      labels: (list, keys) =>
        keys.map((key) => optionLabel(list, key, lang)).filter((text, i) => text !== keys[i]),
      money: (amount) => formatTaka(amount, lang),
      num: (n) => formatNumber(n, lang),
      date: (iso) => formatDate(iso, lang),
      ago: (iso) => timeAgo(iso, lang),
      digits: (v) => localizeDigits(v, lang),
    }),
    [lang, setLang],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}
