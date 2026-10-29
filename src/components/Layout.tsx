import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { DEMO_STUDENT_ID, DEMO_TEACHER_ID } from '../seed'
import { gradingQueue } from '../selectors'
import { useStore, useUser } from '../store'
import { cx } from '../utils'
import { Icon, type IconName } from './Icon'
import { useToast } from './Toast'
import { Avatar } from './ui'

export function Logo({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-fuchsia-500 to-orange-400 text-white shadow-glow">
        <Icon name="cap" />
      </span>
      <span className={cx('font-display text-2xl font-semibold', light ? 'text-white' : 'text-slate-900')}>Lectern</span>
    </div>
  )
}

export function Layout() {
  const { data } = useStore()
  const user = useUser()
  const [drawer, setDrawer] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setDrawer(false)
  }, [location.pathname])

  const myCourseIds = data.courses.filter((c) => c.teacherId === user.id).map((c) => c.id)
  const toGrade = user.role === 'teacher' ? gradingQueue(data, myCourseIds).length : 0

  const nav: { to: string; label: string; icon: IconName; badge?: number }[] =
    user.role === 'teacher'
      ? [
          { to: '/', label: 'Dashboard', icon: 'home' },
          { to: '/courses', label: 'My courses', icon: 'book' },
          { to: '/assignments', label: 'Grading', icon: 'clipboard', badge: toGrade },
          { to: '/grades', label: 'Gradebook', icon: 'chart' },
        ]
      : [
          { to: '/', label: 'Dashboard', icon: 'home' },
          { to: '/courses', label: 'Courses', icon: 'book' },
          { to: '/assignments', label: 'Assignments', icon: 'clipboard' },
          { to: '/grades', label: 'Grades', icon: 'award' },
        ]

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden bg-ink-900">
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl" />
      <div className="pattern-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative px-6 py-6">
        <Logo light />
      </div>
      <p className="relative px-6 pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">
        {user.role === 'teacher' ? 'Teaching' : 'Learning'}
      </p>
      <nav className="relative flex-1 space-y-1 px-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cx(
                'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all',
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-fuchsia-600 text-white shadow-glow'
                  : 'text-white/55 hover:bg-white/[0.06] hover:text-white',
              )
            }
          >
            <Icon name={item.icon} />
            <span className="flex-1">{item.label}</span>
            {!!item.badge && (
              <span className="rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-2 py-0.5 text-[11px] font-bold text-ink-950">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="glass relative m-4 rounded-2xl p-4 text-xs text-white/60">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-400 text-ink-950">
          <Icon name="swap" className="h-4 w-4" />
        </div>
        <p className="font-bold text-white">Demo workspace</p>
        <p className="mt-1 leading-relaxed">Sample data lives in your browser. Switch roles from the profile menu.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] lg:block">{sidebar}</aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="drawer-in absolute inset-y-0 left-0 w-[17rem]">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/70 px-4 backdrop-blur-xl sm:px-8">
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>
          <div className="hidden items-center gap-2 text-sm font-medium text-slate-500 lg:flex">
            <Icon name="calendar" className="h-4 w-4 text-brand-500" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <UserMenu />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function UserMenu() {
  const { login, logout, reset } = useStore()
  const user = useUser()
  const toast = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const other = user.role === 'teacher' ? 'student' : 'teacher'

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 rounded-full border border-slate-200/70 bg-white p-1 pr-3 shadow-sm transition hover:shadow-soft">
        <Avatar user={user} />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold text-slate-900">{user.name}</span>
          <span className="block text-xs capitalize text-slate-500">{user.role}</span>
        </span>
        <Icon name="chevronDown" className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div className="modal-in absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200/70 bg-white py-1 shadow-lift">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <MenuItem
            icon="swap"
            label={`Switch to ${other} view`}
            onClick={() => {
              login(other === 'teacher' ? DEMO_TEACHER_ID : DEMO_STUDENT_ID)
              setOpen(false)
              navigate('/')
              toast(`Now viewing as a ${other}`)
            }}
          />
          <MenuItem
            icon="refresh"
            label="Reset demo data"
            onClick={() => {
              reset()
              setOpen(false)
              toast('Demo data restored')
            }}
          />
          <MenuItem icon="logout" label="Sign out" onClick={logout} />
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
      <Icon name={icon} className="h-4 w-4 text-slate-400" />
      {label}
    </button>
  )
}
