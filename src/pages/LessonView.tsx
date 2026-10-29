import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { Button, Card, ProgressBar } from '../components/ui'
import { courseById, courseLessons, lessonProgress } from '../selectors'
import { useStore, useUser } from '../store'
import { courseTheme, cx } from '../utils'

export default function LessonView() {
  const { courseId, lessonId } = useParams()
  const { data, toggleLesson } = useStore()
  const user = useUser()
  const toast = useToast()
  const navigate = useNavigate()
  const course = courseById(data, courseId!)
  const lessons = course ? courseLessons(data, course.id) : []
  const index = lessons.findIndex((l) => l.id === lessonId)

  const canView = course && (user.role === 'teacher' ? course.teacherId === user.id : course.studentIds.includes(user.id))
  if (!course || !canView) return <Navigate to="/courses" replace />
  if (index === -1) return <Navigate to={`/courses/${course.id}`} replace />

  const lesson = lessons[index]
  const prev = lessons[index - 1]
  const next = lessons[index + 1]
  const isStudent = user.role === 'student'
  const done = new Set(data.completed[user.id] ?? [])
  const complete = done.has(lesson.id)
  const progress = isStudent ? lessonProgress(data, user.id, course.id) : null
  const theme = courseTheme[course.color]

  const completeAndContinue = () => {
    if (!complete) {
      toggleLesson(lesson.id)
      toast(next ? 'Lesson complete' : 'Course lessons complete. Well done!')
    }
    navigate(next ? `/courses/${course.id}/lessons/${next.id}` : `/courses/${course.id}`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
          <Link to="/courses" className="hover:text-slate-800">Courses</Link>
          <Icon name="chevronRight" className="h-3.5 w-3.5" />
          <Link to={`/courses/${course.id}`} className="truncate hover:text-slate-800">{course.code}</Link>
          <Icon name="chevronRight" className="h-3.5 w-3.5" />
          <span className="truncate text-slate-800">Lesson {index + 1}</span>
        </nav>

        <Card className="overflow-hidden">
          <div className={`relative overflow-hidden bg-gradient-to-br ${theme.cover} px-6 py-10 text-white sm:px-10`}>
            <div className="pattern-dots absolute inset-0" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
            <p className="relative text-xs font-bold uppercase tracking-[0.16em] opacity-80">Lesson {index + 1} of {lessons.length}</p>
            <h1 className="relative mt-2 font-display text-3xl font-semibold sm:text-4xl">{lesson.title}</h1>
            <p className="relative mt-3 flex items-center gap-1.5 text-sm opacity-90">
              <Icon name="clock" className="h-4 w-4" /> {lesson.minutes} min read
              {complete && (
                <span className="ml-3 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                  <Icon name="check" className="h-3.5 w-3.5" /> Completed
                </span>
              )}
            </p>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8">
            <p className="text-lg leading-relaxed text-slate-700">{lesson.summary}</p>

            {lesson.keyPoints.length > 0 && (
              <section>
                <h2 className="mb-3 font-semibold text-slate-900">What you'll learn</h2>
                <ul className="space-y-2.5">
                  {lesson.keyPoints.map((p) => (
                    <li key={p} className="flex gap-3 text-slate-700">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${theme.soft} ${theme.text}`}>
                        <Icon name="check" className="h-3 w-3" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/60 to-fuchsia-50/40 p-5">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <Icon name="target" className="h-5 w-5 text-brand-600" /> Check your understanding
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Before moving on, try to explain {lesson.keyPoints.length ? `"${lesson.keyPoints[0].toLowerCase()}"` : 'the main idea of this lesson'} in your own words.
                If you get stuck, re-read the summary or ask in the course discussion.
              </p>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 sm:px-8">
            {prev ? (
              <Link to={`/courses/${course.id}/lessons/${prev.id}`}>
                <Button variant="ghost" icon="chevronLeft">Previous</Button>
              </Link>
            ) : (
              <span />
            )}
            {isStudent ? (
              <div className="flex gap-2">
                {complete && (
                  <Button variant="secondary" onClick={() => toggleLesson(lesson.id)}>Mark incomplete</Button>
                )}
                <Button onClick={completeAndContinue} icon={complete ? undefined : 'check'}>
                  {complete ? (next ? 'Next lesson' : 'Back to course') : next ? 'Complete & continue' : 'Complete course'}
                </Button>
              </div>
            ) : (
              next && (
                <Link to={`/courses/${course.id}/lessons/${next.id}`}>
                  <Button variant="secondary">Next lesson</Button>
                </Link>
              )
            )}
          </div>
        </Card>
      </div>

      <aside className="lg:pt-9">
        <Card className="lg:sticky lg:top-24">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{course.title}</p>
            {progress ? (
              <div className="mt-2">
                <ProgressBar value={progress.pct} color={theme.bar} />
                <p className="mt-1 text-xs text-slate-500">{progress.done} of {progress.total} complete</p>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Previewing as teacher</p>
            )}
          </div>
          <ol className="py-2">
            {lessons.map((l, i) => (
              <li key={l.id}>
                <Link
                  to={`/courses/${course.id}/lessons/${l.id}`}
                  className={cx(
                    'flex items-center gap-3 px-4 py-2 text-sm',
                    l.id === lesson.id ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <span
                    className={cx(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                      done.has(l.id) && isStudent ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {done.has(l.id) && isStudent ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="truncate">{l.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      </aside>
    </div>
  )
}
