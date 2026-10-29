import type { Assignment, AssignmentStatus, Course, Data, User } from './types'

export function userById(d: Data, id: string): User | undefined {
  return d.users.find((u) => u.id === id)
}

export function courseById(d: Data, id: string): Course | undefined {
  return d.courses.find((c) => c.id === id)
}

export function coursesFor(d: Data, user: User) {
  return user.role === 'teacher'
    ? d.courses.filter((c) => c.teacherId === user.id)
    : d.courses.filter((c) => c.studentIds.includes(user.id))
}

export function courseLessons(d: Data, courseId: string) {
  return d.lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order)
}

export function courseAssignments(d: Data, courseId: string) {
  return d.assignments
    .filter((a) => a.courseId === courseId)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
}

export function submissionFor(d: Data, assignmentId: string, studentId: string) {
  return d.submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId)
}

export function assignmentStatus(d: Data, a: Assignment, studentId: string): AssignmentStatus {
  const sub = submissionFor(d, a.id, studentId)
  if (sub?.score !== undefined) return 'graded'
  if (sub) return 'submitted'
  return new Date(a.dueAt).getTime() < Date.now() ? 'missing' : 'todo'
}

export function lessonProgress(d: Data, studentId: string, courseId: string) {
  const lessons = courseLessons(d, courseId)
  const done = new Set(d.completed[studentId] ?? [])
  const count = lessons.filter((l) => done.has(l.id)).length
  return {
    done: count,
    total: lessons.length,
    pct: lessons.length ? Math.round((count / lessons.length) * 100) : 0,
    next: lessons.find((l) => !done.has(l.id)),
  }
}

/** Percentage over graded work only, or null if nothing is graded yet. */
export function studentAverage(d: Data, studentId: string, courseId?: string) {
  let earned = 0
  let possible = 0
  for (const a of d.assignments) {
    if (courseId && a.courseId !== courseId) continue
    const sub = submissionFor(d, a.id, studentId)
    if (sub?.score === undefined) continue
    earned += sub.score
    possible += a.points
  }
  return possible ? Math.round((earned / possible) * 100) : null
}

export function courseAverage(d: Data, course: Course) {
  const avgs = course.studentIds
    .map((sid) => studentAverage(d, sid, course.id))
    .filter((v): v is number => v !== null)
  return avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null
}

export function courseCompletion(d: Data, course: Course) {
  if (!course.studentIds.length) return 0
  const total = course.studentIds.reduce((sum, sid) => sum + lessonProgress(d, sid, course.id).pct, 0)
  return Math.round(total / course.studentIds.length)
}

/** Submitted but not yet graded work in the given courses, oldest first. */
export function gradingQueue(d: Data, courseIds: string[]) {
  const ids = new Set(d.assignments.filter((a) => courseIds.includes(a.courseId)).map((a) => a.id))
  return d.submissions
    .filter((s) => ids.has(s.assignmentId) && s.score === undefined)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
}

export function isLate(d: Data, submittedAt: string, assignmentId: string) {
  const a = d.assignments.find((x) => x.id === assignmentId)
  return !!a && submittedAt > a.dueAt
}
