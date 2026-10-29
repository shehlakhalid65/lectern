import type { CourseColor } from './types'

export const DAY = 86_400_000

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return fmtDate(iso)
}

/** Whole calendar days from today until the given date (negative = past). */
export function daysUntil(iso: string) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - start.getTime()) / DAY)
}

export function dueLabel(iso: string) {
  const d = daysUntil(iso)
  if (new Date(iso).getTime() < Date.now()) {
    return d === 0 ? 'Was due today' : `Was due ${fmtDate(iso)}`
  }
  if (d === 0) return 'Due today'
  if (d === 1) return 'Due tomorrow'
  if (d < 7) return `Due in ${d} days`
  return `Due ${fmtDate(iso)}`
}

export function letterGrade(pct: number) {
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

export function gradeTone(pct: number) {
  if (pct >= 85) return 'text-emerald-600'
  if (pct >= 70) return 'text-amber-600'
  return 'text-rose-600'
}

export function initials(name: string) {
  return name
    .replace(/^(Dr\.|Prof\.)\s+/, '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Full class names so Tailwind can see them at build time.
export const courseTheme: Record<
  CourseColor,
  { cover: string; soft: string; text: string; bar: string; dot: string }
> = {
  indigo: { cover: 'from-indigo-500 via-violet-500 to-purple-600', soft: 'bg-indigo-50', text: 'text-indigo-700', bar: 'bg-gradient-to-r from-indigo-500 to-violet-500', dot: 'bg-indigo-500' },
  emerald: { cover: 'from-emerald-400 via-teal-500 to-cyan-600', soft: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-gradient-to-r from-emerald-400 to-teal-500', dot: 'bg-emerald-500' },
  amber: { cover: 'from-amber-400 via-orange-500 to-rose-500', soft: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-gradient-to-r from-amber-400 to-orange-500', dot: 'bg-amber-500' },
  rose: { cover: 'from-rose-400 via-pink-500 to-fuchsia-600', soft: 'bg-rose-50', text: 'text-rose-700', bar: 'bg-gradient-to-r from-rose-400 to-pink-500', dot: 'bg-rose-500' },
  sky: { cover: 'from-sky-400 via-blue-500 to-indigo-600', soft: 'bg-sky-50', text: 'text-sky-700', bar: 'bg-gradient-to-r from-sky-400 to-blue-500', dot: 'bg-sky-500' },
  violet: { cover: 'from-violet-500 via-fuchsia-500 to-pink-500', soft: 'bg-violet-50', text: 'text-violet-700', bar: 'bg-gradient-to-r from-violet-500 to-fuchsia-500', dot: 'bg-violet-500' },
}

const avatarColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
]

export function avatarColor(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return avatarColors[h % avatarColors.length]
}
