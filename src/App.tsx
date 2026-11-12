import { useEffect, useMemo, useState } from 'react'
import { ProgressRing } from './components/ProgressRing'
import { TodoForm } from './components/TodoForm'
import { TodoItem } from './components/TodoItem'
import { useLocalStorage } from './useLocalStorage'
import type { Category, Filter, Priority, Todo } from './types'
import './App.css'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

type Sort = 'newest' | 'priority' | 'due'

const SEED: Todo[] = [
  {
    id: 'seed-1',
    text: 'Plan the week ahead',
    completed: false,
    priority: 'high',
    category: 'Work',
    dueDate: null,
    createdAt: 1,
  },
  {
    id: 'seed-2',
    text: 'Go for a 30 minute walk',
    completed: true,
    priority: 'low',
    category: 'Health',
    dueDate: null,
    createdAt: 2,
  },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function App() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', SEED)
  const [dark, setDark] = useLocalStorage<boolean>(
    'dark',
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('newest')
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  const addTodo = (text: string, priority: Priority, category: Category, dueDate: string | null) => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      category,
      dueDate,
      createdAt: Date.now(),
    }
    setTodos((prev) => [todo, ...prev])
  }

  const toggleTodo = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))

  const deleteTodo = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id))

  const editTodo = (id: string, text: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)))

  const clearCompleted = () => setTodos((prev) => prev.filter((t) => !t.completed))

  const total = todos.length
  const completed = todos.filter((t) => t.completed).length
  const active = total - completed
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = todos.filter((t) => {
      if (filter === 'active' && t.completed) return false
      if (filter === 'completed' && !t.completed) return false
      return !q || t.text.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    })

    return [...list].sort((a, b) => {
      if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sort === 'due') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      }
      return b.createdAt - a.createdAt
    })
  }, [todos, filter, sort, query])

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="app">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <main className="card">
        <header className="header">
          <div>
            <p className="eyebrow">{today}</p>
            <h1>{greeting()} 👋</h1>
            <p className="subtitle">
              {active === 0
                ? total === 0
                  ? 'Add your first task to get started.'
                  : 'All done. Enjoy the free time!'
                : `You have ${active} task${active === 1 ? '' : 's'} left.`}
            </p>
          </div>
          <div className="header-right">
            <button
              className="theme-toggle"
              onClick={() => setDark(!dark)}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <ProgressRing percent={percent} />
          </div>
        </header>

        <section className="stats">
          <div className="stat">
            <strong>{total}</strong>
            <span>Total</span>
          </div>
          <div className="stat">
            <strong>{active}</strong>
            <span>Active</span>
          </div>
          <div className="stat">
            <strong>{completed}</strong>
            <span>Done</span>
          </div>
        </section>

        <TodoForm onAdd={addTodo} />

        <section className="toolbar">
          <div className="tabs" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                className={`tab ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <input
              className="search"
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tasks"
            />
            <select
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort tasks"
            >
              <option value="newest">Newest</option>
              <option value="priority">Priority</option>
              <option value="due">Due date</option>
            </select>
          </div>
        </section>

        {visible.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">{total === 0 ? '📝' : '🔍'}</div>
            <p>{total === 0 ? 'Nothing here yet' : 'No tasks match your view'}</p>
          </div>
        ) : (
          <ul className="list">
            {visible.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} onEdit={editTodo} />
            ))}
          </ul>
        )}

        {completed > 0 && (
          <footer className="footer">
            <span>
              {completed} completed
            </span>
            <button className="link-btn" onClick={clearCompleted}>
              Clear completed
            </button>
          </footer>
        )}
      </main>
    </div>
  )
}
