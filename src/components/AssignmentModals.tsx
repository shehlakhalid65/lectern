import { useEffect, useState } from 'react'
import { courseById, isLate, userById } from '../selectors'
import { useStore } from '../store'
import type { Assignment, Submission } from '../types'
import { dueLabel, fmtDateTime, gradeTone, letterGrade } from '../utils'
import { useToast } from './Toast'
import { Avatar, Badge, Button, Field, inputClass, Modal } from './ui'

/** Student view: read the brief, submit or resubmit, and see feedback once graded. */
export function SubmitModal({ assignment, onClose }: { assignment: Assignment | null; onClose: () => void }) {
  const { data, user, submit } = useStore()
  const toast = useToast()
  const sub = assignment && user ? data.submissions.find((s) => s.assignmentId === assignment.id && s.studentId === user.id) : undefined
  const [text, setText] = useState('')

  useEffect(() => {
    setText('')
  }, [assignment?.id])

  if (!assignment) return null
  const course = courseById(data, assignment.courseId)
  const graded = sub?.score !== undefined
  const pct = graded ? Math.round((sub!.score! / assignment.points) * 100) : 0

  return (
    <Modal
      open
      onClose={onClose}
      title={assignment.title}
      wide
      footer={
        graded ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button
              icon="send"
              disabled={text.trim().length < 10}
              onClick={() => {
                submit(assignment.id, text.trim())
                toast(sub ? 'Submission updated' : 'Assignment submitted')
                onClose()
              }}
            >
              {sub ? 'Resubmit' : 'Submit'}
            </Button>
          </>
        )
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Badge className="bg-slate-100 text-slate-700">{course?.code}</Badge>
        <span>{dueLabel(assignment.dueAt)}</span>
        <span>·</span>
        <span>{assignment.points} points</span>
      </div>
      <h3 className="text-sm font-semibold text-slate-900">Instructions</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{assignment.instructions}</p>

      {sub && (
        <div className="mt-5 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/60 to-fuchsia-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">Your submission</p>
            <span className="text-xs text-slate-500">
              {fmtDateTime(sub.submittedAt)}
              {isLate(data, sub.submittedAt, assignment.id) && <span className="ml-2 font-medium text-rose-600">Late</span>}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{sub.text}</p>
        </div>
      )}

      {graded && (
        <div className="mt-4 flex gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="text-center">
            <p className={`text-2xl font-bold ${gradeTone(pct)}`}>{sub!.score}/{assignment.points}</p>
            <p className="text-xs text-slate-500">{pct}% · {letterGrade(pct)}</p>
          </div>
          <div className="border-l border-emerald-200 pl-4">
            <p className="text-sm font-semibold text-slate-900">Teacher feedback</p>
            <p className="mt-1 text-sm text-slate-700">{sub!.feedback || 'No written feedback.'}</p>
          </div>
        </div>
      )}

      {!graded && (
        <div className="mt-5">
          <Field label={sub ? 'Update your answer' : 'Your answer'} hint="Write at least a sentence or two. In a real deployment this would also accept file uploads.">
            <textarea
              rows={6}
              className={inputClass}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your approach and paste your work or a link to it…"
            />
          </Field>
        </div>
      )}
    </Modal>
  )
}

const quickFeedback = ['Great work!', 'Clear and well structured.', 'Check the edge cases.', 'Review the lesson notes.', 'Submitted late, so 10% was deducted.']

/** Teacher view: read a submission and record a score with feedback. */
export function GradeModal({ submission, onClose }: { submission: Submission | null; onClose: () => void }) {
  const { data, grade } = useStore()
  const toast = useToast()
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    setScore(submission?.score?.toString() ?? '')
    setFeedback(submission?.feedback ?? '')
  }, [submission?.id]) // reset only when a different submission opens

  if (!submission) return null
  const assignment = data.assignments.find((a) => a.id === submission.assignmentId)!
  const student = userById(data, submission.studentId)!
  const course = courseById(data, assignment.courseId)
  const value = Number(score)
  const valid = score !== '' && Number.isFinite(value) && value >= 0 && value <= assignment.points

  return (
    <Modal
      open
      onClose={onClose}
      title={`Grade: ${assignment.title}`}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            icon="check"
            disabled={!valid}
            onClick={() => {
              grade(submission.id, value, feedback.trim())
              toast(`Graded ${student.name.split(' ')[0]}'s submission`)
              onClose()
            }}
          >
            Save grade
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <Avatar user={student} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">{student.name}</p>
          <p className="text-xs text-slate-500">
            {course?.code} · submitted {fmtDateTime(submission.submittedAt)}
          </p>
        </div>
        {isLate(data, submission.submittedAt, assignment.id) && <Badge className="bg-rose-50 text-rose-700">Late</Badge>}
      </div>

      <div className="mt-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/60 to-fuchsia-50/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Submission</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{submission.text}</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr]">
        <Field label={`Score (out of ${assignment.points})`}>
          <input
            type="number"
            min={0}
            max={assignment.points}
            className={inputClass}
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          {valid && (
            <span className={`mt-1 block text-xs font-medium ${gradeTone((value / assignment.points) * 100)}`}>
              {Math.round((value / assignment.points) * 100)}% · {letterGrade((value / assignment.points) * 100)}
            </span>
          )}
        </Field>
        <Field label="Feedback">
          <textarea rows={3} className={inputClass} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well, and what to improve…" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {quickFeedback.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setFeedback((f) => (f ? `${f} ${q}` : q))}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                {q}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  )
}
