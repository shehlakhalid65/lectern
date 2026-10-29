import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { AssignmentStatus, User } from '../types'
import { avatarColor, cx, initials } from '../utils'
import { Icon, type IconName } from './Icon'

export function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7 w-7 text-[11px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' }
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-2 ring-white',
        sizes[size],
        avatarColor(user.id),
      )}
      title={user.name}
    >
      {initials(user.name)}
    </span>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-2xl border border-slate-200/70 bg-white shadow-soft', className)}>{children}</div>
}

export function CardHeader({ title, action, icon }: { title: string; action?: ReactNode; icon?: IconName }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
      <h2 className="flex items-center gap-2 font-bold text-slate-900">
        {icon && <Icon name={icon} className="h-[18px] w-[18px] text-brand-500" />}
        {title}
      </h2>
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, action, eyebrow }: { title: string; subtitle?: ReactNode; action?: ReactNode; eyebrow?: string }) {
  return (
    <div className="fade-up mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold text-slate-900 sm:text-[2.15rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'light'
  size?: 'sm' | 'md'
  icon?: IconName
}) {
  const variants = {
    primary:
      'bg-gradient-to-r from-brand-600 to-fuchsia-600 text-white shadow-glow hover:brightness-110 hover:-translate-y-px disabled:from-brand-200 disabled:to-brand-200 disabled:shadow-none disabled:translate-y-0',
    secondary: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'text-rose-600 hover:bg-rose-50',
    light: 'bg-white text-slate-900 shadow-lg shadow-black/10 hover:-translate-y-px hover:bg-white/90',
  }
  const sizes = { sm: 'h-8 px-3.5 text-xs gap-1.5', md: 'h-10 px-5 text-sm gap-2' }
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-150 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
    </button>
  )
}

export function ProgressBar({ value, color = 'bg-gradient-to-r from-brand-500 to-fuchsia-500', className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cx('h-2 overflow-hidden rounded-full bg-slate-100', className)}>
      <div className={cx('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

/** Circular progress with a gradient stroke. */
export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  label,
  track = 'stroke-slate-100',
  textClass = 'text-slate-900',
  id,
}: {
  value: number | null
  size?: number
  stroke?: number
  label?: ReactNode
  track?: string
  textClass?: string
  id: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="55%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={track} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.2,0.7,0.2,1)' }}
        />
      </svg>
      <span className={cx('absolute text-center font-bold leading-none', textClass)}>
        {label ?? (value === null ? '–' : `${value}%`)}
      </span>
    </div>
  )
}

const statusStyles: Record<AssignmentStatus, [string, string]> = {
  todo: ['To do', 'bg-slate-100 text-slate-600 ring-slate-200'],
  submitted: ['Submitted', 'bg-sky-50 text-sky-700 ring-sky-200'],
  graded: ['Graded', 'bg-emerald-50 text-emerald-700 ring-emerald-200'],
  missing: ['Missing', 'bg-rose-50 text-rose-700 ring-rose-200'],
}

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  const [label, style] = statusStyles[status]
  return (
    <Badge className={cx('ring-1 ring-inset', style)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </Badge>
  )
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}>
      {children}
    </span>
  )
}

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-fuchsia-50 text-brand-500 ring-1 ring-brand-100">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="font-bold text-slate-800">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

const statTones = {
  violet: 'from-brand-500 to-fuchsia-500 shadow-brand-500/30',
  sky: 'from-sky-400 to-blue-500 shadow-sky-500/30',
  amber: 'from-amber-400 to-orange-500 shadow-orange-500/30',
  emerald: 'from-emerald-400 to-teal-500 shadow-emerald-500/30',
}

export function StatCard({ label, value, hint, icon, tone }: { label: string; value: ReactNode; hint?: string; icon: IconName; tone: keyof typeof statTones }) {
  return (
    <Card className="fade-up group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className={cx('absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.08] transition group-hover:opacity-[0.14]', statTones[tone])} />
      <div className="relative flex items-center gap-4">
        <span className={cx('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', statTones[tone])}>
          <Icon name={icon} className="h-[22px] w-[22px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
        </div>
      </div>
    </Card>
  )
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="inline-flex gap-1 rounded-full border border-slate-200/70 bg-white p-1 shadow-soft">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cx(
              'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all',
              value === t.id
                ? 'bg-ink-900 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cx('rounded-full px-1.5 text-[11px] font-bold', value === t.id ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500')}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('input, textarea, select')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'modal-in relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="h-1 bg-gradient-to-r from-brand-500 via-fuchsia-500 to-orange-400" />
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 className="font-display text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100'
