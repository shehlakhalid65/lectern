import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SubmitModal } from '../components/AssignmentModals'
import { Gradebook } from '../components/Gradebook'
import { Card, EmptyState, PageHeader, ProgressBar, StatusBadge, Tabs } from '../components/ui'
import { assignmentStatus, courseAssignments, coursesFor, studentAverage, submissionFor, userById } from '../selectors'
import { useStore, useUser } from '../store'
import type { Assignment } from '../types'
import { courseTheme, dueLabel, gradeTone, letterGrade } from '../utils'

export default function Grades() {
  return useUser().role === 'teacher' ? <TeacherGradebook /> : <StudentGrades />
}

function TeacherGradebook() {
  const { data } = useStore()
  const user = useUser()
  const courses = coursesFor(data, user)
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const course = courses.find((c) => c.id === courseId)

  return (
    <>
      <PageHeader title="Gradebook" subtitle="Scores for every student and assignment. Click a cell to grade or edit it." />
      {courses.length === 0 || !course ? (
        <Card><EmptyState icon="chart" title="No courses yet" /></Card>
      ) : (
        <>
          <div className="mb-5">
            <Tabs value={courseId} onChange={setCourseId} tabs={courses.map((c) => ({ id: c.id, label: c.code }))} />
          </div>
          <p className="mb-3 text-sm text-slate-500">
            <Link to={`/courses/${course.id}`} className="font-medium text-slate-800 hover:text-brand-700">{course.title}</Link>
            {' '}· {course.studentIds.length} students
          </p>
          <Gradebook course={course} />
        </>
      )}
    </>
  )
}

function StudentGrades() {
  const { data } = useStore()
  const user = useUser()
  const [open, setOpen] = useState<Assignment | null>(null)
  const courses = coursesFor(data, user)
  const overall = studentAverage(data, user.id)

  return (
    <>
      <PageHeader
        title="Grades"
        subtitle={overall === null ? 'No graded work yet.' : `Overall average ${overall}% (${letterGrade(overall)}) across graded work.`}
      />
      {courses.length === 0 ? (
        <Card><EmptyState icon="award" title="No courses yet" /></Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {courses.map((c) => {
            const avg = studentAverage(data, user.id, c.id)
            const theme = courseTheme[c.color]
            return (
              <Card key={c.id} className="overflow-hidden">
                <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white ${theme.cover}`}>
                    {avg === null ? '–' : letterGrade(avg)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/courses/${c.id}`} className="font-semibold text-slate-900 hover:text-brand-700">{c.title}</Link>
                    <p className="text-xs text-slate-500">{c.code} · {userById(data, c.teacherId)?.name}</p>
                  </div>
                  <div className="w-28 text-right">
                    <p className={`text-xl font-bold ${avg === null ? 'text-slate-300' : gradeTone(avg)}`}>{avg === null ? '–' : `${avg}%`}</p>
                    <ProgressBar value={avg ?? 0} color={theme.bar} className="mt-1 h-1.5" />
                  </div>
                </div>
                <ul className="divide-y divide-slate-100">
                  {courseAssignments(data, c.id).map((a) => {
                    const sub = submissionFor(data, a.id, user.id)
                    const status = assignmentStatus(data, a, user.id)
                    return (
                      <li key={a.id}>
                        <button onClick={() => setOpen(a)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-slate-50">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-slate-800">{a.title}</p>
                            <p className="text-xs text-slate-400">{dueLabel(a.dueAt)}</p>
                          </div>
                          {status === 'graded' ? (
                            <span className={`text-sm font-semibold ${gradeTone((sub!.score! / a.points) * 100)}`}>
                              {sub!.score}/{a.points}
                            </span>
                          ) : (
                            <StatusBadge status={status} />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            )
          })}
        </div>
      )}
      <SubmitModal assignment={open} onClose={() => setOpen(null)} />
    </>
  )
}
