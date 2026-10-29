import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GradeModal, SubmitModal } from '../components/AssignmentModals'
import { Icon } from '../components/Icon'
import { Avatar, Badge, Button, Card, EmptyState, inputClass, PageHeader, StatusBadge, Tabs } from '../components/ui'
import { assignmentStatus, courseById, coursesFor, isLate, userById } from '../selectors'
import { useStore, useUser } from '../store'
import type { Assignment, AssignmentStatus, Submission } from '../types'
import { courseTheme, cx, dueLabel, fmtDateTime, gradeTone } from '../utils'

export default function Assignments() {
  return useUser().role === 'teacher' ? <GradingQueue /> : <StudentAssignments />
}

type Filter = 'all' | AssignmentStatus

function StudentAssignments() {
  const { data } = useStore()
  const user = useUser()
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<Assignment | null>(null)
  const courseIds = coursesFor(data, user).map((c) => c.id)
  const all = data.assignments
    .filter((a) => courseIds.includes(a.courseId))
    .map((a) => ({ a, status: assignmentStatus(data, a, user.id) }))
    .sort((x, y) => x.a.dueAt.localeCompare(y.a.dueAt))
  const count = (s: AssignmentStatus) => all.filter((x) => x.status === s).length
  const list = filter === 'all' ? all : all.filter((x) => x.status === filter)

  return (
    <>
      <PageHeader title="Assignments" subtitle="Everything due across your courses." />
      <Tabs
        value={filter}
        onChange={setFilter}
        tabs={[
          { id: 'all', label: 'All', count: all.length },
          { id: 'todo', label: 'To do', count: count('todo') },
          { id: 'missing', label: 'Missing', count: count('missing') },
          { id: 'submitted', label: 'Submitted', count: count('submitted') },
          { id: 'graded', label: 'Graded', count: count('graded') },
        ]}
      />
      <Card className="mt-5">
        {list.length === 0 ? (
          <EmptyState icon="clipboard" title="Nothing here" text="No assignments match this filter." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map(({ a, status }) => {
              const course = courseById(data, a.courseId)!
              const sub = data.submissions.find((s) => s.assignmentId === a.id && s.studentId === user.id)
              return (
                <li key={a.id}>
                  <button onClick={() => setOpen(a)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50">
                    <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex ${courseTheme[course.color].soft} ${courseTheme[course.color].text}`}>
                      <Icon name="file" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{a.title}</p>
                      <p className="text-sm text-slate-500">
                        <span className={courseTheme[course.color].text}>{course.code}</span> · {dueLabel(a.dueAt)} · {a.points} pts
                      </p>
                    </div>
                    {sub?.score !== undefined && (
                      <span className={`text-sm font-semibold ${gradeTone((sub.score / a.points) * 100)}`}>{sub.score}/{a.points}</span>
                    )}
                    <StatusBadge status={status} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
      <SubmitModal assignment={open} onClose={() => setOpen(null)} />
    </>
  )
}

function GradingQueue() {
  const { data } = useStore()
  const user = useUser()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState<'pending' | 'graded' | 'all'>('pending')
  const [grading, setGrading] = useState<Submission | null>(null)

  const courses = coursesFor(data, user)
  const assignmentFilter = params.get('assignment') ?? ''
  const courseFilter = params.get('course') ?? (assignmentFilter ? data.assignments.find((a) => a.id === assignmentFilter)?.courseId ?? '' : '')
  const assignmentOptions = data.assignments.filter((a) => (courseFilter ? a.courseId === courseFilter : courses.some((c) => c.id === a.courseId)))

  const setFilter = (key: 'course' | 'assignment', value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'course') next.delete('assignment')
    setParams(next, { replace: true })
  }

  const relevant = new Set(assignmentOptions.filter((a) => !assignmentFilter || a.id === assignmentFilter).map((a) => a.id))
  const subs = data.submissions.filter((s) => relevant.has(s.assignmentId))
  const pending = subs.filter((s) => s.score === undefined)
  const graded = subs.filter((s) => s.score !== undefined)
  const list = (status === 'pending' ? pending : status === 'graded' ? graded : subs).sort((a, b) =>
    status === 'graded' ? b.gradedAt!.localeCompare(a.gradedAt!) : a.submittedAt.localeCompare(b.submittedAt),
  )

  return (
    <>
      <PageHeader title="Grading" subtitle="Review submissions and give students feedback." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <select className={cx(inputClass, 'sm:w-56')} value={courseFilter} onChange={(e) => setFilter('course', e.target.value)}>
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.code} · {c.title}</option>
          ))}
        </select>
        <select className={cx(inputClass, 'sm:w-64')} value={assignmentFilter} onChange={(e) => setFilter('assignment', e.target.value)}>
          <option value="">All assignments</option>
          {assignmentOptions.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>

      <Tabs
        value={status}
        onChange={setStatus}
        tabs={[
          { id: 'pending', label: 'Needs grading', count: pending.length },
          { id: 'graded', label: 'Graded', count: graded.length },
          { id: 'all', label: 'All', count: subs.length },
        ]}
      />

      <Card className="mt-5 overflow-hidden">
        {list.length === 0 ? (
          <EmptyState icon="check" title={status === 'pending' ? 'All caught up!' : 'No submissions'} text={status === 'pending' ? 'There is nothing waiting to be graded for this filter.' : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-3 py-3">Assignment</th>
                  <th className="px-3 py-3">Submitted</th>
                  <th className="px-3 py-3 text-right">Score</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((s) => {
                  const a = data.assignments.find((x) => x.id === s.assignmentId)!
                  const course = courseById(data, a.courseId)!
                  const student = userById(data, s.studentId)!
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={student} size="sm" />
                          <span className="font-medium text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-slate-800">{a.title}</p>
                        <p className={`text-xs ${courseTheme[course.color].text}`}>{course.code}</p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                        {fmtDateTime(s.submittedAt)}
                        {isLate(data, s.submittedAt, a.id) && <Badge className="ml-2 bg-rose-50 text-rose-700">Late</Badge>}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {s.score === undefined ? (
                          <span className="text-slate-300">–</span>
                        ) : (
                          <span className={`font-semibold ${gradeTone((s.score / a.points) * 100)}`}>{s.score}/{a.points}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant={s.score === undefined ? 'primary' : 'secondary'} onClick={() => setGrading(s)}>
                          {s.score === undefined ? 'Grade' : 'Edit'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <GradeModal submission={grading} onClose={() => setGrading(null)} />
    </>
  )
}
