import { useState, type FormEvent, type RefObject } from 'react'
import { dateInDays } from '../dates'
import { CATEGORIES, PRIORITIES, type Category, type Priority } from '../types'

interface Props {
  inputRef: RefObject<HTMLInputElement | null>
  defaultCategory: Category | null
  onAdd: (text: string, priority: Priority, category: Category, dueDate: string | null) => void
}

export function TodoForm({ inputRef, defaultCategory, onAdd }: Props) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [pickedCategory, setCategory] = useState<Category>('Personal')
  const [dueDate, setDueDate] = useState('')

  const category = defaultCategory ?? pickedCategory

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed, priority, category, dueDate || null)
    setText('')
    setDueDate('')
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-main">
        <input
          ref={inputRef}
          className="form-input"
          placeholder="Add a task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="New task"
        />
        <kbd className="kbd">N</kbd>
        <button className="btn-primary" type="submit" disabled={!text.trim()}>
          Add task
        </button>
      </div>

      <div className="form-row">
        <span className="form-label">Category</span>
        <div className="pills">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              data-cat={c}
              className={`pill ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
              disabled={defaultCategory !== null && defaultCategory !== c}
            >
              <span className="cat-dot" />
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <span className="form-label">Priority</span>
        <div className="pills">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={`pill pill-${p} ${priority === p ? 'active' : ''}`}
              onClick={() => setPriority(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <span className="form-label">Due</span>
        <div className="pills">
          <button
            type="button"
            className={`pill ${dueDate === dateInDays(0) ? 'active' : ''}`}
            onClick={() => setDueDate(dueDate === dateInDays(0) ? '' : dateInDays(0))}
          >
            Today
          </button>
          <button
            type="button"
            className={`pill ${dueDate === dateInDays(1) ? 'active' : ''}`}
            onClick={() => setDueDate(dueDate === dateInDays(1) ? '' : dateInDays(1))}
          >
            Tomorrow
          </button>
          <input
            className="date-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
          />
        </div>
      </div>
    </form>
  )
}
