import { useEffect, useRef, useState } from 'react'
import { bucketOf, formatDue } from '../dates'
import type { Todo } from '../types'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
}

const LEVEL = { low: 1, medium: 2, high: 3 } as const

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

  const overdue = !todo.completed && bucketOf(todo.dueDate) === 'overdue'

  return (
    <li className={`item ${todo.completed ? 'done' : ''}`} data-cat={todo.category}>
      <button
        className={`check ${todo.completed ? 'checked' : ''}`}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path className="tick" d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
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
          <span className="item-text" onDoubleClick={() => setEditing(true)}>
            {todo.text}
          </span>
        )}
        <div className="meta">
          <span className="meta-cat">
            <span className="cat-dot" />
            {todo.category}
          </span>
          <span className="prio" data-level={LEVEL[todo.priority]} title={`${todo.priority} priority`}>
            <i />
            <i />
            <i />
          </span>
          {todo.dueDate && (
            <span className={`due ${overdue ? 'overdue' : ''}`}>
              {formatDue(todo.dueDate)}
              {overdue ? ' · overdue' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="item-actions">
        <button className="text-btn" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="text-btn danger" onClick={() => onDelete(todo.id)}>
          Delete
        </button>
      </div>
    </li>
  )
}
