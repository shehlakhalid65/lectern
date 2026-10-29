import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GradeModal, SubmitModal } from '../components/AssignmentModals'
import { Icon } from '../components/Icon'
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, ProgressBar, ProgressRing, StatCard, StatusBadge } from '../components/ui'
import {
  assignmentStatus,
  courseAverage,
  courseById,
  courseCompletion,
  coursesFor,
  gradingQueue,
  isLate,
  lessonProgress,
  studentAverage,
  submissionFor,
  userById,
} from '../selectors'
import { useStore, useUser } from '../store'
import type { Assignment, Course, Lesson, Submission } from '../types'
import { courseTheme, daysUntil, dueLabel, fmtDate, gradeTone, greeting, letterGrade, timeAgo } from '../utils'

export default function Dashboard() {
  return useUser().role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />
}

function Hero({
  eyebrow,
  greetingText,
  name,
  subtitle,
  actions,
  ring,
  ringLabel,
  chips,
}: {
  eyebrow: string
  greetingText: string
  name: string
  subtitle: string
  actions: React.ReactNode
  ring: number | null
  ringLabel: string
  chips: string[]
}) {
  return (
    <section className="fade-up relative mb-6 overflow-hidden rounded-[1.75rem] bg-ink-900 px-6 py-8 text-white shadow-lift sm:px-10 sm:py-10">
      <div className="blob pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-brand-600/50 blur-3xl" />
      <div className="blob pointer-events-none absolute right-10 top-0 h-64 w-64 rounded-full bg-fuchsia-500/35 blur-3xl" style={{ animationDelay: '-5s' }} />
      <div className="blob pointer-events-none absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-orange-400/25 blur-3xl" style={{ animationDelay: '-9s' }} />
      <div className="pattern-grid pointer-events-none absolute inset-0" />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-[2.6rem]">
            {greetingText},{' '}
            <span className="bg-gradient-to-r from-brand-200 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">{name}</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/65">{subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
        </div>

        <div className="glass float flex items-center gap-5 self-start rounded-3xl p-5 md:self-auto">
          <ProgressRing id="hero-ring" value={ring} size={108} stroke={10} track="stroke-white/10" textClass="text-2xl text-white" />
          <div>
            <p className="text-sm font-semibold text-white">{ringLabel}</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {chips.map((c) => (
                <span key={c} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-300 to-orange-300" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TeacherDashboard() {
  const { data } = useStore()
  const user = useUser()
  const [grading, setGrading] = useState<Submission | null>(null)

  const courses = coursesFor(data, user)
  const courseIds = courses.map((c) => c.id)
  const queue = gradingQueue(data, courseIds)
  const students = new Set(courses.flatMap((c) => c.studentIds))
  const avgs = courses.map((c) => courseAverage(data, c)).filter((v): v is number => v !== null)
  const overall = avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null
  const upcoming = data.assignments
    .filter((a) => courseIds.includes(a.courseId) && new Date(a.dueAt).getTime() > Date.now())
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 5)

  return (
    <>
      <Hero
        eyebrow="Teacher workspace"
        greetingText={greeting()}
        name={`${user.name.split(' ')[0]} ${user.name.split(' ').at(-1)}`}
        subtitle={queue.length ? `You have ${queue.length} submissions waiting for feedback. Your students are ready to hear from you.` : 'You are all caught up on grading. Nice work!'}
        actions={
          <>
            <Link to="/assignments"><Button variant="light" icon="clipboard">Open grading queue</Button></Link>
            <Link to="/grades"><button className="glass inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition hover:bg-white/20">Gradebook</button></Link>
          </>
        }
        ring={overall}
        ringLabel="Class average"
        chips={[`${courses.length} courses`, `${students.size} students`]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active courses" value={courses.length} icon="book" tone="violet" />
        <StatCard label="Students" value={students.size} hint="Unique across your courses" icon="users" tone="sky" />
        <StatCard label="To grade" value={queue.length} hint={queue[0] ? `Oldest from ${fmtDate(queue[0].submittedAt)}` : undefined} icon="clipboard" tone="amber" />
        <StatCard label="Class average" value={overall === null ? '–' : `${overall}%`} hint="Across graded work" icon="award" tone="emerald" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Needs grading" action={<Link to="/assignments" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>} />
          {queue.length === 0 ? (
            <EmptyState icon="check" title="All caught up" text="New submissions will show up here." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {queue.slice(0, 6).map((s) => {
                const a = data.assignments.find((x) => x.id === s.assignmentId)!
                const student = userById(data, s.studentId)!
                const course = courseById(data, a.courseId)!
                return (
                  <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar user={student} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{student.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        <span className={courseTheme[course.color].text}>{course.code}</span> · {a.title}
                      </p>
                    </div>
                    <div className="hidden text-right text-xs text-slate-500 sm:block">
                      {timeAgo(s.submittedAt)}
                      {isLate(data, s.submittedAt, a.id) && <span className="ml-1.5 font-medium text-rose-600">Late</span>}
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setGrading(s)}>Grade</Button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Upcoming deadlines" />
          {upcoming.length === 0 ? (
            <EmptyState icon="calendar" title="Nothing scheduled" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((a) => {
                const course = courseById(data, a.courseId)!
                const submitted = course.studentIds.filter((sid) => submissionFor(data, a.id, sid)).length
                return (
                  <li key={a.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{a.title}</p>
                        <p className="text-xs text-slate-500">{course.code} · {dueLabel(a.dueAt)}</p>
                      </div>
                      <span className="whitespace-nowrap text-xs text-slate-500">{submitted}/{course.studentIds.length}</span>
                    </div>
                    <ProgressBar className="mt-2 h-1.5" value={course.studentIds.length ? (submitted / course.studentIds.length) * 100 : 0} color={courseTheme[course.color].bar} />
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Course performance" action={<Link to="/grades" className="text-sm font-medium text-brand-600 hover:text-brand-700">Gradebook</Link>} />
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => {
            const avg = courseAverage(data, c)
            const completion = courseCompletion(data, c)
            return (
              <Link key={c.id} to={`/courses/${c.id}`} className="bg-white p-5 hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${courseTheme[c.color].dot}`} />
                  <span className="text-xs font-semibold text-slate-500">{c.code}</span>
                </div>
                <p className="mt-1 truncate font-medium text-slate-900">{c.title}</p>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <div className="mb-1 flex justify-between text-slate-500"><span>Average grade</span><span className={avg === null ? '' : `font-semibold ${gradeTone(avg)}`}>{avg === null ? '–' : `${avg}%`}</span></div>
                    <ProgressBar value={avg ?? 0} color={courseTheme[c.color].bar} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-slate-500"><span>Lesson completion</span><span className="font-semibold text-slate-700">{completion}%</span></div>
                    <ProgressBar value={completion} color="bg-slate-400" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Card>

      <GradeModal submission={grading} onClose={() => setGrading(null)} />
    </>
  )
}

function StudentDashboard() {
  const { data } = useStore()
  const user = useUser()
  const [open, setOpen] = useState<Assignment | null>(null)

  const courses = coursesFor(data, user)
  const courseIds = courses.map((c) => c.id)
  const myAssignments = data.assignments.filter((a) => courseIds.includes(a.courseId))
  const dueSoon = myAssignments
    .filter((a) => {
      const s = assignmentStatus(data, a, user.id)
      return s === 'missing' || (s === 'todo' && daysUntil(a.dueAt) <= 14)
    })
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const dueThisWeek = myAssignments.filter((a) => assignmentStatus(data, a, user.id) === 'todo' && daysUntil(a.dueAt) <= 7).length
  const recentGrades = data.submissions
    .filter((s) => s.studentId === user.id && s.gradedAt)
    .sort((a, b) => b.gradedAt!.localeCompare(a.gradedAt!))
    .slice(0, 4)
  const overall = studentAverage(data, user.id)
  const lessonsDone = courses.reduce((n, c) => n + lessonProgress(data, user.id, c.id).done, 0)
  const lessonsTotal = courses.reduce((n, c) => n + lessonProgress(data, user.id, c.id).total, 0)
  const resume = courses
    .map((course) => ({ course, lesson: lessonProgress(data, user.id, course.id).next }))
    .find((r): r is { course: Course; lesson: Lesson } => !!r.lesson)

  return (
    <>
      <Hero
        eyebrow="Student workspace"
        greetingText={greeting()}
        name={user.name.split(' ')[0]}
        subtitle={dueThisWeek ? `You have ${dueThisWeek} assignment${dueThisWeek > 1 ? 's' : ''} due this week. Keep the momentum going!` : 'Nothing due this week. A great time to get ahead on your lessons.'}
        actions={
          resume ? (
            <Link to={`/courses/${resume.course.id}/lessons/${resume.lesson.id}`}>
              <Button variant="light" icon="chevronRight">Resume: {resume.lesson.title}</Button>
            </Link>
          ) : (
            <Link to="/courses"><Button variant="light">Browse courses</Button></Link>
          )
        }
        ring={overall}
        ringLabel={overall === null ? 'Average' : `Average · ${letterGrade(overall)}`}
        chips={[`${lessonsDone}/${lessonsTotal} lessons`, `${courses.length} courses`]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolled courses" value={courses.length} icon="book" tone="violet" />
        <StatCard label="Due this week" value={dueThisWeek} icon="calendar" tone="amber" />
        <StatCard label="Overall average" value={overall === null ? '–' : `${overall}%`} hint={overall === null ? undefined : `Grade ${letterGrade(overall)}`} icon="award" tone="emerald" />
        <StatCard label="Lessons completed" value={`${lessonsDone}/${lessonsTotal}`} icon="check" tone="sky" />
      </div>

      <h2 className="mb-4 mt-9 font-display text-2xl font-semibold text-slate-900">Continue learning</h2>
      {courses.length === 0 ? (
        <Card><EmptyState icon="book" title="You're not enrolled in any courses" action={<Link to="/courses"><Button>Browse courses</Button></Link>} /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {courses.map((c) => {
            const p = lessonProgress(data, user.id, c.id)
            return (
              <Card key={c.id} className="fade-up group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                <div className={`relative h-20 bg-gradient-to-br ${courseTheme[c.color].cover}`}>
                  <div className="pattern-dots absolute inset-0" />
                  <span className="glass absolute left-4 top-4 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white">{c.code}</span>
                  <Icon name="cap" className="absolute -bottom-2 right-3 h-16 w-16 text-white/20 transition group-hover:rotate-6 group-hover:scale-110" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <Link to={`/courses/${c.id}`} className="font-bold text-slate-900 hover:text-brand-700">{c.title}</Link>
                  <div className="mt-auto pt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                      <span>{p.done} of {p.total} lessons</span>
                      <span className="font-semibold text-slate-700">{p.pct}%</span>
                    </div>
                    <ProgressBar value={p.pct} color={courseTheme[c.color].bar} />
                    {p.next ? (
                      <Link to={`/courses/${c.id}/lessons/${p.next.id}`} className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                        <Icon name="chevronRight" className="h-4 w-4 text-brand-600" />
                        <span className="truncate">Next: {p.next.title}</span>
                      </Link>
                    ) : (
                      <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        <Icon name="check" className="h-4 w-4" /> All lessons complete
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader title="Due soon" action={<Link to="/assignments" className="text-sm font-medium text-brand-600 hover:text-brand-700">All assignments</Link>} />
          {dueSoon.length === 0 ? (
            <EmptyState icon="check" title="You're all caught up" text="No pending assignments in the next two weeks." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {dueSoon.map((a) => {
                const course = courseById(data, a.courseId)!
                const status = assignmentStatus(data, a, user.id)
                return (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${courseTheme[course.color].soft} ${courseTheme[course.color].text}`}>
                      <Icon name="file" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{a.title}</p>
                      <p className="text-xs text-slate-500">{course.code} · {dueLabel(a.dueAt)}</p>
                    </div>
                    <span className="hidden sm:inline-flex"><StatusBadge status={status} /></span>
                    <Button size="sm" variant={status === 'missing' ? 'secondary' : 'primary'} onClick={() => setOpen(a)}>
                      {status === 'missing' ? 'Submit late' : 'Submit'}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent grades" action={<Link to="/grades" className="text-sm font-medium text-brand-600 hover:text-brand-700">All grades</Link>} />
          {recentGrades.length === 0 ? (
            <EmptyState icon="award" title="No grades yet" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentGrades.map((s) => {
                const a = data.assignments.find((x) => x.id === s.assignmentId)!
                const course = courseById(data, a.courseId)!
                const pct = Math.round((s.score! / a.points) * 100)
                return (
                  <li key={s.id}>
                    <button onClick={() => setOpen(a)} className="flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-slate-50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-900">{a.title}</p>
                          <Badge className="bg-slate-100 text-slate-600">{course.code}</Badge>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">"{s.feedback}"</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${gradeTone(pct)}`}>{s.score}/{a.points}</p>
                        <p className="text-xs text-slate-400">{pct}%</p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      <SubmitModal assignment={open} onClose={() => setOpen(null)} />
    </>
  )
}
