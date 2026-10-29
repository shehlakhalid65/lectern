import { useState } from 'react'
import { courseAssignments, lessonProgress, studentAverage, submissionFor, userById } from '../selectors'
import { useStore } from '../store'
import type { Course, Submission } from '../types'
import { downloadCsv, gradeTone, letterGrade } from '../utils'
import { GradeModal } from './AssignmentModals'
import { useToast } from './Toast'
import { Avatar, Button, EmptyState } from './ui'

/** Students × assignments grid for one course. Click a cell to grade it. */
export function Gradebook({ course }: { course: Course }) {
  const { data } = useStore()
  const toast = useToast()
  const [grading, setGrading] = useState<Submission | null>(null)
  const assignments = courseAssignments(data, course.id)
  const students = course.studentIds
    .map((id) => userById(data, id)!)
    .sort((a, b) => a.name.localeCompare(b.name))

  if (!students.length) {
    return <EmptyState icon="users" title="No students enrolled yet" text="Grades will appear here once students join the course." />
  }

  const exportCsv = () => {
    downloadCsv(`${course.code}-gradebook.csv`, [
      ['Student', 'Email', ...assignments.map((a) => `${a.title} (/${a.points})`), 'Average %', 'Lessons completed'],
      ...students.map((s) => {
        const avg = studentAverage(data, s.id, course.id)
        const p = lessonProgress(data, s.id, course.id)
        return [
          s.name,
          s.email,
          ...assignments.map((a) => submissionFor(data, a.id, s.id)?.score ?? ''),
          avg ?? '',
          `${p.done}/${p.total}`,
        ]
      }),
    ])
    toast('Gradebook exported as CSV')
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <Legend className="bg-emerald-50 text-emerald-700" label="Graded" />
          <Legend className="bg-sky-50 text-sky-700" label="Needs grading" />
          <Legend className="bg-rose-50 text-rose-600" label="Missing" />
        </div>
        <Button variant="secondary" size="sm" icon="download" onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 bg-slate-50 px-4 py-3">Student</th>
              {assignments.map((a) => (
                <th key={a.id} className="px-3 py-3 text-center font-semibold" title={a.title}>
                  <span className="block max-w-[110px] truncate normal-case tracking-normal text-slate-700">{a.title}</span>
                  <span className="font-normal normal-case tracking-normal">/{a.points}</span>
                </th>
              ))}
              <th className="px-3 py-3 text-center">Progress</th>
              <th className="px-4 py-3 text-right">Average</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => {
              const avg = studentAverage(data, s.id, course.id)
              const progress = lessonProgress(data, s.id, course.id)
              return (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="sticky left-0 bg-white px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={s} size="sm" />
                      <span className="whitespace-nowrap font-medium text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  {assignments.map((a) => {
                    const sub = submissionFor(data, a.id, s.id)
                    const past = new Date(a.dueAt).getTime() < Date.now()
                    return (
                      <td key={a.id} className="px-3 py-2.5 text-center">
                        {sub?.score !== undefined ? (
                          <button onClick={() => setGrading(sub)} className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700 hover:ring-2 hover:ring-emerald-200">
                            {sub.score}
                          </button>
                        ) : sub ? (
                          <button onClick={() => setGrading(sub)} className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 hover:ring-2 hover:ring-sky-200">
                            Grade
                          </button>
                        ) : past ? (
                          <span className="rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-600">Missing</span>
                        ) : (
                          <span className="text-slate-300">–</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-3 py-2.5 text-center text-xs text-slate-500">
                    {progress.done}/{progress.total}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {avg === null ? (
                      <span className="text-slate-300">–</span>
                    ) : (
                      <span className={`font-semibold ${gradeTone(avg)}`}>
                        {avg}% <span className="font-normal text-slate-400">{letterGrade(avg)}</span>
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <GradeModal submission={grading} onClose={() => setGrading(null)} />
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  )
}
