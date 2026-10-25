import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { RequestCard } from '../components/cards'
import { Filters, EMPTY_FILTERS } from '../components/Filters'
import type { FilterState } from '../components/Filters'
import { EmptyState, ErrorBox, Skeleton } from '../components/ui'
import { useLocale } from '../i18n'
import { apiUrl } from '../lib/api'
import { useApi } from '../lib/useApi'
import type { TuitionRequest } from '../../shared/types'

const PAGE = 12

export default function Board() {
  const { t, num } = useLocale()
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS })
  const [limit, setLimit] = useState(PAGE)

  const path = useMemo(
    () =>
      apiUrl('/api/requests', {
        q: filters.q,
        district: filters.district,
        subject: filters.subject,
        class: filters.klass,
        mode: filters.mode,
        limit: String(limit),
      }),
    [filters, limit],
  )

  const { data, error, loading } = useApi<{
    items: TuitionRequest[]
    total: number
  }>(path)

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="container page">
      <div className="section-head row-between wrap">
        <div>
          <h1>{t('boardTitle')}</h1>
          <p className="subtle">{t('boardLead')}</p>
        </div>
        <Link to="/post" className="btn btn-primary btn-sm">
          {t('navPost')}
        </Link>
      </div>

      <div className="stack" style={{ gap: 18 }}>
        <Filters value={filters} onChange={(next) => { setFilters(next); setLimit(PAGE) }} />

        {error ? <ErrorBox message={t('genericError')} /> : null}

        {loading ? (
          <Skeleton count={4} />
        ) : items.length === 0 ? (
          <EmptyState
            title={total === 0 && filters.q === '' && filters.district === '' ? t('emptyBoard') : t('noResults')}
            lead={total === 0 && filters.q === '' && filters.district === '' ? t('emptyBoardLead') : t('noResultsLead')}
            action={
              <Link to="/post" className="btn btn-primary">
                {t('heroCtaPost')}
              </Link>
            }
          />
        ) : (
          <>
            <p className="muted small" aria-live="polite">
              {num(total)}
            </p>
            <div className="grid grid-3">
              {items.map((request) => (
                <RequestCard key={request.id} request={request} />
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
