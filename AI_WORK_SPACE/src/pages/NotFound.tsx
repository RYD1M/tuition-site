import { Link } from 'react-router-dom'

import { useLocale } from '../i18n'

export default function NotFound() {
  const { t } = useLocale()
  return (
    <div className="container page">
      <div className="empty">
        <h3>404</h3>
        <p>{t('noResults')}</p>
        <Link to="/" className="btn btn-primary">
          {t('brand')}
        </Link>
      </div>
    </div>
  )
}
