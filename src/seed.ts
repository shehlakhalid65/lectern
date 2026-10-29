import type { Assignment, Course, CourseColor, Data, Lesson, Post, Submission, User } from './types'
import { DAY } from './utils'

export const DEMO_TEACHER_ID = 't1'
export const DEMO_STUDENT_ID = 's1'

type LessonSeed = [title: string, summary: string, keyPoints: string[]]
type AssignmentSeed = [title: string, instructions: string, points: number]

interface CourseSeed {
  id: string
  code: string
  title: string
  category: string
  color: CourseColor
  teacherId: string
  description: string
  size: number
  lessons: LessonSeed[]
  assignments: AssignmentSeed[]
}

const teachers: User[] = [
  { id: 't1', name: 'Dr. Sarah Malik', email: 'sarah.malik@lectern.edu', role: 'teacher' },
  { id: 't2', name: 'Prof. James Whitfield', email: 'james.whitfield@lectern.edu', role: 'teacher' },
]

const studentNames = [
  'Alex Rivera', 'Priya Nair', 'Omar Haddad', 'Mei Chen', 'Lucas Silva', 'Amara Okafor',
  'Noah Kim', 'Fatima Zahra', 'Ethan Brooks', 'Sofia Rossi', 'Daniel Park', 'Aisha Khan',
  "Liam O'Connor", 'Hana Suzuki', 'Mateo Garcia', 'Zara Ahmed', 'Ben Carter', 'Ines Moreau',
  'Yusuf Demir', 'Chloe Martin',
]

const catalog: CourseSeed[] = [
  {
    id: 'c1', code: 'WEB101', title: 'Introduction to Web Development', category: 'Programming', color: 'indigo', teacherId: 't1', size: 16,
    description: 'Build your first websites from scratch. Covers HTML, CSS, responsive layouts and the JavaScript you need to make pages interactive.',
    lessons: [
      ['How the web works', 'Follow a request from the browser to the server and back, and see where HTML, CSS and JavaScript fit in.', ['Clients, servers and HTTP', 'What a URL is made of', 'How a browser turns code into a page']],
      ['HTML structure and semantics', 'Use the right element for the job so pages are accessible, searchable and easy to style.', ['Document outline: header, main, footer', 'Lists, links and images', 'Why semantic tags matter for screen readers']],
      ['Styling with CSS', 'Selectors, the cascade and the box model: the three ideas behind every stylesheet.', ['Selectors and specificity', 'Margin, border, padding, content', 'Colours, fonts and units']],
      ['Layouts with Flexbox and Grid', 'Arrange content in rows, columns and responsive grids without fighting floats.', ['Flex direction, alignment and wrapping', 'Grid templates and areas', 'Media queries for small screens']],
      ['JavaScript fundamentals', 'Variables, functions, arrays and objects: enough JavaScript to start building behaviour.', ['let, const and data types', 'Functions and arrow functions', 'Looping over arrays']],
      ['Working with the DOM', 'Select elements, respond to clicks and update the page without reloading it.', ['querySelector and event listeners', 'Creating and removing elements', 'Handling form input']],
    ],
    assignments: [
      ['Personal profile page', 'Build a single HTML page about yourself using semantic elements (header, main, sections, footer). Include at least one list, one image and one link.', 20],
      ['Responsive landing page', 'Recreate the provided landing page mock-up with CSS Grid and Flexbox. It must work at 375px, 768px and 1280px widths.', 30],
      ['Interactive to-do list', 'Write a to-do list in plain JavaScript: add, complete and delete items. Bonus: persist items in localStorage.', 30],
      ['Final project proposal', 'Submit a one-page proposal for your final website: purpose, audience, page list and a rough wireframe.', 20],
    ],
  },
  {
    id: 'c2', code: 'CS201', title: 'Data Structures & Algorithms', category: 'Computer Science', color: 'emerald', teacherId: 't1', size: 14,
    description: 'Learn the core data structures behind efficient software and how to reason about the cost of the algorithms that use them.',
    lessons: [
      ['Big-O and complexity analysis', 'Describe how running time and memory grow with input size, and compare algorithms on paper.', ['Constant, linear, logarithmic and quadratic growth', 'Best, average and worst case', 'Dropping constants and lower-order terms']],
      ['Arrays and linked lists', 'Two ways to store a sequence, and the trade-offs between random access and cheap insertion.', ['Contiguous vs linked memory', 'Insertion and deletion costs', 'Singly vs doubly linked lists']],
      ['Stacks and queues', 'Restricted collections that show up everywhere, from undo buttons to print spoolers.', ['LIFO vs FIFO', 'Array and list implementations', 'Classic uses: parsing, BFS, scheduling']],
      ['Hash tables', 'Near-constant-time lookups using hashing, and what happens when keys collide.', ['Hash functions and buckets', 'Chaining vs open addressing', 'Load factor and resizing']],
      ['Trees and binary search trees', 'Hierarchical data and ordered lookups in logarithmic time when the tree stays balanced.', ['Tree vocabulary and traversals', 'BST insert, search and delete', 'Why balance matters']],
      ['Graphs and traversal', 'Model networks of things and explore them with breadth-first and depth-first search.', ['Adjacency lists vs matrices', 'BFS and DFS', 'Shortest paths in unweighted graphs']],
    ],
    assignments: [
      ['Complexity worksheet', 'Give the Big-O running time of the ten code snippets in the worksheet and justify each answer in one or two sentences.', 20],
      ['Implement a linked list', 'Implement a doubly linked list with insert, remove, find and reverse. Include unit tests for each operation.', 30],
      ['Hash map from scratch', 'Build a hash map with separate chaining and automatic resizing. Report how lookup time changes as the load factor grows.', 40],
      ['Graph traversal lab', 'Given the city map dataset, use BFS to find the fewest-stops route between any two cities.', 30],
    ],
  },
  {
    id: 'c3', code: 'DB210', title: 'Database Systems', category: 'Computer Science', color: 'amber', teacherId: 't1', size: 12,
    description: 'Design relational databases, write SQL with confidence and understand what keeps data correct and fast.',
    lessons: [
      ['The relational model', 'Tables, rows, keys and relationships: the foundation of almost every business application.', ['Primary and foreign keys', 'One-to-many and many-to-many', 'Entity-relationship diagrams']],
      ['Writing SQL queries', 'Retrieve exactly the data you need with SELECT, WHERE, ORDER BY and LIMIT.', ['Filtering and sorting', 'NULL and three-valued logic', 'Pattern matching with LIKE']],
      ['Joins and aggregation', 'Combine tables and summarise them with GROUP BY to answer real business questions.', ['Inner, left and right joins', 'COUNT, SUM, AVG with GROUP BY', 'Filtering groups with HAVING']],
      ['Normalization', 'Remove redundancy so updates cannot leave your data in a contradictory state.', ['Functional dependencies', '1NF, 2NF and 3NF', 'When to denormalise on purpose']],
      ['Indexes and query performance', 'Find out why a query is slow and how the right index can make it fast.', ['B-tree indexes', 'Reading an execution plan', 'The cost of too many indexes']],
      ['Transactions and concurrency', 'Keep data consistent when many users read and write at the same time.', ['ACID properties', 'Isolation levels', 'Deadlocks and how to avoid them']],
    ],
    assignments: [
      ['ER diagram for a library', 'Draw an ER diagram for a library that lends books and e-books to members. Mark all keys and cardinalities.', 20],
      ['SQL query set', 'Write the 12 queries described in the brief against the sample retail database. Submit the SQL and the result row counts.', 30],
      ['Normalize a schema', 'Take the provided spreadsheet-style table to 3NF. Show each step and explain which dependency you removed.', 30],
      ['Indexing report', 'Pick three slow queries from the lab, add indexes and report the before/after timings and execution plans.', 20],
    ],
  },
  {
    id: 'c4', code: 'UX150', title: 'UX Design Fundamentals', category: 'Design', color: 'rose', teacherId: 't2', size: 15,
    description: 'Learn to design products people actually want to use, from user research through to tested prototypes.',
    lessons: [
      ['What is user experience?', 'UX is the whole experience of using a product. Learn what it covers and what UX designers do day to day.', ['UX vs UI', 'The double diamond process', 'Roles on a product team']],
      ['User research methods', 'Find out what users need before designing anything, with interviews, surveys and observation.', ['Choosing a research method', 'Writing unbiased interview questions', 'Synthesising findings']],
      ['Personas and journey maps', 'Turn research into tools the whole team can use to make decisions.', ['Evidence-based personas', 'Mapping steps, thoughts and feelings', 'Spotting pain points and opportunities']],
      ['Information architecture', 'Organise content so people can find what they are looking for.', ['Card sorting', 'Sitemaps and navigation patterns', 'Labelling that matches user language']],
      ['Wireframing and prototyping', 'Sketch, wireframe and prototype ideas quickly so you can test them cheaply.', ['Low vs high fidelity', 'Layout and visual hierarchy', 'Clickable prototypes']],
      ['Usability testing', 'Watch real people use your design and learn where it breaks down.', ['Writing test tasks', 'Moderated vs unmoderated tests', 'Prioritising issues by severity']],
    ],
    assignments: [
      ['Interview summary', 'Interview three people about how they plan meals. Summarise the key needs and frustrations you heard.', 20],
      ['Persona and journey map', 'Create one persona and a journey map from your interview findings. Highlight the top three pain points.', 30],
      ['Wireframes', 'Wireframe the five core screens of a meal-planning app that addresses your persona\'s pain points.', 30],
      ['Usability test report', 'Test your prototype with two people. Report what worked, what failed and what you would change.', 20],
    ],
  },
  {
    id: 'c5', code: 'BUS120', title: 'Business Writing', category: 'Business', color: 'sky', teacherId: 't2', size: 10,
    description: 'Write emails, reports and proposals that are clear, concise and get the response you need.',
    lessons: [
      ['Writing for your reader', 'Start with who will read your writing and what they need to do with it.', ['Audience and purpose', 'Putting the main point first', 'Choosing the right tone']],
      ['Clear and concise sentences', 'Cut filler, prefer active voice and make every sentence earn its place.', ['Active vs passive voice', 'Removing wordy phrases', 'One idea per sentence']],
      ['Emails that get answers', 'Write subject lines and requests that busy people read and act on.', ['Specific subject lines', 'Clear asks and deadlines', 'Formatting for skimming']],
      ['Structuring reports', 'Organise longer documents so readers find the conclusion fast.', ['Executive summaries', 'Headings and signposting', 'Tables vs prose']],
      ['Persuasive proposals', 'Make a case for a decision with evidence, options and a clear recommendation.', ['Problem, solution, benefit', 'Handling objections', 'A clear call to action']],
      ['Editing and proofreading', 'Revise in passes so the final draft is accurate and polished.', ['Structural vs line editing', 'Common grammar traps', 'Reading aloud']],
    ],
    assignments: [
      ['Rewrite a memo', 'Rewrite the provided 600-word memo in under 250 words without losing any decisions or deadlines.', 20],
      ['Email set', 'Write three emails: a request, a follow-up and a polite refusal, each for the scenario in the brief.', 20],
      ['Short report', 'Write a two-page report recommending one of the three office software options in the case study.', 40],
      ['Proposal draft', 'Draft a one-page proposal for a change you would like to see at your workplace or university.', 20],
    ],
  },
]

const feedback = [
  'Great work. Clear structure and well explained.',
  'Solid submission. Check the edge cases next time.',
  'Good effort. Review the lesson notes on this topic before the next assignment.',
  'Excellent, one of the strongest in the class.',
  'Nice job. Your explanation could be a little more concise.',
  'Well organised. Watch out for small mistakes in the details.',
]

const submissionTexts = [
  'Submission attached. I followed the brief step by step and noted my assumptions at the end.',
  'Here is my work for this assignment. The trickiest part was getting the details right, so I double-checked against the lesson examples.',
  'Please find my submission below. I went slightly beyond the minimum on the last section.',
  'My completed assignment. I have included a short reflection on what I would improve with more time.',
]

/** Due-date offsets in days for each course's four assignments. */
const dueOffsets = [-20, -8, 3, 10]

/** Hand-picked state for the demo student so every status appears: g = graded, s = submitted, n = nothing. */
const demoStudentPlan: Record<string, string> = { c1: 'ggnn', c2: 'gsnn', c3: 'gnnn', c4: 'ggsn' }
const demoStudentLessons: Record<string, number> = { c1: 4, c2: 3, c3: 2, c4: 5 }

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function atEndOfDay(now: number, offsetDays: number) {
  const d = new Date(now + offsetDays * DAY)
  d.setHours(23, 59, 0, 0)
  return d.getTime()
}

export function createSeed(): Data {
  const rand = rng(42)
  const now = Date.now()
  const iso = (t: number) => new Date(t).toISOString()

  const students: User[] = studentNames.map((name, i) => ({
    id: `s${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z ]/g, '').replace(' ', '.')}@student.lectern.edu`,
    role: 'student',
  }))
  const others = students.slice(1).map((s) => s.id)

  const courses: Course[] = []
  const lessons: Lesson[] = []
  const assignments: Assignment[] = []
  const submissions: Submission[] = []
  const posts: Post[] = []
  const completed: Record<string, string[]> = {}

  catalog.forEach((seed, ci) => {
    const pool = [...others].sort(() => rand() - 0.5)
    const enrolDemo = seed.id in demoStudentPlan
    const studentIds = enrolDemo
      ? [DEMO_STUDENT_ID, ...pool.slice(0, seed.size - 1)]
      : pool.slice(0, seed.size)

    courses.push({
      id: seed.id,
      code: seed.code,
      title: seed.title,
      description: seed.description,
      category: seed.category,
      color: seed.color,
      teacherId: seed.teacherId,
      studentIds,
    })

    const courseLessons = seed.lessons.map(([title, summary, keyPoints], i): Lesson => ({
      id: `${seed.id}-l${i + 1}`,
      courseId: seed.id,
      title,
      summary,
      keyPoints,
      minutes: 15 + Math.round(rand() * 6) * 5,
      order: i + 1,
    }))
    lessons.push(...courseLessons)

    const courseAssignments = seed.assignments.map(([title, instructions, points], i): Assignment => ({
      id: `${seed.id}-a${i + 1}`,
      courseId: seed.id,
      title,
      instructions,
      points,
      dueAt: iso(atEndOfDay(now, dueOffsets[i] + (ci % 2))),
    }))
    assignments.push(...courseAssignments)

    for (const sid of studentIds) {
      const isDemo = sid === DEMO_STUDENT_ID
      const done = isDemo
        ? demoStudentLessons[seed.id]
        : Math.min(courseLessons.length, 1 + Math.floor(rand() * courseLessons.length))
      completed[sid] = [...(completed[sid] ?? []), ...courseLessons.slice(0, done).map((l) => l.id)]

      courseAssignments.forEach((a, ai) => {
        const due = new Date(a.dueAt).getTime()
        const past = due < now
        let state: 'g' | 's' | 'n'
        if (isDemo) {
          state = demoStudentPlan[seed.id][ai] as 'g' | 's' | 'n'
        } else if (past) {
          const r = rand()
          // Leave part of the second assignment ungraded so the grading queue has work in it.
          state = r < 0.08 ? 'n' : ai === 1 && rand() < 0.3 ? 's' : 'g'
        } else {
          state = rand() < (ai === 2 ? 0.2 : 0.05) ? 's' : 'n'
        }
        if (state === 'n') return

        const submittedAt = past
          ? due - Math.floor(rand() * 3 * DAY) - 3_600_000
          : now - Math.floor(rand() * 2 * DAY)
        const sub: Submission = {
          id: `sub-${a.id}-${sid}`,
          assignmentId: a.id,
          studentId: sid,
          submittedAt: iso(submittedAt),
          text: submissionTexts[Math.floor(rand() * submissionTexts.length)],
        }
        if (state === 'g') {
          const ratio = isDemo ? 0.82 + rand() * 0.16 : 0.55 + rand() * 0.45
          sub.score = Math.round(a.points * ratio)
          sub.feedback = feedback[Math.floor(rand() * feedback.length)]
          sub.gradedAt = iso(Math.min(now - 3_600_000, submittedAt + (1 + rand() * 3) * DAY))
        }
        submissions.push(sub)
      })
    }

    const teacher = teachers.find((t) => t.id === seed.teacherId)!
    const [s1, s2] = studentIds.filter((id) => id !== DEMO_STUDENT_ID)
    const upcoming = courseAssignments[2]
    posts.push(
      {
        id: `${seed.id}-p1`, courseId: seed.id, authorId: teacher.id, announcement: true,
        createdAt: iso(now - 26 * DAY),
        body: `Welcome to ${seed.code}! Lessons are released in order. Work through them at your own pace, but keep an eye on assignment deadlines. Post questions in the discussion below so everyone benefits from the answers.`,
      },
      {
        id: `${seed.id}-p2`, courseId: seed.id, authorId: teacher.id, announcement: true,
        createdAt: iso(now - 2 * DAY - 5 * 3_600_000),
        body: `Reminder: "${upcoming.title}" is due soon. Grades for "${courseAssignments[0].title}" are now available. Check your feedback before starting the next one.`,
      },
      {
        id: `${seed.id}-p3`, courseId: seed.id, authorId: s1, announcement: false,
        createdAt: iso(now - 3 * DAY),
        body: `Quick question about "${upcoming.title}": is it okay to go beyond the minimum requirements, or should we stick closely to the brief?`,
      },
      {
        id: `${seed.id}-p4`, courseId: seed.id, authorId: teacher.id, announcement: false,
        createdAt: iso(now - 3 * DAY + 4 * 3_600_000),
        body: 'Going beyond is welcome, but make sure every core requirement is covered first. That is what the rubric checks.',
      },
      {
        id: `${seed.id}-p5`, courseId: seed.id, authorId: s2, announcement: false,
        createdAt: iso(now - 20 * 3_600_000),
        body: `Thanks! Is anyone up for a ${seed.code} study group this week? Happy to book a room in the library on Thursday.`,
      },
    )
  })

  return {
    seededAt: iso(now),
    users: [...teachers, ...students],
    courses,
    lessons,
    assignments,
    submissions,
    completed,
    posts,
  }
}

/** Moves every date forward by the time since seeding, so a saved demo never looks stale. */
export function refreshDates(data: Data): Data {
  const shift = Date.now() - new Date(data.seededAt).getTime()
  if (shift < DAY) return data
  const move = (iso: string) => new Date(new Date(iso).getTime() + shift).toISOString()
  return {
    ...data,
    seededAt: new Date().toISOString(),
    assignments: data.assignments.map((a) => ({ ...a, dueAt: move(a.dueAt) })),
    submissions: data.submissions.map((s) => ({
      ...s,
      submittedAt: move(s.submittedAt),
      gradedAt: s.gradedAt && move(s.gradedAt),
    })),
    posts: data.posts.map((p) => ({ ...p, createdAt: move(p.createdAt) })),
  }
}
