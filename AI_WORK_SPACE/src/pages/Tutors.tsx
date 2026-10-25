import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { TutorCard } from '../components/cards'
import { EMPTY_FILTERS, Filters } from '../components/Filters'
import type { FilterState } from '../components/Filters'
import { EmptyState, ErrorBox, Skeleton } from '../components/ui'
import { useLocale } from '../i18n'
import { apiUrl } from '../lib/api'
import { useApi } from '../lib/useApi'
import type { PublicTutor } from '../../shared/types'

const PAGE = 12

export default function Tutors() {
  const { t, num } = useLocale()
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS })
  const [limit, setLimit] = useState(PAGE)

  const path = useMemo(
    () =>
      apiUrl('/api/tutors', {
        q: filters.q,
        district: filters.district,
        subject: filters.subject,
        class: filters.klass,
        mode: filters.mode,
        limit: String(limit),
      }),
    [filters, limit],
  )

  const { data, error, loading } = useApi<{ items: PublicTutor[]; total: number }>(path)
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const untouched = Object.values(filters).every((value) => value === '')

  return (
    <div className="container page">
      <div className="section-head row-between wrap">
        <div>
          <h1>{t('tutorsTitle')}</h1>
          <p className="subtle">{t('tutorsLead')}</p>
        </div>
        <Link to="/me?tab=profile" className="btn btn-ghost btn-sm">
          {t('profileTitle')}
        </Link>
      </div>

      <div className="stack" style={{ gap: 18 }}>
        <Filters value={filters} onChange={(next) => { setFilters(next); setLimit(PAGE) }} />

        {error ? <ErrorBox message={t('genericError')} /> : null}

        {loading ? (
          <Skeleton count={4} />
        ) : items.length === 0 ? (
          <EmptyState
            title={untouched && total === 0 ? t('emptyTutors') : t('noResults')}
            lead={untouched && total === 0 ? t('emptyTutorsLead') : t('noResultsLead')}
            action={
              <Link to="/me?tab=profile" className="btn btn-primary">
                {t('profileTitle')}
              </Link>
            }
          />
        ) : (
          <>
            <p className="muted small" aria-live="polite">
              {num(total)}
            </p>
            <div className="grid grid-3">
              {items.map((tutor) => (
                <TutorCard key={tutor.sub} tutor={tutor} />
              ))}
            </div>
            {items.length < total ? (
              <div className="pagination">
                <button type="button" className="btn btn-ghost" onClick={() => setLimit((n) => n + PAGE)}>
                  {t('loadMore')}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
