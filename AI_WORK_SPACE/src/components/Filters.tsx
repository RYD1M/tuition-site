import { useEffect, useState } from 'react'

import { CLASS_LEVELS, DISTRICTS, MODES, SUBJECTS } from '../../shared/constants'
import type { Option } from '../../shared/constants'
import { useLocale } from '../i18n'
import { IconSearch } from './icons'

export interface FilterState {
  q: string
  district: string
  subject: string
  klass: string
  mode: string
}

export const EMPTY_FILTERS: FilterState = {
  q: '',
  district: '',
  subject: '',
  klass: '',
  mode: '',
}

export function activeFilterCount(f: FilterState): number {
  return Object.values(f).filter((value) => value !== '').length
}

export function Filters({
  value,
  onChange,
}: {
  value: FilterState
  onChange: (next: FilterState) => void
}) {
  const { t, label } = useLocale()
  const [draft, setDraft] = useState(value.q)

  // Debounce typing so the list is not refetched on every keystroke.
  useEffect(() => {
    setDraft(value.q)
  }, [value.q])

  useEffect(() => {
    if (draft === value.q) return
    const timer = setTimeout(() => onChange({ ...value, q: draft }), 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch })

  const selectOptions = (list: Option[]) => (
    <>
      <option value="">{t('all')}</option>
      {list.map((item) => (
        <option key={item.key} value={item.key}>
          {label(list, item.key)}
        </option>
      ))}
    </>
  )

  return (
    <div className="filters">
      <div className="field span-all">
        <label htmlFor="filter-q">{t('filterSearch')}</label>
        <div style={{ position: 'relative' }}>
          <IconSearch
            width="17"
            height="17"
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-3)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="filter-q"
            className="input"
            style={{ paddingLeft: 34 }}
            type="search"
            placeholder={t('filterSearchPh')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="filter-district">{t('filterDistrict')}</label>
        <select
          id="filter-district"
          className="select"
          value={value.district}
          onChange={(e) => set({ district: e.target.value })}
        >
          {selectOptions(DISTRICTS)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-subject">{t('filterSubject')}</label>
        <select
          id="filter-subject"
          className="select"
          value={value.subject}
          onChange={(e) => set({ subject: e.target.value })}
        >
          {selectOptions(SUBJECTS)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-class">{t('filterClass')}</label>
        <select
          id="filter-class"
          className="select"
          value={value.klass}
          onChange={(e) => set({ klass: e.target.value })}
        >
          {selectOptions(CLASS_LEVELS)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-mode">{t('filterMode')}</label>
        <select
          id="filter-mode"
          className="select"
          value={value.mode}
          onChange={(e) => set({ mode: e.target.value })}
        >
          {selectOptions(MODES)}
        </select>
      </div>

      {activeFilterCount(value) > 0 ? (
        <div className="span-all">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChange({ ...EMPTY_FILTERS })}
          >
            {t('clearFilters')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
