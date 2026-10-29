import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SubmitModal } from '../components/AssignmentModals'
import { Gradebook } from '../components/Gradebook'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { Avatar, Badge, Button, Card, EmptyState, Field, inputClass, Modal, ProgressBar, StatusBadge, Tabs } from '../components/ui'
import {
  assignmentStatus,
  courseAssignments,
  courseById,
  courseLessons,
  lessonProgress,
  studentAverage,
  submissionFor,
  userById,
} from '../selectors'
import { useStore, useUser } from '../store'
import type { Assignment, Course } from '../types'
import { courseTheme, cx, DAY, dueLabel, fmtDateTime, gradeTone, timeAgo } from '../utils'

type Tab = 'lessons' | 'assignments' | 'discussion' | 'people' | 'grades'

export default function CourseDetail() {
  const { courseId } = useParams()
  const { data } = useStore()
  const user = useUser()
  const [tab, setTab] = useState<Tab>('lessons')
  const course = courseById(data, courseId!)

  if (!course) return <Navigate to="/courses" replace />
  const isTeacher = user.role === 'teacher'
  const canView = isTeacher ? course.teacherId === user.id : course.studentIds.includes(user.id)
  if (!canView) return <Navigate to="/courses" replace />

  const teacher = userById(data, course.teacherId)!
  const theme = courseTheme[course.color]
  const progress = !isTeacher ? lessonProgress(data, user.id, course.id) : null
  const lessons = courseLessons(data, course.id)
  const assignments = courseAssignments(data, course.id)
  const posts = data.posts.filter((p) => p.courseId === course.id)

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'lessons', label: 'Lessons', count: lessons.length },
    { id: 'assignments', label: 'Assignments', count: assignments.length },
    { id: 'discussion', label: 'Discussion', count: posts.length },
    { id: 'people', label: 'People', count: course.studentIds.length + 1 },
  ]
  if (isTeacher) tabs.push({ id: 'grades', label: 'Gradebook' })

  return (
    <>
      <Link to="/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <Icon name="chevronLeft" className="h-4 w-4" /> All courses
      </Link>

      <div className={`fade-up relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${theme.cover} p-6 text-white shadow-lift sm:p-10`}>
        <div className="pattern-dots absolute inset-0" />
        <div className="blob absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <Icon name="cap" className="absolute -bottom-8 -right-4 h-52 w-52 text-white/15" />
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="glass rounded-full px-3 py-1 font-bold">{course.code}</span>
            <span className="font-bold uppercase tracking-[0.14em] opacity-80">{course.category}</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold sm:text-[2.6rem] sm:leading-tight">{course.title}</h1>
          <p className="mt-2 text-sm opacity-90 sm:text-base">{course.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-[11px] font-semibold">
                {teacher.name.replace(/^(Dr\.|Prof\.)\s+/, '').split(' ').map((p) => p[0]).join('')}
              </span>
              {teacher.name}
            </span>
            <span className="opacity-90">{course.studentIds.length} students</span>
            {progress && (
              <span className="flex min-w-[200px] items-center gap-3">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/25">
                  <span className="block h-full rounded-full bg-white" style={{ width: `${progress.pct}%` }} />
                </span>
                <span className="font-semibold">{progress.pct}% complete</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
      </div>

      <div className="mt-6">
        {tab === 'lessons' && <LessonsTab course={course} />}
        {tab === 'assignments' && <AssignmentsTab course={course} />}
        {tab === 'discussion' && <DiscussionTab course={course} />}
        {tab === 'people' && <PeopleTab course={course} />}
        {tab === 'grades' && <Gradebook course={course} />}
      </div>
    </>
  )
}

function LessonsTab({ course }: { course: Course }) {
  const { data, addLesson, deleteLesson } = useStore()
  const user = useUser()
  const toast = useToast()
  const [adding, setAdding] = useState(false)
  const lessons = courseLessons(data, course.id)
  const done = new Set(data.completed[user.id] ?? [])
  const isTeacher = user.role === 'teacher'
  const nextId = !isTeacher ? lessons.find((l) => !done.has(l.id))?.id : undefined

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <p className="text-sm text-slate-500">
          {lessons.length} lessons · {lessons.reduce((n, l) => n + l.minutes, 0)} min total
        </p>
        {isTeacher && <Button size="sm" icon="plus" onClick={() => setAdding(true)}>Add lesson</Button>}
      </div>
      {lessons.length === 0 ? (
        <EmptyState icon="book" title="No lessons yet" text={isTeacher ? 'Add the first lesson to get your course started.' : 'Your teacher has not published any lessons yet.'} />
      ) : (
        <ol className="divide-y divide-slate-100">
          {lessons.map((l, i) => {
            const complete = done.has(l.id)
            return (
              <li key={l.id} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                <span
                  className={cx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    complete ? 'bg-emerald-500 text-white' : l.id === nextId ? 'bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-glow' : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {complete ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                </span>
                <Link to={`/courses/${course.id}/lessons/${l.id}`} className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 group-hover:text-brand-700">{l.title}</p>
                  <p className="truncate text-sm text-slate-500">{l.summary}</p>
                </Link>
                {l.id === nextId && <Badge className="hidden bg-brand-50 text-brand-700 sm:inline-flex">Up next</Badge>}
                <span className="hidden items-center gap-1 whitespace-nowrap text-xs text-slate-400 sm:flex">
                  <Icon name="clock" className="h-3.5 w-3.5" /> {l.minutes} min
                </span>
                {isTeacher && (
                  <button
                    onClick={() => {
                      deleteLesson(l.id)
                      toast('Lesson deleted')
                    }}
                    className="rounded-md p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Delete ${l.title}`}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      )}
      <NewLessonModal
        open={adding}
        onClose={() => setAdding(false)}
        onSave={(l) => {
          addLesson(course.id, l)
          toast('Lesson added')
        }}
      />
    </Card>
  )
}

function NewLessonModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (l: { title: string; summary: string; minutes: number; keyPoints: string[] }) => void }) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [points, setPoints] = useState('')
  const [minutes, setMinutes] = useState('20')
  const close = () => {
    setTitle('')
    setSummary('')
    setPoints('')
    setMinutes('20')
    onClose()
  }
  return (
    <Modal
      open={open}
      onClose={close}
      title="Add lesson"
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button
            disabled={!title.trim()}
            onClick={() => {
              onSave({
                title: title.trim(),
                summary: summary.trim() || 'No summary yet.',
                minutes: Math.max(5, Number(minutes) || 20),
                keyPoints: points.split('\n').map((p) => p.trim()).filter(Boolean),
              })
              close()
            }}
          >
            Add lesson
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Async JavaScript and promises" />
        </Field>
        <Field label="Summary">
          <textarea rows={2} className={inputClass} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One or two sentences on what the lesson covers" />
        </Field>
        <Field label="Key points" hint="One per line">
          <textarea rows={3} className={inputClass} value={points} onChange={(e) => setPoints(e.target.value)} placeholder={'Callbacks vs promises\nasync / await\nError handling'} />
        </Field>
        <Field label="Estimated minutes">
          <input type="number" min={5} className={cx(inputClass, 'sm:w-32')} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}

function AssignmentsTab({ course }: { course: Course }) {
  const { data, addAssignment, deleteAssignment } = useStore()
  const user = useUser()
  const toast = useToast()
  const [open, setOpen] = useState<Assignment | null>(null)
  const [adding, setAdding] = useState(false)
  const isTeacher = user.role === 'teacher'
  const assignments = courseAssignments(data, course.id)

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <p className="text-sm text-slate-500">{assignments.reduce((n, a) => n + a.points, 0)} points available</p>
        {isTeacher && <Button size="sm" icon="plus" onClick={() => setAdding(true)}>New assignment</Button>}
      </div>
      {assignments.length === 0 ? (
        <EmptyState icon="clipboard" title="No assignments yet" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {assignments.map((a) => {
            if (isTeacher) {
              const subs = course.studentIds.map((sid) => submissionFor(data, a.id, sid)).filter(Boolean)
              const ungraded = subs.filter((s) => s!.score === undefined).length
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-500">{dueLabel(a.dueAt)} · {a.points} pts</p>
                  </div>
                  <div className="w-36">
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Submitted</span>
                      <span>{subs.length}/{course.studentIds.length}</span>
                    </div>
                    <ProgressBar value={course.studentIds.length ? (subs.length / course.studentIds.length) * 100 : 0} color={courseTheme[course.color].bar} />
                  </div>
                  {ungraded > 0 ? (
                    <Link to={`/assignments?assignment=${a.id}`}>
                      <Button size="sm" variant="secondary">Grade {ungraded}</Button>
                    </Link>
                  ) : (
                    <Badge className="bg-emerald-50 text-emerald-700">{subs.length ? 'All graded' : 'No submissions'}</Badge>
                  )}
                  <button
                    onClick={() => {
                      deleteAssignment(a.id)
                      toast('Assignment deleted')
                    }}
                    className="rounded-md p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Delete ${a.title}`}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </li>
              )
            }
            const status = assignmentStatus(data, a, user.id)
            const sub = submissionFor(data, a.id, user.id)
            return (
              <li key={a.id}>
                <button onClick={() => setOpen(a)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-500">{dueLabel(a.dueAt)} · {a.points} pts</p>
                  </div>
                  {status === 'graded' && (
                    <span className={`text-sm font-semibold ${gradeTone((sub!.score! / a.points) * 100)}`}>
                      {sub!.score}/{a.points}
                    </span>
                  )}
                  <StatusBadge status={status} />
                  <Icon name="chevronRight" className="h-4 w-4 text-slate-300" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <SubmitModal assignment={open} onClose={() => setOpen(null)} />
      <NewAssignmentModal
        open={adding}
        onClose={() => setAdding(false)}
        onSave={(a) => {
          addAssignment(course.id, a)
          toast('Assignment published')
        }}
      />
    </Card>
  )
}

function defaultDue() {
  const d = new Date(Date.now() + 7 * DAY)
  return d.toISOString().slice(0, 10)
}

function NewAssignmentModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (a: { title: string; instructions: string; dueAt: string; points: number }) => void }) {
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [due, setDue] = useState(defaultDue)
  const [points, setPoints] = useState('20')
  const close = () => {
    setTitle('')
    setInstructions('')
    setDue(defaultDue())
    setPoints('20')
    onClose()
  }
  return (
    <Modal
      open={open}
      onClose={close}
      title="New assignment"
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button
            disabled={!title.trim() || !due || Number(points) <= 0}
            onClick={() => {
              const dueAt = new Date(`${due}T23:59:00`).toISOString()
              onSave({ title: title.trim(), instructions: instructions.trim() || 'See the brief in class.', dueAt, points: Number(points) })
              close()
            }}
          >
            Publish
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly reflection" />
        </Field>
        <Field label="Instructions">
          <textarea rows={4} className={inputClass} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="What should students hand in?" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Due date" hint="Due at 11:59 PM">
            <input type="date" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
          <Field label="Points">
            <input type="number" min={1} className={inputClass} value={points} onChange={(e) => setPoints(e.target.value)} />
          </Field>
        </div>
      </div>
    </Modal>
  )
}

function DiscussionTab({ course }: { course: Course }) {
  const { data, addPost } = useStore()
  const user = useUser()
  const toast = useToast()
  const [body, setBody] = useState('')
  const [announce, setAnnounce] = useState(false)
  const isTeacher = user.role === 'teacher'
  const posts = data.posts.filter((p) => p.courseId === course.id)
  const announcements = posts.filter((p) => p.announcement).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const thread = posts.filter((p) => !p.announcement).sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const post = () => {
    addPost(course.id, body.trim(), isTeacher && announce)
    toast(announce && isTeacher ? 'Announcement posted' : 'Message posted')
    setBody('')
    setAnnounce(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card>
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">Class discussion</h2>
          <p className="text-sm text-slate-500">Ask questions and help each other out.</p>
        </div>
        {thread.length === 0 ? (
          <EmptyState icon="message" title="No messages yet" text="Start the conversation below." />
        ) : (
          <ul className="space-y-5 px-5 py-5">
            {thread.map((p) => {
              const author = userById(data, p.authorId)!
              const staff = author.role === 'teacher'
              return (
                <li key={p.id} className="flex gap-3">
                  <Avatar user={author} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{author.name}</span>
                      {staff && <Badge className="bg-brand-50 text-brand-700">Teacher</Badge>}
                      <span className="text-xs text-slate-400">{timeAgo(p.createdAt)}</span>
                    </div>
                    <p className={cx('mt-1.5 inline-block rounded-xl rounded-tl-sm px-4 py-2.5 text-sm', staff ? 'bg-brand-50 text-slate-800' : 'bg-slate-100 text-slate-700')}>
                      {p.body}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="border-t border-slate-100 p-4">
          <textarea
            rows={2}
            className={inputClass}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && body.trim()) post()
            }}
            placeholder={isTeacher ? 'Reply to the class or post an announcement…' : 'Ask a question or share something helpful…'}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            {isTeacher ? (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={announce} onChange={(e) => setAnnounce(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                Post as announcement
              </label>
            ) : (
              <span className="hidden text-xs text-slate-400 sm:block">Ctrl + Enter to send</span>
            )}
            <Button size="sm" icon="send" disabled={!body.trim()} onClick={post}>Post</Button>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
          <Icon name="megaphone" className="h-5 w-5 text-amber-500" /> Announcements
        </h2>
        {announcements.length === 0 ? (
          <Card><EmptyState icon="megaphone" title="No announcements" /></Card>
        ) : (
          <div className="space-y-3">
            {announcements.map((p) => (
              <Card key={p.id} className="border-l-4 border-l-amber-400 p-4">
                <p className="text-sm text-slate-700">{p.body}</p>
                <p className="mt-2 text-xs text-slate-400">{userById(data, p.authorId)?.name} · {fmtDateTime(p.createdAt)}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PeopleTab({ course }: { course: Course }) {
  const { data } = useStore()
  const user = useUser()
  const isTeacher = user.role === 'teacher'
  const teacher = userById(data, course.teacherId)!
  const students = course.studentIds.map((id) => userById(data, id)!).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-6">
      <Card>
        <div className="border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Teacher</div>
        <div className="flex items-center gap-3 px-5 py-4">
          <Avatar user={teacher} />
          <div>
            <p className="font-medium text-slate-900">{teacher.name}</p>
            <p className="text-sm text-slate-500">{teacher.email}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex justify-between border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>Students · {students.length}</span>
          {isTeacher && <span className="hidden sm:block">Progress / Average</span>}
        </div>
        {students.length === 0 ? (
          <EmptyState icon="users" title="No students enrolled yet" text="Students can enroll from the course catalog." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {students.map((s) => {
              const p = lessonProgress(data, s.id, course.id)
              const avg = studentAverage(data, s.id, course.id)
              return (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar user={s} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {s.name} {s.id === user.id && <span className="text-xs font-normal text-slate-400">(you)</span>}
                    </p>
                    <p className="truncate text-sm text-slate-500">{s.email}</p>
                  </div>
                  {isTeacher && (
                    <>
                      <div className="hidden w-32 sm:block">
                        <ProgressBar value={p.pct} color={courseTheme[course.color].bar} />
                        <p className="mt-1 text-xs text-slate-400">{p.done}/{p.total} lessons</p>
                      </div>
                      <span className={cx('w-12 text-right text-sm font-semibold', avg === null ? 'text-slate-300' : gradeTone(avg))}>
                        {avg === null ? '–' : `${avg}%`}
                      </span>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
