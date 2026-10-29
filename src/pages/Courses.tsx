import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { Button, Card, EmptyState, Field, inputClass, Modal, PageHeader, ProgressBar, Tabs } from '../components/ui'
import { courseAssignments, courseLessons, coursesFor, lessonProgress, userById } from '../selectors'
import { useStore, useUser } from '../store'
import type { Course, CourseColor } from '../types'
import { courseTheme, cx } from '../utils'

export default function Courses() {
  const { data, enroll } = useStore()
  const user = useUser()
  const toast = useToast()
  const [tab, setTab] = useState<'mine' | 'catalog'>('mine')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const mine = coursesFor(data, user)
  const catalog = data.courses.filter((c) => !c.studentIds.includes(user.id))
  const isTeacher = user.role === 'teacher'
  const list = (tab === 'mine' ? mine : catalog).filter((c) =>
    `${c.code} ${c.title} ${c.category}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <>
      <PageHeader
        title={isTeacher ? 'My courses' : 'Courses'}
        subtitle={isTeacher ? 'Courses you teach, with lessons, assignments and enrolment.' : 'Your enrolled courses and the course catalog.'}
        action={isTeacher && <Button icon="plus" onClick={() => setCreating(true)}>New course</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {isTeacher ? (
          <div />
        ) : (
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'mine', label: 'My courses', count: mine.length },
              { id: 'catalog', label: 'Browse catalog', count: catalog.length },
            ]}
          />
        )}
        <div className="relative sm:w-72">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className={cx(inputClass, 'pl-9')} placeholder="Search courses" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon="book"
            title={query ? 'No courses match your search' : tab === 'catalog' ? "You're enrolled in every course" : 'No courses yet'}
            text={isTeacher && !query ? 'Create your first course to start adding lessons and assignments.' : undefined}
          />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              action={
                tab === 'catalog' && !isTeacher ? (
                  <Button
                    size="sm"
                    icon="plus"
                    onClick={() => {
                      enroll(c.id)
                      toast(`Enrolled in ${c.code}`)
                      setTab('mine')
                    }}
                  >
                    Enroll
                  </Button>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      <NewCourseModal open={creating} onClose={() => setCreating(false)} />
    </>
  )
}

function CourseCard({ course, action }: { course: Course; action?: React.ReactNode }) {
  const { data } = useStore()
  const user = useUser()
  const teacher = userById(data, course.teacherId)
  const lessons = courseLessons(data, course.id).length
  const assignments = courseAssignments(data, course.id).length
  const enrolled = course.studentIds.includes(user.id)
  const progress = user.role === 'student' && enrolled ? lessonProgress(data, user.id, course.id) : null
  const theme = courseTheme[course.color]

  const body = (
    <>
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${theme.cover} p-5 text-white`}>
        <div className="pattern-dots absolute inset-0" />
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <span className="glass relative rounded-full px-3 py-1 text-xs font-bold">{course.code}</span>
        <Icon name="cap" className="absolute -bottom-3 right-3 h-24 w-24 text-white/20 transition duration-300 group-hover:-rotate-6 group-hover:scale-110" />
        <p className="absolute bottom-4 left-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{course.category}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-slate-900">{course.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{course.description}</p>
        <div className="mt-auto pt-4">
          {progress && (
            <div className="mb-3">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span className="font-semibold text-slate-700">{progress.pct}%</span>
              </div>
              <ProgressBar value={progress.pct} color={theme.bar} />
            </div>
          )}
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="truncate">{user.role === 'teacher' ? `${course.studentIds.length} students` : teacher?.name}</span>
            {action ?? (
              <span className="whitespace-nowrap">
                {lessons} lessons · {assignments} tasks
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )

  const className = 'fade-up group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift'
  return action ? (
    <div className={className}>{body}</div>
  ) : (
    <Link to={`/courses/${course.id}`} className={className}>
      {body}
    </Link>
  )
}

const colors: CourseColor[] = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet']

function NewCourseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCourse } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const empty = { code: '', title: '', category: '', description: '', color: 'violet' as CourseColor }
  const [form, setForm] = useState(empty)
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))
  const valid = form.code.trim() && form.title.trim()

  const close = () => {
    setForm(empty)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="New course"
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const id = addCourse({
                code: form.code.trim().toUpperCase(),
                title: form.title.trim(),
                category: form.category.trim() || 'General',
                description: form.description.trim() || 'No description yet.',
                color: form.color,
              })
              toast('Course created')
              close()
              navigate(`/courses/${id}`)
            }}
          >
            Create course
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <Field label="Code">
            <input className={inputClass} value={form.code} onChange={(e) => set({ code: e.target.value })} placeholder="ML300" maxLength={10} />
          </Field>
          <Field label="Title">
            <input className={inputClass} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Intro to Machine Learning" />
          </Field>
        </div>
        <Field label="Category">
          <input className={inputClass} value={form.category} onChange={(e) => set({ category: e.target.value })} placeholder="Computer Science" />
        </Field>
        <Field label="Description">
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="What will students learn?" />
        </Field>
        <Field label="Cover colour">
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set({ color: c })}
                aria-label={c}
                className={cx(
                  'h-9 w-9 rounded-lg bg-gradient-to-br ring-offset-2 transition',
                  courseTheme[c].cover,
                  form.color === c ? 'ring-2 ring-slate-900' : 'hover:scale-105',
                )}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  )
}
