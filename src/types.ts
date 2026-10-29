export type Role = 'teacher' | 'student'

export type CourseColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Course {
  id: string
  code: string
  title: string
  description: string
  category: string
  color: CourseColor
  teacherId: string
  studentIds: string[]
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  summary: string
  keyPoints: string[]
  minutes: number
  order: number
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  instructions: string
  dueAt: string
  points: number
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  submittedAt: string
  text: string
  score?: number
  feedback?: string
  gradedAt?: string
}

export interface Post {
  id: string
  courseId: string
  authorId: string
  body: string
  createdAt: string
  announcement: boolean
}

export interface Data {
  seededAt: string
  users: User[]
  courses: Course[]
  lessons: Lesson[]
  assignments: Assignment[]
  submissions: Submission[]
  /** studentId -> completed lesson ids */
  completed: Record<string, string[]>
  posts: Post[]
}

export type AssignmentStatus = 'todo' | 'submitted' | 'graded' | 'missing'
