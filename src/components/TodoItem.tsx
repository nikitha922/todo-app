import { useEffect, useRef, useState } from 'react'
import type { Todo } from '../types'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
}

const CATEGORY_ICONS: Record<Todo['category'], string> = {
  Personal: '🏠',
  Work: '💼',
  Health: '💪',
  Learning: '📚',
  Shopping: '🛒',
}

function dueLabel(due: string, completed: boolean) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(`${due}T00:00:00`)
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000)

  let label: string
  if (diff === 0) label = 'Today'
  else if (diff === 1) label = 'Tomorrow'
  else if (diff === -1) label = 'Yesterday'
  else label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  const overdue = diff < 0 && !completed
  return { label, overdue }
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.text) onEdit(todo.id, trimmed)
    else setDraft(todo.text)
    setEditing(false)
  }

  const due = todo.dueDate ? dueLabel(todo.dueDate, todo.completed) : null

  return (
    <li className={`item priority-${todo.priority} ${todo.completed ? 'done' : ''}`}>
      <button
        className={`check ${todo.completed ? 'checked' : ''}`}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="item-body">
        {editing ? (
          <input
            ref={inputRef}
            className="edit-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(todo.text)
                setEditing(false)
              }
            }}
          />
        ) : (
          <span className="item-text" onDoubleClick={() => setEditing(true)} title="Double-click to edit">
            {todo.text}
          </span>
        )}
        <div className="chips">
          <span className="chip chip-category">
            {CATEGORY_ICONS[todo.category]} {todo.category}
          </span>
          <span className={`chip chip-priority chip-${todo.priority}`}>{todo.priority}</span>
          {due && (
            <span className={`chip chip-due ${due.overdue ? 'overdue' : ''}`}>
              📅 {due.label}
              {due.overdue ? ' · overdue' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="item-actions">
        <button className="icon-btn" onClick={() => setEditing(true)} aria-label="Edit task">
          ✎
        </button>
        <button className="icon-btn danger" onClick={() => onDelete(todo.id)} aria-label="Delete task">
          ✕
        </button>
      </div>
    </li>
  )
}
