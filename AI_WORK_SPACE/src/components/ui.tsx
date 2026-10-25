import type { ReactNode } from 'react'

import { useLocale } from '../i18n'

export function Badge({ status }: { status: string }) {
  const { t } = useLocale()
  const key =
    status === 'open'
      ? 'open'
      : status === 'filled'
        ? 'filled'
        : status === 'closed'
          ? 'closed'
          : status === 'accepted'
            ? 'accepted'
            : status === 'invited'
              ? 'invited'
              : status === 'rejected'
                ? 'rejected'
                : status === 'withdrawn'
                  ? 'withdrawn'
                  : 'pending'

  const labelKey = status === 'pending' ? 'statusPending' : status === 'invited' ? 'statusInvited' : status === 'accepted' ? 'statusAccepted' : status === 'rejected' ? 'statusRejected' : status === 'withdrawn' ? 'statusWithdrawn' : status === 'open' ? 'open' : status === 'filled' ? 'filled' : 'closed'

  return <span className={`badge badge-${key}`}>{t(labelKey)}</span>
}

export function Tag({ children, tone }: { children: ReactNode; tone?: 'brand' | 'gold' }) {
  return <span className={tone ? `tag tag-${tone}` : 'tag'}>{children}</span>
}

export function Tags({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="tags">
      {items.map((item) => (
        <span className="tag" key={item}>
          {item}
        </span>
      ))}
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="error-box" role="alert">
      {message}
    </div>
  )
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="notice">{children}</div>
}

export function EmptyState({
  title,
  lead,
  action,
}: {
  title: string
  lead?: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {lead ? <p>{lead}</p> : null}
      {action}
    </div>
  )
}

export function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="stack" aria-busy="true" aria-label="loading">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  )
}

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="field">
      <span className="field-label">
        {label}
        {required ? <span style={{ color: 'var(--danger)' }}> *</span> : null}
      </span>
      {children}
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  )
}

export function Chips({
  options,
  selected,
  onToggle,
  multiple = true,
}: {
  options: { key: string; text: string }[]
  selected: string[]
  onToggle: (key: string) => void
  multiple?: boolean
}) {
  return (
    <div className="chips">
      {options.map((option) => {
        const on = multiple
          ? selected.includes(option.key)
          : selected[0] === option.key
        return (
          <button
            type="button"
            key={option.key}
            className={on ? 'chip on' : 'chip'}
            aria-pressed={on}
            onClick={() => onToggle(option.key)}
          >
            {option.text}
          </button>
        )
      })}
    </div>
  )
}

export function SectionHead({ title, lead, action }: { title: string; lead?: string; action?: ReactNode }) {
  return (
    <div className="section-head row-between wrap">
      <div>
        <h2>{title}</h2>
        {lead ? <p>{lead}</p> : null}
      </div>
      {action}
    </div>
  )
}
