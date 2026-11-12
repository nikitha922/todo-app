import { bucketOf } from '../dates'
import { CATEGORIES, type Category, type Todo, type View } from '../types'

interface Props {
  todos: Todo[]
  view: View
  category: Category | null
  dark: boolean
  onView: (view: View) => void
  onCategory: (category: Category | null) => void
  onToggleTheme: () => void
}

export function Sidebar({ todos, view, category, dark, onView, onCategory, onToggleTheme }: Props) {
  const open = todos.filter((t) => !t.completed)
  const done = todos.length - open.length
  const percent = todos.length === 0 ? 0 : Math.round((done / todos.length) * 100)

  const views: { key: View; label: string; count: number }[] = [
    { key: 'all', label: 'All tasks', count: open.length },
    {
      key: 'today',
      label: 'Today',
      count: open.filter((t) => ['today', 'overdue'].includes(bucketOf(t.dueDate))).length,
    },
    { key: 'upcoming', label: 'Upcoming', count: open.filter((t) => bucketOf(t.dueDate) === 'upcoming').length },
    { key: 'completed', label: 'Completed', count: done },
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        Taskly<span className="brand-dot">.</span>
      </div>

      <nav className="nav" aria-label="Views">
        {views.map((v) => (
          <button
            key={v.key}
            className={`nav-item ${view === v.key ? 'active' : ''}`}
            onClick={() => onView(v.key)}
          >
            <span>{v.label}</span>
            <span className="count">{v.count}</span>
          </button>
        ))}
      </nav>

      <div className="side-label">Categories</div>
      <nav className="nav" aria-label="Categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            data-cat={c}
            className={`nav-item ${category === c ? 'active' : ''}`}
            onClick={() => onCategory(category === c ? null : c)}
          >
            <span className="nav-cat">
              <span className="cat-dot" />
              {c}
            </span>
            <span className="count">{open.filter((t) => t.category === c).length}</span>
          </button>
        ))}
      </nav>

      <div className="side-progress">
        <div className="side-label">Progress</div>
        <div className="fraction">
          {done}
          <span>/{todos.length}</span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="progress-note">{percent}% of everything is done</p>
      </div>

      <button className="theme-toggle" onClick={onToggleTheme}>
        {dark ? 'Switch to light' : 'Switch to dark'}
      </button>
    </aside>
  )
}
