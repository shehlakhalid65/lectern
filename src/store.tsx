import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createSeed, refreshDates } from './seed'
import type { Assignment, Course, Data, Lesson, User } from './types'
import { uid } from './utils'

const DATA_KEY = 'lectern:data:v1'
const USER_KEY = 'lectern:user'

function load(): Data {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (raw) return refreshDates(JSON.parse(raw) as Data)
  } catch {
    // Corrupt or unavailable storage: fall back to fresh sample data.
  }
  return createSeed()
}

function loadUser() {
  try {
    return localStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

type NewCourse = Pick<Course, 'code' | 'title' | 'description' | 'category' | 'color'>
type NewLesson = Pick<Lesson, 'title' | 'summary' | 'minutes'> & { keyPoints?: string[] }
type NewAssignment = Pick<Assignment, 'title' | 'instructions' | 'dueAt' | 'points'>

interface Store {
  data: Data
  user: User | null
  login: (userId: string) => void
  logout: () => void
  reset: () => void
  addCourse: (c: NewCourse) => string
  enroll: (courseId: string) => void
  addLesson: (courseId: string, l: NewLesson) => void
  deleteLesson: (lessonId: string) => void
  toggleLesson: (lessonId: string) => void
  addAssignment: (courseId: string, a: NewAssignment) => void
  deleteAssignment: (assignmentId: string) => void
  submit: (assignmentId: string, text: string) => void
  grade: (submissionId: string, score: number, feedback: string) => void
  addPost: (courseId: string, body: string, announcement: boolean) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(load)
  const [userId, setUserId] = useState<string | null>(loadUser)

  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data))
    } catch {
      // Storage full or blocked; the demo keeps working in memory.
    }
  }, [data])

  useEffect(() => {
    try {
      if (userId) localStorage.setItem(USER_KEY, userId)
      else localStorage.removeItem(USER_KEY)
    } catch {
      // ignore
    }
  }, [userId])

  const user = data.users.find((u) => u.id === userId) ?? null
  const update = useCallback((fn: (d: Data) => Data) => setData(fn), [])

  const store = useMemo<Store>(
    () => ({
      data,
      user,
      login: setUserId,
      logout: () => setUserId(null),
      reset: () => setData(createSeed()),

      addCourse: (c) => {
        const id = uid('course')
        update((d) => ({ ...d, courses: [...d.courses, { ...c, id, teacherId: user!.id, studentIds: [] }] }))
        return id
      },

      enroll: (courseId) =>
        update((d) => ({
          ...d,
          courses: d.courses.map((c) =>
            c.id === courseId && !c.studentIds.includes(user!.id)
              ? { ...c, studentIds: [...c.studentIds, user!.id] }
              : c,
          ),
        })),

      addLesson: (courseId, l) =>
        update((d) => {
          const order = Math.max(0, ...d.lessons.filter((x) => x.courseId === courseId).map((x) => x.order)) + 1
          return { ...d, lessons: [...d.lessons, { keyPoints: [], ...l, id: uid('lesson'), courseId, order }] }
        }),

      deleteLesson: (lessonId) => update((d) => ({ ...d, lessons: d.lessons.filter((l) => l.id !== lessonId) })),

      toggleLesson: (lessonId) =>
        update((d) => {
          const mine = d.completed[user!.id] ?? []
          const next = mine.includes(lessonId) ? mine.filter((id) => id !== lessonId) : [...mine, lessonId]
          return { ...d, completed: { ...d.completed, [user!.id]: next } }
        }),

      addAssignment: (courseId, a) =>
        update((d) => ({ ...d, assignments: [...d.assignments, { ...a, id: uid('asg'), courseId }] })),

      deleteAssignment: (assignmentId) =>
        update((d) => ({
          ...d,
          assignments: d.assignments.filter((a) => a.id !== assignmentId),
          submissions: d.submissions.filter((s) => s.assignmentId !== assignmentId),
        })),

      submit: (assignmentId, text) =>
        update((d) => {
          const rest = d.submissions.filter((s) => !(s.assignmentId === assignmentId && s.studentId === user!.id))
          return {
            ...d,
            submissions: [
              ...rest,
              { id: uid('sub'), assignmentId, studentId: user!.id, text, submittedAt: new Date().toISOString() },
            ],
          }
        }),

      grade: (submissionId, score, feedback) =>
        update((d) => ({
          ...d,
          submissions: d.submissions.map((s) =>
            s.id === submissionId ? { ...s, score, feedback, gradedAt: new Date().toISOString() } : s,
          ),
        })),

      addPost: (courseId, body, announcement) =>
        update((d) => ({
          ...d,
          posts: [
            ...d.posts,
            { id: uid('post'), courseId, authorId: user!.id, body, announcement, createdAt: new Date().toISOString() },
          ],
        })),
    }),
    [data, user, update],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

/** For pages behind the auth guard, where a user is always signed in. */
export function useUser() {
  return useStore().user!
}
