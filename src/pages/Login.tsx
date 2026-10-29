import { Icon, type IconName } from '../components/Icon'
import { Logo } from '../components/Layout'
import { Avatar, ProgressRing } from '../components/ui'
import { DEMO_STUDENT_ID, DEMO_TEACHER_ID } from '../seed'
import { userById } from '../selectors'
import { useStore } from '../store'

const features: [IconName, string][] = [
  ['book', 'Courses & lessons'],
  ['clipboard', 'Assignments & grading'],
  ['chart', 'Gradebook & CSV export'],
  ['message', 'Class discussion'],
]

export default function Login() {
  const { data, login } = useStore()
  const teacher = userById(data, DEMO_TEACHER_ID)!
  const student = userById(data, DEMO_STUDENT_ID)!

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col">
        <div className="blob absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-600/50 blur-3xl" />
        <div className="blob absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-fuchsia-500/30 blur-3xl" style={{ animationDelay: '-6s' }} />
        <div className="blob absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-orange-400/25 blur-3xl" style={{ animationDelay: '-10s' }} />
        <div className="pattern-grid absolute inset-0" />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative my-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Learning management, reimagined</p>
          <h1 className="mt-4 max-w-lg font-display text-5xl font-semibold leading-[1.08]">
            Where great{' '}
            <span className="bg-gradient-to-r from-brand-200 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">teaching</span>{' '}
            meets eager learning.
          </h1>
          <p className="mt-5 max-w-md text-white/60">
            Courses, assignments, grading and class discussion in one beautiful workspace for teachers and students.
          </p>
          <div className="mt-8 flex max-w-lg flex-wrap gap-2">
            {features.map(([icon, label]) => (
              <span key={label} className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-white/85">
                <Icon name={icon} className="h-4 w-4 text-fuchsia-200" />
                {label}
              </span>
            ))}
          </div>

          {/* Floating preview cards */}
          <div className="relative mt-14 h-44 max-w-lg">
            <div className="glass float absolute left-0 top-0 w-64 rounded-2xl p-4 shadow-2xl shadow-black/30">
              <div className="flex items-center gap-3">
                <ProgressRing id="login-ring" value={92} size={56} stroke={6} track="stroke-white/10" textClass="text-sm text-white" />
                <div>
                  <p className="text-sm font-bold">Persona & journey map</p>
                  <p className="text-xs text-white/60">Graded · 28/30 · A</p>
                </div>
              </div>
            </div>
            <div className="glass float-delay absolute right-0 top-16 w-60 rounded-2xl p-4 shadow-2xl shadow-black/30">
              <p className="text-xs font-semibold text-white/60">WEB101 · Lesson progress</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-400 via-fuchsia-400 to-orange-300" />
              </div>
              <p className="mt-2 text-sm font-bold">4 of 6 complete</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Lectern · Portfolio demo</p>
      </div>

      <div className="relative flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="relative w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Interactive demo</p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-3 text-slate-500">
            Choose a role to explore. Each one has its own dashboard and permissions, and you can switch at any time.
          </p>

          <div className="mt-8 space-y-4">
            <RoleCard
              title="Continue as a teacher"
              text="Create courses, set assignments, grade and track class progress."
              name={teacher.name}
              icon="clipboard"
              onClick={() => login(teacher.id)}
              avatar={<Avatar user={teacher} size="lg" />}
            />
            <RoleCard
              title="Continue as a student"
              text="Work through lessons, submit assignments and follow your grades."
              name={student.name}
              icon="cap"
              onClick={() => login(student.id)}
              avatar={<Avatar user={student} size="lg" />}
            />
          </div>

          <p className="mt-8 flex items-start gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-xs leading-relaxed text-slate-500 backdrop-blur">
            <Icon name="alert" className="mt-px h-4 w-4 shrink-0 text-brand-500" />
            All names and data are fictional, and changes are saved only in your browser.
          </p>
        </div>
      </div>
    </div>
  )
}

function RoleCard({ title, text, name, avatar, icon, onClick }: { title: string; text: string; name: string; avatar: React.ReactNode; icon: IconName; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-2xl bg-gradient-to-r from-slate-200/80 to-slate-200/80 p-px text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-500 hover:via-fuchsia-500 hover:to-orange-400 hover:shadow-lift"
    >
      <span className="flex items-center gap-4 rounded-[15px] bg-white p-5">
        <span className="relative">
          {avatar}
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white ring-2 ring-white">
            <Icon name={icon} className="h-3 w-3" />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-slate-900">{title}</span>
          <span className="block text-xs font-medium text-brand-600">as {name}</span>
          <span className="mt-1 block text-sm text-slate-500">{text}</span>
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition group-hover:bg-gradient-to-br group-hover:from-brand-600 group-hover:to-fuchsia-600 group-hover:text-white">
          <Icon name="chevronRight" className="h-4 w-4" />
        </span>
      </span>
    </button>
  )
}
