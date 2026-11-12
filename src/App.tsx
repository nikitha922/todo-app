import { useEffect, useMemo, useRef, useState } from 'react'
import { Charts } from './components/Charts'
import { Sidebar } from './components/Sidebar'
import { TodoForm } from './components/TodoForm'
import { TodoItem } from './components/TodoItem'
import { bucketOf, dateInDays, type Bucket } from './dates'
import { useLocalStorage } from './useLocalStorage'
import type { Category, Priority, Todo, View } from './types'
import './App.css'

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

const VIEW_TITLES: Record<View, string> = {
  all: 'All tasks',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
}

type GroupKey = Bucket | 'done'

const GROUP_LABELS: Record<GroupKey, string> = {
  overdue: 'Overdue',
  today: 'Today',
  upcoming: 'Upcoming',
  none: 'No date',
  done: 'Completed',
}

const VIEW_GROUPS: Record<View, GroupKey[]> = {
  all: ['overdue', 'today', 'upcoming', 'none'],
  today: ['overdue', 'today'],
  upcoming: ['upcoming'],
  completed: ['done'],
}

const SEED: Todo[] = [
  { id: 'seed-1', text: 'Review the sprint plan', completed: false, priority: 'high', category: 'Work', dueDate: dateInDays(-1), createdAt: 1 },
  { id: 'seed-2', text: 'Send the weekly status update', completed: false, priority: 'medium', category: 'Work', dueDate: dateInDays(0), createdAt: 2 },
  { id: 'seed-3', text: 'Book a dentist appointment', completed: false, priority: 'low', category: 'Health', dueDate: dateInDays(2), createdAt: 3 },
  { id: 'seed-4', text: 'Read two chapters of the TypeScript handbook', completed: false, priority: 'medium', category: 'Learning', dueDate: dateInDays(4), createdAt: 4 },
  { id: 'seed-5', text: 'Pick up groceries', completed: false, priority: 'low', category: 'Shopping', dueDate: null, createdAt: 5 },
  { id: 'seed-6', text: 'Go for a 30 minute walk', completed: true, priority: 'low', category: 'Health', dueDate: null, createdAt: 6 },
]

function groupKeyOf(todo: Todo, view: View): GroupKey {
  return view === 'completed' ? 'done' : bucketOf(todo.dueDate)
}

export default function App() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', SEED)
  const [dark, setDark] = useLocalStorage<boolean>(
    'dark',
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [view, setView] = useState<View>('all')
  const [category, setCategory] = useState<Category | null>(null)
  const [query, setQuery] = useState('')
  const [undo, setUndo] = useState<Todo | null>(null)

  const formInputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'n') {
        e.preventDefault()
        formInputRef.current?.focus()
      } else if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!undo) return
    const timer = setTimeout(() => setUndo(null), 5000)
    return () => clearTimeout(timer)
  }, [undo])

  const addTodo = (text: string, priority: Priority, cat: Category, dueDate: string | null) => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      category: cat,
      dueDate,
      createdAt: Date.now(),
    }
    setTodos((prev) => [todo, ...prev])
  }

  const toggleTodo = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))

  const deleteTodo = (id: string) => {
    const target = todos.find((t) => t.id === id)
    if (!target) return
    setTodos((prev) => prev.filter((t) => t.id !== id))
    setUndo(target)
  }

  const restoreTodo = () => {
    if (!undo) return
    setTodos((prev) => [undo, ...prev])
    setUndo(null)
  }

  const editTodo = (id: string, text: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)))

  const clearCompleted = () => setTodos((prev) => prev.filter((t) => !t.completed))

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matching = todos.filter((t) => {
      if (view === 'completed' ? !t.completed : t.completed) return false
      if (category && t.category !== category) return false
      return !q || t.text.toLowerCase().includes(q)
    })

    return VIEW_GROUPS[view]
      .map((key) => ({
        key,
        items: matching
          .filter((t) => groupKeyOf(t, view) === key)
          .sort(
            (a, b) =>
              (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') ||
              PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
              b.createdAt - a.createdAt,
          ),
      }))
      .filter((g) => g.items.length > 0)
  }, [todos, view, category, query])

  const shown = groups.reduce((n, g) => n + g.items.length, 0)
  const hasCompleted = todos.some((t) => t.completed)

  const today = new Date()
  const weekday = today.toLocaleDateString(undefined, { weekday: 'long' })
  const dateLine = today.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="app">
      <Sidebar
        todos={todos}
        view={view}
        category={category}
        dark={dark}
        onView={setView}
        onCategory={setCategory}
        onToggleTheme={() => setDark(!dark)}
      />

      <main className="main">
        <header className="page-head">
          <div>
            <p className="eyebrow">
              {weekday}, {dateLine}
            </p>
            <h1>
              {VIEW_TITLES[view]}
              {category && <span className="title-cat"> / {category}</span>}
            </h1>
          </div>
          <div className="search-wrap">
            <input
              ref={searchRef}
              className="search"
              type="search"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tasks"
            />
            <kbd className="kbd">/</kbd>
          </div>
        </header>

        <TodoForm inputRef={formInputRef} defaultCategory={category} onAdd={addTodo} />

        {shown === 0 ? (
          <div className="empty">
            <svg className="empty-art" viewBox="0 0 64 64" width="56" height="56" aria-hidden>
              <rect x="10" y="8" width="44" height="48" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M20 24h24M20 34h24M20 44h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <p className="empty-title">
              {query ? 'Nothing matches that search' : view === 'completed' ? 'Nothing completed yet' : 'You are all caught up'}
            </p>
            <p className="empty-sub">
              {query ? 'Try a different word.' : view === 'completed' ? 'Finished tasks will show up here.' : 'Press N to add something new.'}
            </p>
          </div>
        ) : (
          groups.map((g) => (
            <section className="group" key={g.key}>
              <h2 className={`group-head ${g.key === 'overdue' ? 'is-overdue' : ''}`}>
                {GROUP_LABELS[g.key]}
                <span className="group-count">{g.items.length}</span>
              </h2>
              <ul className="list">
                {g.items.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} onEdit={editTodo} />
                ))}
              </ul>
            </section>
          ))
        )}

        {view === 'completed' && hasCompleted && (
          <button className="link-btn clear" onClick={clearCompleted}>
            Clear all completed
          </button>
        )}
      </main>

      <Charts todos={todos} dark={dark} />

      {undo && (
        <div className="toast" role="status">
          <span>Deleted “{undo.text.length > 32 ? `${undo.text.slice(0, 32)}…` : undo.text}”</span>
          <button onClick={restoreTodo}>Undo</button>
        </div>
      )}
    </div>
  )
}
