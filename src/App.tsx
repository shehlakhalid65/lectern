import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import Assignments from './pages/Assignments'
import CourseDetail from './pages/CourseDetail'
import Courses from './pages/Courses'
import Dashboard from './pages/Dashboard'
import Grades from './pages/Grades'
import LessonView from './pages/LessonView'
import Login from './pages/Login'
import { useStore } from './store'

export default function App() {
  const { user } = useStore()
  const { pathname } = useLocation()

  // Braces matter: newer browsers return a Promise from scrollTo, which React would treat as a cleanup function.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:courseId" element={<CourseDetail />} />
        <Route path="courses/:courseId/lessons/:lessonId" element={<LessonView />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="grades" element={<Grades />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
